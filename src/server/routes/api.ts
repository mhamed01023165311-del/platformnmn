import { Router, Request, Response } from 'express';
import { db, IncomingTransaction, DepositRequest, Student, WalletTransactionRecord } from '../db';
import { parseVodafoneCashSMS, normalizePhoneNumber } from '../services/smsParser';
import { analyzeVodafoneSmsWithGemini } from '../services/geminiService';

export const apiRouter = Router();

// Current Student ID for single-student demo
const DEFAULT_STUDENT_ID = 'std-current';

function getOrCreateStudent(): Student {
  const students = db.get('Students');
  let student = students.find(s => s.id === DEFAULT_STUDENT_ID);
  if (!student) {
    student = {
      id: DEFAULT_STUDENT_ID,
      name: 'طالب المنصة',
      email: 'student@edumaster.com',
      phone: '01012345678',
      wallet_balance: 350,
      created_at: new Date().toISOString()
    };
    students.unshift(student);
    db.save();
  }
  return student;
}

/**
 * 1. GET /api/wallet
 * Returns current student wallet balance and transaction history
 */
apiRouter.get('/wallet', (req: Request, res: Response) => {
  const student = getOrCreateStudent();
  const transactions = db.get('WalletTransactions')
    .filter(t => t.student_id === student.id);
  const incomingSMS = db.get('IncomingTransactions');
  const depositRequests = db.get('DepositRequests');

  res.json({
    success: true,
    student: {
      id: student.id,
      name: student.name,
      phone: student.phone,
      wallet_balance: student.wallet_balance
    },
    transactions,
    recent_sms: incomingSMS.slice(0, 5),
    recent_deposits: depositRequests.slice(0, 5)
  });
});

/**
 * 2. POST /api/sms/webhook
 * Receives incoming SMS from the mobile reader app.
 * Body: { sender: "VodafoneCash", message: "..." }
 */
apiRouter.post('/sms/webhook', (req: Request, res: Response) => {
  try {
    const rawMessage = req.body.message || req.body.body || req.body.raw_message || '';

    if (!rawMessage) {
      return res.status(400).json({ success: false, error: 'نص الرسالة غير موجود' });
    }

    const parsed = parseVodafoneCashSMS(rawMessage);
    if (!parsed.success || !parsed.sender_phone || parsed.amount <= 0) {
      return res.status(422).json({
        success: false,
        error: 'لم نتمكن من استخراج رقم الهاتف والمبلغ من الرسالة',
        details: parsed
      });
    }

    const normalizedPhone = normalizePhoneNumber(parsed.sender_phone);
    const now = new Date().toISOString();
    const incomingList = db.get('IncomingTransactions');

    // Create incoming transaction record
    const incomingRecord: IncomingTransaction = {
      id: `sms-${Date.now()}`,
      sender_phone: normalizedPhone,
      amount: parsed.amount,
      transaction_id: parsed.transaction_id || `TX-${Date.now()}`,
      raw_message: rawMessage,
      status: 'PENDING',
      is_used: false,
      created_at: now,
      matched_student_id: null
    };

    incomingList.unshift(incomingRecord);

    // Check if there is any pending deposit request waiting for this phone number
    const depositRequests = db.get('DepositRequests');
    const pendingDeposit = depositRequests.find(dep => 
      dep.status === 'PENDING_VERIFICATION' &&
      normalizePhoneNumber(dep.sender_phone) === normalizedPhone
    );

    let matchedImmediately = false;

    if (pendingDeposit) {
      const student = getOrCreateStudent();
      
      // CRITICAL LOGIC: Adopt the amount in the SMS ONLY!
      const approvedAmount = parsed.amount;

      // Credit student wallet
      student.wallet_balance += approvedAmount;

      // Mark SMS as used
      incomingRecord.status = 'COMPLETED';
      incomingRecord.is_used = true;
      incomingRecord.matched_student_id = student.id;

      // Update deposit request
      pendingDeposit.status = 'COMPLETED';
      pendingDeposit.matched_incoming_id = incomingRecord.id;
      pendingDeposit.updated_at = now;
      pendingDeposit.notes = `تم الاعتماد التلقائي بمبلغ ${approvedAmount} ج.م من رسالة SMS`;

      // Add to transaction history
      const walletTx = db.get('WalletTransactions');
      walletTx.unshift({
        id: `wtx-${Date.now()}`,
        student_id: student.id,
        type: 'deposit_vodafone_cash',
        amount: approvedAmount,
        description: `إيداع فودافون كاش - رقم: ${normalizedPhone} (مبلغ الرسالة: ${approvedAmount} ج.م)`,
        reference_id: incomingRecord.transaction_id,
        created_at: now
      });

      matchedImmediately = true;
    }

    db.save();

    return res.status(201).json({
      success: true,
      message: matchedImmediately
        ? `تم استلام الـ SMS ومطابقتها فوراً برقم ${normalizedPhone} واعتماد مبلغ ${parsed.amount} ج.م في رصيد الطالب!`
        : `تم استلام الـ SMS وحفظها برقم ${normalizedPhone} ومبلغ ${parsed.amount} ج.م بنجاح.`,
      matched_immediately: matchedImmediately,
      sms: incomingRecord
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2.5 POST /api/gemini/analyze-sms
 * Analyzes raw Vodafone Cash SMS text using Gemini API (@google/genai SDK)
 * Returns: { real_sender_phone, amount, is_valid_transfer, model_used, notes }
 */
apiRouter.post('/gemini/analyze-sms', async (req: Request, res: Response) => {
  try {
    const rawMessage = req.body.raw_message || req.body.message || '';
    if (!rawMessage) {
      return res.status(400).json({
        success: false,
        error: 'نص الرسالة الخام raw_message غير موجود'
      });
    }

    const result = await analyzeVodafoneSmsWithGemini(rawMessage);
    return res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Gemini analyze endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 2.6 POST /api/gemini/match-deposit
 * Validates candidate raw messages against student phone using Gemini AI
 */
apiRouter.post('/gemini/match-deposit', async (req: Request, res: Response) => {
  try {
    const { sender_phone, messages } = req.body;
    const normalizedTargetPhone = normalizePhoneNumber(String(sender_phone || ''));

    if (!normalizedTargetPhone || normalizedTargetPhone.length !== 11) {
      return res.status(400).json({
        success: false,
        error: 'رقم هاتف الطالب غير صحيح، يجب أن يتكون من 11 رقماً'
      });
    }

    const list: string[] = Array.isArray(messages) ? messages : (messages ? [messages] : []);
    
    for (const msg of list) {
      const parsed = await analyzeVodafoneSmsWithGemini(msg);
      if (parsed.is_valid_transfer && parsed.real_sender_phone === normalizedTargetPhone && parsed.amount > 0) {
        return res.json({
          success: true,
          matched: true,
          real_sender_phone: parsed.real_sender_phone,
          amount: parsed.amount,
          is_valid_transfer: parsed.is_valid_transfer,
          model_used: parsed.model_used,
          notes: parsed.notes,
          message: `تم التحقق بنجاح عبر Gemini AI! تطابق رقم المحول ${parsed.real_sender_phone} مع رقم الطالب، وتم اعتماد مبلغ ${parsed.amount} جنيه.`
        });
      }
    }

    return res.json({
      success: true,
      matched: false,
      message: 'لم يتم العثور على رسالة استلام أموال تطابق رقم الطالب بعد تحليل النصوص بالذكاء الاصطناعي.'
    });
  } catch (error: any) {
    console.error('Gemini match error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. POST /api/deposit
 * Student clicks [ إرسال الطلب ]
 * Sends: { sender_phone, claimed_amount, receipt_image }
 * 
 * BACKEND MATCHING LOGIC WITH GEMINI AI:
 * - The ONLY matching link is: sender_phone.
 * - Searches for the latest un-used SMS matching that sender_phone.
 * - Uses Gemini API to analyze raw_message and extract { real_sender_phone, amount, is_valid_transfer }.
 * - Approved Amount: ADOPTS the amount in the SMS ONLY! Completely ignores claimed_amount.
 * - Immediately credits student wallet if found!
 */
apiRouter.post('/deposit', async (req: Request, res: Response) => {
  try {
    const { sender_phone, claimed_amount, receipt_image } = req.body;

    if (!sender_phone) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رقم الموبايل الذي قمت بالتحويل منه'
      });
    }

    const normalizedPhone = normalizePhoneNumber(String(sender_phone).trim());
    if (normalizedPhone.length !== 11) {
      return res.status(400).json({
        success: false,
        error: 'رقم الموبايل غير صحيح، يجب أن يتكون من 11 رقماً (مثال: 01012345678)'
      });
    }

    const student = getOrCreateStudent();
    const now = new Date().toISOString();
    const incomingList = db.get('IncomingTransactions');

    // MATCHING LOGIC: Search for un-used SMS matching sender_phone or in raw_message using Gemini AI
    let matchedSMS: IncomingTransaction | undefined = undefined;
    let geminiApprovedAmount = 0;
    let geminiModelUsed = 'regex-direct';

    for (const sms of incomingList) {
      if (sms.is_used || sms.status === 'COMPLETED') continue;

      const phoneInDoc = normalizePhoneNumber(sms.sender_phone);
      const rawText = sms.raw_message || '';

      // Direct quick check
      if (
        phoneInDoc === normalizedPhone || 
        rawText.includes(normalizedPhone) || 
        rawText.includes(`من رقم ${normalizedPhone}`) ||
        rawText.includes(`من رقم: ${normalizedPhone}`)
      ) {
        matchedSMS = sms;
        geminiApprovedAmount = sms.amount;
        break;
      }

      // If raw_message is present, run Gemini AI analysis
      if (rawText) {
        const aiParsed = await analyzeVodafoneSmsWithGemini(rawText);
        if (
          aiParsed.is_valid_transfer && 
          aiParsed.real_sender_phone === normalizedPhone && 
          aiParsed.amount > 0
        ) {
          matchedSMS = sms;
          geminiApprovedAmount = aiParsed.amount;
          geminiModelUsed = aiParsed.model_used;
          // Update the SMS record with AI verified details
          sms.amount = aiParsed.amount;
          sms.sender_phone = aiParsed.real_sender_phone;
          break;
        }
      }
    }

    const depositRequests = db.get('DepositRequests');

    if (matchedSMS) {
      // MATCH FOUND!
      // The server adopts the amount in the SMS ONLY and ignores claimed_amount!
      const approvedAmount = geminiApprovedAmount > 0 ? geminiApprovedAmount : matchedSMS.amount;

      // 1. Credit wallet balance immediately
      student.wallet_balance += approvedAmount;

      // 2. Mark SMS as used
      matchedSMS.status = 'COMPLETED';
      matchedSMS.is_used = true;
      matchedSMS.matched_student_id = student.id;

      // 3. Record Deposit Request as COMPLETED
      const depositRecord: DepositRequest = {
        id: `dep-${Date.now()}`,
        student_id: student.id,
        sender_phone: normalizedPhone,
        claimed_amount: parseFloat(claimed_amount) || approvedAmount,
        status: 'COMPLETED',
        transaction_id: matchedSMS.transaction_id,
        matched_incoming_id: matchedSMS.id,
        created_at: now,
        updated_at: now,
        notes: `تم اعتماد المبلغ عبر الذكاء الاصطناعي من رسالة SMS: ${approvedAmount} ج.م`
      };
      depositRequests.unshift(depositRecord);

      // 4. Record wallet transaction
      const walletTx = db.get('WalletTransactions');
      walletTx.unshift({
        id: `wtx-${Date.now()}`,
        student_id: student.id,
        type: 'deposit_vodafone_cash',
        amount: approvedAmount,
        description: `إيداع فودافون كاش من رقم ${normalizedPhone} (معتمد عبر الذكاء الاصطناعي)`,
        reference_id: matchedSMS.transaction_id,
        created_at: now
      });

      db.save();

      return res.json({
        success: true,
        matched: true,
        approved_amount: approvedAmount,
        new_balance: student.wallet_balance,
        ai_verified: true,
        model_used: geminiModelUsed,
        message: `تم العثور على رسالة التحويل وتحليلها بالذكاء الاصطناعي بنجاح! تم اعتماد مبلغ ${approvedAmount} جنيه المسجل في رسالة الـ SMS وإضافته لرصيدك فوراً.`
      });
    } else {
      // NO MATCH YET: Save as PENDING_VERIFICATION
      const depositRecord: DepositRequest = {
        id: `dep-${Date.now()}`,
        student_id: student.id,
        sender_phone: normalizedPhone,
        claimed_amount: parseFloat(claimed_amount) || 0,
        status: 'PENDING_VERIFICATION',
        transaction_id: null,
        matched_incoming_id: null,
        created_at: now,
        updated_at: now,
        notes: 'بانتظار وصول رسالة الـ SMS من نفس رقم الهاتف'
      };
      depositRequests.unshift(depositRecord);
      db.save();

      return res.json({
        success: true,
        matched: false,
        claimed_amount: depositRecord.claimed_amount,
        new_balance: student.wallet_balance,
        message: `تم إرسال الطلب بنجاح وهو بانتظار وصول رسالة الـ SMS من رقم ${normalizedPhone}. سيتم إضافة المبلغ المسجل في الرسالة إلى محفظتك فور وصولها.`
      });
    }
  } catch (error: any) {
    console.error('Deposit error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. POST /api/withdraw
 * Student clicks [ سحب ]
 */
apiRouter.post('/withdraw', (req: Request, res: Response) => {
  try {
    const { amount, phone } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال مبلغ سحب صحيح' });
    }

    const student = getOrCreateStudent();

    if (student.wallet_balance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        error: `رصيدك الحالي (${student.wallet_balance} جنيه) لا يكفي لسحب ${withdrawAmount} جنيه`
      });
    }

    student.wallet_balance -= withdrawAmount;
    const now = new Date().toISOString();

    const walletTx = db.get('WalletTransactions');
    walletTx.unshift({
      id: `wtx-${Date.now()}`,
      student_id: student.id,
      type: 'manual_adjustment',
      amount: -withdrawAmount,
      description: `طلب سحب كاش إلى رقم ${phone || student.phone}`,
      reference_id: `WTH-${Date.now()}`,
      created_at: now
    });

    db.save();

    return res.json({
      success: true,
      new_balance: student.wallet_balance,
      message: `تم سحب مبلغ ${withdrawAmount} جنيه بنجاح. رصيدك المتبقي: ${student.wallet_balance} جنيه.`
    });
  } catch (error: any) {
    console.error('Withdraw error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/send-otp
 * Sends OTP email via Brevo API on the backend
 * Body: { email, code }
 */
apiRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const otpCode = String(code || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !otpCode) {
      return res.status(400).json({
        success: false,
        error: 'يرجى توفير بريد إلكتروني صحيح وكود مكون من 6 أرقام'
      });
    }

    const BREVO_KEY = process.env.VITE_BREVO_API_KEY || process.env.BREVO_API_KEY || 'Xkeysib-05f15c12fbcf782fc875f7288184d0ce471b99e76b3ec3199323c9678104c3c3-UlJLsZLKuZEU2Bg6';

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_KEY
      },
      body: JSON.stringify({
        sender: { name: 'منصة الأستاذ', email: 'mhamed01023265312@gmail.com' },
        to: [{ email: cleanEmail }],
        subject: 'رمز التحقق الخاص بك',
        htmlContent: `
          <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h2>رمز التحقق الخاص بك</h2>
            <p>رمز التحقق لتعيين كلمة المرور هو:</p>
            <h1 style="color: #2563eb; letter-spacing: 4px; font-size: 32px;">${otpCode}</h1>
            <p>هذا الكود صالح لمدة 5 دقائق فقط.</p>
          </div>
        `
      })
    });

    const data = await brevoResponse.json().catch(() => ({}));

    if (brevoResponse.ok) {
      return res.json({
        success: true,
        message: 'تم إرسال كود التحقق بنجاح',
        data
      });
    } else {
      console.error('Brevo API error on backend:', data);
      return res.status(brevoResponse.status || 500).json({
        success: false,
        error: data.message || 'فشل إرسال الإيميل عبر Brevo API',
        details: data
      });
    }
  } catch (err: any) {
    console.error('Backend /api/send-otp error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'حدث خطأ في السيرفر أثناء إرسال البريد'
    });
  }
});
apiRouter.post('/sms/simulate', (req: Request, res: Response) => {
  const { phone, amount } = req.body;
  const numAmount = parseFloat(amount) || 200;
  const phoneNormalized = normalizePhoneNumber(phone || '01012345678');

  const simulatedMessage = `تم استلام مبلغ ${numAmount.toFixed(2)} جنيه مصري من رقم ${phoneNormalized}. مصاريف الخدمة 0.00 جنيه. رقم العملية: VF-${Math.floor(100000 + Math.random() * 900000)}`;

  // Forward to internal webhook logic
  req.body = {
    sender: 'VodafoneCash',
    message: simulatedMessage
  };

  // Call the webhook handler directly
  const incomingList = db.get('IncomingTransactions');
  const now = new Date().toISOString();

  const incomingRecord: IncomingTransaction = {
    id: `sms-${Date.now()}`,
    sender_phone: phoneNormalized,
    amount: numAmount,
    transaction_id: `VF-${Math.floor(100000 + Math.random() * 900000)}`,
    raw_message: simulatedMessage,
    status: 'PENDING',
    is_used: false,
    created_at: now,
    matched_student_id: null
  };
  incomingList.unshift(incomingRecord);

  // Check pending
  const depositRequests = db.get('DepositRequests');
  const pendingDeposit = depositRequests.find(dep => 
    dep.status === 'PENDING_VERIFICATION' &&
    normalizePhoneNumber(dep.sender_phone) === phoneNormalized
  );

  let matched = false;
  if (pendingDeposit) {
    const student = getOrCreateStudent();
    student.wallet_balance += numAmount;
    incomingRecord.status = 'COMPLETED';
    incomingRecord.is_used = true;
    incomingRecord.matched_student_id = student.id;
    pendingDeposit.status = 'COMPLETED';
    pendingDeposit.matched_incoming_id = incomingRecord.id;
    pendingDeposit.updated_at = now;

    const walletTx = db.get('WalletTransactions');
    walletTx.unshift({
      id: `wtx-${Date.now()}`,
      student_id: student.id,
      type: 'deposit_vodafone_cash',
      amount: numAmount,
      description: `إيداع فودافون كاش من رقم ${phoneNormalized} (محاكاة)`,
      reference_id: incomingRecord.transaction_id,
      created_at: now
    });
    matched = true;
  }

  db.save();

  const student = getOrCreateStudent();
  return res.json({
    success: true,
    matched,
    simulated_sms: incomingRecord,
    current_balance: student.wallet_balance,
    message: matched
      ? `وصلت رسالة SMS بمبلغ ${numAmount} ج.م وتمت مطابقتها فوراً مع طلبك المعلق!`
      : `تم حفظ رسالة SMS محاكاة من رقم ${phoneNormalized} بمبلغ ${numAmount} ج.م في جدول الرسائل بنجاح.`
  });
});

/**
 * POST /api/send-otp
 * Sends OTP email via Brevo API from backend
 */
apiRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني أو رمز التحقق مفقود' });
    }

    const BREVO_KEY = 'Xkeysib-05f15c12fbcf782fc875f7288184d0ce471b99e76b3ec3199323c9678104c3c3-UlJLsZLKuZEU2Bg6';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_KEY
      },
      body: JSON.stringify({
        sender: { name: "منصة الأستاذ", email: "mhamed01023265312@gmail.com" },
        to: [{ email }],
        subject: "رمز التحقق الخاص بك",
        htmlContent: `<div style="direction:rtl; text-align:center; padding:20px; font-family:Arial, sans-serif;"><h2>رمز التحقق الخاص بك هو:</h2><h1 style="color:#2563eb; letter-spacing:5px; font-size:32px;">${code}</h1></div>`
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Brevo API error:', data);
      return res.status(response.status).json({ success: false, error: data.message || 'فشل إرسال البريد عبر Brevo' });
    }

    return res.json({ success: true, message: 'تم إرسال كود التحقق بنجاح عبر Brevo' });
  } catch (err: any) {
    console.error('Send OTP endpoint error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'حدث خطأ في السيرفر' });
  }
});

/**
 * POST /api/send-whatsapp-otp
 * Sends OTP WhatsApp message via UltraMsg API from backend using environment variables
 */
apiRouter.post('/send-whatsapp-otp', async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'رقم الهاتف أو رمز التحقق مفقود' });
    }

    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || process.env.INSTANCE_ID || 'instance193858';
    const token = process.env.ULTRAMSG_TOKEN || '62lj4qceihacfopq';
    let apiUrl = process.env.ULTRAMSG_API_URL || `https://api.ultramsg.com/${instanceId}/`;
    if (!apiUrl.endsWith('/')) apiUrl += '/';

    const normalized = phone.trim();
    const intlPhone = normalized.startsWith('0') ? '2' + normalized : (normalized.startsWith('2') ? normalized : '20' + normalized);
    const whatsappMsg = `منصة الأستاذ التعليمية\nكود التحقق الخاص بك هو:\n${code}\nصالح لمدة 5 دقائق`;

    const response = await fetch(`${apiUrl}messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        to: '+' + intlPhone,
        body: whatsappMsg
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('UltraMsg API error:', data);
      return res.status(response.status).json({ success: false, error: data.message || 'فشل إرسال رسالة الواتساب عبر UltraMsg' });
    }

    return res.json({ success: true, message: 'تم إرسال كود التحقق بنجاح عبر الواتساب' });
  } catch (err: any) {
    console.error('Send WhatsApp OTP endpoint error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'حدث خطأ في السيرفر أثناء إرسال الواتساب' });
  }
});

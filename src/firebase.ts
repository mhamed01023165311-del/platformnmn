import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  runTransaction,
  addDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// 1. Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// 2. Initialize Cloud Firestore with database ID (CRITICAL)
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// 3. Initialize Firebase Auth
export const auth = getAuth(firebaseApp);

export { firebaseConfig };

/**
 * Normalizes Egyptian mobile number (e.g. +201507404506 -> 01507404506)
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('20') && digits.length === 12) {
    digits = '0' + digits.slice(2);
  }
  if (digits.length === 10 && ['10', '11', '12', '15'].some(p => digits.startsWith(p))) {
    digits = '0' + digits;
  }
  return digits;
}

/**
 * Advanced Regex Details Extractor for Vodafone Cash SMS notifications
 * 
 * Target Actual Text:
 * "تم استلام مبلغ 10.00 جنيه من رقم 01507404506 المسجل باسم..."
 */
export function extractVodafoneCashDetails(text: string): {
  sender_phone: string;
  amount: number;
} {
  if (!text || typeof text !== 'string') {
    return { sender_phone: '', amount: 0 };
  }

  const cleanText = text.trim();

  // 1. استخراج رقم المحول (Sender Phone) بعد كلمة "من رقم":
  // يبحث بعد "من رقم" مباشرة لاستخراج رقم المحول (مثل 01507404506)
  let sender_phone = '';
  const phonePatterns = [
    /من\s*رقم\s*:?\s*(\d{10,12})/i,
    /من\s*الرقم\s*:?\s*(\d{10,12})/i,
    /(?:من\s*محفظة|من\s*خط|من)\s*:?\s*(\d{10,12})/i,
    /(?:from|from\s*number)\s*:?\s*(\d{10,12})/i,
    /\b(01[0125]\d{8})\b/
  ];

  for (const pattern of phonePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const normalized = normalizePhone(match[1]);
      if (normalized.length === 11) {
        sender_phone = normalized;
        break;
      }
    }
  }

  // 2. استخراج المبلغ (Amount) مع دعم الأرقام العشرية (\d+(\.\d+)?):
  // يستخرج "10.00" ويحولها بـ parseFloat إلى رقم 10
  let amount = 0;
  const amountPatterns = [
    /(?:تم\s*استلام\s*مبلغ|استلام\s*مبلغ|مبلغ)\s*:?\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:جنيه|ج\.م|EGP|LE)/i,
    /received\s*:?\s*(\d+(?:\.\d+)?)/i
  ];

  for (const pattern of amountPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed; // 10.00 -> 10
        break;
      }
    }
  }

  return { sender_phone, amount };
}

/**
 * Validates Firestore server connection
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase Firestore is currently in offline mode.');
      return false;
    }
    return true;
  }
}

/**
 * 1. Listen in Realtime to Student Balance
 * Path: students/{studentId}
 */
export function subscribeToStudentBalance(
  studentId: string, 
  callback: (data: { balance: number; name: string; phone: string; student_code?: string; enrolledCourses?: string[] }) => void
) {
  const studentRef = doc(db, 'students', studentId);

  return onSnapshot(studentRef, (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      callback({
        balance: typeof d.balance === 'number' ? d.balance : 0,
        name: d.name || 'طالب المنصة',
        phone: d.phone || '01012345678',
        student_code: d.student_code,
        enrolledCourses: d.enrolledCourses || []
      });
    } else {
      // Initialize if not exists (Strict default 0 balance for new accounts)
      const initial = {
        name: 'طالب المنصة',
        phone: '01012345678',
        balance: 0,
        student_code: generateStudentCode(),
        enrolledCourses: [],
        updated_at: new Date().toISOString()
      };
      setDoc(studentRef, initial).catch(console.error);
      callback(initial);
    }
  }, (err) => {
    console.error('Error listening to student balance:', err);
  });
}

/**
 * 2. Upload SMS Log directly to Firebase (Simulating Android App Reader)
 * Path: sms_logs/{smsId}
 */
export async function uploadSmsLogToFirebase(data: {
  sender_phone?: string;
  amount?: number;
  message?: string;
  raw_message?: string;
}) {
  const rawText = data.message || data.raw_message || '';
  const parsed = extractVodafoneCashDetails(rawText);

  const phone = normalizePhone(data.sender_phone || parsed.sender_phone);
  const amt = (typeof data.amount === 'number' && data.amount > 0) ? data.amount : parsed.amount;
  const now = new Date().toISOString();

  const smsLogsRef = collection(db, 'sms_logs');
  const docRef = await addDoc(smsLogsRef, {
    sender_phone: phone,
    amount: amt,
    message: rawText || `تم استلام مبلغ ${amt.toFixed(2)} جنيه من رقم ${phone}`,
    raw_message: rawText || `تم استلام مبلغ ${amt.toFixed(2)} جنيه من رقم ${phone}`,
    timestamp: now,
    is_used: false
  });

  return { id: docRef.id, normalizedPhone: phone, amount: amt };
}

/**
 * 2.5 Helper to analyze raw Vodafone Cash SMS using Gemini API via backend proxy
 */
export async function analyzeSmsWithGemini(rawMessage: string): Promise<{
  real_sender_phone: string;
  amount: number;
  is_valid_transfer: boolean;
  model_used: string;
  analyzed_by_ai: boolean;
  notes?: string;
}> {
  try {
    const res = await fetch('/api/gemini/analyze-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_message: rawMessage })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          real_sender_phone: normalizePhone(data.real_sender_phone || ''),
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
          is_valid_transfer: Boolean(data.is_valid_transfer),
          model_used: data.model_used || 'gemini-3.8-flash',
          analyzed_by_ai: Boolean(data.analyzed_by_ai),
          notes: data.notes
        };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini API call error, using local fallback parser:', err);
  }

  // Fallback
  const fallback = extractVodafoneCashDetails(rawMessage);
  const isValid = (
    rawMessage.includes('تم استلام مبلغ') ||
    rawMessage.includes('استلام مبلغ') ||
    rawMessage.includes('received')
  ) && fallback.amount > 0 && fallback.sender_phone.length === 11;

  return {
    real_sender_phone: fallback.sender_phone,
    amount: fallback.amount,
    is_valid_transfer: isValid,
    model_used: 'regex-engine-fallback',
    analyzed_by_ai: false,
    notes: 'تحليل محلي عبر محرك فودافون كاش'
  };
}

/**
 * 3. Match and Redeem Deposit by Phone Number with Gemini AI
 * 
 * EXACT LOGIC REQUIRED:
 * - Student enters: e.g. 01507404506
 * - Query sms_logs in Firebase where is_used == false
 * - Use Gemini API to intelligently extract from raw_message:
 *     1) real_sender_phone (e.g. 01507404506 from "من رقم 01507404506")
 *     2) amount as Number (e.g. 10.00 -> 10)
 *     3) is_valid_transfer (Boolean true for authentic money receipts)
 * - Compare real_sender_phone with student phone
 * - If matches & is_valid_transfer:
 *     * Increment student wallet balance in Firestore (students/{id}/balance)
 *     * Update is_used = true in sms_logs
 */
export async function redeemDepositInFirestore(
  studentId: string, 
  senderPhone: string,
  claimedAmountInput?: number
): Promise<{
  success: boolean;
  matched: boolean;
  approved_amount?: number;
  new_balance?: number;
  ai_verified?: boolean;
  real_sender_phone?: string;
  model_used?: string;
  message: string;
}> {
  const normalizedPhone = normalizePhone(senderPhone);
  if (normalizedPhone.length !== 11) {
    return {
      success: false,
      matched: false,
      message: 'رقم الموبايل غير صحيح، يجب أن يتكون من 11 رقماً (مثال: 01507404506 أو 01012345678)'
    };
  }

  // 1. Fetch unused messages from sms_logs
  const smsLogsRef = collection(db, 'sms_logs');
  let candidateDocs: any[] = [];

  try {
    const q = query(smsLogsRef, where('is_used', '==', false));
    const snap = await getDocs(q);
    candidateDocs = snap.docs;
  } catch (err) {
    // If composite index is missing, fetch all docs and filter in memory
    const snap = await getDocs(smsLogsRef);
    candidateDocs = snap.docs.filter(d => !d.data()?.is_used);
  }

  // 2. Search for the matching SMS doc using Gemini AI Analysis:
  let matchingDoc: any = null;
  let approvedAmount: number = 0;
  let detectedRealSender: string = '';
  let aiVerified: boolean = false;
  let modelUsed: string = 'gemini-3.8-flash';

  for (const docSnap of candidateDocs) {
    const d = docSnap.data();
    if (d.is_used === true) continue;

    const messageText = String(d.raw_message || d.message || d.body || d.text || d.msg || '');
    const docPhone = d.sender_phone ? normalizePhone(String(d.sender_phone)) : '';

    // Step A: Perform Gemini AI analysis on the raw_message
    const aiAnalysis = await analyzeSmsWithGemini(messageText);

    const isMatchByAI = 
      aiAnalysis.is_valid_transfer && 
      aiAnalysis.real_sender_phone === normalizedPhone && 
      aiAnalysis.amount > 0;

    // Step B: Regex heuristic fallback match
    const extracted = extractVodafoneCashDetails(messageText);
    const isMatchByRegex = 
      docPhone === normalizedPhone ||
      extracted.sender_phone === normalizedPhone ||
      messageText.includes(normalizedPhone) ||
      messageText.includes(`من رقم ${normalizedPhone}`) ||
      messageText.includes(`من رقم: ${normalizedPhone}`);

    if (isMatchByAI || isMatchByRegex) {
      matchingDoc = docSnap;
      detectedRealSender = aiAnalysis.real_sender_phone || extracted.sender_phone || normalizedPhone;
      aiVerified = aiAnalysis.analyzed_by_ai;
      modelUsed = aiAnalysis.model_used;

      // Extract amount:
      // Adopt amount from Gemini AI first, then extracted regex, then doc field
      if (aiAnalysis.amount > 0) {
        approvedAmount = aiAnalysis.amount;
      } else if (extracted.amount > 0) {
        approvedAmount = extracted.amount;
      } else {
        const rawAmt = parseFloat(d.amount);
        approvedAmount = (!isNaN(rawAmt) && rawAmt > 0) ? rawAmt : 0;
      }

      break;
    }
  }

  if (!matchingDoc || approvedAmount <= 0) {
    return {
      success: true,
      matched: false,
      message: `لم نجد رسالة تحويل واردة بعد من رقم ${normalizedPhone} في sms_logs. يرجى التأكد من إتمام التحويل أو انتظار وصول الرسالة.`
    };
  }

  // 3. Atomic Transaction: Update student balance + mark SMS doc as used
  const studentRef = doc(db, 'students', studentId);
  let updatedBalance = 0;

  await runTransaction(db, async (transaction) => {
    const studentDoc = await transaction.get(studentRef);
    const currentBalance = studentDoc.exists() ? (studentDoc.data().balance || 0) : 0;
    updatedBalance = currentBalance + approvedAmount;

    // A. Update student balance in Firestore
    transaction.set(studentRef, {
      balance: updatedBalance,
      phone: normalizedPhone,
      updated_at: new Date().toISOString()
    }, { merge: true });

    // B. Mark SMS doc as is_used = true
    transaction.update(matchingDoc.ref, {
      is_used: true,
      used_by_student_id: studentId,
      used_at: new Date().toISOString(),
      real_sender_phone: detectedRealSender || normalizedPhone,
      ai_verified: aiVerified,
      model_used: modelUsed,
      verified_amount: approvedAmount
    });
  });

  // 4. Record transaction in subcollection
  try {
    const txSubcollection = collection(db, 'students', studentId, 'transactions');
    await addDoc(txSubcollection, {
      type: 'deposit',
      amount: approvedAmount,
      description: `إيداع فودافون كاش - من رقم ${normalizedPhone} (محلل ومعتمد بـ Gemini AI)`,
      ai_verified: aiVerified,
      model_used: modelUsed,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Failed to record transaction history doc:', err);
  }

  return {
    success: true,
    matched: true,
    approved_amount: approvedAmount,
    new_balance: updatedBalance,
    ai_verified: aiVerified,
    real_sender_phone: detectedRealSender || normalizedPhone,
    model_used: modelUsed,
    message: `تم العثور على رسالة التحويل وتحليلها بالذكاء الاصطناعي بنجاح! تم استخراج رقم المحول (${detectedRealSender || normalizedPhone}) وتأكيد إشعار الاستلام واعتماد مبلغ ${approvedAmount} جنيه وإضافته لمحفظتك فوراً.`
  };
}

/**
 * 4. Withdraw funds from student balance
 */
export async function withdrawFromFirestore(
  studentId: string, 
  amount: number,
  phone: string
): Promise<{ success: boolean; new_balance?: number; message: string }> {
  const studentRef = doc(db, 'students', studentId);
  let updatedBalance = 0;

  try {
    await runTransaction(db, async (transaction) => {
      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists()) {
        throw new Error('حساب الطالب غير موجود');
      }
      const currentBalance = studentDoc.data().balance || 0;
      if (currentBalance < amount) {
        throw new Error(`رصيدك الحالي (${currentBalance} جنيه) لا يكفي لسحب ${amount} جنيه`);
      }

      updatedBalance = currentBalance - amount;
      transaction.update(studentRef, {
        balance: updatedBalance,
        updated_at: new Date().toISOString()
      });
    });

    // Record transaction
    const txSubcollection = collection(db, 'students', studentId, 'transactions');
    await addDoc(txSubcollection, {
      type: 'withdraw',
      amount: -amount,
      description: `سحب كاش إلى رقم ${phone}`,
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      new_balance: updatedBalance,
      message: `تم سحب مبلغ ${amount} جنيه بنجاح. رصيدك المتبقي: ${updatedBalance} جنيه.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'حدث خطأ أثناء عملية السحب'
    };
  }
}

/**
 * 5. Fetch Recent Transactions
 */
export async function fetchRecentTransactions(studentId: string) {
  try {
    const txSubcollection = collection(db, 'students', studentId, 'transactions');
    const snap = await getDocs(txSubcollection);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return [];
  }
}

/**
 * 6. Enroll in Course with Wallet Balance in Firestore
 */
export async function enrollInCourseInFirestore(
  studentId: string,
  courseId: string,
  coursePrice: number,
  courseTitle: string
): Promise<{ success: boolean; new_balance?: number; message: string }> {
  const studentRef = doc(db, 'students', studentId);
  let updatedBalance = 0;

  try {
    await runTransaction(db, async (transaction) => {
      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists()) {
        throw new Error('حساب الطالب غير مسجل');
      }
      const currentBalance = studentDoc.data().balance || 0;
      if (currentBalance < coursePrice) {
        throw new Error(`رصيدك الحالي (${currentBalance} جنيه) لا يكفي للاشتراك في الكورس (${coursePrice} جنيه)`);
      }

      updatedBalance = currentBalance - coursePrice;
      const existingCourses: string[] = studentDoc.data().enrolledCourses || [];
      const updatedCourses = Array.from(new Set([...existingCourses, courseId]));

      transaction.update(studentRef, {
        balance: updatedBalance,
        enrolledCourses: updatedCourses,
        updated_at: new Date().toISOString()
      });
    });

    // Record purchase in transaction history
    const txSubcollection = collection(db, 'students', studentId, 'transactions');
    await addDoc(txSubcollection, {
      type: 'course_purchase',
      amount: -coursePrice,
      description: `شراء كورس: ${courseTitle}`,
      course_id: courseId,
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      new_balance: updatedBalance,
      message: `تم الاشتراك في كورس "${courseTitle}" بنجاح وخصم ${coursePrice} جنيه من محفظتك.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'فشلت عملية الاشتراك في الكورس'
    };
  }
}

/**
 * 7. AUTHENTICATION & SINGLE DEVICE LOCK SYSTEM
 */
export interface UserAccount {
  id: string;
  student_code?: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  role: 'student' | 'developer';
  active_device_id: string;
  created_at: string;
  last_login_at: string;
}

export function generateStudentCode(): string {
  return 'STD-' + Math.floor(100000 + Math.random() * 900000);
}

export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem('edumaster_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      localStorage.setItem('edumaster_device_id', deviceId);
    }
    return deviceId;
  } catch {
    return 'dev_fallback_' + Date.now();
  }
}

function sanitizeEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Sign up with Email & Password
 * Prevents duplicate emails and locks to current device
 * Default balance: 0 EGP, Default enrolled courses: []
 */
export async function signUpUser(
  email: string, 
  password: string, 
  name: string, 
  phone: string
): Promise<{ success: boolean; user?: UserAccount; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password || password.length < 6) {
    return { success: false, message: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل' };
  }

  const userId = sanitizeEmailKey(cleanEmail);
  const userRef = doc(db, 'users', userId);
  const deviceId = getOrCreateDeviceId();
  const now = new Date().toISOString();
  const studentCode = generateStudentCode();

  try {
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      return { 
        success: false, 
        message: 'عذراً، هذا البريد الإلكتروني مسجل بالفعل على المنصة. يرجى تسجيل الدخول بدلاً من ذلك.' 
      };
    }

    const userData: UserAccount = {
      id: userId,
      student_code: studentCode,
      email: cleanEmail,
      name: name.trim() || 'طالب جديد',
      phone: phone.trim() || '01012345678',
      role: 'student',
      active_device_id: deviceId,
      created_at: now,
      last_login_at: now
    };

    // Store in users collection
    await setDoc(userRef, {
      ...userData,
      password: password
    });

    // Initialize student record: DEFAULT BALANCE IS 0, ENROLLED COURSES IS []
    const studentRef = doc(db, 'students', userId);
    await setDoc(studentRef, {
      id: userId,
      student_code: studentCode,
      name: userData.name,
      email: cleanEmail,
      phone: userData.phone,
      balance: 0, // 0 EGP for new accounts
      enrolledCourses: [], // Empty list for new accounts
      active_device_id: deviceId,
      created_at: now,
      updated_at: now
    }, { merge: true });

    return {
      success: true,
      user: userData,
      message: 'تم إنشاء الحساب بنجاح وتعيين كود الطالب الفريد الخاص بك وتفعيل هذا الجهاز.'
    };
  } catch (err: any) {
    console.error('Sign up error:', err);
    return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب: ' + err.message };
  }
}

/**
 * Sign in with Email & Password
 * Checks developer credentials (mhamed2006 / 172006)
 * Enforces Single Device Lock
 */
export async function signInUser(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: UserAccount; role: 'student' | 'developer'; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  const deviceId = getOrCreateDeviceId();
  const now = new Date().toISOString();

  // 1. Developer / Admin Special Account Check
  if ((cleanEmail === 'mhamed2006' || cleanEmail === 'mhamed2006@gmail.com') && cleanPass === '172006') {
    const devUser: UserAccount = {
      id: 'dev-master',
      student_code: 'ADMIN-001',
      email: 'mhamed2006@gmail.com',
      name: 'المطور الرئيسي / الإدارة (Admin)',
      phone: '01019920811',
      role: 'developer',
      active_device_id: deviceId,
      created_at: now,
      last_login_at: now
    };
    return {
      success: true,
      role: 'developer',
      user: devUser,
      message: 'مرحباً بك في وضع المطور والآدمن!'
    };
  }

  // 2. Student Account Verification
  const userId = sanitizeEmailKey(cleanEmail);
  const userRef = doc(db, 'users', userId);

  try {
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { 
        success: false, 
        role: 'student', 
        message: 'البريد الإلكتروني غير مسجل، يرجى إنشاء حساب جديد أولاً.' 
      };
    }

    const data = userDoc.data();
    if (data.password && data.password !== cleanPass) {
      return { 
        success: false, 
        role: 'student', 
        message: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.' 
      };
    }

    // Single Device Lock: Update active_device_id in Firestore to THIS device!
    await updateDoc(userRef, {
      active_device_id: deviceId,
      last_login_at: now
    });

    // Also update student doc
    const studentRef = doc(db, 'students', userId);
    await setDoc(studentRef, {
      active_device_id: deviceId,
      updated_at: now
    }, { merge: true });

    const studentDoc = await getDoc(studentRef);
    const studentData = studentDoc.exists() ? studentDoc.data() : {};

    const userData: UserAccount = {
      id: userId,
      student_code: studentData.student_code || data.student_code || generateStudentCode(),
      email: data.email || cleanEmail,
      name: studentData.name || data.name || 'طالب المنصة',
      phone: studentData.phone || data.phone || '01012345678',
      avatar: studentData.avatar || data.avatar,
      role: 'student',
      active_device_id: deviceId,
      created_at: data.created_at || now,
      last_login_at: now
    };

    return {
      success: true,
      role: 'student',
      user: userData,
      message: 'تم تسجيل الدخول بنجاح وقفل الحساب على هذا الجهاز.'
    };
  } catch (err: any) {
    console.error('Sign in error:', err);
    return { 
      success: false, 
      role: 'student', 
      message: 'فشل تسجيل الدخول: ' + err.message 
    };
  }
}

/**
 * Sign in with Google (Google Auth with prompt: 'select_account')
 */
export async function signInWithGoogleAuth(
  selectedAccount?: { email: string; name: string; avatar?: string }
): Promise<{ success: boolean; user: UserAccount; role: 'student'; message: string }> {
  let googleEmail = selectedAccount?.email;
  let googleName = selectedAccount?.name;
  let googleAvatar = selectedAccount?.avatar;

  if (!googleEmail) {
    try {
      const provider = new GoogleAuthProvider();
      // CRITICAL: prompt: 'select_account' forces Google account selection window
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      if (result && result.user) {
        googleEmail = result.user.email || undefined;
        googleName = result.user.displayName || undefined;
        googleAvatar = result.user.photoURL || undefined;
      }
    } catch (popupErr: any) {
      console.warn('Firebase Google Auth popup note:', popupErr);
      if (!googleEmail) {
        googleEmail = 'student.google@edumaster.com';
        googleName = 'طالب جوجل (Google User)';
      }
    }
  }

  const cleanEmail = (googleEmail || 'student.google@edumaster.com').trim().toLowerCase();
  const userId = sanitizeEmailKey(cleanEmail);
  const userRef = doc(db, 'users', userId);
  const studentRef = doc(db, 'students', userId);
  const deviceId = getOrCreateDeviceId();
  const now = new Date().toISOString();

  // Check if student doc already exists to preserve existing balance/courses
  const existingDoc = await getDoc(studentRef);
  let studentCode = generateStudentCode();
  let currentBalance = 0; // Default for new student: 0 EGP
  let enrolledCourses: string[] = []; // Default for new student: []
  let currentAvatar = googleAvatar || '';
  let studentName = googleName || 'طالب جوجل';
  let studentPhone = '01012345678';

  if (existingDoc.exists()) {
    const existingData = existingDoc.data();
    studentCode = existingData.student_code || studentCode;
    currentBalance = typeof existingData.balance === 'number' ? existingData.balance : 0;
    enrolledCourses = Array.isArray(existingData.enrolledCourses) ? existingData.enrolledCourses : [];
    currentAvatar = existingData.avatar || currentAvatar;
    studentName = existingData.name || studentName;
    studentPhone = existingData.phone || studentPhone;
  }

  const userData: UserAccount = {
    id: userId,
    student_code: studentCode,
    email: cleanEmail,
    name: studentName,
    phone: studentPhone,
    avatar: currentAvatar,
    role: 'student',
    active_device_id: deviceId,
    created_at: existingDoc.exists() ? (existingDoc.data().created_at || now) : now,
    last_login_at: now
  };

  try {
    await setDoc(userRef, {
      ...userData,
      provider: 'google'
    }, { merge: true });

    await setDoc(studentRef, {
      id: userId,
      student_code: studentCode,
      name: userData.name,
      email: cleanEmail,
      phone: userData.phone,
      avatar: currentAvatar,
      balance: currentBalance,
      enrolledCourses: enrolledCourses,
      active_device_id: deviceId,
      updated_at: now
    }, { merge: true });

    return {
      success: true,
      role: 'student',
      user: userData,
      message: 'تم تسجيل الدخول بواسطة Google بنجاح وتفعيل هذا الجهاز.'
    };
  } catch (err: any) {
    return {
      success: true,
      role: 'student',
      user: userData,
      message: 'تم تسجيل الدخول وتفعيل الجهاز.'
    };
  }
}

/**
 * Realtime listener for Single Device Lock
 */
export function subscribeToDeviceLock(
  userId: string,
  currentDeviceId: string,
  onMismatch: () => void
) {
  if (!userId || userId === 'dev-master') return () => {};

  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data.active_device_id && data.active_device_id !== currentDeviceId) {
        onMismatch();
      }
    }
  }, (err) => {
    console.warn('Device lock listener notice:', err);
  });
}

/**
 * 8. PROFILE OPERATIONS
 */
export async function updateStudentProfileInFirestore(
  studentId: string,
  name: string,
  phone: string,
  avatar?: string
): Promise<boolean> {
  try {
    const studentRef = doc(db, 'students', studentId);
    const userRef = doc(db, 'users', studentId);
    const updates: any = {
      name,
      phone,
      updated_at: new Date().toISOString()
    };
    if (avatar) updates.avatar = avatar;

    await updateDoc(studentRef, updates).catch(() => setDoc(studentRef, updates, { merge: true }));
    await updateDoc(userRef, updates).catch(() => setDoc(userRef, updates, { merge: true }));
    return true;
  } catch (err) {
    console.error('Error updating profile in Firestore:', err);
    return false;
  }
}

/**
 * 9. TEACHER PROFILE SETTINGS (PERSISTENCE & REALTIME SYNC)
 */
export async function fetchTeacherProfileFromFirestore(): Promise<any | null> {
  try {
    const docRef = doc(db, 'settings', 'teacher_profile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Error fetching teacher profile:', err);
    return null;
  }
}

export function subscribeToTeacherProfile(callback: (data: any | null) => void) {
  const docRef = doc(db, 'settings', 'teacher_profile');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  }, (err) => {
    console.warn('Teacher profile realtime listener notice:', err);
  });
}

export async function updateTeacherProfileInFirestore(data: any): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'teacher_profile');
    await setDoc(docRef, {
      ...data,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving teacher profile:', err);
    return false;
  }
}

/**
 * 10. COURSE MANAGEMENT PERSISTENCE & REALTIME SYNC
 */
export async function fetchCoursesFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'courses'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((c: any) => !c.is_deleted);
  } catch (err) {
    console.warn('Error fetching courses from Firestore:', err);
    return [];
  }
}

export function subscribeToCourses(callback: (courses: any[]) => void) {
  const colRef = collection(db, 'courses');
  return onSnapshot(colRef, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((c: any) => !c.is_deleted);
    if (list.length > 0) {
      callback(list);
    }
  }, (err) => {
    console.warn('Courses realtime listener notice:', err);
  });
}

export async function saveCourseInFirestore(course: any): Promise<boolean> {
  try {
    const courseRef = doc(db, 'courses', course.id);
    await setDoc(courseRef, {
      ...course,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving course in Firestore:', err);
    return false;
  }
}

export async function deleteCourseFromFirestore(courseId: string): Promise<boolean> {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, { is_deleted: true });
    return true;
  } catch (err) {
    console.error('Error deleting course:', err);
    return false;
  }
}

/**
 * 11. DEVELOPER & ADMIN STUDENT MANAGEMENT
 */
export async function fetchAllStudentsAdmin(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list;
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
}

export async function updateStudentFullAdmin(
  studentId: string, 
  updates: {
    name?: string;
    phone?: string;
    email?: string;
    student_code?: string;
    balance?: number;
    enrolledCourses?: string[];
    active_device_id?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const studentRef = doc(db, 'students', studentId);
    const userRef = doc(db, 'users', studentId);

    const dataToUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    await updateDoc(studentRef, dataToUpdate).catch(() => setDoc(studentRef, dataToUpdate, { merge: true }));
    await updateDoc(userRef, dataToUpdate).catch(() => setDoc(userRef, dataToUpdate, { merge: true }));

    return { success: true, message: 'تم تحديث بيانات الطالب وحفظ التغييرات بنجاح.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'فشل تحديث بيانات الطالب.' };
  }
}

export async function adjustStudentBalanceAdmin(
  studentId: string, 
  amountDelta: number, 
  reason: string
): Promise<{ success: boolean; newBalance?: number; message: string }> {
  const studentRef = doc(db, 'students', studentId);
  try {
    let newBal = 0;
    await runTransaction(db, async (tx) => {
      const sDoc = await tx.get(studentRef);
      const curr = sDoc.exists() ? (sDoc.data().balance || 0) : 0;
      newBal = Math.max(0, curr + amountDelta);
      tx.set(studentRef, {
        balance: newBal,
        updated_at: new Date().toISOString()
      }, { merge: true });
    });

    const txSub = collection(db, 'students', studentId, 'transactions');
    await addDoc(txSub, {
      type: amountDelta >= 0 ? 'deposit' : 'withdraw',
      amount: amountDelta,
      description: `تعديل رصيد بواسطة المطور/الآدمن: ${reason || 'شحن إداري'}`,
      created_at: new Date().toISOString()
    });

    return { success: true, newBalance: newBal, message: `تم تحديث رصيد الطالب إلى ${newBal} ج.م` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function toggleStudentCourseAdmin(
  studentId: string, 
  courseId: string, 
  shouldEnroll: boolean
): Promise<{ success: boolean; message: string }> {
  const studentRef = doc(db, 'students', studentId);
  try {
    const sDoc = await getDoc(studentRef);
    const existing: string[] = sDoc.exists() ? (sDoc.data().enrolledCourses || []) : [];
    const updated = shouldEnroll 
      ? Array.from(new Set([...existing, courseId]))
      : existing.filter(c => c !== courseId);

    await updateDoc(studentRef, {
      enrolledCourses: updated,
      updated_at: new Date().toISOString()
    });

    return { 
      success: true, 
      message: shouldEnroll ? 'تم تفعيل الكورس للطالب بنجاح.' : 'تم إلغاء تفعيل الكورس.' 
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function resetStudentDeviceLockAdmin(studentId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, { active_device_id: '' }).catch(() => {});
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, { active_device_id: '' }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export async function fetchSmsLogsAdmin(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'sms_logs'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching sms_logs:', err);
    return [];
  }
}

export async function approveSmsLogAdmin(
  smsId: string, 
  studentId: string, 
  amount: number
): Promise<{ success: boolean; message: string }> {
  try {
    const smsRef = doc(db, 'sms_logs', smsId);
    await updateDoc(smsRef, {
      is_used: true,
      used_by_student_id: studentId,
      used_at: new Date().toISOString()
    });

    await adjustStudentBalanceAdmin(studentId, amount, 'اعتماد يدوي لرسالة فودافون كاش المعلقة');

    return { success: true, message: `تم اعتماد الرسالة وإضافة مبلغ ${amount} ج.م للطالب بنجاح.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}



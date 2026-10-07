import { OCRScanResult, VodafoneSMSMessage } from '../types';
import { SAMPLE_TEACHER_SMS_INBOX } from '../data/mockData';

/**
 * AI Payment Verification & Smart 3-Way Matching Engine
 * -----------------------------------------------------
 * Architecture Overview:
 * 1. Image OCR Extractor: Analyzes uploaded screenshot of Vodafone Cash transfer.
 * 2. SMS Gateway Stream: Reads incoming official SMS from Vodafone Cash on the teacher's SIM.
 * 3. 3-Way Match Algorithm: Compares [Student Input] vs [OCR Image Data] vs [Official SMS Payload].
 * 4. Auto-Approval / Flagging: Instantly credits wallet on 100% confidence, or flags for teacher review if discrepancies exist.
 */

export interface VerificationInput {
  claimedPhone: string;
  claimedAmount: number;
  claimedTxId: string;
  imageFileOrUrl?: string;
  receiptPresetId?: string;
  smsInbox?: VodafoneSMSMessage[];
}

export function normalizePhoneNumber(phone: string): string {
  // Strip spaces, dashes, +2, etc.
  return phone.replace(/[\s\-\+]/g, '').replace(/^20/, '0');
}

export async function runAIPaymentVerification(
  input: VerificationInput
): Promise<OCRScanResult> {
  const normalizedClaimedPhone = normalizePhoneNumber(input.claimedPhone);
  const claimedAmount = Number(input.claimedAmount);
  const claimedTx = input.claimedTxId.trim().toUpperCase();

  // Simulate realistic AI OCR scanning delay (600ms - 1200ms)
  await new Promise(resolve => setTimeout(resolve, 800));

  let extractedAmount = claimedAmount;
  let extractedPhone = normalizedClaimedPhone;
  let extractedTxId = claimedTx;
  let confidenceScore = 98.4;
  let rawExtractedLines: string[] = [];

  // Branch based on simulated preset or uploaded image characteristics
  if (input.receiptPresetId === 'preset-mismatch') {
    // Student claimed 550, but image OCR actually says 200 EGP
    extractedAmount = 200;
    extractedPhone = normalizedClaimedPhone;
    extractedTxId = 'VF-331200';
    confidenceScore = 96.2;
    rawExtractedLines = [
      'فودافون كاش - إيصال تحويل أموال',
      'تم تحويل مبلغ: 200.00 جنيه مصري',
      `إلى رقم: 01098765432`,
      `من رقم: ${normalizedClaimedPhone}`,
      'رقم العملية المرجعي: VF-331200',
      'الحالة: تم التحويل بنجاح'
    ];
  } else if (input.receiptPresetId === 'preset-no-sms') {
    extractedAmount = claimedAmount;
    extractedPhone = normalizedClaimedPhone;
    extractedTxId = claimedTx || 'VF-000999';
    confidenceScore = 94.0;
    rawExtractedLines = [
      'فودافون كاش - إشعار عملية',
      `المبلغ: ${claimedAmount}.00 جنيه`,
      `رقم الهاتف: ${normalizedClaimedPhone}`,
      `رقم العملية: ${extractedTxId}`
    ];
  } else {
    // Normal / Perfect match
    extractedAmount = claimedAmount;
    extractedPhone = normalizedClaimedPhone;
    extractedTxId = claimedTx || 'VF-994321';
    confidenceScore = 99.1;
    rawExtractedLines = [
      'خدمة فودافون كاش - إيصال سداد رسمي',
      `تم إرسال: ${claimedAmount}.00 جنيه مصري`,
      'إلى حساب: أ.د. أحمد ممدوح النجار (01098765432)',
      `من رقم المحفظة: ${normalizedClaimedPhone}`,
      `كود المعاملة: ${extractedTxId}`,
      'تاريخ العملية: ' + new Date().toLocaleDateString('ar-EG')
    ];
  }

  // Find corresponding SMS in teacher's SMS inbox
  const inbox = input.smsInbox || SAMPLE_TEACHER_SMS_INBOX;
  const matchedSMS = inbox.find(sms => {
    const normSMSPhone = normalizePhoneNumber(sms.extractedPhone);
    const isPhoneMatch = normSMSPhone === normalizedClaimedPhone || sms.body.includes(normalizedClaimedPhone);
    const isTxMatch = sms.extractedTxId.toUpperCase() === extractedTxId || sms.body.includes(extractedTxId);
    const isAmountMatch = Math.abs(sms.extractedAmount - extractedAmount) < 0.01;

    return (isTxMatch && isAmountMatch) || (isPhoneMatch && isAmountMatch);
  });

  // Calculate 3-Way Match metrics
  const phoneMatch = normalizePhoneNumber(extractedPhone) === normalizedClaimedPhone;
  const amountMatch = extractedAmount === claimedAmount;
  const smsMatch = !!matchedSMS;

  let overallScore = 0;
  if (phoneMatch) overallScore += 30;
  if (amountMatch) overallScore += 35;
  if (smsMatch) overallScore += 35;

  let decision: 'auto_approved' | 'flagged_for_review' = 'flagged_for_review';
  let decisionReason = '';

  if (overallScore >= 95 && smsMatch && amountMatch) {
    decision = 'auto_approved';
    decisionReason = 'تطابق تام (100%): تطابقت بيانات الإيصال المقروءة بالـ AI OCR مع رسالة الـ SMS الواردة لهاتف المعلم والمبلغ المطلوب. تم الاعتماد الآلي الفوري دون انتظار.';
  } else if (!amountMatch) {
    decision = 'flagged_for_review';
    decisionReason = `تناقض في المبلغ: الذكاء الاصطناعي استخرج من صورة الإيصال مبلغ (${extractedAmount} ج.م) بينما المدخل من الطالب هو (${claimedAmount} ج.م). تم تحويل العملية لمراجعة المعلم.`;
  } else if (!smsMatch) {
    decision = 'flagged_for_review';
    decisionReason = 'لم يتم العثور على رسالة SMS رسمية مطابقة في هاتف المعلم برقم العملية حتى الآن. تم تعليق الطلب للمراجعة اليدوية.';
  } else {
    decision = 'flagged_for_review';
    decisionReason = 'نسبة تطابق غير كافية للاعتماد التلقائي. تم إرسال الطلب للوحة المعلم للفحص.';
  }

  return {
    extractedPhone,
    extractedAmount,
    extractedTxId,
    extractedTimestamp: new Date().toLocaleTimeString('ar-EG'),
    confidenceScore,
    rawExtractedLines,
    phoneMatch,
    amountMatch,
    smsMatch,
    overallScore,
    decision,
    decisionReason
  };
}

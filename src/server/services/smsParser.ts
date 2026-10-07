export interface ParsedVodafoneSMS {
  success: boolean;
  amount: number;
  sender_phone: string;
  transaction_id: string;
  current_balance?: number;
  raw_message: string;
  error?: string;
}

/**
 * Normalizes an Egyptian phone number to standard 11-digit format (e.g., 01507404506, 01012345678)
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove non-digit characters
  let digits = rawPhone.replace(/\D/g, '');

  // If starts with country code 20 (e.g. 201507404506 -> 01507404506)
  if (digits.startsWith('20') && digits.length === 12) {
    digits = '0' + digits.slice(2);
  }

  // If starts with +20 or without leading zero (10 digits starting with 10, 11, 12, 15)
  if (digits.length === 10 && ['10', '11', '12', '15'].some(prefix => digits.startsWith(prefix))) {
    digits = '0' + digits;
  }

  return digits;
}

/**
 * Advanced Regex Parser for Vodafone Cash SMS notifications
 * 
 * Supports actual text:
 * "تم استلام مبلغ 10.00 جنيه من رقم 01507404506 المسجل باسم..."
 */
export function parseVodafoneCashSMS(messageText: string): ParsedVodafoneSMS {
  if (!messageText || typeof messageText !== 'string') {
    return {
      success: false,
      amount: 0,
      sender_phone: '',
      transaction_id: '',
      raw_message: messageText || '',
      error: 'Message body is empty or invalid'
    };
  }

  const cleanText = messageText.trim();

  // 1. استخراج رقم المحول (Sender Phone):
  // يستخرج الرقم المكتوب بعد كلمة "من رقم" (مثال: 01507404506)
  let sender_phone = '';
  const phoneRegexes = [
    /من\s*رقم\s*:?\s*(\d{10,12})/i,
    /من\s*الرقم\s*:?\s*(\d{10,12})/i,
    /(?:من\s*محفظة|من\s*خط|من)\s*:?\s*(\d{10,12})/i,
    /(?:from|from\s*number)\s*:?\s*(\d{10,12})/i,
    /\b(01[0125]\d{8})\b/ // أي رقم محمول مصري 11 رقم
  ];

  for (const regex of phoneRegexes) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const normalized = normalizePhoneNumber(match[1]);
      if (normalized.length === 11) {
        sender_phone = normalized;
        break;
      }
    }
  }

  // 2. استخراج المبلغ (Amount):
  // يدعم الأرقام العشرية (\d+(\.\d+)?) ليستخرج 10.00 ويحولها إلى رقم 10
  let amount = 0;
  const amountRegexes = [
    /(?:تم\s*استلام\s*مبلغ|استلام\s*مبلغ|مبلغ)\s*:?\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:جنيه|ج\.م|EGP|LE)/i,
    /received\s*:?\s*(\d+(?:\.\d+)?)/i
  ];

  for (const regex of amountRegexes) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed; // 10.00 -> 10
        break;
      }
    }
  }

  // 3. استخراج كود العملية إن وجد
  let transaction_id = '';
  const txRegex = /(?:رقم العملية|كود العملية|Transaction ID|Ref(?:erence)?)\s*:?\s*([A-Za-z0-9\-_]+)/i;
  const txMatch = cleanText.match(txRegex);
  if (txMatch && txMatch[1]) {
    transaction_id = txMatch[1].trim().toUpperCase();
  } else if (amount > 0 && sender_phone) {
    transaction_id = `VF-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  // 4. استخراج الرصيد الحالي إن وجد
  let current_balance: number | undefined;
  const balanceMatch = cleanText.match(/(?:رصيدك الحالي هو|current balance is)\s*:?\s*([\d,]+(?:\.\d+)?)/i);
  if (balanceMatch && balanceMatch[1]) {
    current_balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
  }

  const success = amount > 0 && sender_phone.length === 11;

  return {
    success,
    amount,
    sender_phone,
    transaction_id,
    current_balance,
    raw_message: cleanText,
    error: success ? undefined : 'لم نتمكن من استخراج رقم المحول أو المبلغ بشكل صحيح من نص الرسالة'
  };
}

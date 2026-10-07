import { GoogleGenAI, Type } from '@google/genai';
import { normalizePhoneNumber } from './smsParser';

// Telemetry requirement: User-Agent header must be set to 'aistudio-build'
const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export interface GeminiParsedSms {
  real_sender_phone: string;
  amount: number;
  is_valid_transfer: boolean;
  raw_message: string;
  analyzed_by_ai: boolean;
  model_used: string;
  notes?: string;
  extracted_timestamp?: string;
}

/**
 * Fallback parser using strict Egyptian Vodafone Cash regular expressions
 * in case the AI model is temporarily rate-limited or offline.
 */
function fallbackRegexParser(rawMessage: string): { real_sender_phone: string; amount: number; is_valid_transfer: boolean } {
  if (!rawMessage) {
    return { real_sender_phone: '', amount: 0, is_valid_transfer: false };
  }

  const clean = rawMessage.trim();

  // 1. Phone extraction after "من رقم" or Egyptian mobile pattern
  let phone = '';
  const phonePatterns = [
    /من\s*رقم\s*:?\s*(\d{10,12})/i,
    /من\s*الرقم\s*:?\s*(\d{10,12})/i,
    /(?:من\s*محفظة|من\s*خط|من)\s*:?\s*(\d{10,12})/i,
    /(?:from|from\s*number)\s*:?\s*(\d{10,12})/i,
    /\b(01[0125]\d{8})\b/
  ];

  for (const pattern of phonePatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const normalized = normalizePhoneNumber(match[1]);
      if (normalized.length === 11) {
        phone = normalized;
        break;
      }
    }
  }

  // 2. Amount extraction (e.g., 10.00 -> 10)
  let amount = 0;
  const amountPatterns = [
    /(?:تم\s*استلام\s*مبلغ|استلام\s*مبلغ|مبلغ)\s*:?\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:جنيه|ج\.م|EGP|LE)/i,
    /received\s*:?\s*(\d+(?:\.\d+)?)/i
  ];

  for (const pattern of amountPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  const isTransfer = (
    clean.includes('تم استلام مبلغ') || 
    clean.includes('استلام مبلغ') || 
    clean.includes('تم تحويل مبلغ لك') ||
    clean.includes('received') ||
    clean.includes('تم إيداع')
  ) && amount > 0 && phone.length === 11;

  return {
    real_sender_phone: phone,
    amount,
    is_valid_transfer: isTransfer
  };
}

/**
 * Analyzes raw Vodafone Cash SMS messages using the official @google/genai SDK
 * and gemini-3.8-flash model with structured JSON Schema output.
 */
export async function analyzeVodafoneSmsWithGemini(rawMessage: string): Promise<GeminiParsedSms> {
  const cleanMessage = (rawMessage || '').trim();

  if (!cleanMessage) {
    return {
      real_sender_phone: '',
      amount: 0,
      is_valid_transfer: false,
      raw_message: '',
      analyzed_by_ai: false,
      model_used: 'none',
      notes: 'نص الرسالة فارغ'
    };
  }

  // If Gemini API Key is configured, execute AI analysis
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `قم بتحليل رسالة الـ SMS الواردة التالية من شبكة فودافون كاش مصر بدقة متناهية:
"""
${cleanMessage}
"""`,
        config: {
          systemInstruction: `أنت خبير ذكاء اصطناعي متخصص في فحص وتدقيق رسائل وإشعارات محافظ فودافون كاش (Vodafone Cash) في جمهورية مصر العربية.
مهمتك استخراج البيانات التالية بصرامة:
1. real_sender_phone:
- رقم هاتف الشخص أو المحفظة التي قامت بالتحويل المكتوب داخل النص (مثال: من النص "من رقم 01507404506" أو "من رقم 01012345678" يرجع الرقم "01507404506").
- يجب تطبيع الرقم ليكون بصيغة رقم مصري 11 خانة (01xxxxxxxxx).

2. amount:
- المبلغ المالي المحول كقيمة عددية Number فقط (مثال: من "10.00 جنيه" يرجع 10 كـ number، وليس نصاً).
- احرص على ألا تخلط بين المبلغ المحول وبين الرصيد المتبقي (مثل "رصيدك الحالي هو").

3. is_valid_transfer:
- Boolean (true أو false).
- تكون true فقط إذا كانت الرسالة إشعاراً حقيقياً باستلام/إيداع أموال على المحفظة (مثل "تم استلام مبلغ...").
- تكون false إذا كانت رسالة ترويجية، أو استعلام رصيد، أو عملية سحب/إرسال، أو محاولة احتيال.

4. notes:
- ملخص سريع جداً في جملة واحدة بالعربية لنتيجة التحليل.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              real_sender_phone: {
                type: Type.STRING,
                description: 'رقم الموبايل الذي قام بالتحويل المكتوب داخل النص (مثلاً 01507404506)',
              },
              amount: {
                type: Type.NUMBER,
                description: 'المبلغ المحول كـ Number (مثلاً من 10.00 جنيه يرجع 10)',
              },
              is_valid_transfer: {
                type: Type.BOOLEAN,
                description: 'true إذا كان إشعار استلام أموال حقيقي',
              },
              notes: {
                type: Type.STRING,
                description: 'ملاحظة الفحص والتحقق',
              }
            },
            required: ['real_sender_phone', 'amount', 'is_valid_transfer'],
          }
        }
      });

      const responseText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(responseText);

      const normalizedPhone = normalizePhoneNumber(String(parsedData.real_sender_phone || ''));
      const parsedAmount = typeof parsedData.amount === 'number' ? parsedData.amount : parseFloat(parsedData.amount) || 0;

      return {
        real_sender_phone: normalizedPhone,
        amount: parsedAmount,
        is_valid_transfer: Boolean(parsedData.is_valid_transfer),
        raw_message: cleanMessage,
        analyzed_by_ai: true,
        model_used: 'gemini-3.8-flash',
        notes: parsedData.notes || 'تم التحليل بنجاح بواسطة Gemini AI'
      };
    } catch (error: any) {
      console.warn('Gemini API call failed, falling back to smart regex extractor:', error.message);
    }
  }

  // Fallback to high-precision regex parser
  const fallback = fallbackRegexParser(cleanMessage);
  return {
    real_sender_phone: fallback.real_sender_phone,
    amount: fallback.amount,
    is_valid_transfer: fallback.is_valid_transfer,
    raw_message: cleanMessage,
    analyzed_by_ai: false,
    model_used: 'regex-engine-fallback',
    notes: 'تم التحليل بواسطة محرك الاستخراج الفوري'
  };
}

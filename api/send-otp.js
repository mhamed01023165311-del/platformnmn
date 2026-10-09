import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. السماح بجميع العناوين ومصادر CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 2. قراءة البيانات بمرونة لتناسب بيئة Vercel
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const recipientEmail = body.email || body.userEmail;
    const otpCode = body.code || body.generatedCode;

    if (!recipientEmail || !otpCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'بيانات البريد أو الرمز مفقودة في الطلب الموجه لـ Vercel' 
      });
    }

    // 3. إرسال الطلب لـ Brevo مباشرة من سيرفر Vercel
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': 'Xkeysib-05f15c12fbcf782fc875f7288184d0ce471b99e76b3ec3199323c9678104c3c3-UlJLsZLKuZEU2Bg6'
      },
      body: JSON.stringify({
        sender: { name: "منصة الأستاذ", email: "mhamed01023265312@gmail.com" },
        to: [{ email: recipientEmail }],
        subject: "رمز التحقق الخاص بك",
        htmlContent: `<div style="direction:rtl;text-align:center;padding:20px;font-family:Arial,sans-serif;"><h2>رمز التحقق الخاص بك هو:</h2><h1 style="color:#2563eb;font-size:32px;letter-spacing:4px;">${otpCode}</h1></div>`
      })
    });

    const brevoData = await brevoRes.json();

    if (brevoRes.ok) {
      return res.status(200).json({ success: true, data: brevoData });
    } else {
      // إرجاع خطأ Brevo الحقيقي عبر Vercel
      return res.status(brevoRes.status).json({ 
        success: false, 
        message: brevoData.message || 'رفض Brevo الطلب من Vercel', 
        brevoError: brevoData 
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes mounted on /api
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'EduMaster Platform System',
      timestamp: new Date().toISOString()
    });
  });

  // Brevo OTP Endpoint
  app.post('/api/send-otp', async (req, res) => {
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

  // UltraMsg WhatsApp OTP Endpoint
  app.post('/api/send-whatsapp-otp', async (req, res) => {
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

  // Vite integration / Static files serving
  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(200).send('EduMaster Server Running');
        }
      });
    } else {
      app.get('*', (req, res) => {
        res.status(200).send('EduMaster Server Running (Dist building)');
      });
    }
  } else {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [EduMaster Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Failure]:', err);
  process.exit(1);
});

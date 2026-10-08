import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Send, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { sendEmailOtpService, verifyOtpAndResetPasswordService } from '../firebase';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialEmail?: string;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = ''
}) => {
  const [step, setResetStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Sync initial email when modal opens
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Timer countdown for 5-minute OTP expiry (300s)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Format countdown seconds into MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const userEmail = email.trim().toLowerCase();
    if (!userEmail) return;

    setLoading(true);
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // 1. حفظ الـ OTP في Firestore
      await sendEmailOtpService(userEmail, generatedCode);

      // 2. قراءة المفتاح من الأسرار (process.env.BREVO_API_KEY)
      const apiKey = 
        (typeof process !== 'undefined' && process.env?.BREVO_API_KEY) || 
        (import.meta as any).env?.VITE_BREVO_API_KEY || 
        (import.meta as any).env?.BREVO_API_KEY || 
        'Xkeysib-05f15c12fbcf782fc875f7288184d0ce471b99e76b3ec3199323c9678104c3c3-UlJLsZLKuZEU2Bg6';

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          sender: { name: "منصة الأستاذ", email: "mhamed01023265312@gmail.com" },
          to: [{ email: userEmail }],
          subject: "رمز التحقق الخاص بك",
          htmlContent: `<div style="direction:rtl; text-align:center; padding:20px; font-family:Arial, sans-serif;"><h2>رمز التحقق الخاص بك هو:</h2><h1 style="color:#2563eb; letter-spacing:5px; font-size:32px;">${generatedCode}</h1><p>صالح لمدة 5 دقائق.</p></div>`
        })
      });

      if (response.ok) {
        setResetStep('verify');
        setCountdown(300);
        setSuccessMessage('تم إرسال كود التحقق بنجاح إلى بريدك الإلكتروني!');
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Brevo Error:', err);
        setErrorMessage('فشل الإرسال: ' + (err.message || 'يرجى التأكد من صحة المفتاح في الأسرار'));
      }
    } catch (error: any) {
      console.error('Send Error:', error);
      setErrorMessage('حدث خطأ أثناء الاتصال: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP Verification & Password Reset
  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (countdown <= 0) {
      setErrorMessage('انتهت صلاحية الرمز (مرت 5 دقائق)، يرجى الضغط على "إعادة إرسال الرمز"');
      return;
    }

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('كلمة المرور الجديدة يجب أن تتكون من 6 أحرف أو أرقام على الأقل');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtpAndResetPasswordService(email, otpCode, newPassword);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشلت عملية التحقق وتحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn touch-none select-none overflow-y-auto"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-right touch-auto select-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Close Button */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">استعادة كلمة المرور</h3>
              <p className="text-xs text-slate-400">منصة الأستاذ التعليمية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter Email & Request OTP */}
        {step === 'request' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              أدخل بريدك الإلكتروني المسجل لإرسال كود التحقق المكون من 6 أرقام لإعادة تعيين كلمة المرور:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني المسجل:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>جاري إرسال كود التحقق...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال الكود عبر البريد الإلكتروني</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP & Set New Password */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyAndResetPassword} className="space-y-4 animate-fadeIn">
            
            {/* Status & Security Expiry Badge (OTP Muted from UI) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>تم إرسال كود التحقق لبريدك</span>
              </span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>صالح لـ: {formatTimer(countdown)}</span>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                أدخل كود التحقق المكون من 6 أرقام (المرسل إلى بريدك):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 rounded-xl px-3.5 py-3 text-center text-xl font-mono font-black text-amber-300 tracking-widest placeholder:text-slate-600 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور الجديدة:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تأكيد كلمة المرور الجديدة:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              {countdown > 0 ? (
                <span className="font-mono text-amber-400">إعادة الإرسال بعد ({formatTimer(countdown)})</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendCode()}
                  className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة إرسال الكود</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setResetStep('request')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                تغيير البريد الإلكتروني
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>جاري حفظ كلمة المرور الجديدة...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>تأكيد وتعيين كلمة المرور الجديدة</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

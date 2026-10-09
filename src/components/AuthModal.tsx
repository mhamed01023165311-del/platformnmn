import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Send,
  RefreshCw,
  HelpCircle,
  Check,
  MessageSquare,
  ExternalLink,
  Clock
} from 'lucide-react';
import { 
  signInUser, 
  signUpUser, 
  signInWithGoogleAuth, 
  sendEmailOtpService,
  sendWhatsAppOtpService,
  verifyOtpAndResetPasswordService,
  UserAccount 
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserAccount, role: 'student' | 'developer') => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Password Reset System States (Exclusively Email OTP & WhatsApp OTP - Automated Muted OTP)
  const [resetMethod, setResetMethod] = useState<'email' | 'whatsapp'>('email');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Timer countdown for OTP expiry (300s / 5 minutes)
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

  // 1. Strict Scroll Lock & Touch Shield on Body
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalOverscrollBehavior;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMessage('كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('كلمة المرور يجب أن تكون 6 خانات أو أكثر');
        return;
      }

      setLoading(true);
      try {
        const res = await signUpUser(email, password, name, phone);
        if (res.success && res.user) {
          onSuccess(res.user, 'student');
        } else {
          setErrorMessage(res.message);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'فشلت عملية إنشاء الحساب');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signin') {
      // Sign In
      setLoading(true);
      try {
        const res = await signInUser(email, password);
        if (res.success && res.user) {
          onSuccess(res.user, res.role);
        } else {
          setErrorMessage(res.message);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'فشل تسجيل الدخول');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await signInWithGoogleAuth();
      if (res.success && res.user && res.user.email) {
        onSuccess(res.user, res.role || 'student');
      } else if (!res.cancelled && res.message) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('فشل تسجيل الدخول عبر Google: ' + (err?.message || err));
      }
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Step 1: Send OTP via Email or WhatsApp (Automated Dispatch)
  const handleSendResetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (resetMethod === 'email') {
        const userEmail = resetEmail.trim().toLowerCase();
        if (!userEmail) {
          setErrorMessage('يرجى إدخال البريد الإلكتروني المسجل');
          setLoading(false);
          return;
        }

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

        try {
          // Send 6-digit OTP code via sendEmailOtpService (Gmail API + Firestore persistence)
          const res = await sendEmailOtpService(userEmail, generatedCode);

          if (res.success) {
            setSuccessMessage(res.message || 'تم إرسال كود التحقق بنجاح إلى بريدك الإلكتروني!');
            setResetStep('verify');
            setCountdown(300);
          } else {
            setErrorMessage(res.message || 'حدث خطأ أثناء إرسال كود التحقق');
          }
        } catch (error: any) {
          console.error('Send Reset Code Error:', error);
          setErrorMessage('حدث خطأ أثناء معالجة الطلب: ' + (error.message || 'خطأ غير معروف'));
        }
      } else {
        // WhatsApp Method
        if (!resetPhone.trim()) {
          setErrorMessage('يرجى إدخال رقم الواتساب المسجل (11 رقماً)');
          setLoading(false);
          return;
        }
        const res = await sendWhatsAppOtpService(resetPhone);
        if (res.success) {
          setSuccessMessage(res.message);
          setResetStep('verify');
          setCountdown(300); // 5 minutes = 300 seconds
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Step 2: Verify OTP and save new password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (countdown <= 0) {
      setErrorMessage('انتهت صلاحية الرمز (مرت 5 دقائق)، يرجى ضغط "إعادة إرسال الرمز".');
      return;
    }

    const expectedLen = resetMethod === 'whatsapp' ? 8 : 6;
    if (!otpCode || otpCode.trim().length !== expectedLen) {
      setErrorMessage(`يرجى إدخال رمز التحقق المكون من ${expectedLen} أرقام كاملاً`);
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
    const identifier = resetMethod === 'email' ? resetEmail : resetPhone;

    try {
      const res = await verifyOtpAndResetPasswordService(identifier, otpCode, newPassword);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setMode('signin');
          setEmail(identifier);
          setPassword(newPassword);
          setResetStep('request');
          setOtpCode('');
          setNewPassword('');
          setConfirmNewPassword('');
        }, 2000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشلت عملية التحقق وتغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn touch-none select-none overscroll-none overflow-y-auto"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-right touch-auto select-auto my-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <GraduationCap className="w-7 h-7 text-slate-950" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              منصة الأستاذ التعليمية
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'forgot_password' 
                ? 'استعادة وإعادة تعيين كلمة المرور'
                : 'بوابة تسجيل الدخول والأمان وقفل الحساب على جهاز واحد'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs (Sign in / Sign up) */}
        {mode !== 'forgot_password' ? (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-2.5 rounded-xl transition cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              حساب جديد
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <KeyRound className="w-4 h-4" />
              <span>استعادة كلمة المرور</span>
            </div>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer font-semibold"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لتسجيل الدخول</span>
            </button>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: SIGN IN / SIGN UP FORMS */}
        {/* ======================================================== */}
        {mode !== 'forgot_password' && (
          <>
            {/* Google Quick Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:scale-[0.98] border border-slate-700 text-xs sm:text-sm font-bold text-white transition flex items-center justify-center gap-3 cursor-pointer shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>المتابعة باستخدام Google (Google Auth)</span>
            </button>

            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <div className="h-[1px] bg-slate-800 flex-1" />
              <span>أو عبر البريد الإلكتروني</span>
              <div className="h-[1px] bg-slate-800 flex-1" />
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      الاسم بالكامل:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="عمر شريف إبراهيم"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رقم الهاتف (المحمول):
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="01012345678"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  البريد الإلكتروني:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="student@gmail.com أو اسم المستخدم"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    كلمة المرور:
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setResetEmail(email);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
                    >
                      نسيت كلمة السر؟
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تأكيد كلمة المرور:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Single Device Lock Info Banner */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ميزة حماية الحساب (Single Device Lock):</span>
                </span>
                <p className="leading-relaxed">
                  عند إتمام الدخول سيتم قفل الحساب تلقائياً على هذا الجهاز لمنع تشغيله من أكثر من جهاز في نفس الوقت.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>جاري التحقق وقفل الجهاز...</span>
                ) : mode === 'signin' ? (
                  <span>تسجيل الدخول</span>
                ) : (
                  <span>إنشاء الحساب وتفعيل الجهاز</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: MULTI-METHOD PASSWORD RESET SYSTEM (EMAIL & WHATSAPP ONLY) */}
        {/* ======================================================== */}
        {mode === 'forgot_password' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Step Indicator & Method Tabs */}
            {resetStep === 'request' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  اختر الطريقة المفضلة لإرسال رمز التحقق وإعادة تعيين كلمة المرور:
                </p>

                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setResetMethod('email'); setErrorMessage(null); }}
                    className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      resetMethod === 'email' 
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>البريد الإلكتروني (Email)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setResetMethod('whatsapp'); setErrorMessage(null); }}
                    className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      resetMethod === 'whatsapp' 
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>الواتساب (WhatsApp)</span>
                  </button>
                </div>

                <form onSubmit={handleSendResetCode} className="space-y-3.5 pt-1">
                  {resetMethod === 'email' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        البريد الإلكتروني المسجل:
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="student@gmail.com"
                          value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        رقم الواتساب المسجل (11 رقم):
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="01012345678"
                          value={resetPhone}
                          onChange={e => setResetPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60 ${
                      resetMethod === 'whatsapp'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                    }`}
                  >
                    {loading ? (
                      <span>جاري توليد كود التحقق...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{resetMethod === 'whatsapp' ? 'إرسال كود الواتساب (WhatsApp OTP)' : 'إرسال رمز البريد (Email OTP)'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: OTP Verification & New Password Setup */}
            {resetStep === 'verify' && (
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-3.5 animate-fadeIn">
                
                {/* Security Expiry & Status Banner */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>تم إرسال الرمز أوتوماتيكياً</span>
                  </span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>صالح لـ: {formatTimer(countdown)}</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {resetMethod === 'whatsapp'
                      ? 'أدخل رمز التحقق (OTP) المكون من 8 أرقام المرسل عبر الواتساب:'
                      : 'أدخل رمز التحقق (OTP) المكون من 6 أرقام:'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={resetMethod === 'whatsapp' ? 8 : 6}
                      placeholder={resetMethod === 'whatsapp' ? '12345678' : '123456'}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className={`w-full bg-slate-950 border ${
                        resetMethod === 'whatsapp'
                          ? 'border-emerald-500/50 focus:border-emerald-400 text-emerald-300'
                          : 'border-amber-500/50 focus:border-amber-400 text-amber-300'
                      } rounded-xl px-3.5 py-2.5 text-center text-xl font-mono font-black tracking-widest placeholder:text-slate-600 focus:outline-none shadow-inner`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    كلمة المرور الجديدة:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تأكيد كلمة المرور الجديدة:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  {countdown > 0 ? (
                    <span className="font-mono text-amber-400">إعادة الإرسال بعد ({formatTimer(countdown)})</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendResetCode()}
                      className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إعادة إرسال الرمز</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="text-slate-400 hover:text-white"
                  >
                    تغيير الرقم/البريد
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
        )}

        {/* Developer Hint Footer */}
        <div className="text-center pt-1 border-t border-slate-850">
          <span className="text-[10px] text-slate-400">
            حساب تجربة المطور/الآدمن: <code className="text-amber-400 font-mono">mhamed2006</code> | كلمة المرور: <code className="text-amber-400 font-mono">172006</code>
          </span>
        </div>

      </div>
    </div>
  );
};


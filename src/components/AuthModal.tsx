import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import { 
  signInUser, 
  signUpUser, 
  signInWithGoogleAuth, 
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
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
    } else {
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
    try {
      const res = await signInWithGoogleAuth();
      if (res.success && res.user && res.user.email) {
        onSuccess(res.user, res.role || 'student');
      } else if (!res.cancelled && res.message) {
        setErrorMessage(res.message);
      }
      // If cancelled by user closing popup, simply stop loading with no error banner
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('فشل تسجيل الدخول عبر Google: ' + (err?.message || err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn" dir="rtl">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-right">
        
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
              بوابة تسجيل الدخول والأمان وقفل الحساب على جهاز واحد
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
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
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`py-2.5 rounded-xl transition cursor-pointer ${
              mode === 'signup' 
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Quick Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:scale-[0.98] border border-slate-700 text-xs sm:text-sm font-bold text-white transition flex items-center justify-center gap-3 cursor-pointer shadow-md disabled:opacity-50"
        >
          {/* Google Icon SVG */}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              كلمة المرور:
            </label>
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

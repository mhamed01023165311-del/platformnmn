import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  Camera, 
  ShieldCheck, 
  Wallet, 
  BookOpen, 
  LogOut, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { UserAccount, updateStudentProfileInFirestore } from '../firebase';
import { PageId } from '../types';

interface StudentProfilePageProps {
  currentUser: UserAccount | null;
  studentName: string;
  studentPhone: string;
  studentCode: string;
  balance: number;
  enrolledCount: number;
  onUpdateProfile: (name: string, phone: string, avatar?: string) => Promise<boolean>;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  currentUser,
  studentName,
  studentPhone,
  studentCode,
  balance,
  enrolledCount,
  onUpdateProfile,
  onNavigate,
  onLogout
}) => {
  const [name, setName] = useState(studentName || currentUser?.name || 'طالب المنصة');
  const [phone, setPhone] = useState(studentPhone || currentUser?.phone || '01012345678');
  const [avatar, setAvatar] = useState<string>(
    currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyCode = () => {
    const codeToCopy = studentCode || currentUser?.student_code || currentUser?.id || 'STD-2026';
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          showToast('success', 'تم تحميل الصورة، اضغط "حفظ التعديلات" لتأكيد التغيير.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'يرجى إدخال اسم الطالب');
      return;
    }
    if (!phone.trim()) {
      showToast('error', 'يرجى إدخال رقم هاتف صالح');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await onUpdateProfile(name.trim(), phone.trim(), avatar);
      if (ok) {
        showToast('success', 'تم حفظ وتحديث بيانات البروفايل بنجاح في قاعدة البيانات.');
      } else {
        showToast('error', 'تعذر حفظ البيانات، يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      showToast('error', 'خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayCode = studentCode || currentUser?.student_code || currentUser?.id || 'STD-782910';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn" dir="rtl">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border backdrop-blur-md animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950/95 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
          
          {/* Avatar with Upload button */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-950 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-500" />
              )}
            </div>

            <label 
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -left-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg border border-slate-900 transition active:scale-90"
              title="تغيير صورة البروفايل"
            >
              <Camera className="w-4 h-4" />
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarFileChange} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Student Header Info */}
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>حساب طالب معتمد</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{name}</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono" dir="ltr">{currentUser?.email || 'student@platform.com'}</p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('wallet')}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-center transition cursor-pointer group"
            >
              <span className="text-[10px] text-slate-400 block">رصيد المحفظة</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono group-hover:scale-105 transition-transform inline-block">
                {(Number.isFinite(balance) ? balance : 0).toLocaleString('ar-EG')} ج.م
              </span>
            </button>

            <button
              onClick={() => onNavigate('my_courses')}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-center transition cursor-pointer group"
            >
              <span className="text-[10px] text-slate-400 block">الكورسات المشترك بها</span>
              <span className="text-base sm:text-lg font-black text-indigo-400 font-mono group-hover:scale-105 transition-transform inline-block">
                {enrolledCount} كورس
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Unique Student Code Card (كود الطالب الفريد) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-right">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-indigo-300 font-bold block">
              كود الطالب الفريد (Student ID / Code):
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider block mt-0.5" dir="ltr">
              {displayCode}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              استخدم هذا الكود الفريد عند التواصل مع المعلم أو عند التحقق من بياناتك.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer shrink-0"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>تم نسخ الكود</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>نسخ كود الطالب</span>
            </>
          )}
        </button>
      </div>

      {/* Edit Personal Information Form */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>تعديل البيانات الشخصية</span>
          </h2>
          <span className="text-xs text-slate-400">تحديث مباشر في قاعدة البيانات</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              اسم الطالب بالكامل:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="عمر شريف إبراهيم"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              رقم الهاتف (المحمول):
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              رقم الهاتف المستخدم في التحقق من عمليات فودافون كاش والإيداع.
            </span>
          </div>

          {/* Email (Read Only / Reference) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              البريد الإلكتروني المرتبط بالحساب:
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={currentUser?.email || 'student@platform.com'}
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 font-mono cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Security & Device Lock Status */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>حماية الحساب وقفل الجهاز الواحد (Single Device Lock)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              حسابك مرتبط ومحمي على هذا الجهاز الحالي. لا يمكن فتح الحساب على جهاز آخر في نفس الوقت.
            </p>
          </div>

          {/* Submit Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span>جاري حفظ التعديلات...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Logout Action */}
      <div className="text-center pt-2">
        <button
          onClick={onLogout}
          className="py-3 px-6 rounded-2xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 hover:text-white border border-rose-500/30 text-xs sm:text-sm font-bold transition flex items-center gap-2 mx-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج من المنصة</span>
        </button>
      </div>

    </div>
  );
};

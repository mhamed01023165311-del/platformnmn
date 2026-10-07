import React, { useState, useEffect } from 'react';
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
  Smartphone,
  QrCode,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Maximize2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  UserAccount, 
  updateStudentProfileInFirestore, 
  subscribeToStudentAttendance, 
  AttendanceRecord 
} from '../firebase';
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
  const [showLargeQr, setShowLargeQr] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const displayCode = studentCode || currentUser?.student_code || currentUser?.id || 'STD-782910';
  const studentUid = currentUser?.id || 'std_' + displayCode;

  // Realtime subscription to student's center attendance records
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeToStudentAttendance(currentUser.id, (records) => {
      setAttendanceRecords(records);
    });
    return () => unsub();
  }, [currentUser?.id]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyCode = () => {
    const codeToCopy = displayCode;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrintCard = () => {
    window.print();
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

  // QR Payload JSON
  const qrPayload = JSON.stringify({
    student_id: studentUid,
    student_code: displayCode,
    name: name,
    phone: phone
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.find(r => r.date === todayStr);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn" dir="rtl">
      
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

      {/* FEATURE 1: DIGITAL STUDENT ID CARD WITH QR CODE (بطاقة الطالب الذكية الرسمية) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-indigo-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Official Student ID Card
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                بطاقة الطالب الرقمية المعتمدة (QR Code)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLargeQr(true)}
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>تكبير الـ QR</span>
            </button>
            <button
              onClick={handlePrintCard}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الكارنيه</span>
            </button>
          </div>
        </div>

        {/* Card Body: Student ID layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-white p-4 sm:p-5 rounded-3xl shadow-xl border-4 border-indigo-400/30 text-center mx-auto">
            <QRCodeSVG
              value={qrPayload}
              size={170}
              level="H"
              includeMargin={false}
              className="rounded-lg shadow-sm"
            />
            <span className="text-[11px] font-black text-slate-800 font-mono mt-2" dir="ltr">
              {displayCode}
            </span>
            <span className="text-[10px] text-slate-600">امسح الكود لتسجيل الحضور في السنتر</span>
          </div>

          {/* Student Card Info Details */}
          <div className="md:col-span-2 space-y-3.5 text-right">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">اسم الطالب بالكامل:</span>
                <span className="text-sm sm:text-base font-bold text-white">{name}</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">كود الطالب (Student ID):</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-sm sm:text-base font-mono font-black text-indigo-400" dir="ltr">
                    {displayCode}
                  </span>
                  <button onClick={handleCopyCode} className="text-xs text-slate-400 hover:text-white">
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">رقم المحمول:</span>
                <span className="text-xs sm:text-sm font-mono text-slate-200 font-bold">{phone}</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">حالة الحساب والأمان:</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>نشط ومقيد بجهاز معتمد</span>
                </span>
              </div>
            </div>

            {/* Attendance Status Today Banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              todayAttendance 
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' 
                : 'bg-slate-950/60 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <Clock className={`w-4 h-4 ${todayAttendance ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold block">
                    {todayAttendance ? 'حالة حضور اليوم: حضر في السنتر ✓' : 'حالة حضور اليوم: لم يتم مسح الكود اليوم بعد'}
                  </span>
                  {todayAttendance && (
                    <span className="text-[11px] text-emerald-300 font-mono">
                      الساعة: {todayAttendance.time} · {todayAttendance.center_group}
                    </span>
                  )}
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                todayAttendance ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {todayAttendance ? 'تم إثبات الحضور' : 'في الانتظار'}
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* FEATURE 2: ATTENDANCE HISTORY (سجل الحضور في السنتر والمحاضرات) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>سجل حضور الطالب في السنتر والمجموعات</span>
            </h3>
            <p className="text-xs text-slate-400">تتبع تلقائي لحظي لجميع أيام الحضور المسجلة بالـ QR Code</p>
          </div>

          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            إجمالي الحضور: {attendanceRecords.length} حصة
          </span>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-400 space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-sm text-slate-300">لم يتم تسجيل حضور حتى الآن</p>
            <p className="text-xs">سيظهر هنا سجل حضورك فور قيام المساعد/الأستاذ بمسح كود الـ QR الخاص بك في السنتر.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
            {attendanceRecords.map((rec, index) => (
              <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">
                      {rec.center_group || 'حصة السنتر'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.date}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">{rec.time}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    حضر في السنتر ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Large QR Full-Screen Modal */}
      {showLargeQr && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => setShowLargeQr(false)}
        >
          <div 
            className="bg-white p-8 rounded-3xl text-center space-y-4 shadow-2xl max-w-sm w-full cursor-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-slate-900">{name}</h3>
            <div className="p-2 bg-white rounded-2xl flex justify-center">
              <QRCodeSVG value={qrPayload} size={260} level="H" />
            </div>
            <p className="text-base font-black text-indigo-700 font-mono tracking-wider" dir="ltr">
              {displayCode}
            </p>
            <button
              onClick={() => setShowLargeQr(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

    </div>
  );
};


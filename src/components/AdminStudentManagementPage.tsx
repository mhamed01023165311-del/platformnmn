import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Wallet, 
  BookOpen, 
  Smartphone, 
  ShieldCheck, 
  Edit3, 
  X, 
  Save, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  User, 
  Mail, 
  Phone, 
  Hash,
  Unlock
} from 'lucide-react';
import { 
  fetchAllStudentsAdmin, 
  updateStudentFullAdmin, 
  adjustStudentBalanceAdmin, 
  toggleStudentCourseAdmin, 
  resetStudentDeviceLockAdmin 
} from '../firebase';
import { COURSES_DATA } from '../data/mockData';
import { Course } from '../types';

interface AdminStudentManagementPageProps {
  courses?: Course[];
  onClose?: () => void;
}

export const AdminStudentManagementPage: React.FC<AdminStudentManagementPageProps> = ({
  courses = COURSES_DATA,
  onClose
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Student for Full Profile Modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Edit Student Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  
  // Balance Adjustment Sub-form
  const [balanceDelta, setBalanceDelta] = useState('100');
  const [balanceReason, setBalanceReason] = useState('شحن يدوي من لوحة الإدارة');
  const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const list = await fetchAllStudentsAdmin();
      setStudents(list);
    } finally {
      setLoading(false);
    }
  };

  // Open full details modal for student
  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setEditName(student.name || '');
    setEditPhone(student.phone || '');
    setEditEmail(student.email || '');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Save personal details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsSavingDetails(true);
    try {
      const res = await updateStudentFullAdmin(selectedStudent.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim()
      });

      if (res.success) {
        showToast('success', res.message);
        setSelectedStudent({
          ...selectedStudent,
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim()
        });
        loadStudents();
      } else {
        showToast('error', res.message);
      }
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Adjust Wallet Balance
  const handleAdjustBalance = async (isAdding: boolean) => {
    if (!selectedStudent) return;
    const amount = parseFloat(balanceDelta);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'يرجى إدخال مبلغ صالح للتعديل');
      return;
    }

    const delta = isAdding ? amount : -amount;
    setIsAdjustingBalance(true);
    try {
      const res = await adjustStudentBalanceAdmin(selectedStudent.id, delta, balanceReason);
      if (res.success) {
        showToast('success', res.message);
        setSelectedStudent({
          ...selectedStudent,
          balance: res.newBalance
        });
        loadStudents();
      } else {
        showToast('error', res.message);
      }
    } finally {
      setIsAdjustingBalance(false);
    }
  };

  // Toggle Course
  const handleToggleCourse = async (courseId: string, currentlyEnrolled: boolean) => {
    if (!selectedStudent) return;
    const shouldEnroll = !currentlyEnrolled;

    try {
      const res = await toggleStudentCourseAdmin(selectedStudent.id, courseId, shouldEnroll);
      if (res.success) {
        showToast('success', res.message);
        const existing: string[] = selectedStudent.enrolledCourses || [];
        const nextEnrolled = shouldEnroll ? [...existing, courseId] : existing.filter(c => c !== courseId);
        setSelectedStudent({
          ...selectedStudent,
          enrolledCourses: nextEnrolled
        });
        loadStudents();
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Reset Device Lock
  const handleResetDevice = async () => {
    if (!selectedStudent) return;
    const ok = await resetStudentDeviceLockAdmin(selectedStudent.id);
    if (ok) {
      showToast('success', 'تم إعادة ضبط قفل الجهاز للطالب بنجاح. يمكنه الآن الدخول من جهازه الجديد.');
      setSelectedStudent({
        ...selectedStudent,
        active_device_id: ''
      });
      loadStudents();
    } else {
      showToast('error', 'فشل إعادة ضبط قفل الجهاز');
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const code = (s.student_code || s.id || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    const phone = (s.phone || '');
    const email = (s.email || '').toLowerCase();
    return code.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn" dir="rtl">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border backdrop-blur-md animate-fadeIn ${
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

      {/* Header & Search Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>إدارة الطلاب وقواعد البيانات (Admin Mode)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              قسم إدارة وبحث بيانات الطلاب
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              ابحث بكود الطالب (Student ID) أو اسم الطالب، واضغط على الطالب لفتح صفحته الكاملة وتعديل بياناته ورصيده وكورساته.
            </p>
          </div>

          <button
            onClick={loadStudents}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-2 text-xs font-bold shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث القائمة</span>
          </button>
        </div>

        {/* Search Input Bar (Student ID / Name) */}
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث بـ كود الطالب (مثال: STD-782914) أو اسم الطالب أو رقم الموبايل..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-2xl px-4 py-3.5 pr-11 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none shadow-inner"
          />
          <Search className="w-5 h-5 text-amber-400 absolute right-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-3.5 text-slate-400 hover:text-white text-xs"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Students List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span>نتائج الطلاب ({filteredStudents.length})</span>
          <span>اضغط على بطاقة أي طالب لعرض وتعديل صفحته الكاملة</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-300">لا يوجد طلاب مطابقون للبحث</p>
            <p className="text-xs">تأكد من كود الطالب أو الاسم وأعد المحاولة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const code = student.student_code || student.id;
              const coursesCount = Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0;
              const isLocked = Boolean(student.active_device_id);

              return (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition cursor-pointer shadow-xl flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Unique Code Badge */}
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold" dir="ltr">
                        {code}
                      </span>

                      {/* Device Lock status */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isLocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Smartphone className="w-3 h-3" />
                        <span>{isLocked ? 'مفعل على جهاز' : 'غير مفعل'}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                        {student.name || 'طالب المنصة'}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{student.phone || '01012345678'}</p>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">رصيد المحفظة:</span>
                      <span className="font-black text-emerald-400 font-mono text-sm">
                        {(Number.isFinite(student.balance) ? student.balance : 0).toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 block">الكورسات المشترك بها:</span>
                      <span className="font-black text-indigo-400 font-mono text-sm">
                        {coursesCount} كورس
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>عرض وتعديل بيانات الطالب ←</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL STUDENT DETAILS MODAL (صفحة تفاصيل وتعديل الطالب بالكامل) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-3xl w-full p-6 text-right space-y-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    ملف وبيانات الطالب: {selectedStudent.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">تحكم كامل في الرصيد والكورسات وقفل الجهاز</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-1 flex-1">
              
              {/* Unique Student Code Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-300 block font-bold">كود الطالب الفريد (Student ID):</span>
                    <span className="text-base sm:text-lg font-black text-white font-mono" dir="ltr">
                      {selectedStudent.student_code || selectedStudent.id}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedStudent.student_code || selectedStudent.id)}
                  className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>

              {/* 1. Personal Details Form */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>1. تعديل البيانات الشخصية للطالب:</span>
                </h4>

                <form onSubmit={handleSaveDetails} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">اسم الطالب:</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">رقم المحمول:</label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">البريد الإلكتروني:</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingDetails}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSavingDetails ? 'جاري الحفظ...' : 'حفظ البيانات الشخصية'}</span>
                  </button>
                </form>
              </div>

              {/* 2. Wallet Balance Adjustment */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>2. رصيد محفظة الطالب:</span>
                  </h4>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    {(selectedStudent.balance || 0).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">المبلغ المطلوب إضافته / خصمه (ج.م):</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={balanceDelta}
                        onChange={e => setBalanceDelta(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">السبب / الملاحظة:</label>
                      <input
                        type="text"
                        placeholder="شحن يدوي / مكافأة / تسوية"
                        value={balanceReason}
                        onChange={e => setBalanceReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isAdjustingBalance}
                      onClick={() => handleAdjustBalance(true)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة رصيد للمحفظة (+)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAdjustingBalance}
                      onClick={() => handleAdjustBalance(false)}
                      className="flex-1 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>خصم من الرصيد (-)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Enrolled Courses Management */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>3. الكورسات المتاحة والمشترك بها الطالب:</span>
                </h4>

                <div className="divide-y divide-slate-800/80">
                  {courses.map((course) => {
                    const isEnrolled = Array.isArray(selectedStudent.enrolledCourses) && selectedStudent.enrolledCourses.includes(course.id);

                    return (
                      <div key={course.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-white block">{course.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{course.discountedPrice} ج.م · {course.gradeTitle}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCourse(course.id, isEnrolled)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isEnrolled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isEnrolled ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>مفعّل (اضغط للإلغاء)</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>تفعيل الكورس للطالب</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Single Device Lock Security */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>قفل الحساب على جهاز واحد (Device Lock)</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    معرف الجهاز: <code className="font-mono text-slate-300">{selectedStudent.active_device_id || 'غير مقيد بجهاز حالياً'}</code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDevice}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>إعادة تعيين قفل الجهاز</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

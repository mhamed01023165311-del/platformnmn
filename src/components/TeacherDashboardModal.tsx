import React, { useState } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Send, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { MOCK_STUDENTS } from '../data/mockData';
import { StudentRecord } from '../types';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [students, setStudents] = useState<StudentRecord[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'security_logs' | 'analytics'>('students');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendWhatsappReport = (student: StudentRecord) => {
    showToast(`تم إرسال تقرير الأداء بنجاح إلى ولي أمر الطالب (${student.name}) عبر واتساب على الرقم ${student.parentPhone} 📲`);
  };

  const handleToggleFreeze = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const isAlert = !s.suspiciousDeviceAlert;
        showToast(isAlert ? `تم تجميد حساب الطالب ورصد نشاط غير مصرح به` : `تم فك تجميد الحساب وتجديد رمز المصادقة`);
        return { ...s, suspiciousDeviceAlert: isAlert };
      }
      return s;
    }));
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || s.phone.includes(searchQuery) || s.enrolledCourse.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden my-auto relative animate-fadeIn text-right flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>لوحة تحكم المعلم وإدارة المنصة</span>
            </div>

            <div className="text-right">
              <h3 className="text-base font-black text-white">أ.د. أحمد ممدوح النجار</h3>
              <p className="text-xs text-emerald-400">نظام الإدارة الأكاديمية وحماية المحتوى</p>
            </div>
          </div>
        </div>

        {/* Toast alert notification */}
        {toastMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 p-3 text-xs font-bold text-emerald-200 px-6 flex items-center justify-between animate-fadeIn">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400">إغلاق</button>
          </div>
        )}

        {/* Quick Key Metrics Bar */}
        <div className="bg-slate-950/60 p-5 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>إجمالي الطلاب النشطين</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">18,520</p>
            <span className="text-[10px] text-emerald-400">+145 طالب هذا الأسبوع</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>نسبة إنجاز الفيديوهات</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">89.4%</p>
            <span className="text-[10px] text-indigo-400">معدل التزام قياسي</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>محاولات التسريب المحظورة</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">100% نجاح</p>
            <span className="text-[10px] text-slate-400">0 تسريب مسجل (DRM Active)</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>اشتراكات الشهر الحالي</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">485,200 ج.م</p>
            <span className="text-[10px] text-slate-400">عبر المحافظ وفوري والبطاقات</span>
          </div>
        </div>

        {/* Dashboard Tabs & Search */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              إدارة ومتابعة الطلاب ({filteredStudents.length})
            </button>

            <button
              onClick={() => setActiveTab('security_logs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'security_logs'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              سجل أحداث الحماية والـ DRM
            </button>
          </div>

          {activeTab === 'students' && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="بحث بالاسم أو الهاتف أو الكورس..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-9"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
            </div>
          )}
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'students' ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold pb-2">
                      <th className="p-3">الطالب</th>
                      <th className="p-3">الكورس والصف</th>
                      <th className="p-3">نسبة المشاهدة</th>
                      <th className="p-3">متوسط الاختبارات</th>
                      <th className="p-3">حالة السداد</th>
                      <th className="p-3">أمان الجلسة</th>
                      <th className="p-3 text-center">إجراءات المتابعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <p className="font-bold text-white text-sm">{std.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">طالب: {std.phone}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ولي الأمر: {std.parentPhone}</p>
                        </td>

                        <td className="p-3">
                          <p className="font-semibold text-slate-200">{std.enrolledCourse}</p>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            {std.grade}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-800 rounded-full h-2">
                              <div 
                                className="bg-emerald-400 h-2 rounded-full" 
                                style={{ width: `${std.progressPercentage}%` }} 
                              />
                            </div>
                            <span className="font-mono text-emerald-400 font-bold">{std.progressPercentage}%</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{std.lastActive}</span>
                        </td>

                        <td className="p-3">
                          <span className={`font-bold font-mono text-sm ${
                            std.quizAverage >= 90 ? 'text-emerald-400' : std.quizAverage >= 70 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {std.quizAverage}%
                          </span>
                        </td>

                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            std.paymentStatus === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          }`}>
                            {std.paymentStatus === 'paid' ? 'مدفوع ومفعل' : 'في انتظار التجديد'}
                          </span>
                        </td>

                        <td className="p-3">
                          {std.suspiciousDeviceAlert ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-800/50">
                              <AlertTriangle className="w-3 h-3" />
                              <span>رصد جهازين متزامنين</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/30">
                              <ShieldCheck className="w-3 h-3" />
                              <span>جلسة موثوقة</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSendWhatsappReport(std)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title="إرسال تقرير لولي الأمر عبر واتساب"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>واتساب ولي الأمر</span>
                            </button>

                            <button
                              onClick={() => handleToggleFreeze(std.id)}
                              className={`p-1.5 rounded-xl border text-[11px] transition cursor-pointer ${
                                std.suspiciousDeviceAlert
                                  ? 'bg-rose-600 text-white border-rose-500'
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                              }`}
                              title={std.suspiciousDeviceAlert ? 'فك تجميد الحساب' : 'تجميد الحساب احترازياً'}
                            >
                              {std.suspiciousDeviceAlert ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* SECURITY & DRM AUDIT LOGS */
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span>سجل أمان البث المشفر (Encrypted HLS & Watermark Security Audit Trail)</span>
                <span className="text-emerald-400">● LIVE MONITORING ACTIVE</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">
                    [12:34:10] WATERMARK_DYNAMIC_INJECT: Hash #0x9F41 for student 01012345678 rendered at coordinates (35%, 40%).
                  </span>
                  <span className="text-emerald-400">SUCCESS</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">
                    [12:31:02] CONCURRENT_SESSION_CHECK: Student ID STD-103 attempted login from secondary IP (156.204.18.9) - Original device prompted.
                  </span>
                  <span className="text-amber-400">SESSION_LOCKED</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">
                    [12:28:44] HLS_KEY_ROTATION: Key renewal completed for Chapter 1 Lesson 2 stream chunk #88.
                  </span>
                  <span className="text-indigo-400">AES-128 ROTATED</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">
                    [12:20:15] PAYMENT_WEBHOOK_RECEIVED: Fawry Ref #9928190 paid (550 EGP) - Physics 2026 auto-activated for new user.
                  </span>
                  <span className="text-emerald-400">ENROLLED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>نظام حماية وإدارة المنصة مدمج بنسبة 100% مع أنظمة Webhooks و DRM Cloud</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold transition cursor-pointer"
          >
            إغلاق اللوحة
          </button>
        </div>

      </div>
    </div>
  );
};

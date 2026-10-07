import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Send, 
  Lock, 
  Unlock, 
  TrendingUp, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet,
  Check,
  Terminal
} from 'lucide-react';
import { MOCK_STUDENTS } from '../data/mockData';
import { StudentRecord, VodafoneCashDepositRequest, UserProfile } from '../types';
import { BackendTestingConsole } from './BackendTestingConsole';

interface TeacherDashboardPageProps {
  depositRequests: VodafoneCashDepositRequest[];
  onApproveDeposit: (requestId: string) => void;
  onRejectDeposit: (requestId: string) => void;
  onBackToHome: () => void;
  userProfile?: UserProfile | null;
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({
  depositRequests,
  onApproveDeposit,
  onRejectDeposit,
  onBackToHome,
  userProfile
}) => {
  const [students, setStudents] = useState<StudentRecord[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'deposits' | 'students' | 'security_logs' | 'backend_server'>('deposits');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingDeposits = depositRequests.filter(d => d.status === 'pending');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = (req: VodafoneCashDepositRequest) => {
    onApproveDeposit(req.id);
    showToast(`✅ تمت الموافقة بنجاح وإيداع مبلغ ${req.amount} ج.م في محفظة الطالب (${req.studentName})!`);
  };

  const handleReject = (req: VodafoneCashDepositRequest) => {
    onRejectDeposit(req.id);
    showToast(`❌ تم رفض طلب الشحن رقم ${req.transactionId}.`);
  };

  const handleSendWhatsappReport = (student: StudentRecord) => {
    showToast(`تم إرسال تقرير الأداء بنجاح إلى ولي أمر الطالب (${student.name}) عبر واتساب على الرقم ${student.parentPhone} 📲`);
  };

  const handleToggleFreeze = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const isAlert = !s.suspiciousDeviceAlert;
        showToast(isAlert ? `تم تجميد حساب الطالب ورصد جهاز ثانٍ متزامن` : `تم فك تجميد الحساب وتجديد التوكن`);
        return { ...s, suspiciousDeviceAlert: isAlert };
      }
      return s;
    }));
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || s.phone.includes(searchQuery) || s.enrolledCourse.includes(searchQuery)
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-right animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 p-3.5 rounded-2xl text-xs font-bold text-emerald-200 px-6 flex items-center justify-between shadow-lg">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400">إغلاق</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>لوحة تحكم المعلم والإدارة الأكاديمية والمالية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            إدارة طلبات فودافون كاش، محافظ الطلاب، وسجلات الأمان
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            مراجعة واعتماد طلبات شحن المحافظ الرقمية الواردة عبر فودافون كاش، متابعة حضور ومشاهدات الطلاب، ورصد محاولات التسريب.
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending deposits metric */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-rose-500/30 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>طلبات فودافون كاش المعلقة</span>
            <Smartphone className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-1">{pendingDeposits.length} طلبات</p>
          <span className="text-[10px] text-slate-400">بانتظار موافقة المعلم والاعتماد</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الطلاب المسجلين</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">18,520</p>
          <span className="text-[10px] text-emerald-400">+145 طالب جديد</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>حماية المحتوى بالـ DRM</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">100% مؤمن</p>
          <span className="text-[10px] text-slate-400">0 تسريب مسجل</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الإيداعات والمبيعات</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">485,200 ج.م</p>
          <span className="text-[10px] text-slate-400">فودافون كاش والمحافظ</span>
        </div>
      </div>

      {/* Tabs and Navigation */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* VODAFONE CASH TAB */}
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'deposits'
                ? 'bg-rose-600 text-white font-black shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>طلبات شحن فودافون كاش</span>
            {pendingDeposits.length > 0 && (
              <span className="bg-white text-rose-600 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة الطلاب ({filteredStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security_logs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security_logs'
                ? 'bg-indigo-600 text-white font-black'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>سجل أمان الـ DRM</span>
          </button>

          <button
            onClick={() => setActiveTab('backend_server')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backend_server'
                ? 'bg-cyan-600 text-white font-black shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-300" />
            <span>سيرفر الـ Webhook والـ Forwarder ⚡</span>
          </button>
        </div>

        {activeTab === 'students' && (
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="بحث باسم الطالب أو الهاتف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-9"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          </div>
        )}
      </div>

      {/* TAB 1: VODAFONE CASH DEPOSITS APPROVAL SECTION */}
      {activeTab === 'deposits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">قائمة طلبات شحن المحافظ الرقمية (فودافون كاش)</h3>
              <p className="text-xs text-slate-400">
                راجع رقم العملية والمبلغ، ثم اضغط على «موافقة وإيداع الرصيد» ليتم شحن محفظة الطالب فوراً.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-800 text-slate-300">
              إجمالي الطلبات: {depositRequests.length}
            </span>
          </div>

          <div className="space-y-4">
            {depositRequests.map((req) => {
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    isPending
                      ? 'bg-slate-950 border-rose-500/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 opacity-90'
                  }`}
                >
                  <div className="space-y-2 text-right">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-black text-white">{req.studentName}</span>
                      <span className="text-xs text-slate-400 font-mono">({req.studentEmail})</span>
                      
                      {req.verificationMode === 'ai_auto' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>معتمد آلياً بالذكاء الاصطناعي (100% تطابق) ⚡</span>
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPending
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        }`}>
                          {isPending ? 'بانتظار مراجعة المعلم ⚠️' : 'تم الاعتماد اليدوي ✅'}
                        </span>
                      )}

                      {req.ocrScan && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          req.ocrScan.overallScore >= 95 ? 'bg-cyan-950 text-cyan-300' : 'bg-rose-950 text-rose-300'
                        }`}>
                          AI Score: {req.ocrScan.overallScore}%
                        </span>
                      )}
                    </div>

                    {/* Receipt thumbnail preview if attached */}
                    {req.receiptImage && (
                      <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                        <img 
                          src={req.receiptImage} 
                          alt="إيصال التحويل" 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 cursor-pointer hover:scale-105 transition"
                          title="صورة إيصال فودافون كاش المرفوعة"
                        />
                        <span className="text-[11px] text-slate-400">تم استخراج البيانات من صورة الإيصال المرفقة بواسطة محرك الـ OCR</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[10px] block">المبلغ المطلوب:</span>
                        <strong className="text-emerald-400 text-sm font-mono">{req.amount} ج.م</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">رقم المحفظة المحول منها:</span>
                        <span className="font-mono text-white">{req.senderPhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">كود العملية (Transaction ID):</span>
                        <code className="text-cyan-300 font-mono font-bold">{req.transactionId}</code>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">وقت الطلب:</span>
                        <span className="text-slate-400">{req.createdAt}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-[11px] text-slate-400 pt-1">ملاحظة الطالب: {req.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleApprove(req)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>موافقة وإيداع الرصيد في المحفظة</span>
                        </button>

                        <button
                          onClick={() => handleReject(req)}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          رفض الطلب
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-800/40">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>الرصيد متاح في محفظة الطالب</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/60">
                  <th className="p-4">بيانات الطالب</th>
                  <th className="p-4">الكورس والصف</th>
                  <th className="p-4">نسبة المشاهدة</th>
                  <th className="p-4">متوسط الامتحانات</th>
                  <th className="p-4">حالة السداد</th>
                  <th className="p-4">أمان الجلسة</th>
                  <th className="p-4 text-center">إجراءات المتابعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{std.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">طالب: {std.phone}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ولي الأمر: {std.parentPhone}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{std.enrolledCourse}</p>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {std.grade}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-emerald-400 h-2 rounded-full" 
                            style={{ width: `${std.progressPercentage}%` }} 
                          />
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">{std.progressPercentage}%</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{std.lastActive}</span>
                    </td>

                    <td className="p-4">
                      <span className={`font-bold font-mono text-sm ${
                        std.quizAverage >= 90 ? 'text-emerald-400' : std.quizAverage >= 70 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {std.quizAverage}%
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        std.paymentStatus === 'paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                      }`}>
                        {std.paymentStatus === 'paid' ? 'مدفوع ومفعل' : 'في انتظار التجديد'}
                      </span>
                    </td>

                    <td className="p-4">
                      {std.suspiciousDeviceAlert ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-800/50">
                          <AlertTriangle className="w-3 h-3" />
                          <span>رصد جهاز ثانٍ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>جلسة موثوقة</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSendWhatsappReport(std)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>تقرير واتساب</span>
                        </button>

                        <button
                          onClick={() => handleToggleFreeze(std.id)}
                          className={`p-1.5 rounded-xl border text-[11px] transition cursor-pointer ${
                            std.suspiciousDeviceAlert
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                          }`}
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
      )}

      {/* TAB 3: SECURITY AUDIT LOGS */}
      {activeTab === 'security_logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <span>سجل أمان التشفير والـ DRM والمعاملات المالية</span>
            <span className="text-emerald-400">● REALTIME ACTIVE</span>
          </div>

          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">
                [14:15:10] VODAFONE_CASH_DEPOSIT: Verified deposit request #VF-88210 for student (عمر شريف) - +200 EGP credited to wallet.
              </span>
              <span className="text-emerald-400">CREDITED</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">
                [14:02:18] FORENSIC_WATERMARK: Moving watermark updated position for student (عمر شريف) - Coordinates (42%, 28%).
              </span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">
                [13:58:05] SCREEN_RECORD_PREVENTION: Screen capture attempt blocked on device ID #DEV-9921 - Black screen triggered.
              </span>
              <span className="text-rose-400">BLOCKED</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKEND FORWARDER & WEBHOOK TESTING CONSOLE */}
      {activeTab === 'backend_server' && (
        <BackendTestingConsole 
          userProfile={userProfile || {
            id: 'std-current',
            name: 'عمر شريف إبراهيم',
            email: 'omar.sherif2026@gmail.com',
            phone: '01012345678',
            grade: 'الصف الثالث الثانوي',
            walletBalance: 300,
            enrolledCourseIds: [],
            authProvider: 'google'
          }}
          onRefreshWallet={() => {}}
        />
      )}

    </div>
  );
};

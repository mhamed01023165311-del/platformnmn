import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Smartphone, 
  Settings, 
  Search, 
  Plus, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Eye, 
  LogOut, 
  Clock, 
  DollarSign, 
  Edit3, 
  Save, 
  Trash2, 
  GraduationCap,
  Copy,
  Check,
  QrCode,
  Calendar,
  Radio,
  Video,
  MapPin
} from 'lucide-react';
import { 
  fetchAllStudentsAdmin, 
  adjustStudentBalanceAdmin, 
  toggleStudentCourseAdmin, 
  resetStudentDeviceLockAdmin,
  fetchSmsLogsAdmin,
  approveSmsLogAdmin,
  fetchAllAttendanceRecordsAdmin,
  fetchOnlineAttendanceAdmin,
  AttendanceRecord,
  OnlineLectureSession
} from '../firebase';
import { COURSES_DATA } from '../data/mockData';
import { Course } from '../types';
import { AttendanceQrScannerModal } from './AttendanceQrScannerModal';

interface DeveloperDashboardProps {
  onSwitchToStudentView: () => void;
  onLogout: () => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onSwitchToStudentView,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'online_tracking' | 'courses' | 'sms' | 'settings'>('students');

  // Students State
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Attendance Records State & Scanner Modal
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);
  const [selectedCenterFilter, setSelectedCenterFilter] = useState('all');

  // Online Lecture Tracking State
  const [onlineSessions, setOnlineSessions] = useState<OnlineLectureSession[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(false);

  // Balance Adjustment Modal State
  const [selectedStudentForBalance, setSelectedStudentForBalance] = useState<any | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('100');
  const [adjustmentReason, setAdjustmentReason] = useState('شحن يدوي من لوحة الإدارة');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // SMS Logs State
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [loadingSms, setLoadingSms] = useState(false);

  // New Course Form State
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES_DATA);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubject, setNewCourseSubject] = useState('الفيزياء');
  const [newCoursePrice, setNewCoursePrice] = useState('450');
  const [newCourseVideoUrl, setNewCourseVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');

  // Platform Settings State
  const [teacherWalletNumber, setTeacherWalletNumber] = useState('01019920811');
  const [teacherName, setTeacherName] = useState('أ. د. أحمد ممدوح النجار');
  const [teacherWhatsApp, setTeacherWhatsApp] = useState('01012345678');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    loadStudents();
    loadSmsLogs();
    loadAttendance();
    loadOnlineTracking();
  }, []);

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const data = await fetchAllStudentsAdmin();
      setStudentsList(data);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const data = await fetchAllAttendanceRecordsAdmin();
      setAttendanceRecords(data);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const loadOnlineTracking = async () => {
    setLoadingOnline(true);
    try {
      const data = await fetchOnlineAttendanceAdmin();
      setOnlineSessions(data);
    } finally {
      setLoadingOnline(false);
    }
  };

  const loadSmsLogs = async () => {
    setLoadingSms(true);
    try {
      const data = await fetchSmsLogsAdmin();
      setSmsLogs(data);
    } finally {
      setLoadingSms(false);
    }
  };

  // Filtered Students
  const filteredStudents = studentsList.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.id && s.id.includes(q))
    );
  });

  const handleAdjustBalance = async () => {
    if (!selectedStudentForBalance) return;
    const delta = parseFloat(adjustmentAmount);
    if (isNaN(delta)) return;

    setIsAdjusting(true);
    try {
      const res = await adjustStudentBalanceAdmin(
        selectedStudentForBalance.id,
        delta,
        adjustmentReason
      );
      if (res.success) {
        showToast('success', res.message);
        setSelectedStudentForBalance(null);
        loadStudents();
      } else {
        showToast('error', res.message);
      }
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleToggleCourse = async (studentId: string, courseId: string, currentlyEnrolled: boolean) => {
    const res = await toggleStudentCourseAdmin(studentId, courseId, !currentlyEnrolled);
    if (res.success) {
      showToast('success', res.message);
      loadStudents();
    } else {
      showToast('error', res.message);
    }
  };

  const handleResetDevice = async (studentId: string) => {
    const ok = await resetStudentDeviceLockAdmin(studentId);
    if (ok) {
      showToast('success', 'تم إعادة تعيين قفل الجهاز بنجاح. يمكن للطالب الدخول من جهاز جديد الآن.');
      loadStudents();
    } else {
      showToast('error', 'فشلت عملية إعادة التعيين');
    }
  };

  const handleApproveSms = async (smsId: string, amount: number) => {
    if (filteredStudents.length === 0) {
      showToast('error', 'لا يوجد طلاب لاعتماد المبلغ لهم');
      return;
    }
    const targetStudent = filteredStudents[0];
    const res = await approveSmsLogAdmin(smsId, targetStudent.id, amount);
    if (res.success) {
      showToast('success', res.message);
      loadSmsLogs();
      loadStudents();
    } else {
      showToast('error', res.message);
    }
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: 'course-' + Date.now(),
      title: newCourseTitle,
      subject: newCourseSubject,
      gradeLevel: 'third_secondary',
      gradeTitle: 'الصف الثالث الثانوي',
      instructor: teacherName,
      instructorTitle: 'خبير تدريس الثانوية العامة',
      rating: 4.95,
      studentsCount: 120,
      totalWeeks: 12,
      totalModules: 3,
      totalLessons: 24,
      totalHours: '40 ساعة تدريبية',
      originalPrice: parseFloat(newCoursePrice) + 200,
      discountedPrice: parseFloat(newCoursePrice),
      currency: 'ج.م',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      overview: 'كورس تدريبي مضاف حديثاً من لوحة تحكم المطور.',
      modules: []
    };

    setCoursesList([newCourse, ...coursesList]);
    setShowAddCourseModal(false);
    setNewCourseTitle('');
    showToast('success', 'تمت إضافة الكورس الجديد بنجاح إلى منصة الطلاب!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo',sans-serif] p-4 sm:p-8 space-y-8" dir="rtl">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border backdrop-blur-md animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/95 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Navbar for Developer Console */}
      <header className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">لوحة تحكم المطور والآدمن (Developer Console)</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                Admin Mode
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono block">
              الحساب الحالي: mhamed2006@gmail.com
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowQrScannerModal(true)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <QrCode className="w-4 h-4" />
            <span>ماسح الـ QR Code للحضور</span>
          </button>

          <button
            onClick={onSwitchToStudentView}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة واجهة الطالب</span>
          </button>

          <button
            onClick={onLogout}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'students' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة الطلاب ({studentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'attendance' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>حضور السنتر والـ QR ({attendanceRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('online_tracking')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'online_tracking' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>تتبع مشاهدات الأونلاين ({onlineSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'courses' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>إدارة الكورسات والمحتوى</span>
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'sms' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>سجل رسائل فودافون كاش ({smsLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40' 
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>بيانات الأستاذ والمنصة</span>
        </button>
      </div>

      {/* TAB 1: إدارة الطلاب */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد الإلكتروني أو الهاتف..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
            </div>

            <button
              onClick={loadStudents}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition self-end sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStudents ? 'animate-spin' : ''}`} />
              <span>تحديث القائمة</span>
            </button>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => {
              const enrolled: string[] = student.enrolledCourses || [];

              return (
                <div key={student.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
                  {/* Student Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white">{student.name || 'طالب المنصة'}</h3>
                      <span className="text-xs text-slate-400 font-mono block">{student.email || student.id}</span>
                      <span className="text-xs text-slate-400 font-mono block mt-0.5">{student.phone || '01012345678'}</span>
                    </div>

                    {/* Balance Badge */}
                    <div className="text-left bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">رصيد المحفظة:</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {typeof student.balance === 'number' ? student.balance : 0} ج.م
                      </span>
                    </div>
                  </div>

                  {/* Device Lock Info */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate max-w-[150px] font-mono text-[11px]">
                        الجهاز: {student.active_device_id || 'لم يسجل جهاز بعد'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleResetDevice(student.id)}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                      title="السماح للطالب بالدخول من جهاز جديد"
                    >
                      فك قفل الجهاز
                    </button>
                  </div>

                  {/* Enrolled Courses Controls */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-300 block">الكورسات المشترك بها:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {COURSES_DATA.map(c => {
                        const isEnrolled = enrolled.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => handleToggleCourse(student.id, c.id, isEnrolled)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                              isEnrolled 
                                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <span>{isEnrolled ? '✓' : '+'}</span>
                            <span>{c.subject}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStudentForBalance(student)}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>تعديل الرصيد يدوياً</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: حضور السنتر بالـ QR Code */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>سجلات حضور السنتر عبر مسح الـ QR Code (Attendance Records)</span>
              </h2>
              <p className="text-xs text-slate-400">يتم تسجيل كل طالب فورياً بمجرد مسح كود بطاقته بالهاتف أو الكاميرا</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowQrScannerModal(true)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>فتح ماسح الـ QR Code للحضور</span>
              </button>

              <button
                onClick={loadAttendance}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loadingAttendance ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">إجمالي سجلات الحضور:</span>
              <span className="text-xl font-black text-white font-mono mt-0.5 block">{attendanceRecords.length} حضور</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">حضور اليوم:</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                {attendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length} طالب
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">طريقة التسجيل الأساسية:</span>
              <span className="text-sm font-bold text-indigo-300 mt-1 block flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>مسح بطاقة الطالب الرقمية</span>
              </span>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden shadow-xl">
            {attendanceRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <QrCode className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <span>لا توجد سجلات حضور مسجلة حتى الآن. اضغط على "فتح ماسح الـ QR Code" لبدء تسجيل حضور الطلاب.</span>
              </div>
            ) : (
              attendanceRecords.map((record, index) => (
                <div key={record.id || index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{record.student_name}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-[10px]" dir="ltr">
                          {record.student_code}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{record.center_group}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto text-slate-300 font-mono text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">{record.date}</span>
                      <span className="text-emerald-400 font-bold">{record.time}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                      حضر في السنتر ✓
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: تتبع مشاهدات المحاضرات الأونلاين */}
      {activeTab === 'online_tracking' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <span>تتبع مشاهدات وتفاعل الطلاب في المحاضرات الأونلاين (Online Attendance Tracking)</span>
              </h2>
              <p className="text-xs text-slate-400">يسجل تلقائياً وقت دخول وخروج الطالب ومدة المشاهدة بالدقائق والثواني</p>
            </div>

            <button
              onClick={loadOnlineTracking}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${loadingOnline ? 'animate-spin' : ''}`} />
              <span>تحديث السجلات</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">إجمالي جلسات المشاهدة:</span>
              <span className="text-xl font-black text-white font-mono mt-0.5 block">{onlineSessions.length} جلسة</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">إجمالي ساعات المشاهدة التراكمية:</span>
              <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">
                {(onlineSessions.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) / 3600).toFixed(1)} ساعة
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">حالة التتبع:</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>تتبع نشط وتلقائي عبر مشغل HLS DRM</span>
              </span>
            </div>
          </div>

          {/* Sessions List */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden shadow-xl">
            {onlineSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Video className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <span>لا توجد جلسات مشاهدة أونلاين مسجلة حتى الآن.</span>
              </div>
            ) : (
              onlineSessions.map((session, index) => {
                const mins = Math.floor((session.duration_seconds || 0) / 60);
                const secs = (session.duration_seconds || 0) % 60;

                return (
                  <div key={session.id || index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{session.student_name}</span>
                        <span className="text-[11px] text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {session.course_title || 'كورس الفيزياء'}
                        </span>
                      </div>
                      <p className="text-slate-300 font-semibold text-xs">
                        {session.lesson_title}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">
                          بدء: {new Date(session.start_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-mono text-emerald-400 font-black">
                          مدة المشاهدة: {mins} دقيقة و {secs} ثانية
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        session.completed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {session.completed ? 'أتم المشاهدة ✓' : 'مشاهدة جزئية'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: إدارة الكورسات والمحتوى */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white">الكورسات والمناهج المسجلة</h2>
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كورس جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coursesList.map((course) => (
              <div key={course.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex gap-4 items-center shadow-lg">
                <img src={course.thumbnail} alt={course.title} className="w-24 h-24 rounded-2xl object-cover bg-slate-950 shrink-0" />
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-bold text-emerald-400 block">{course.gradeTitle} · {course.subject}</span>
                  <h3 className="font-bold text-sm sm:text-base text-white">{course.title}</h3>
                  <div className="flex items-baseline gap-2 text-xs font-mono">
                    <span className="text-white font-bold">{course.discountedPrice} ج.م</span>
                    <span className="text-slate-500 line-through">{course.originalPrice} ج.م</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: سجل رسائل فودافون كاش */}
      {activeTab === 'sms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">رسائل SMS الواردة من تطبيق المحمول (Firestore sms_logs)</h2>
              <p className="text-xs text-slate-400">تظهر هنا جميع الرسائل المرفوعة تلقائياً من تطبيق قارئ الـ SMS بالأندرويد</p>
            </div>
            <button onClick={loadSmsLogs} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <RefreshCw className={`w-4 h-4 ${loadingSms ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-xl">
            {smsLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">لا توجد رسائل SMS مسجلة في sms_logs حتى الآن</div>
            ) : (
              smsLogs.map(sms => (
                <div key={sms.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{sms.sender_phone || 'بدون رقم'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sms.is_used ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {sms.is_used ? 'تم استخدامه ✓' : 'معلق لم يستخدم ⏳'}
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-[11px] leading-relaxed max-w-xl">
                      {sms.raw_message || sms.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {sms.amount} ج.م
                    </span>
                    {!sms.is_used && (
                      <button
                        onClick={() => handleApproveSms(sms.id, sms.amount)}
                        className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        اعتماد يدوي لطالب
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: بيانات الأستاذ والمنصة */}
      {activeTab === 'settings' && (
        <div className="max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-xl">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>بيانات الدفع والتواصل الرسمية</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                رقم محفظة فودافون كاش الثابت لاستقبال التحويلات:
              </label>
              <input
                type="text"
                value={teacherWalletNumber}
                onChange={e => setTeacherWalletNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                اسم الأستاذ الرسمي:
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                رقم واتساب الدعم المباشر:
              </label>
              <input
                type="text"
                value={teacherWhatsApp}
                onChange={e => setTeacherWhatsApp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => {
                setSettingsSaved(true);
                showToast('success', 'تم حفظ بيانات المنصة والأستاذ بنجاح!');
                setTimeout(() => setSettingsSaved(false), 2000);
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{settingsSaved ? 'تم الحفظ بنجاح ✓' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: تعديل رصيد الطالب يدوياً */}
      {selectedStudentForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span>تعديل رصيد محفظة: {selectedStudentForBalance.name}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  المبلغ المراد إضافته (أو كتابة سالب - للخصم):
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={e => setAdjustmentAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  سبب التعديل / البيان:
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleAdjustBalance}
                  disabled={isAdjusting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
                >
                  {isAdjusting ? 'جاري التعديل...' : 'تأكيد تعديل الرصيد'}
                </button>
                <button
                  onClick={() => setSelectedStudentForBalance(null)}
                  className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: إضافة كورس جديد */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>إضافة كورس تعليمي جديد</span>
            </h3>

            <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">عنوان الكورس:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مراجعة نهائية فيزياء 2026"
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">المادة:</label>
                <input
                  type="text"
                  required
                  value={newCourseSubject}
                  onChange={e => setNewCourseSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">سعر الكورس (جنيه مصري):</label>
                <input
                  type="number"
                  required
                  value={newCoursePrice}
                  onChange={e => setNewCoursePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  إضافة الكورس ونشره
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance QR Code Live Scanner Modal */}
      <AttendanceQrScannerModal
        isOpen={showQrScannerModal}
        onClose={() => setShowQrScannerModal(false)}
        onAttendanceRecorded={(rec) => {
          showToast('success', `تم تسجيل حضور الطالب (${rec.student_name}) بنجاح!`);
          loadAttendance();
          loadStudents();
        }}
      />

    </div>
  );
};

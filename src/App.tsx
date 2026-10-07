import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Wallet, 
  Sparkles, 
  BookOpen, 
  UserCheck, 
  Home, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  LogOut, 
  User, 
  Settings, 
  Users, 
  Plus, 
  Edit3 
} from 'lucide-react';
import { PageId, Course, TeacherProfileData } from './types';
import { 
  subscribeToStudentBalance, 
  redeemDepositInFirestore, 
  withdrawFromFirestore, 
  fetchRecentTransactions, 
  enrollInCourseInFirestore, 
  testFirestoreConnection, 
  UserAccount, 
  getOrCreateDeviceId, 
  subscribeToDeviceLock,
  updateStudentProfileInFirestore,
  fetchTeacherProfileFromFirestore,
  subscribeToTeacherProfile,
  updateTeacherProfileInFirestore,
  fetchCoursesFromFirestore,
  subscribeToCourses,
  saveCourseInFirestore
} from './firebase';

import { OrganicBottomNav } from './components/OrganicBottomNav';
import { HomePage } from './components/HomePage';
import { CoursesCatalogPage } from './components/CoursesCatalogPage';
import { MyCoursesCleanPage } from './components/MyCoursesCleanPage';
import { CleanWalletPage, Transaction } from './components/CleanWalletPage';
import { AboutTeacherPage } from './components/AboutTeacherPage';
import { StudentProfilePage } from './components/StudentProfilePage';
import { AdminStudentManagementPage } from './components/AdminStudentManagementPage';
import { AuthModal } from './components/AuthModal';
import { COURSES_DATA } from './data/mockData';

const DEFAULT_STUDENT_ID = 'std-current';

export function App() {
  // Authentication & Role
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('edumaster_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isDeveloperMode = currentUser?.role === 'developer';

  const [isDeviceMismatchLocked, setIsDeviceMismatchLocked] = useState(false);

  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    try {
      const saved = localStorage.getItem('edumaster_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'developer') return 'teacher';
      }
    } catch {}
    return 'home';
  });

  // Strict Default for New Accounts is 0 EGP
  const [balance, setBalance] = useState<number>(0);
  const [studentName, setStudentName] = useState<string>(currentUser?.name || 'طالب المنصة');
  const [studentPhone, setStudentPhone] = useState<string>(currentUser?.phone || '01012345678');
  const [studentCode, setStudentCode] = useState<string>(currentUser?.student_code || 'STD-782914');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Strict Default for New Accounts is [] empty array
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('edumaster_enrolled_courses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Courses & Teacher Profile
  const [coursesList, setCoursesList] = useState<Course[]>(COURSES_DATA);
  const [teacherData, setTeacherData] = useState<TeacherProfileData | undefined>(undefined);

  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const activeStudentId = currentUser?.id || DEFAULT_STUDENT_ID;

  // 1. Subscribe in Real-Time to Firestore Student Balance, Device Lock, Courses & Teacher Profile
  useEffect(() => {
    testFirestoreConnection().catch(console.warn);

    // Initial Fetch & Real-time Subscriptions
    fetchTeacherProfileFromFirestore().then(data => {
      if (data) setTeacherData(data as TeacherProfileData);
    }).catch(console.warn);

    fetchCoursesFromFirestore().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setCoursesList(data as Course[]);
      }
    }).catch(console.warn);

    // Realtime Teacher Profile Sync
    const unsubscribeTeacher = subscribeToTeacherProfile((data) => {
      if (data) setTeacherData(data as TeacherProfileData);
    });

    // Realtime Courses Sync
    const unsubscribeCourses = subscribeToCourses((courses) => {
      if (Array.isArray(courses) && courses.length > 0) {
        setCoursesList(courses as Course[]);
      }
    });

    // Realtime Student Balance & Courses Sync
    const unsubscribeBalance = subscribeToStudentBalance(activeStudentId, (data) => {
      if (typeof data.balance === 'number') setBalance(data.balance);
      if (data.name) setStudentName(data.name);
      if (data.phone) setStudentPhone(data.phone);
      if (data.student_code) setStudentCode(data.student_code);
      if (Array.isArray(data.enrolledCourses)) {
        setEnrolledCourseIds(data.enrolledCourses);
        try {
          localStorage.setItem('edumaster_enrolled_courses', JSON.stringify(data.enrolledCourses));
        } catch {}
      }
    });

    // Realtime Single Device Lock Listener
    let unsubscribeLock = () => {};
    if (currentUser && currentUser.role === 'student') {
      const myDeviceId = getOrCreateDeviceId();
      unsubscribeLock = subscribeToDeviceLock(currentUser.id, myDeviceId, () => {
        setIsDeviceMismatchLocked(true);
      });
    }

    refreshTransactions(activeStudentId);

    return () => {
      if (typeof unsubscribeBalance === 'function') unsubscribeBalance();
      if (typeof unsubscribeLock === 'function') unsubscribeLock();
      if (typeof unsubscribeTeacher === 'function') unsubscribeTeacher();
      if (typeof unsubscribeCourses === 'function') unsubscribeCourses();
    };
  }, [currentUser, activeStudentId]);

  const refreshTransactions = async (studentId: string = activeStudentId) => {
    try {
      const txs = await fetchRecentTransactions(studentId);
      if (Array.isArray(txs)) {
        setTransactions(txs as Transaction[]);
      }
    } catch (err) {
      console.warn('Failed to load transactions:', err);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = (user: UserAccount, role: 'student' | 'developer') => {
    setCurrentUser(user);
    try {
      localStorage.setItem('edumaster_current_user', JSON.stringify(user));
    } catch {}

    setStudentName(user.name);
    setStudentPhone(user.phone);
    if (user.student_code) setStudentCode(user.student_code);

    if (role === 'developer') {
      setCurrentPage('teacher');
      showToast('success', 'مرحباً بك يا دكتور / أدمن! تم تفعيل وضع التعديل المباشر وشريط تحكم الإدارة.');
    } else {
      setCurrentPage('home');
      showToast('success', `أهلاً بك يا ${user.name}! تم قفل الحساب على جهازك بنجاح.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    try {
      localStorage.removeItem('edumaster_current_user');
      localStorage.removeItem('edumaster_enrolled_courses');
    } catch {}
    showToast('info', 'تم تسجيل الخروج بنجاح.');
  };

  // Update Profile
  const handleUpdateProfile = async (name: string, phone: string, avatar?: string) => {
    if (!currentUser) return false;
    const ok = await updateStudentProfileInFirestore(currentUser.id, name, phone, avatar);
    if (ok) {
      setStudentName(name);
      setStudentPhone(phone);
      const updatedUser = {
        ...currentUser,
        name,
        phone,
        avatar: avatar || currentUser.avatar
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('edumaster_current_user', JSON.stringify(updatedUser));
      } catch {}
      return true;
    }
    return false;
  };

  // Update Teacher Data (Developer)
  const handleUpdateTeacher = async (data: TeacherProfileData) => {
    const ok = await updateTeacherProfileInFirestore(data);
    if (ok) {
      setTeacherData(data);
      showToast('success', 'تم حفظ ونشر تحديثات صفحة الأستاذ ومزامنتها في قاعدة البيانات بنجاح.');
      return true;
    }
    return false;
  };

  // Save / Add Course (Developer)
  const handleSaveCourse = async (course: Course) => {
    const ok = await saveCourseInFirestore(course);
    if (ok) {
      setCoursesList(prev => prev.map(c => c.id === course.id ? course : c));
      showToast('success', `تم حفظ تعديلات كورس "${course.title}" ونشرها لجميع الطلاب.`);
      return true;
    }
    return false;
  };

  const handleAddCourse = async (course: Course) => {
    const ok = await saveCourseInFirestore(course);
    if (ok) {
      setCoursesList(prev => [course, ...prev]);
      showToast('success', `تم إضافة كورس "${course.title}" بنجاح وتخزينه في Firestore.`);
      return true;
    }
    return false;
  };

  // Deposit Submission (Fixed Wallet 01019920811 with auto-match)
  const handleDepositSubmit = async (phone: string, amountStr: string) => {
    const amt = parseFloat(amountStr) || 0;
    const res = await redeemDepositInFirestore(activeStudentId, phone, amt);
    if (res.success) {
      refreshTransactions(activeStudentId);
    }
    return res;
  };

  // Withdraw Submission
  const handleWithdrawSubmit = async (amountStr: string, phone: string) => {
    const amt = parseFloat(amountStr);
    const res = await withdrawFromFirestore(activeStudentId, amt, phone);
    if (res.success) {
      refreshTransactions(activeStudentId);
    }
    return res;
  };

  // Course Enrollment
  const handleEnrollCourse = async (course: Course): Promise<boolean> => {
    try {
      const res = await enrollInCourseInFirestore(
        activeStudentId, 
        course.id, 
        course.discountedPrice, 
        course.title
      );

      if (res.success) {
        const nextEnrolled = Array.from(new Set([...enrolledCourseIds, course.id]));
        setEnrolledCourseIds(nextEnrolled);
        try {
          localStorage.setItem('edumaster_enrolled_courses', JSON.stringify(nextEnrolled));
        } catch {}

        showToast('success', res.message);
        refreshTransactions(activeStudentId);
        return true;
      } else {
        showToast('error', res.message);
        return false;
      }
    } catch (err: any) {
      showToast('error', 'فشلت عملية الاشتراك: ' + err.message);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo',sans-serif] selection:bg-emerald-500 selection:text-white flex flex-col justify-between" dir="rtl">
      
      {/* 1. Auth Modal (Opens if no user is signed in) */}
      <AuthModal
        isOpen={!currentUser}
        onSuccess={handleAuthSuccess}
      />

      {/* 2. Single Device Lock Security Modal */}
      {isDeviceMismatchLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn text-right" dir="rtl">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <Smartphone className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">تنبيه أمان: تم الدخول من جهاز آخر</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                تم تسجيل الدخول إلى هذا الحساب من هاتف أو حاسوب آخر. لحماية محتواك، تسمح منصة الأستاذ بتشغيل الحساب على جهاز واحد فقط في نفس الوقت.
              </p>
            </div>

            <button
              onClick={() => {
                setIsDeviceMismatchLocked(false);
                handleLogout();
              }}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-rose-950/50"
            >
              تسجيل الدخول مجدداً وتفعيل هذا الجهاز
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border backdrop-blur-md animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200' 
            : toast.type === 'error'
            ? 'bg-rose-950/95 border-rose-500/50 text-rose-200'
            : 'bg-indigo-950/95 border-indigo-500/50 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Clock className="w-5 h-5 text-indigo-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white shrink-0 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Developer / Admin Top Action Bar */}
      {isDeveloperMode && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span className="font-black">وضع المطور والأدمن مفعّل (Admin Mode) - تعديل المدرس والكورسات وإدارة الطلاب</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('teacher')}
              className={`py-1 px-3 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                currentPage === 'teacher'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-900/90 text-white hover:bg-slate-950'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>عن المدرس</span>
            </button>

            <button
              onClick={() => setCurrentPage('courses')}
              className={`py-1 px-3 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                currentPage === 'courses'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-900/90 text-white hover:bg-slate-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>الكورسات</span>
            </button>

            <button
              onClick={() => setCurrentPage('admin_students')}
              className={`py-1 px-3 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                currentPage === 'admin_students'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-900/90 text-white hover:bg-slate-950'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>إدارة الطلاب</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className={`sticky z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 sm:py-4 ${isDeveloperMode ? 'top-9' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setCurrentPage(isDeveloperMode ? 'teacher' : 'home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <span>منصة الأستاذ</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">
                {isDeveloperMode ? 'لوحة تحكم وإدارة المنصة' : 'الفيزياء والمناهج الحديثة للثانوية العامة'}
              </span>
            </div>
          </div>

          {/* User & Wallet Quick Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Wallet Balance Pill (Visible for student) */}
            {!isDeveloperMode && (
              <button
                onClick={() => setCurrentPage('wallet')}
                className="py-1.5 px-3 sm:px-3.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer flex items-center gap-2 shadow-sm group"
                title="رصيد المحفظة - اضغط للذهاب للمحفظة"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-baseline gap-1 text-xs">
                  <span className="font-extrabold text-white font-mono group-hover:text-emerald-300 transition-colors">
                    {(Number.isFinite(balance) ? balance : 0).toLocaleString('ar-EG')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">ج.م</span>
                </div>
              </button>
            )}

            {/* Profile Quick Button (Student) */}
            {!isDeveloperMode && (
              <button
                onClick={() => setCurrentPage('profile')}
                className={`p-1.5 sm:px-3 rounded-full border transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'profile'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="البروفايل والبيانات الشخصية"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline font-bold">{studentName.split(' ')[0]}</span>
              </button>
            )}

            {/* Developer Badge Pill */}
            {isDeveloperMode && (
              <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin / Developer</span>
              </div>
            )}

            {/* Logout */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="py-1.5 px-2.5 rounded-full bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-200 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Page Content Body */}
      <main className="flex-1 pb-28 sm:pb-36">
        {currentPage === 'home' && !isDeveloperMode && (
          <HomePage
            studentName={studentName}
            balance={balance}
            enrolledCourseIds={enrolledCourseIds}
            onNavigate={setCurrentPage}
            courses={coursesList}
            onEnrollCourse={handleEnrollCourse}
          />
        )}

        {currentPage === 'courses' && (
          <CoursesCatalogPage
            walletBalance={balance}
            enrolledCourseIds={enrolledCourseIds}
            onEnrollCourse={handleEnrollCourse}
            onNavigateToWallet={() => setCurrentPage('wallet')}
            onNavigateToMyCourses={() => setCurrentPage('my_courses')}
            isDeveloper={isDeveloperMode}
            coursesList={coursesList}
            onSaveCourse={handleSaveCourse}
            onAddCourse={handleAddCourse}
          />
        )}

        {currentPage === 'my_courses' && !isDeveloperMode && (
          <MyCoursesCleanPage
            enrolledCourseIds={enrolledCourseIds}
            onNavigateToCourses={() => setCurrentPage('courses')}
          />
        )}

        {currentPage === 'wallet' && !isDeveloperMode && (
          <CleanWalletPage
            balance={balance}
            studentName={studentName}
            studentPhone={studentPhone}
            transactions={transactions}
            onDepositSubmit={handleDepositSubmit}
            onWithdrawSubmit={handleWithdrawSubmit}
            onRefresh={() => refreshTransactions(activeStudentId)}
          />
        )}

        {currentPage === 'teacher' && (
          <AboutTeacherPage
            isDeveloper={isDeveloperMode}
            teacherData={teacherData}
            onUpdateTeacher={handleUpdateTeacher}
          />
        )}

        {currentPage === 'profile' && !isDeveloperMode && (
          <StudentProfilePage
            currentUser={currentUser}
            studentName={studentName}
            studentPhone={studentPhone}
            studentCode={studentCode}
            balance={balance}
            enrolledCount={enrolledCourseIds.length}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'admin_students' && (
          <AdminStudentManagementPage
            courses={coursesList}
            onClose={() => setCurrentPage('teacher')}
          />
        )}
      </main>

      {/* Interactive Organic Bottom Nav Bar (Only visible after login/signup) */}
      {currentUser && (
        <OrganicBottomNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          walletBalance={balance}
          isDeveloper={isDeveloperMode}
        />
      )}

    </div>
  );
}

export default App;

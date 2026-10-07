import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  CreditCard, 
  UserCheck, 
  LayoutDashboard, 
  Menu, 
  X, 
  Sparkles,
  Home,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ArrowRight,
  Wallet,
  Smartphone,
  BookMarked,
  Terminal
} from 'lucide-react';
import { PageId, UserProfile } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenAuth,
  userProfile,
  onLogout
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; desc: string }[] = [
    { 
      id: 'home', 
      label: 'الرئيسية', 
      icon: Home,
      desc: 'الصفحة الرئيسية ومقدمة الأستاذ والإحصائيات' 
    },
    { 
      id: 'wallet', 
      label: 'محفظة فودافون كاش', 
      icon: Wallet,
      badge: `${userProfile?.walletBalance ?? 0} ج.م`,
      desc: 'عرض الرصيد المتاح وشحن فودافون كاش وسجل العمليات' 
    },
    { 
      id: 'courses', 
      label: 'الكورسات والشراء', 
      icon: Award,
      badge: 'دفعة 2026',
      desc: 'استعراض المقررات وشراء الكورس عبر رصيد المحفظة' 
    },
    { 
      id: 'my_courses', 
      label: 'كورساتي المشترك بها', 
      icon: BookMarked,
      desc: 'المقررات التي تم شراؤها وتفعيلها في حسابك' 
    },
    { 
      id: 'curriculum', 
      label: 'هيكل المنهج والدروس', 
      icon: BookOpen,
      desc: 'تفاصيل الوحدات والأهداف التعليمية والوسائط' 
    },
    { 
      id: 'quiz', 
      label: 'الاختبار الذكي (MCQ)', 
      icon: Sparkles,
      badge: 'تغذية فورية',
      desc: 'بنك أسئلة المفاهيم والتقييم والبرهان العلمي' 
    },
    { 
      id: 'pricing', 
      label: 'باقات الاشتراك', 
      icon: CreditCard,
      desc: 'خطط الكورس والشهري والترم والنخبة' 
    },
    { 
      id: 'security', 
      label: 'الحماية وإدارة الطلاب', 
      icon: ShieldCheck,
      badge: 'DRM مانع التسريب',
      desc: 'محاكي البصمة المائية وتشفير الفيديو وحظر التسجيل' 
    },
    { 
      id: 'teacher', 
      label: 'لوحة تحكم المعلم', 
      icon: LayoutDashboard,
      badge: 'إدارة',
      desc: 'اعتماد طلبات فودافون كاش ومتابعة الطلاب وسجل الأمان' 
    },
    { 
      id: 'backend_api', 
      label: 'سيرفر الـ Forwarder والـ Webhook', 
      icon: Terminal,
      badge: 'LIVE API ⚡',
      desc: 'فحص واختبار مسارات POST /api/sms/webhook والمطابقة الآلية' 
    }
  ];

  const handleSelectPage = (pageId: PageId) => {
    onNavigate(pageId);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Right: Hamburger button ("ثلاث شرط") & Logo */}
            <div className="flex items-center gap-3">
              {/* The 3-bar hamburger button ("ثلاث شرط") */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/80 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition cursor-pointer shadow-sm group"
                title="فتح قائمة الصفحات والتنقل (ثلاث شرط)"
                aria-label="قائمة الصفحات"
              >
                <Menu className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-white hidden sm:inline">
                  القائمة ☰
                </span>
              </button>

              {/* Logo & Teacher Branding */}
              <button 
                onClick={() => handleSelectPage('home')}
                className="flex items-center gap-2.5 text-right cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-l from-white to-slate-200 bg-clip-text text-transparent">
                      منصة الأستاذ
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                      فودافون كاش
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 hidden md:block">
                    محفظة رقمية ودفع محلي فوري
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-300">
              {navItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPage(item.id)}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-l from-indigo-600 to-emerald-600 text-white shadow-md font-black shadow-emerald-500/10'
                        : 'hover:text-white hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Left: Digital Wallet Pill + Auth Profile */}
            <div className="flex items-center gap-2.5">
              
              {/* Student Wallet Quick Badge */}
              {userProfile && (
                <button
                  onClick={() => handleSelectPage('wallet')}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-950/80 to-slate-900 hover:from-emerald-900/80 border border-emerald-500/40 px-3.5 py-2 rounded-2xl transition shadow-sm cursor-pointer group"
                  title="فتح محفظة فودافون كاش"
                >
                  <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block leading-none">رصيد المحفظة:</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      {userProfile.walletBalance} ج.م
                    </span>
                  </div>
                </button>
              )}

              {/* Teacher Portal Switcher */}
              <button
                onClick={() => handleSelectPage('teacher')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  currentPage === 'teacher'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-slate-800/70 text-indigo-300 border-indigo-500/30 hover:bg-slate-700/80'
                }`}
                title="لوحة تحكم المعلم (اعتماد طلبات فودافون كاش)"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>لوحة المعلم</span>
              </button>

              {/* User Profile / Login */}
              {userProfile ? (
                <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700">
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-400/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {userProfile.name.charAt(0)}
                    </div>
                  )}

                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-200 line-clamp-1">{userProfile.name}</p>
                    <p className="text-[9px] text-emerald-400 font-mono">
                      {userProfile.authProvider === 'google' ? 'Google Account' : userProfile.phone}
                    </p>
                  </div>

                  <button
                    onClick={onLogout}
                    className="text-slate-400 hover:text-rose-400 text-xs px-1 cursor-pointer font-semibold mr-1"
                    title="تسجيل الخروج"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    دخول
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>حساب جديد</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Slide-over Drawer Menu ("قائمة الثلاث شرط") */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between text-right animate-slideInRight">
              
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-black text-base text-white">فهرس صفحات المنصة</span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Menu className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">محفظة فودافون كاش والكورسات</p>
                </div>
              </div>

              {/* Drawer Navigation List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-2">
                
                {/* Highlighted Wallet Banner in Drawer */}
                {userProfile && (
                  <div 
                    onClick={() => handleSelectPage('wallet')}
                    className="p-4 rounded-2xl bg-gradient-to-l from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/40 cursor-pointer shadow-md mb-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>رصيد محفظتك الرقمية:</span>
                      </span>
                      <span className="font-black text-emerald-400 text-base font-mono">
                        {userProfile.walletBalance} ج.م
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">اضغط للشحن عبر فودافون كاش أو مراجعة العمليات</p>
                  </div>
                )}

                <p className="text-[11px] font-bold text-slate-400 px-2 mb-2">اختر الصفحة التي تريد الانتقال إليها:</p>
                
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectPage(item.id)}
                      className={`w-full p-3.5 rounded-2xl text-right transition flex items-center justify-between cursor-pointer group ${
                        isActive
                          ? 'bg-gradient-to-l from-indigo-950 via-slate-800 to-emerald-950/60 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive 
                            ? 'bg-emerald-500 text-slate-950 font-bold' 
                            : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                        </div>
                      </div>

                      <ChevronLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${
                        isActive ? 'text-emerald-400' : 'text-slate-600'
                      }`} />
                    </button>
                  );
                })}
              </div>

              {/* Drawer Bottom Status & Actions */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
                {userProfile ? (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">{userProfile.name}</p>
                      <p className="text-[10px] text-emerald-400 font-mono">رصيد: {userProfile.walletBalance} ج.م</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                    >
                      تسجيل خروج
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setDrawerOpen(false); onOpenAuth('login'); }}
                      className="py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-800"
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      onClick={() => { setDrawerOpen(false); onOpenAuth('register'); }}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-xs font-bold text-white shadow-md"
                    >
                      حساب جديد
                    </button>
                  </div>
                )}

                <div className="text-center text-[10px] text-slate-500">
                  منصة الأستاذ التعليمية 2026 • محفظة فودافون كاش الرقمية
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

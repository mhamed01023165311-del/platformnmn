import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  BookOpen, 
  Award, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  LayoutDashboard,
  Wallet,
  BookMarked,
  Terminal,
  User,
  Users
} from 'lucide-react';
import { PageId } from '../types';

interface PageHeaderNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

const PAGE_META: { [key in PageId]: { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> } } = {
  home: { title: 'الرئيسية', subtitle: 'نظرة عامة على المنصة ومحفظة فودافون كاش', icon: Home },
  wallet: { title: 'محفظة فودافون كاش', subtitle: 'إدارة الرصيد المتاح، شحن فودافون كاش، وسجل العمليات', icon: Wallet },
  courses: { title: 'الكورسات والشراء', subtitle: 'مقررات الثانوية العامة والشراء المباشر بالرصيد', icon: Award },
  my_courses: { title: 'كورساتي المشترك بها', subtitle: 'المقررات المفعلة في حسابك والمتابعة الدراسية', icon: BookMarked },
  curriculum: { title: 'هيكل المنهج والدروس', subtitle: 'الوحدات، الدروس الأسبوعية، والأهداف التعليمية', icon: BookOpen },
  quiz: { title: 'نظام الاختبارات الذكية', subtitle: 'أسئلة MCQ مع التغذية الراجعة والبرهان العلمي', icon: Sparkles },
  pricing: { title: 'باقات الاشتراك والأسعار', subtitle: 'خطط الكورس والشهري والترم والنخبة VIP', icon: CreditCard },
  security: { title: 'حماية الفيديوهات وإدارة الطلاب', subtitle: 'محاكي الـ DRM، البصمة المائية، وبوابات الدفع', icon: ShieldCheck },
  teacher: { title: 'لوحة تحكم المعلم', subtitle: 'اعتماد طلبات فودافون كاش، متابعة الطلاب، وسجل الأمان', icon: LayoutDashboard },
  backend_api: { title: 'سيرفر الـ Forwarder والـ Webhook', subtitle: 'مسارات POST /api/sms/webhook والـ Matching Engine المباشر', icon: Terminal },
  profile: { title: 'بروفايل الطالب', subtitle: 'البيانات الشخصية، كود الطالب، وإعدادات الحساب', icon: User },
  admin_students: { title: 'إدارة الطلاب (Admin)', subtitle: 'البحث وتعديل الأرصدة والكورسات وقفل الأجهزة', icon: Users }
};

const PAGES_ORDER: PageId[] = ['home', 'wallet', 'courses', 'my_courses', 'teacher', 'profile', 'admin_students'];

export const PageHeaderNav: React.FC<PageHeaderNavProps> = ({
  currentPage,
  onNavigate
}) => {
  const currentIndex = PAGES_ORDER.indexOf(currentPage);
  const prevPage = currentIndex > 0 ? PAGES_ORDER[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGES_ORDER.length - 1 ? PAGES_ORDER[currentIndex + 1] : null;

  const currentMeta = PAGE_META[currentPage] || PAGE_META.home;
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
        
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('home')}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </button>
          
          {currentPage !== 'home' && (
            <>
              <span className="text-slate-600">/</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                <CurrentIcon className="w-3.5 h-3.5" />
                <span>{currentMeta.title}</span>
              </div>
            </>
          )}
        </div>

        {/* Previous / Next Page Quick Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          {prevPage && (
            <button
              onClick={() => onNavigate(prevPage)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1 cursor-pointer"
              title={`الانتقال إلى: ${PAGE_META[prevPage]?.title}`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق: {PAGE_META[prevPage]?.title}</span>
            </button>
          )}

          {nextPage && (
            <button
              onClick={() => onNavigate(nextPage)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-900/40 hover:border-emerald-500/40 transition flex items-center gap-1 cursor-pointer font-bold"
              title={`الانتقال إلى: ${PAGE_META[nextPage]?.title}`}
            >
              <span>التالي: {PAGE_META[nextPage]?.title}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

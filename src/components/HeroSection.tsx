import React from 'react';
import { 
  Sparkles, 
  PlayCircle, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  Award, 
  ArrowLeft, 
  Star, 
  FileText, 
  HelpCircle, 
  Video,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  Menu,
  Wallet,
  Smartphone,
  BookMarked
} from 'lucide-react';
import { PageId } from '../types';

interface HeroSectionProps {
  onNavigate: (page: PageId) => void;
  onOpenPreviewLesson: () => void;
  walletBalance?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onOpenPreviewLesson,
  walletBalance = 300
}) => {
  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-20">
        {/* Background Glows */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Main Hero Content (Col 7) */}
            <div className="lg:col-span-7 text-right space-y-6">
              
              {/* Top pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/80 shadow-inner">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-slate-300">
                  نظام شحن فودافون كاش الفوري والمحافظ الرقمية 2026
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-100 leading-[1.2] tracking-tight">
                اشحن محفظتك بفودافون كاش واشترك
                <span className="block mt-2 bg-gradient-to-l from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  في أقوى كورسات الثانوية العامة
                </span>
              </h1>

              {/* Subheading / Value Proposition */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                منصة تعليمية ذكية متكاملة بإشراف <strong className="text-white font-bold">أ.د. أحمد ممدوح</strong> تجمع بين نظام المحفظة الرقمية لشحن فودافون كاش، تفعيل الكورسات بالرصيد فورياً، والشرح المرئي فائق الدقة 4K مع حماية الـ DRM.
              </p>

              {/* Wallet Quick Feature Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-semibold text-slate-300">
                <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                  <Smartphone className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>شحن سريع عبر فودافون كاش</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                  <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>محفظة طالب بالجنيه المصري</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                  <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>فيديوهات 4K محمية بـ DRM</span>
                </div>
              </div>

              {/* Action Buttons to navigate to pages */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => onNavigate('wallet')}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all transform hover:-translate-y-1 flex items-center gap-3 cursor-pointer"
                >
                  <Wallet className="w-5 h-5 text-emerald-300" />
                  <span>شحن المحفظة وفودافون كاش ({walletBalance} ج.م)</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('courses')}
                  className="px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-base hover:text-white transition flex items-center gap-2.5 cursor-pointer shadow-md group"
                >
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>شراء الكورسات بالرصيد</span>
                </button>

                <button
                  onClick={onOpenPreviewLesson}
                  className="px-5 py-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-indigo-400" />
                  <span>مشاهدة درس تجريبي مجاني</span>
                </button>
              </div>

              {/* Live Metrics Row */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 sm:grid-cols-4 gap-4 text-right">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">18,500+</p>
                  <p className="text-xs text-slate-400 mt-1">طالب مشترك بالمنصة</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">98.7%</p>
                  <p className="text-xs text-slate-400 mt-1">نسبة النجاح والتفوق</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-rose-400">01098765432</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">رقم فودافون كاش المعتمد</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-2xl sm:text-3xl font-black text-indigo-400">420+</p>
                  <p className="text-xs text-slate-400 mt-1">ساعة شرح وتطبيقات</p>
                </div>
              </div>

            </div>

            {/* Teacher Spotlight & Visual Card (Col 5) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                <div className="relative rounded-3xl bg-gradient-to-b from-slate-800 via-slate-800/90 to-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl overflow-hidden">
                  
                  {/* Upper instructor banner */}
                  <div className="flex items-center gap-4 pb-5 border-b border-slate-700/70">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=260&h=260&q=80" 
                        alt="أ.د. أحمد ممدوح"
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-400/50 shadow-md"
                      />
                      <div className="absolute -bottom-1 -left-1 bg-emerald-500 rounded-full p-1 text-slate-900" title="معلم موثق">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="text-right flex-1">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                        <span className="font-bold text-slate-200 mr-1">4.98 / 5</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white">أ.د. أحمد ممدوح النجار</h3>
                      <p className="text-xs text-emerald-400 font-semibold">كبير معلمي الفيزياء ومعد البرامج التعليمية</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">شحن آلي وتفعيل فوري للكورسات عبر المحفظة</p>
                    </div>
                  </div>

                  {/* Digital Wallet Card Mini Preview */}
                  <div 
                    onClick={() => onNavigate('wallet')}
                    className="mt-5 p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer shadow-lg space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>رصيد محفظتك الرقمية:</span>
                      </span>
                      <span className="font-black text-emerald-400 text-base font-mono">{walletBalance} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                      <span>تحويل فودافون كاش: 010 9876 5432</span>
                      <span className="text-indigo-400 font-bold hover:underline">اشحن الآن ←</span>
                    </div>
                  </div>

                  {/* Quick CTAs */}
                  <div className="mt-4 space-y-2.5">
                    <button
                      onClick={() => onNavigate('courses')}
                      className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>الانتقال لصفحة الكورسات وشراء كورس</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigate('my_courses')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>عرض الكورسات المشترك بها</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Direct Page Jump Doors on Home */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold mb-2">
            <Menu className="w-3.5 h-3.5 text-emerald-400" />
            <span>تنقل مباشر بين الصفحات المستقلة (أو استخدم قائمة الثلاث شرط ☰ بالأعلى)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            أقسام وصفحات المنصة التعليمية الذكية
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-right">
          
          {/* Card 1: Wallet & Vodafone Cash */}
          <div 
            onClick={() => onNavigate('wallet')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl transition cursor-pointer group hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition">
                صفحة 1: محفظة الطالب وشحن فودافون كاش
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                رقم التحويل المعتمد (010 9876 5432)، نموذج إدخال رقم العملية والمبلغ، وسجل المعاملات والطلبات المعلقة.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-2 border-t border-slate-800">
              <span>فتح المحفظة وشحن الرصيد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Courses & Checkout */}
          <div 
            onClick={() => onNavigate('courses')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-3xl transition cursor-pointer group hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition">
                صفحة 2: الكورسات المتاحة والشراء الفوري
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                بطاقات الكورسات مع زر الشراء بالرصيد المتاح، وفحص كفاية المحفظة قبل الخصم، أو التوجيه لشحن العجز.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 pt-2 border-t border-slate-800">
              <span>استعرض الكورسات واشترك الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: My Courses */}
          <div 
            onClick={() => onNavigate('my_courses')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl transition cursor-pointer group hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BookMarked className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition">
                صفحة 3: كورساتي المشترك بها
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                لوحة الطالب الخاصة بالكورسات التي تم شراؤها وتفعيلها، مع مشغل الدروس ومذكرات الـ PDF المحمية.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-2 border-t border-slate-800">
              <span>عرض الكورسات المشترك بها</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Curriculum */}
          <div 
            onClick={() => onNavigate('curriculum')}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-3xl transition cursor-pointer group hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition">
                صفحة 4: هيكل المنهج والدروس الأسبوعية
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                مقسم إلى (مقدمة، كورسات، وحدات، ودروس أسبوعية) مع الأهداف والوسائط التعليمية.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 pt-2 border-t border-slate-800">
              <span>استعراض هيكل المنهج</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Smart Quiz */}
          <div 
            onClick={() => onNavigate('quiz')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl transition cursor-pointer group hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                صفحة 5: نظام الاختبارات الذكية (MCQ)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                أسئلة اختيار من متعدد مقاسة على المنهج مع مؤقت وتغذية راجعة تحليلية فورية وبرهان فيزيائي.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1 pt-2 border-t border-slate-800">
              <span>بدء الاختبار الذكي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Teacher Dashboard */}
          <div 
            onClick={() => onNavigate('teacher')}
            className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 p-6 rounded-3xl transition cursor-pointer group hover:shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white group-hover:text-rose-300 transition">
                صفحة 6: لوحة المعلم واعتماد فودافون كاش
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                مراجعة طلبات شحن فودافون كاش المعلقة، اعتماد الرصيد بضغطة زر، ومتابعة حضور الطلاب.
              </p>
            </div>
            <div className="text-xs font-bold text-rose-400 flex items-center gap-1 pt-2 border-t border-slate-800">
              <span>فتح لوحة تحكم المعلم</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

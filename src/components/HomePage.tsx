import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Wallet, 
  UserCheck, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  MessageCircle,
  Star,
  Award,
  Clock,
  X
} from 'lucide-react';
import { PageId, Course } from '../types';
import { COURSES_DATA } from '../data/mockData';

const DEFAULT_DEMO_VIDEO = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

interface HomePageProps {
  studentName: string;
  balance: number;
  enrolledCourseIds: string[];
  onNavigate: (page: PageId) => void;
  courses?: Course[];
  onEnrollCourse?: (course: Course) => Promise<boolean>;
}

export const HomePage: React.FC<HomePageProps> = ({
  studentName,
  balance,
  enrolledCourseIds,
  onNavigate,
  courses = COURSES_DATA,
  onEnrollCourse
}) => {
  const [activePreviewVideo, setActivePreviewVideo] = useState<{ title: string; embedUrl: string; duration?: string } | null>(null);

  const displayedCourses = courses.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 animate-fadeIn" dir="rtl">
      
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-5 text-right">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>منصة الأستاذ للفيزياء والعلوم الحديثة 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            مرحباً بك يا <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">{studentName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            منصتك التعليمية الذكية لمتابعة شروحات ومراجعات الثانوية العامة مع نظام شحن المحفظة الفوري بفودافون كاش ومشاهدة الدروس التجريبية بأعلى جودة.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('courses')}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>استعراض الكورسات العامة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigate('wallet')}
              className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>رصيد المحفظة ({balance} ج.م)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: المحفظة */}
        <div 
          onClick={() => onNavigate('wallet')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer shadow-lg space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">رصيد المحفظة الحالي</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">{balance}</span>
            <span className="text-xs text-emerald-400 font-bold">جنيه مصري</span>
          </div>
          <span className="text-[11px] text-slate-400 group-hover:text-emerald-300 transition-colors block">
            اضغط لإيداع رصيد فودافون كاش ←
          </span>
        </div>

        {/* Card 2: كورساتي */}
        <div 
          onClick={() => onNavigate('my_courses')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer shadow-lg space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">الدورات المشترك بها</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">{enrolledCourseIds.length}</span>
            <span className="text-xs text-indigo-400 font-bold">كورسات مفعلة</span>
          </div>
          <span className="text-[11px] text-slate-400 group-hover:text-indigo-300 transition-colors block">
            متابعة المذاكرة والدروس ←
          </span>
        </div>

        {/* Card 3: عن الأستاذ */}
        <div 
          onClick={() => onNavigate('teacher')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer shadow-lg space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">المعلم والمشرف الأكاديمي</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-sm text-white">
            أ. د. أحمد ممدوح النجار
          </div>
          <span className="text-[11px] text-slate-400 group-hover:text-cyan-300 transition-colors block">
            التواصل المباشر عبر واتساب ←
          </span>
        </div>
      </div>

      {/* 3. Featured Courses Section (بنفس شكل الكورسات العامة الأنيق) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="text-right">
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <span>أبرز الكورسات والمناهج المتاحة الآن</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              شاهد الفيديوهات التجريبية مجاناً واشترك برصيد محفظتك الرقمية مباشرة.
            </p>
          </div>

          <button
            onClick={() => onNavigate('courses')}
            className="text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <span>عرض كل الكورسات ({courses.length})</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Identical 3D Cards Grid to CoursesCatalogPage */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const firstLesson = course.modules?.[0]?.lessons?.[0];
            const demoVideoUrl = firstLesson?.resources?.find(r => r.type === 'video')?.url || DEFAULT_DEMO_VIDEO;

            return (
              <div 
                key={course.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl flex flex-col justify-between transition duration-200 group relative"
              >
                <div>
                  {/* Course Thumbnail Image */}
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Floating Grade Badge */}
                    <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-200">
                      {course.gradeTitle}
                    </div>

                    {/* YouTube Preview Trigger Button over image */}
                    <button
                      onClick={() => setActivePreviewVideo({
                        title: course.title + ' (محاضرة تجريبية)',
                        embedUrl: demoVideoUrl,
                        duration: firstLesson?.duration || '90 دقيقة'
                      })}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition group/btn cursor-pointer"
                      title="مشاهدة درس تجريبي مجاناً على يوتيوب"
                    >
                      <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition">
                        <Play className="w-6 h-6 ml-0.5 fill-current" />
                      </div>
                    </button>
                  </div>

                  {/* Course Details Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block mb-1">
                        {course.subject} · {course.instructor}
                      </span>
                      <h3 className="font-bold text-base sm:text-lg text-white leading-snug">
                        {course.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {course.overview}
                    </p>

                    {/* Meta stats */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.totalHours}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.totalLessons || course.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 12} محاضرة</span>
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{course.rating}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Actions Footer */}
                <div className="p-5 sm:p-6 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white font-mono">
                        {course.discountedPrice}
                      </span>
                      <span className="text-xs text-slate-400">جنيه مصري</span>
                    </div>
                    {course.originalPrice > course.discountedPrice && (
                      <span className="text-xs text-slate-500 line-through font-mono">
                        {course.originalPrice} ج.م
                      </span>
                    )}
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActivePreviewVideo({
                        title: course.title + ' (درس تجريبي)',
                        embedUrl: demoVideoUrl,
                        duration: firstLesson?.duration || '90 دقيقة'
                      })}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-rose-400 fill-current" />
                      <span>درس تجريبي</span>
                    </button>

                    {isEnrolled ? (
                      <button
                        onClick={() => onNavigate('my_courses')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>مشترك بالفعل</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onEnrollCourse) {
                            onEnrollCourse(course);
                          } else {
                            onNavigate('courses');
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-950/40"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>اشتراك بالرصيد</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded YouTube Preview Modal */}
      {activePreviewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-right space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] text-rose-400 font-bold block">
                  درس تجريبي مجاني
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {activePreviewVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <iframe
                src={activePreviewVideo.embedUrl + '?autoplay=1'}
                title="معاينة كورس الأستاذ"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>مدة الدرس: {activePreviewVideo.duration || '90 دقيقة'}</span>
              <button
                onClick={() => setActivePreviewVideo(null)}
                className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                إغلاق المشغل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

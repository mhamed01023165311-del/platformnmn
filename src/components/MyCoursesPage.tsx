import React from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  Award, 
  ArrowLeft, 
  Sparkles, 
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { COURSES_DATA } from '../data/mockData';

interface MyCoursesPageProps {
  enrolledCourseIds: string[];
  onOpenLessonPlayer: (lesson: Lesson, courseTitle: string) => void;
  onNavigateToCourses: () => void;
  onNavigateToWallet: () => void;
}

export const MyCoursesPage: React.FC<MyCoursesPageProps> = ({
  enrolledCourseIds,
  onOpenLessonPlayer,
  onNavigateToCourses,
  onNavigateToWallet
}) => {
  const enrolledCourses = COURSES_DATA.filter(c => enrolledCourseIds.includes(c.id));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 text-right animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Award className="w-4 h-4" />
            <span>لوحة الكورسات المشترك بها</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            كورساتي المشترك بها (My Enrolled Courses)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            جميع المقررات التي قمت بشرائها واقتطاع ثمنها من محفظتك الرقمية مع صلاحية المشاهدة غير المحدودة ومذكرات الـ PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={onNavigateToWallet}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-slate-700"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>المحفظة الرقمية</span>
          </button>
          <button
            onClick={onNavigateToCourses}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>شراء كورس إضافي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Courses List */}
      {enrolledCourses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">لم تشترك في أي كورس بعد!</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              يمكنك استخدام رصيد محفظتك الرقمية الآن لشراء كورس الفيزياء أو الكيمياء أو التفاضل والبدء في المذاكرة فوراً.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNavigateToCourses}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>استعراض وشراء الكورسات المتاحة</span>
            </button>
            <button
              onClick={onNavigateToWallet}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-700 flex items-center gap-2"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>شحن المحفظة عبر فودافون كاش</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => {
            const firstLesson = course.modules[0]?.lessons[0];

            return (
              <div
                key={course.id}
                className="bg-slate-950 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-emerald-400 transition"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>اشتراك مفعّل</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 text-xs font-bold text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-lg">
                    {course.gradeTitle}
                  </div>
                </div>

                <div className="p-6 text-right space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">المحاضر: {course.instructor}</p>

                    <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>نسبة الإنجاز في الكورس:</span>
                        <span className="text-emerald-400 font-bold font-mono">25%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-400 h-1.5 rounded-full w-1/4" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => firstLesson && onOpenLessonPlayer(firstLesson, course.title)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>متابعة الشرح ومشاهدة الدروس</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

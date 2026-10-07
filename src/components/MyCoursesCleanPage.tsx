import React, { useState } from 'react';
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  X,
  Award,
  Video
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { COURSES_DATA } from '../data/mockData';

interface MyCoursesCleanPageProps {
  enrolledCourseIds: string[];
  onNavigateToCourses: () => void;
}

export const MyCoursesCleanPage: React.FC<MyCoursesCleanPageProps> = ({
  enrolledCourseIds,
  onNavigateToCourses
}) => {
  const enrolledCourses = COURSES_DATA.filter(c => enrolledCourseIds.includes(c.id));
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const handleOpenCourse = (course: Course) => {
    setSelectedCourseForLessons(course);
    if (course.modules[0]?.lessons[0]) {
      setActiveLesson(course.modules[0].lessons[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn" dir="rtl">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <GraduationCap className="w-4 h-4" />
            <span>لوحة دوراتي ومحاضراتي المشتراة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            كورساتي المشترك بها (My Courses)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            جميع المقررات التعليمية التي اشتركت فيها بالفعل. يمكنك متابعة تقدمك ومشاهدة المحاضرات وتحميل مذكرات الشرح في أي وقت.
          </p>
        </div>

        <button
          onClick={onNavigateToCourses}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start md:self-auto shrink-0 shadow-lg"
        >
          <span>استعراض باقي الكورسات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Course Cards List */}
      {enrolledCourses.length === 0 ? (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-10 sm:p-16 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-white">لم تشترك في أي كورس بعد!</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              يمكنك استخدام رصيد محفظتك الرقمية الآن للاشتراك في كورسات الفيزياء أو الكيمياء أو الرياضيات والبدء في المذاكرة ومتابعة المحاضرات فوراً.
            </p>
          </div>

          <button
            onClick={onNavigateToCourses}
            className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-950/50 inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>تصفح الكورسات المتاحة واشترك الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {enrolledCourses.map((course, index) => {
            // Simulated course progress
            const progressPercent = index === 0 ? 45 : 15;

            return (
              <div 
                key={course.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl flex flex-col justify-between transition duration-200 group"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 right-3 bg-emerald-900/90 border border-emerald-500/50 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>مشترك ومفعّل</span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block mb-1">
                        {course.subject} · {course.instructor}
                      </span>
                      <h3 className="font-bold text-base sm:text-lg text-white leading-snug">
                        {course.title}
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">نسبة التقدم في الكورس:</span>
                        <span className="font-bold text-emerald-400 font-mono">{progressPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.totalHours}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.totalLessons} محاضرة</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <button
                    onClick={() => handleOpenCourse(course)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>متابعة المشاهدة والدروس</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: نافذة مشاهدة دروس الكورس */}
      {selectedCourseForLessons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-5 sm:p-6 text-right space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-bold block">
                  {selectedCourseForLessons.subject}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedCourseForLessons.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourseForLessons(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="مشاهدة محاضرة الكورس"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Lesson Title and Resources */}
            {activeLesson && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>{activeLesson.title}</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    المدة: {activeLesson.duration}
                  </span>
                </div>

                {/* Lesson Objectives */}
                {activeLesson.objectives && activeLesson.objectives.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">أهداف ونقاط المحاضرة:</span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {activeLesson.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lesson Resources (PDF / Exercises) */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href="#download-pdf"
                    onClick={(e) => { e.preventDefault(); alert('جاري تحميل مذكرة الدرس بصيغة PDF...'); }}
                    className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>تحميل مذكرة الدرس (PDF)</span>
                  </a>
                </div>
              </div>
            )}

            {/* Module Lessons List */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">فهرس المحاضرات والدروس:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedCourseForLessons.modules.flatMap(m => m.lessons).map((lesson, idx) => {
                  const isCurrent = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full p-3 rounded-xl border text-right flex items-center justify-between text-xs transition cursor-pointer ${
                        isCurrent 
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold' 
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[11px] text-slate-400">
                          {idx + 1}
                        </span>
                        <span>{lesson.title}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">{lesson.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

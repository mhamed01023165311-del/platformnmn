import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  ArrowLeft, 
  Play, 
  Sparkles,
  Tag,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { Course, GradeLevel } from '../types';
import { COURSES_DATA } from '../data/mockData';

interface CourseCardsSectionProps {
  enrolledCourseIds?: string[];
  onSelectCourse: (course: Course) => void;
  onEnrollCourse: (course: Course) => void;
  onOpenLessonPlayer?: (course: Course) => void;
}

export const CourseCardsSection: React.FC<CourseCardsSectionProps> = ({
  enrolledCourseIds = [],
  onSelectCourse,
  onEnrollCourse,
  onOpenLessonPlayer
}) => {
  const [selectedFilter, setSelectedFilter] = useState<GradeLevel>('all');

  const filteredCourses = selectedFilter === 'all'
    ? COURSES_DATA
    : COURSES_DATA.filter(c => c.gradeLevel === selectedFilter);

  return (
    <div className="py-12 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
              <Award className="w-4 h-4" />
              <span>الكورسات والمناهج المتاحة للاشتراك الفوري</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              اختر مسارك التعليمي واشترك برصيد المحفظة
            </h2>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              يمكنك الدفع المباشر من رصيد محفظتك الرقمية المشحونة عبر فودافون كاش، مع فتح فوري وشامل لجميع المحاضرات والمذكرات.
            </p>
          </div>

          {/* Grade Level Filters */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              جميع الصفوف
            </button>
            <button
              onClick={() => setSelectedFilter('third_secondary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedFilter === 'third_secondary'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الصف الثالث الثانوي
            </button>
            <button
              onClick={() => setSelectedFilter('second_secondary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedFilter === 'second_secondary'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الصف الثاني الثانوي
            </button>
          </div>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const discountPercentage = Math.round(((course.originalPrice - course.discountedPrice) / course.originalPrice) * 100);
            const isEnrolled = enrolledCourseIds.includes(course.id);

            return (
              <div
                key={course.id}
                className={`group bg-slate-950/80 border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  isEnrolled 
                    ? 'border-emerald-500/70 shadow-emerald-500/10' 
                    : 'border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                {/* Thumbnail & Badges */}
                <div className="relative overflow-hidden h-52">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isEnrolled ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مشترك به بالفعل</span>
                      </span>
                    ) : course.badge ? (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-slate-950 shadow-md">
                        {course.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600/90 text-white shadow-md flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>خصم {discountPercentage}%</span>
                    </span>
                  </div>

                  {/* Grade Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-sm">
                      {course.gradeTitle}
                    </span>
                  </div>
                </div>

                {/* Course Content Body */}
                <div className="p-6 text-right flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Rating & Students stats */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{course.rating}</span>
                        <span className="text-slate-400 font-normal">({course.studentsCount} طالب)</span>
                      </div>
                      <span className="text-slate-400">{course.subject}</span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition leading-snug line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Instructor Info */}
                    <p className="text-xs text-slate-400 mt-2">
                      تقديم: <strong className="text-slate-200">{course.instructor}</strong> ({course.instructorTitle})
                    </p>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 my-3 text-center text-xs">
                      <div>
                        <p className="text-[10px] text-slate-500">المدة الأكاديمية</p>
                        <p className="font-bold text-white mt-0.5">{course.totalWeeks} أسبوعاً</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">إجمالي الحصص</p>
                        <p className="font-bold text-emerald-400 mt-0.5">{course.totalLessons} حصة</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">حجم الشرح</p>
                        <p className="font-bold text-indigo-400 mt-0.5">{course.totalHours.split(' ')[0]} س</p>
                      </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>فيديوهات 4K محمية ببصمة الطالب والـ DRM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>مذكرات PDF شاملة مع أكثر من 3000 مسألة</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-emerald-400">
                            {course.discountedPrice}
                          </span>
                          <span className="text-xs font-bold text-emerald-300">
                            {course.currency}
                          </span>
                          <span className="text-xs line-through text-slate-500">
                            {course.originalPrice} {course.currency}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">خصم فوري من رصيد المحفظة</p>
                      </div>

                      <button
                        onClick={() => onSelectCourse(course)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 cursor-pointer"
                      >
                        تفاصيل المنهج
                      </button>
                    </div>

                    {/* Enroll CTA */}
                    <div className="grid grid-cols-2 gap-2">
                      {isEnrolled ? (
                        <button
                          onClick={() => onSelectCourse(course)}
                          className="col-span-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>أنت مشترك! ابدأ مشاهدة الدروس</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onEnrollCourse(course)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>شراء الآن</span>
                          </button>

                          <button
                            onClick={() => onSelectCourse(course)}
                            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 text-emerald-400" />
                            <span>معاينة مجانية</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

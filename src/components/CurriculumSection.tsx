import React, { useState } from 'react';
import { 
  BookOpen, 
  FolderTree, 
  Layers, 
  CalendarDays, 
  Target, 
  Video, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Sparkles, 
  Download, 
  Compass, 
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Course, Lesson, CourseModule } from '../types';
import { COURSES_DATA } from '../data/mockData';

interface CurriculumSectionProps {
  onOpenLessonPlayer: (lesson: Lesson, courseTitle: string) => void;
  onOpenQuiz: (quizId?: string) => void;
}

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  onOpenLessonPlayer,
  onOpenQuiz
}) => {
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'structure' | 'orientation'>('structure');
  const [expandedModules, setExpandedModules] = useState<{ [id: string]: boolean }>({
    'mod-1': true // First module expanded by default
  });
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(COURSES_DATA[0].modules[0].lessons[0]);

  const activeCourse = COURSES_DATA[selectedCourseIndex];

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <section id="curriculum" className="py-20 bg-slate-950/70 border-t border-b border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-3">
            <FolderTree className="w-4 h-4" />
            <span>القسم الأول: المعمارية البيداغوجية وهيكل المنهج</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            هيكلة المحتوى والكورسات: نظام تعليمي متدرج نحو الإتقان
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            مخطط دراسي أكاديمي مصمم بعناية فائقة يضمن انتقال الطالب المنطقي من تأسيس المفهوم وصولاً إلى حل أصعب مسائل المستويات العليا والامتحانات الوزارية.
          </p>

          {/* Top Switcher: Orientation vs Course Hierarchy */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('structure')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'structure'
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>هيكل الوحدات والدروس الأسبوعية</span>
            </button>
            <button
              onClick={() => setActiveTab('orientation')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'orientation'
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>المقدمة والتهيئة العامة للمنهج</span>
            </button>
          </div>
        </div>

        {/* Orientation Tab View */}
        {activeTab === 'orientation' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl max-w-5xl mx-auto space-y-8 animate-fadeIn">
            <div className="border-b border-slate-800 pb-6 text-right">
              <span className="text-emerald-400 font-bold text-xs">خارطة الطريق الأكاديمية</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                دليل الانطلاق والتهيئة لطلاب الثانوية العامة (دفعة 2026)
              </h3>
              <p className="text-sm text-slate-300 mt-2">
                قبل البدء في الدروس التخصصية، يخضع كل طالب لأسبوع تهيئة كامل يشمل المهارات الرياضية والحسابية الأساسية التي يحتاجها في الفيزياء والعلوم.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl text-right space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  01
                </div>
                <h4 className="font-bold text-white text-base">أساسيات الرياضيات والفيزياء</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  معالجة الكسور والتحويلات، البوادئ القياسية (المايكرو، النانو، البيكو)، الميل والرسوم البيانية وحساب مساحة ما تحت المنحنى.
                </p>
                <div className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1 pt-1">
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3 محاضرات تأسيسية مجانية</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl text-right space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  02
                </div>
                <h4 className="font-bold text-white text-base">استراتيجية إدارة الوقت والحل</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  كيف يتدرب الطالب على حل أسئلة الاختيار من متعدد خلال دقيقتين لكل سؤال، والتغلب على مصائد الممتحن والتشويش البصري.
                </p>
                <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 pt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ورشة عمل تفاعلية لايف مع د. أحمد</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl text-right space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="font-bold text-white text-base">ميثاق الانضباط ومتابعة ولي الأمر</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  نظام المنصة لا يفتح الدرس التالي إلا بعد تحقيق 80% في واجب الدرس السابق، مع رسائل واتساب آلية لولي الأمر فور أي تأخير.
                </p>
                <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 pt-1">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>متابعة أسبوعية دقيقة ومستمرة</span>
                </div>
              </div>
            </div>

            {/* Quick CTA to return to course modules */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
              <div>
                <p className="font-bold text-white text-sm">جاهز للاطلاع على تفاصيل الوحدات والدروس الأسبوعية؟</p>
                <p className="text-xs text-slate-300 mt-0.5">شاهد الأهداف التعليمية وطرق الشرح والوسائط لكل درس على حدة.</p>
              </div>
              <button
                onClick={() => setActiveTab('structure')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                انتقل لهيكل الدروس الأسبوعية
              </button>
            </div>
          </div>
        )}

        {/* Structure Tab View */}
        {activeTab === 'structure' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Course Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {COURSES_DATA.map((course, idx) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourseIndex(idx);
                    if (course.modules[0]?.lessons[0]) {
                      setSelectedLesson(course.modules[0].lessons[0]);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                    selectedCourseIndex === idx
                      ? 'bg-slate-800 text-white border-2 border-emerald-400 shadow-md'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${selectedCourseIndex === idx ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{course.title.split('(')[0]}</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                    {course.gradeTitle.replace('الصف ', '')}
                  </span>
                </button>
              ))}
            </div>

            {/* Course Overview Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
                    {activeCourse.gradeTitle}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">{activeCourse.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                  {activeCourse.overview}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 shrink-0">
                <div className="text-center bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60">
                  <p className="text-slate-400 text-[10px]">إجمالي الأسابيع</p>
                  <p className="font-bold text-white text-sm">{activeCourse.totalWeeks} أسبوعاً</p>
                </div>
                <div className="text-center bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60">
                  <p className="text-slate-400 text-[10px]">الوحدات المقررة</p>
                  <p className="font-bold text-emerald-400 text-sm">{activeCourse.modules.length} وحدات</p>
                </div>
                <div className="text-center bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60">
                  <p className="text-slate-400 text-[10px]">ساعات الشرح</p>
                  <p className="font-bold text-indigo-400 text-sm">{activeCourse.totalHours}</p>
                </div>
              </div>
            </div>

            {/* Two-Column Layout: Modules Tree on Right / Selected Lesson Deep Dive on Left */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Modules & Weekly Lessons List (Col 5) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                  <span>قائمة الوحدات والدروس الأسبوعية</span>
                  <span>اضغط لتوسيع الوحدة أو اختيار درس</span>
                </div>

                {activeCourse.modules.map(module => {
                  const isExpanded = expandedModules[module.id] ?? false;

                  return (
                    <div 
                      key={module.id} 
                      className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Module Accordion Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-800/50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {module.moduleNumber}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white line-clamp-1">{module.title}</h4>
                            <p className="text-[11px] text-slate-400">{module.lessons.length} دروس أسبوعية • {module.totalHours}</p>
                          </div>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Module Lessons sub-list */}
                      {isExpanded && (
                        <div className="bg-slate-950/60 border-t border-slate-800/80 p-2 space-y-1.5">
                          {module.lessons.map(lesson => {
                            const isSelected = selectedLesson.id === lesson.id;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson)}
                                className={`w-full p-3 rounded-xl text-right transition cursor-pointer flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-gradient-to-l from-indigo-900/40 to-slate-800 border border-emerald-500/50 text-white' 
                                    : 'hover:bg-slate-900 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {lesson.weekNumber}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold line-clamp-1">{lesson.title}</p>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Clock className="w-3 h-3 text-slate-500" />
                                      <span>{lesson.duration}</span>
                                      {lesson.isFreePreview && (
                                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                                          معاينة مجانية
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1 text-[11px]">
                                  {isSelected && (
                                    <span className="text-emerald-400 font-bold text-[10px]">محدد الآن</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected Lesson Deep Dive Detail View (Col 7) */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                  
                  {/* Lesson Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5 text-right">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>الأسبوع {selectedLesson.weekNumber} في خطة المنهج</span>
                        {selectedLesson.isFreePreview && (
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px]">
                            متاح للعرض التجريبي مجاناً 🎁
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {selectedLesson.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>المدة الزمنية المقدرة: {selectedLesson.duration}</span>
                        <span>•</span>
                        <span>دقة الشرح: 4K Ultra-HD</span>
                      </p>
                    </div>

                    {/* Action buttons on lesson */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenLessonPlayer(selectedLesson, activeCourse.title)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>مشغل الدرس التفاعلي</span>
                      </button>

                      {selectedLesson.quizId && (
                        <button
                          onClick={() => onOpenQuiz(selectedLesson.quizId)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>اختبار الأسبوع</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1. Learning Objectives (الأهداف التعليمية المحددة للدرس) */}
                  <div className="space-y-3 text-right">
                    <div className="flex items-center gap-2 text-sm font-black text-white">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>أهداف نواتج التعلم المستهدفة من الدرس:</span>
                    </div>

                    <ul className="space-y-2.5">
                      {selectedLesson.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. Detailed Explanation Method & Media (طريقة الشرح والوسائط) */}
                  <div className="space-y-3 text-right border-t border-slate-800 pt-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <Video className="w-4 h-4 text-indigo-400" />
                        <span>طريقة الشرح والوسائط التعليمية المرفقة:</span>
                      </div>
                      <span className="text-[11px] text-slate-400">نظام متعدد الوسائط</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                      {selectedLesson.explanationMethod.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Video Media Card */}
                      <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                          <Video className="w-4 h-4" />
                          <span>المحاضرة المرئية</span>
                        </div>
                        <p className="text-xs text-white font-semibold">
                          {selectedLesson.explanationMethod.videoDuration}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {selectedLesson.explanationMethod.videoQuality}
                        </p>
                      </div>

                      {/* PDF Notes Card */}
                      <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <FileText className="w-4 h-4" />
                          <span>المذكرة والملخص</span>
                        </div>
                        <p className="text-xs text-white font-semibold">
                          {selectedLesson.explanationMethod.pdfPages} صفحة عالية الوضوح
                        </p>
                        <p className="text-[10px] text-slate-400">
                          شاملة القوانين والأمثلة المحلولة
                        </p>
                      </div>

                      {/* Exercises Card */}
                      <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                          <HelpCircle className="w-4 h-4" />
                          <span>التمارين والواجب</span>
                        </div>
                        <p className="text-xs text-white font-semibold">
                          {selectedLesson.explanationMethod.exercisesCount} سؤالاً تدريبياً
                        </p>
                        <p className="text-[10px] text-slate-400">
                          تصحيح آلي فوري مع فيديو حل الواجب
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Resources Download & Preview Bar */}
                  <div className="border-t border-slate-800 pt-5 space-y-2">
                    <span className="text-xs font-bold text-slate-300 block text-right">
                      الملحقات والملفات الجاهزة للمعاينة:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedLesson.resources.map((res, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200"
                        >
                          {res.type === 'video' && <Video className="w-3.5 h-3.5 text-indigo-400" />}
                          {res.type === 'pdf' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                          {res.type === 'exercise' && <HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
                          {res.type === 'summary' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                          <span>{res.title}</span>
                          {res.durationOrPages && (
                            <span className="text-[10px] text-slate-400 font-mono">({res.durationOrPages})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};

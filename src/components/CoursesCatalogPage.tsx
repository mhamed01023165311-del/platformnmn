import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Wallet, 
  ArrowLeft,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Plus,
  Edit3,
  Camera,
  Save,
  Trash2,
  Video,
  Layers,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, Lesson, CourseModule } from '../types';
import { COURSES_DATA } from '../data/mockData';

// Verified open YouTube embed URLs without domain or playback restrictions
const DEFAULT_DEMO_VIDEO = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

interface CoursesCatalogPageProps {
  walletBalance: number;
  enrolledCourseIds: string[];
  onEnrollCourse: (course: Course) => Promise<boolean>;
  onNavigateToWallet: () => void;
  onNavigateToMyCourses: () => void;
  isDeveloper?: boolean;
  coursesList?: Course[];
  onSaveCourse?: (course: Course) => Promise<boolean>;
  onAddCourse?: (course: Course) => Promise<boolean>;
}

export const CoursesCatalogPage: React.FC<CoursesCatalogPageProps> = ({
  walletBalance,
  enrolledCourseIds,
  onEnrollCourse,
  onNavigateToWallet,
  onNavigateToMyCourses,
  isDeveloper = false,
  coursesList,
  onSaveCourse,
  onAddCourse
}) => {
  const [courses, setCourses] = useState<Course[]>(coursesList || COURSES_DATA);
  const [activePreviewVideo, setActivePreviewVideo] = useState<{ title: string; embedUrl: string; duration?: string } | null>(null);
  const [purchasingCourseId, setPurchasingCourseId] = useState<string | null>(null);
  const [insufficientFundsCourse, setInsufficientFundsCourse] = useState<Course | null>(null);

  // Developer Course Editor Modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'lessons'>('details');

  // Sync when prop updates
  React.useEffect(() => {
    if (coursesList && coursesList.length > 0) {
      setCourses(coursesList);
    }
  }, [coursesList]);

  const handleEnrollClick = async (course: Course) => {
    if (enrolledCourseIds.includes(course.id)) {
      onNavigateToMyCourses();
      return;
    }

    if (walletBalance < course.discountedPrice) {
      setInsufficientFundsCourse(course);
      return;
    }

    setPurchasingCourseId(course.id);
    try {
      const ok = await onEnrollCourse(course);
      if (ok) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } finally {
      setPurchasingCourseId(null);
    }
  };

  const handleOpenAddCourse = () => {
    const newId = 'course-' + Date.now();
    const newCourse: Course = {
      id: newId,
      title: 'كورس جديد 2026',
      gradeLevel: 'third_secondary',
      gradeTitle: 'الصف الثالث الثانوي',
      subject: 'الفيزياء',
      instructor: 'أ. د. أحمد ممدوح النجار',
      instructorTitle: 'خبير تدريس الفيزياء ومؤلف سلسلة المعلم',
      badge: 'جديد 🌟',
      rating: 5.0,
      studentsCount: 1,
      totalWeeks: 12,
      totalModules: 3,
      totalLessons: 12,
      totalHours: '24 ساعة تدريبية',
      originalPrice: 600,
      discountedPrice: 400,
      currency: 'ج.م',
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80',
      overview: 'شرح وتدريبات مكثفة على المنهج مع حل نماذج امتحانات.',
      modules: [
        {
          id: 'mod-1',
          moduleNumber: 1,
          title: 'الوحدة الأولى: البداية والتأسيس',
          description: 'محاضرات الشرح وحل التدريبات والواجبات.',
          totalHours: '8 ساعات',
          lessons: [
            {
              id: 'les-1',
              weekNumber: 1,
              title: 'المحاضرة الأولى: الشرح التأسيسي الأول',
              duration: '90 دقيقة',
              isFreePreview: true,
              objectives: ['فهم القوانين الأساسية', 'حل التدريبات المتنوعة'],
              explanationMethod: {
                videoDuration: 'ساعة و 30 دقيقة',
                videoQuality: '4K HLS',
                pdfPages: 25,
                exercisesCount: 30,
                description: 'شرح تفصيلي مع حل التمارين.'
              },
              resources: [
                {
                  type: 'video',
                  title: 'فيديو المحاضرة الأولى',
                  durationOrPages: '1:30:00',
                  url: DEFAULT_DEMO_VIDEO
                }
              ]
            }
          ]
        }
      ]
    };
    setEditingCourse(newCourse);
    setIsCreatingNew(true);
    setActiveTab('details');
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingCourse) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditingCourse({
            ...editingCourse,
            thumbnail: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setIsSavingCourse(true);
    try {
      if (isCreatingNew) {
        if (onAddCourse) await onAddCourse(editingCourse);
        setCourses(prev => [editingCourse, ...prev]);
      } else {
        if (onSaveCourse) await onSaveCourse(editingCourse);
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? editingCourse : c));
      }
      setEditingCourse(null);
    } finally {
      setIsSavingCourse(false);
    }
  };

  // Add Lesson / Video inside course package
  const handleAddLessonToModule = (moduleIndex: number) => {
    if (!editingCourse) return;
    const updatedModules = [...editingCourse.modules];
    const mod = updatedModules[moduleIndex];
    const nextLessonNum = (mod.lessons?.length || 0) + 1;
    const newLesson: Lesson = {
      id: `les-${Date.now()}-${nextLessonNum}`,
      weekNumber: nextLessonNum,
      title: `المحاضرة ${nextLessonNum}: شرح جديد وتدريبات`,
      duration: '90 دقيقة',
      isFreePreview: false,
      objectives: ['فهم وتطبيق القوانين'],
      explanationMethod: {
        videoDuration: 'ساعة و 30 دقيقة',
        videoQuality: '4K HLS',
        pdfPages: 20,
        exercisesCount: 30,
        description: 'شرح تفصيلي للمحاضرة'
      },
      resources: [
        {
          type: 'video',
          title: `فيديو المحاضرة ${nextLessonNum}`,
          durationOrPages: '1:30:00',
          url: DEFAULT_DEMO_VIDEO
        }
      ]
    };

    mod.lessons = [...(mod.lessons || []), newLesson];
    setEditingCourse({
      ...editingCourse,
      modules: updatedModules,
      totalLessons: updatedModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
    });
  };

  const handleUpdateLessonVideoUrl = (moduleIndex: number, lessonIndex: number, newUrl: string, title?: string, duration?: string) => {
    if (!editingCourse) return;
    const updatedModules = [...editingCourse.modules];
    const lesson = updatedModules[moduleIndex].lessons[lessonIndex];
    if (title) lesson.title = title;
    if (duration) lesson.duration = duration;

    // Update resources video URL
    if (lesson.resources && lesson.resources.length > 0) {
      const vidRes = lesson.resources.find(r => r.type === 'video');
      if (vidRes) {
        vidRes.url = newUrl;
        if (duration) vidRes.durationOrPages = duration;
      } else {
        lesson.resources.push({
          type: 'video',
          title: lesson.title,
          url: newUrl,
          durationOrPages: duration || '90 دقيقة'
        });
      }
    } else {
      lesson.resources = [{
        type: 'video',
        title: lesson.title,
        url: newUrl,
        durationOrPages: duration || '90 دقيقة'
      }];
    }

    setEditingCourse({
      ...editingCourse,
      modules: updatedModules
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn" dir="rtl">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>المناهج والكورسات المتاحة للعام الدراسي 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            الكورسات العامة والمحاضرات المسجلة
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            شاهد الفيديوهات والدروس التجريبية مجاناً واشترك برصيد محفظتك الرقمية مع فتح فوري وشامل لجميع المحاضرات.
          </p>
        </div>

        {/* Action / Balance Card */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
          
          {isDeveloper && (
            <button
              onClick={handleOpenAddCourse}
              className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كورس جديد</span>
            </button>
          )}

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between md:flex-col md:items-end gap-2">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">رصيد محفظتك:</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                {walletBalance.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
            <button
              onClick={onNavigateToWallet}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-3 h-3 text-emerald-400" />
              <span>شحن المحفظة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Developer Banner */}
      {isDeveloper && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Edit3 className="w-4 h-4" />
            <span>وضع إدارة الكورسات مفعّل: يمكنك تعديل أسعار الكورسات، الصور المصغرة، وإضافة روابط الفيديوهات.</span>
          </div>
        </div>
      )}

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {courses.map((course) => {
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

                  {/* Developer Quick Edit Button on Card */}
                  {isDeveloper && (
                    <button
                      onClick={() => {
                        setEditingCourse({ ...course });
                        setIsCreatingNew(false);
                        setActiveTab('details');
                      }}
                      className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black shadow-lg flex items-center gap-1 cursor-pointer z-10"
                      title="تعديل الكورس والباكج والفيديوهات"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                  )}

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
                      onClick={onNavigateToMyCourses}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>مشترك بالفعل</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnrollClick(course)}
                      disabled={purchasingCourseId === course.id}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-50"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>{purchasingCourseId === course.id ? 'جاري الشراء...' : 'اشتراك بالرصيد'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: مشغل فيديو يوتيوب التجريبي (YouTube Embedded Modal) */}
      {activePreviewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 sm:p-6 text-right space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] text-rose-400 font-bold block">
                  درس تجريبي مجاني مفتوح للتضمين
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

      {/* MODAL 2: تنبيه رصيد غير كافٍ */}
      {insufficientFundsCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>الرصيد الحالي لا يكفي للاشتراك</span>
              </h3>
              <button
                onClick={() => setInsufficientFundsCourse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <p>سعر الكورس: <span className="font-mono font-bold text-white">{insufficientFundsCourse.discountedPrice} ج.م</span></p>
              <p>رصيدك الحالي: <span className="font-mono font-bold text-rose-400">{walletBalance} ج.م</span></p>
              <p className="text-slate-400 text-xs leading-relaxed">
                المبلغ المطلوب إيداعه في محفظتك لإتمام الاشتراك هو <span className="font-mono font-bold text-emerald-400">{insufficientFundsCourse.discountedPrice - walletBalance} ج.م</span> فقط.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setInsufficientFundsCourse(null);
                  onNavigateToWallet();
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <Wallet className="w-4 h-4" />
                <span>إيداع رصيد الآن</span>
              </button>

              <button
                onClick={() => setInsufficientFundsCourse(null)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEVELOPER MODAL: تعديل الكورس والباكج وإدارة الفيديوهات */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full p-6 text-right space-y-5 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  {isCreatingNew ? 'إضافة كورس تعليمي جديد' : `تعديل: ${editingCourse.title}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs: تفاصيل الكورس / الفيديوهات والباكج */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2 rounded-lg transition ${activeTab === 'details' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                1. البيانات الأساسية والصورة المصغرة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lessons')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${activeTab === 'lessons' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>2. توسيع الباكج وإدارة روابط الفيديوهات</span>
              </button>
            </div>

            <form onSubmit={handleSaveCourseSubmit} className="space-y-4 overflow-y-auto p-1 flex-1">
              
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Thumbnail Preview & Upload */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-36 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                      <img src={editingCourse.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="block text-xs font-bold text-slate-300">الصورة المصغرة للكورس (Thumbnail):</label>
                      <div className="flex flex-wrap gap-2">
                        <label className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1.5 transition">
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>رفع صورة من الجهاز</span>
                          <input type="file" accept="image/*" onChange={handleThumbnailFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Title & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الكورس:</label>
                      <input
                        type="text"
                        required
                        value={editingCourse.title}
                        onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">المادة الدراسية:</label>
                      <input
                        type="text"
                        required
                        value={editingCourse.subject}
                        onChange={e => setEditingCourse({ ...editingCourse, subject: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Price & Discounted Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">السعر الأصلي (قبل الخصم):</label>
                      <input
                        type="number"
                        required
                        value={editingCourse.originalPrice}
                        onChange={e => setEditingCourse({ ...editingCourse, originalPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">السعر المعتمد للشراء (ج.م):</label>
                      <input
                        type="number"
                        required
                        value={editingCourse.discountedPrice}
                        onChange={e => setEditingCourse({ ...editingCourse, discountedPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Overview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">وصف الكورس ونواتج التعلم:</label>
                    <textarea
                      rows={3}
                      required
                      value={editingCourse.overview}
                      onChange={e => setEditingCourse({ ...editingCourse, overview: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: توسيع الباكج وإدارة روابط الفيديوهات */}
              {activeTab === 'lessons' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">
                      قائمة الوحدات والمحاضرات داخل هذا الكورس:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddLessonToModule(0)}
                      className="py-1.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة محاضرة / فيديو للباكج</span>
                    </button>
                  </div>

                  {editingCourse.modules?.map((module, modIdx) => (
                    <div key={module.id || modIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          <span>{module.title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{module.lessons?.length || 0} فيديوهات</span>
                      </div>

                      <div className="space-y-3">
                        {module.lessons?.map((lesson, lesIdx) => {
                          const vidResource = lesson.resources?.find(r => r.type === 'video');
                          const currentVidUrl = vidResource?.url || DEFAULT_DEMO_VIDEO;

                          return (
                            <div key={lesson.id || lesIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] text-slate-400 mb-0.5">عنوان المحاضرة:</label>
                                  <input
                                    type="text"
                                    value={lesson.title}
                                    onChange={e => handleUpdateLessonVideoUrl(modIdx, lesIdx, currentVidUrl, e.target.value, lesson.duration)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 mb-0.5">المدة:</label>
                                  <input
                                    type="text"
                                    value={lesson.duration}
                                    onChange={e => handleUpdateLessonVideoUrl(modIdx, lesIdx, currentVidUrl, lesson.title, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] text-amber-400 font-bold mb-0.5 flex items-center gap-1">
                                  <Video className="w-3 h-3" />
                                  <span>رابط تضمين الفيديو (Embed URL):</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="https://www.youtube.com/embed/..."
                                  value={currentVidUrl}
                                  onChange={e => handleUpdateLessonVideoUrl(modIdx, lesIdx, e.target.value, lesson.title, lesson.duration)}
                                  className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={isSavingCourse}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
              >
                {isSavingCourse ? (
                  <span>جاري حفظ ونشر الكورس...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ ونشر الكورس</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

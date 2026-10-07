import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  Maximize2, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  Download, 
  CheckCircle, 
  Sparkles, 
  Lock,
  Layers,
  Settings,
  AlertTriangle,
  Clock,
  Radio
} from 'lucide-react';
import { Lesson } from '../types';
import { startOnlineLectureSession, endOnlineLectureSession } from '../firebase';

interface LessonPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  courseTitle: string;
  studentName?: string;
  studentPhone?: string;
  studentId?: string;
  onOpenQuiz: (quizId?: string) => void;
}

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({
  isOpen,
  onClose,
  lesson,
  courseTitle,
  studentName = 'طالب تجريبي (عمر شريف)',
  studentPhone = '01012345678',
  studentId,
  onOpenQuiz
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'pdf' | 'exercises'>('video');
  const [watermarkPos, setWatermarkPos] = useState({ top: '35%', left: '40%' });
  const [showWatermarkInfo, setShowWatermarkInfo] = useState(false);
  const [watchSeconds, setWatchSeconds] = useState(0);

  const sessionIdRef = useRef<string | null>(null);
  const watchSecondsRef = useRef(0);

  // Dynamic moving forensic watermark simulation: changes position every 10 seconds
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 60 + 15) + '%';
      const randomLeft = Math.floor(Math.random() * 60 + 15) + '%';
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Online Lecture Attendance & Watch Duration Tracking
  useEffect(() => {
    if (!isOpen || !lesson) return;

    watchSecondsRef.current = 0;
    setWatchSeconds(0);

    // 1. Record Stream Start Time in Firestore
    const sid = studentId || ('std_' + (studentPhone || 'unknown'));
    startOnlineLectureSession({
      student_id: sid,
      student_name: studentName,
      lesson_id: lesson.id,
      lesson_title: lesson.title,
      course_title: courseTitle
    }).then(sessionId => {
      sessionIdRef.current = sessionId;
    });

    // 2. Count watch seconds every second
    const timer = setInterval(() => {
      watchSecondsRef.current += 1;
      setWatchSeconds(watchSecondsRef.current);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (sessionIdRef.current) {
        endOnlineLectureSession(sessionIdRef.current, watchSecondsRef.current);
      }
    };
  }, [isOpen, lesson?.id, studentId, studentName, courseTitle]);

  const handleClose = () => {
    if (sessionIdRef.current) {
      endOnlineLectureSession(sessionIdRef.current, watchSecondsRef.current);
    }
    onClose();
  };

  if (!isOpen || !lesson) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden my-auto relative animate-fadeIn text-right flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Live Online Attendance Tracking Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span>تسجيل الحضور الأونلاين: {formatTime(watchSeconds)}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>مشغل محمي بتقنية HLS DRM</span>
            </div>

            <div className="text-right">
              <h3 className="text-sm sm:text-base font-black text-white">{lesson.title}</h3>
              <p className="text-[11px] text-slate-400">{courseTitle}</p>
            </div>
          </div>
        </div>

        {/* Tab switchers: Video Player / PDF Notes / Homework Exercises */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>مشغل الفيديو المشفر</span>
            </button>

            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>المذكرة والملخص (PDF)</span>
            </button>

            <button
              onClick={() => setActiveTab('exercises')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'exercises'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>التمارين والواجب الأسبوعي</span>
            </button>
          </div>

          <button
            onClick={() => setShowWatermarkInfo(!showWatermarkInfo)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام البصمة المائية المتحركة</span>
          </button>
        </div>

        {/* Watermark Explanation Dropdown */}
        {showWatermarkInfo && (
          <div className="bg-emerald-950/40 border-b border-emerald-500/30 p-3 text-xs text-emerald-200 px-6 flex items-center justify-between">
            <span>
              🛡️ تلاحظ النص المتحرك فوق الفيديو؟ هذه بصمة رقمية حية (Dynamic Forensic Watermark) تحمل اسمك وهاتفك والـ IP الخاص بك وتتغير إحداثياتها عشوائياً، لمنع تصوير الشاشة بكاميرا خارجية أو أي وسيلة تسجيل.
            </span>
            <button onClick={() => setShowWatermarkInfo(false)} className="text-emerald-400 font-bold px-2">
              فهمت
            </button>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: VIDEO PLAYER */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              
              {/* Simulated DRM Protected Video Canvas */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[500px] border border-slate-800 shadow-2xl flex items-center justify-center select-none group">
                
                {/* Background Educational Slide Visual */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 flex flex-col justify-between p-8 text-right">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                    <span className="font-mono text-emerald-400">4K • 60 FPS • HLS Encrypted</span>
                    <span className="font-bold text-white">سلسلة المعلم للفيزياء - أ.د. أحمد ممدوح</span>
                  </div>

                  <div className="space-y-4 max-w-xl">
                    <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
                      محاضرة الأسبوع {lesson.weekNumber}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {lesson.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {lesson.explanationMethod.description}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-cyan-300">
                      I = Q / t = n · e / t &nbsp;|&nbsp; R = ρₑ · (L / A)
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>جلسة مشفرة: Token #{Math.random().toString(36).substring(2, 9)}</span>
                    <span>DRM Protected Content</span>
                  </div>
                </div>

                {/* THE MOVING FORENSIC WATERMARK OVERLAY */}
                <div 
                  className="absolute pointer-events-none transition-all duration-1000 ease-in-out z-20"
                  style={{ top: watermarkPos.top, left: watermarkPos.left }}
                >
                  <div className="bg-black/35 backdrop-blur-[1px] border border-white/10 px-3 py-1.5 rounded-lg text-white/50 text-[11px] font-mono select-none tracking-wider shadow-sm transform -rotate-3">
                    <p className="font-bold">{studentName}</p>
                    <p>{studentPhone} • IP: 197.34.120.45</p>
                  </div>
                </div>

                {/* Big Center Play / Pause Indicator */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="relative z-10 w-20 h-20 rounded-full bg-emerald-500/85 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl transition transform hover:scale-110 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-9 h-9 fill-current" />
                  ) : (
                    <Play className="w-9 h-9 fill-current ml-1" />
                  )}
                </button>

                {/* Video Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col gap-2 z-30 opacity-90 group-hover:opacity-100 transition-opacity">
                  {/* Progress scrub */}
                  <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
                    <div className="bg-emerald-400 h-full w-2/5 rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white cursor-pointer">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <Volume2 className="w-4 h-4 hover:text-white cursor-pointer" />
                      <span className="font-mono text-[11px]">42:15 / {lesson.duration}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400">
                        4K 2160p
                      </span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                        1.0x
                      </span>
                      <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Lesson Objectives and Notes Below Player */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>نواتج التعلم التي يتم إتقانها في هذه المحاضرة:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {lesson.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PDF NOTES VIEWER */}
          {activeTab === 'pdf' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-6 text-right">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-black text-white">مذكرة الشرح والتلخيص المركزة (PDF)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {lesson.explanationMethod.pdfPages} صفحة عالية الجودة من إعداد أ.د. أحمد ممدوح
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('تم بدء تحميل مذكرة الشرح بصيغة PDF المشفرة')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل نسخة الطباعة (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Simulated PDF Document Pages Viewer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-inner">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between text-xs text-slate-400">
                  <span>الصفحة 1 من {lesson.explanationMethod.pdfPages}</span>
                  <span className="font-bold text-white">سلسلة المعلم للفيزياء الحديثة</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-black text-emerald-400 border-r-4 border-emerald-400 pr-3">
                    ملخص القوانين والمفاهيم الجوهرية: {lesson.title}
                  </h3>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2">
                    <p className="font-bold text-white">1. شدة التيار الكهربي (Electric Current Intensity):</p>
                    <p>هي كمية الشحنة الكهربية المارة عبر مقطع من موصل في وحدة الزمن (الثانية الواحدة).</p>
                    <p className="font-mono text-cyan-300 bg-slate-900 p-2 rounded text-center">
                      I (Ampere) = Q (Coulomb) / t (Seconds) = (n × e) / t
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2">
                    <p className="font-bold text-white">2. المقاومة النوعية والتوصيلية الكهربية:</p>
                    <p>المقاومة النوعية (ρₑ) خاصية فيزيائية مميزة للمادة تعتمد فقط على نوع المادة ودرجة الحرارة، ولا تتأثر بطول السلك أو مساحة مقطعه.</p>
                    <p className="font-mono text-cyan-300 bg-slate-900 p-2 rounded text-center">
                      ρₑ = (R × A) / L &nbsp;|&nbsp; σ = 1 / ρₑ
                    </p>
                  </div>
                </div>

                <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200">
                  💡 ملحوظة امتحانات هامة: عند سحب السلك فإن حجمه يظل ثابتاً، وبالتالي فإن النسبة بين المقاومتين (R₁/R₂) تساوي مربع النسبة بين الطولين (L₁²/L₂²) أو النسبة بين مربعي المساحتين معكوسة (A₂²/A₁²).
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXERCISES & HOMEWORK */}
          {activeTab === 'exercises' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-6 text-right">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-black text-white">الواجب الإلكتروني والتمارين الأسبوعية</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {lesson.explanationMethod.exercisesCount} سؤالاً مقيساً على نواتج التعلم لن يتم فتح الدرس القادم إلا بعد إتقانه!
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenQuiz(lesson.quizId);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>بدء حل الواجب في نظام الاختبار الذكي</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">الجزء الأول: أسئلة الفهم والتطبيق</span>
                    <span className="text-emerald-400">20 سؤالاً</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    قياس العلاقات الرياضية وتطبيق القوانين المباشرة وحسابات شدة التيار وفروق الجهد.
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">الجزء الثاني: أسئلة التفكير الناقد والتحليل</span>
                    <span className="text-amber-400">25 سؤالاً</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    دوائر كهربية غير تقليدية، تحليل قراءات أجهزة القياس عند غلق وفتح المفاتيح، ومسائل امتحانات سابقة.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            إغلاق المشغل
          </button>

          <div className="flex items-center gap-2">
            {lesson.quizId && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuiz(lesson.quizId);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition cursor-pointer"
              >
                انتقل للاختبار الذكي المباشر لهذا الدرس
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

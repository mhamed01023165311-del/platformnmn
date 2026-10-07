import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Award, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  HelpCircle,
  Layers,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SMART_QUIZ_QUESTIONS } from '../data/mockData';
import { QuizQuestion } from '../types';

interface SmartQuizPageProps {
  onBackToHome: () => void;
  onNavigateToCourses: () => void;
}

export const SmartQuizPage: React.FC<SmartQuizPageProps> = ({
  onBackToHome,
  onNavigateToCourses
}) => {
  const [selectedTopic, setSelectedTopic] = useState<'ohm' | 'kirchhoff' | 'induction'>('ohm');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<{ [questionId: string]: boolean }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  const questions = SMART_QUIZ_QUESTIONS;
  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (quizCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setQuizCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizCompleted]);

  useEffect(() => {
    if (quizCompleted) {
      const correctCount = questions.filter(
        q => selectedAnswers[q.id] === q.correctOptionId
      ).length;
      const scorePct = (correctCount / questions.length) * 100;

      if (scorePct >= 75) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }
  }, [quizCompleted]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted[currentQ.id]) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswers[currentQ.id]) return;
    setIsAnswerSubmitted(prev => ({ ...prev, [currentQ.id]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsAnswerSubmitted({});
    setCurrentIndex(0);
    setQuizCompleted(false);
    setTimeLeft(600);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const chosenOptionId = selectedAnswers[currentQ?.id];
  const isCurrentSubmitted = isAnswerSubmitted[currentQ?.id];
  const isCurrentCorrect = chosenOptionId === currentQ?.correctOptionId;
  const correctCount = questions.filter(q => selectedAnswers[q.id] === q.correctOptionId).length;
  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 text-right animate-fadeIn">
      
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام الاختبارات الذكية والتغذية الراجعة الفورية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            اختبار المفاهيم والذكاء الفيزيائي (MCQ)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            كل سؤال مزود بشرح علمي وبرهان رياضي يوضح لماذا اختيارك صواب أو خطأ مع تحديد مصائد الامتحانات الشائعة.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2 text-amber-400 font-mono text-sm font-bold shadow-inner">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleResetQuiz}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="إعادة بدء الاختبار"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: In-Progress Quiz vs Final Results */}
      {!quizCompleted ? (
        <div className="space-y-6">
          
          {/* Progress Bar & Indicators */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">السؤال {currentIndex + 1} من {questions.length}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">{Object.keys(isAnswerSubmitted).length} مكتمل</span>
            </div>

            <div className="flex-1 max-w-md bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-l from-emerald-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between text-xs">
              <span className="bg-slate-800 text-indigo-300 font-bold px-3 py-1 rounded-xl">
                {currentQ.lessonReference}
              </span>

              <span className={`px-3 py-1 rounded-xl font-bold text-xs ${
                currentQ.difficulty === 'easy'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                  : currentQ.difficulty === 'medium'
                  ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/50'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
              }`}>
                مستوى السؤال: {currentQ.difficulty === 'easy' ? 'تأسيسي مباشر' : currentQ.difficulty === 'medium' ? 'متوسط ومفاهيمي' : 'فكر عالي وتطبيقي'}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-black text-white leading-relaxed">
              {currentQ.questionText}
            </h3>

            {currentQ.conceptFormula && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-300 text-center direction-ltr">
                القانون الفيزيائي المرتبط: {currentQ.conceptFormula}
              </div>
            )}

            {/* MCQ Options Grid */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-400">حدد إجابتك من الخيارات التالية:</p>

              {currentQ.options.map((option) => {
                const isSelected = chosenOptionId === option.id;
                const isCorrect = option.id === currentQ.correctOptionId;

                let borderClass = 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700';
                let indicatorColor = 'border-slate-600';

                if (isSelected && !isCurrentSubmitted) {
                  borderClass = 'border-indigo-500 bg-indigo-950/50 text-white shadow-md';
                  indicatorColor = 'border-indigo-400 bg-indigo-500';
                }

                if (isCurrentSubmitted) {
                  if (isCorrect) {
                    borderClass = 'border-emerald-500 bg-emerald-950/50 text-emerald-200';
                    indicatorColor = 'border-emerald-500 bg-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    borderClass = 'border-rose-500 bg-rose-950/50 text-rose-200';
                    indicatorColor = 'border-rose-500 bg-rose-500';
                  } else {
                    borderClass = 'border-slate-800/40 opacity-50';
                  }
                }

                return (
                  <button
                    key={option.id}
                    disabled={isCurrentSubmitted}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-4 rounded-2xl border text-right transition flex items-center justify-between cursor-pointer ${borderClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${indicatorColor}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-semibold">{option.text}</span>
                    </div>

                    {isCurrentSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isCurrentSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Box */}
            {isCurrentSubmitted && chosenOptionId && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  {isCurrentCorrect ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>إجابة صحيحة ومتقنة!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                      <AlertCircle className="w-5 h-5" />
                      <span>إجابة خاطئة! اقرأ التغذية الراجعة بعناية.</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p className="font-bold text-amber-400 text-xs mb-1">
                    تغذية راجعة خاصة بخيارك ({chosenOptionId.replace('opt_', '').toUpperCase()}):
                  </p>
                  <p>{currentQ.feedbacks[chosenOptionId]}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p className="font-bold text-indigo-300 text-xs mb-1">
                    الشرح والبرهان الرياضي النموذجي:
                  </p>
                  <p>{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السؤال السابق</span>
              </button>

              <div className="flex items-center gap-2">
                {!isCurrentSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!chosenOptionId}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs disabled:opacity-40 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    تأكيد الإجابة وعرض التغذية الراجعة
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentIndex === questions.length - 1 ? 'عرض النتيجة النهائية' : 'السؤال التالي'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Final Results Screen */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              تقرير التقييم النهائي للاختبار
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {scorePercentage >= 90 ? 'أداء ممتاز بمستوى الأوائل! 🌟' : scorePercentage >= 70 ? 'مستوى رائع جداً! 👏' : 'بداية جيدة تحتاج لتركيز على المفاهيم 💡'}
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              أجبت على <strong className="text-white">{correctCount}</strong> من أصل <strong className="text-white">{questions.length}</strong> أسئلة بشكل صحيح بنسبة إتقان <strong className="text-emerald-400">{scorePercentage}%</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
            <div>
              <p className="text-slate-400 text-xs">نسبة الإتقان</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{scorePercentage}%</p>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-slate-800 py-2 sm:py-0">
              <p className="text-slate-400 text-xs">الوقت المستغرق</p>
              <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">{formatTime(600 - timeLeft)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">التقييم</p>
              <p className="text-sm font-bold text-white mt-2">
                {scorePercentage >= 85 ? 'مؤهل للدرجة النهائية' : 'يحتاج مراجعة طفيفة'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleResetQuiz}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span>إعادة الاختبار من البداية</span>
            </button>

            <button
              onClick={() => {
                setQuizCompleted(false);
                setCurrentIndex(0);
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>مراجعة الأسئلة مع التفسيرات</span>
            </button>

            <button
              onClick={onNavigateToCourses}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              الانتقال لصفحة الكورسات
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

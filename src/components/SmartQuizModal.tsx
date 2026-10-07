import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Award,
  BookOpen,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SMART_QUIZ_QUESTIONS } from '../data/mockData';
import { QuizQuestion } from '../types';

interface SmartQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizTitle?: string;
}

export const SmartQuizModal: React.FC<SmartQuizModalProps> = ({
  isOpen,
  onClose,
  quizTitle = 'اختبار المفاهيم الذكي: قانون أوم وتطبيقات المقاومات'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<{ [questionId: string]: boolean }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const questions = SMART_QUIZ_QUESTIONS;
  const currentQ = questions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (!isOpen || quizCompleted) return;

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
  }, [isOpen, quizCompleted]);

  // Trigger celebratory confetti on good score
  useEffect(() => {
    if (quizCompleted) {
      const correctCount = questions.filter(
        q => selectedAnswers[q.id] === q.correctOptionId
      ).length;
      const scorePct = (correctCount / questions.length) * 100;

      if (scorePct >= 75) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if canvas unavailable
        }
      }
    }
  }, [quizCompleted]);

  if (!isOpen) return null;

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted[currentQ.id]) return; // lock once submitted
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswers[currentQ.id]) return;
    setIsAnswerSubmitted(prev => ({
      ...prev,
      [currentQ.id]: true
    }));
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

  // Score calculations
  const answeredCount = Object.keys(isAnswerSubmitted).length;
  const correctCount = questions.filter(
    q => selectedAnswers[q.id] === q.correctOptionId
  ).length;
  const rawScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const scorePercentage = Number.isFinite(rawScore) ? rawScore : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const chosenOptionId = selectedAnswers[currentQ?.id];
  const isCurrentSubmitted = isAnswerSubmitted[currentQ?.id];
  const isCurrentCorrect = chosenOptionId === currentQ?.correctOptionId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto relative animate-fadeIn text-right">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-amber-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="text-right">
              <h3 className="text-sm sm:text-base font-black text-white line-clamp-1">{quizTitle}</h3>
              <p className="text-[11px] text-emerald-400">نظام التقييم الذكي مع التغذية الراجعة الفورية</p>
            </div>
          </div>
        </div>

        {/* Quiz Body */}
        {!quizCompleted ? (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Progress Bar & Indicators */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                <span>السؤال {currentIndex + 1} من {questions.length}</span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">{answeredCount}</span>
                  <span>تمت الإجابة عليها</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-l from-emerald-400 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Details Card */}
            <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 font-bold">
                  {currentQ.lessonReference}
                </span>

                <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                  currentQ.difficulty === 'easy' 
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' 
                    : currentQ.difficulty === 'medium' 
                    ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/50' 
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                }`}>
                  مستوى الصعوبة: {currentQ.difficulty === 'easy' ? 'مباشر وتأسيسي' : currentQ.difficulty === 'medium' ? 'متوسط ومفاهيمي' : 'فكر عالي وتطبيقي'}
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed pt-2">
                {currentQ.questionText}
              </h4>

              {currentQ.conceptFormula && (
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 direction-ltr text-center">
                  القانون المرتبط: {currentQ.conceptFormula}
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400">اختر الإجابة المناسبة مما يلي:</p>
              
              {currentQ.options.map((option) => {
                const isSelected = chosenOptionId === option.id;
                const isCorrect = option.id === currentQ.correctOptionId;

                // Color styles depending on whether answer has been submitted
                let borderClass = 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700';
                let indicatorColor = 'border-slate-600';

                if (isSelected && !isCurrentSubmitted) {
                  borderClass = 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm';
                  indicatorColor = 'border-indigo-400 bg-indigo-500';
                }

                if (isCurrentSubmitted) {
                  if (isCorrect) {
                    borderClass = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200';
                    indicatorColor = 'border-emerald-500 bg-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    borderClass = 'border-rose-500/80 bg-rose-950/40 text-rose-200';
                    indicatorColor = 'border-rose-500 bg-rose-500';
                  } else {
                    borderClass = 'border-slate-800/50 opacity-60';
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

            {/* Instant Detailed Feedback & Explanation Box */}
            {isCurrentSubmitted && chosenOptionId && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  {isCurrentCorrect ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>إجابة صحيحة! أحسنت التفوق.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                      <AlertCircle className="w-5 h-5" />
                      <span>إجابة غير دقيقة! اقرأ التغذية الراجعة لفهم السبب.</span>
                    </div>
                  )}
                </div>

                {/* Specific Feedback on the chosen option */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p className="font-bold text-amber-400 text-xs mb-1">
                    التغذية الراجعة لخيارك ({chosenOptionId.replace('opt_', '').toUpperCase()}):
                  </p>
                  <p>{currentQ.feedbacks[chosenOptionId]}</p>
                </div>

                {/* Step-by-step scientific explanation */}
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <p className="font-bold text-indigo-300 text-xs mb-1">
                    الشرح والبرهان العلمي النموذجي:
                  </p>
                  <p>{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Bottom Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
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
                    <span>{currentIndex === questions.length - 1 ? 'إنهاء التقييم وعرض النتيجة' : 'السؤال التالي'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Final Results and Evaluation Breakdown Screen */
          <div className="p-6 sm:p-10 space-y-8 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-indigo-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                تقرير الأداء الذكي للاختبار
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {scorePercentage >= 90 ? 'أداء عبقري أسطوري! 🌟' : scorePercentage >= 70 ? 'مستوى ممتاز جداً! 👏' : 'بداية جيدة تحتاج لتركيز على المفاهيم 💡'}
              </h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                لقد أجبت على <strong className="text-white">{correctCount}</strong> من أصل <strong className="text-white">{questions.length}</strong> أسئلة بشكل صحيح.
              </p>
            </div>

            {/* Score Ring Display */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 max-w-md mx-auto grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-xs">نسبة الإتقان</p>
                <p className={`text-2xl font-black mt-1 ${scorePercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scorePercentage}%
                </p>
              </div>
              <div className="border-x border-slate-800">
                <p className="text-slate-400 text-xs">الوقت المستغرق</p>
                <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">
                  {formatTime(600 - timeLeft)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">التقييم العام</p>
                <p className="text-sm font-bold text-white mt-2">
                  {scorePercentage >= 85 ? 'مستوى أول جمهورية' : scorePercentage >= 65 ? 'فوق المتوسط' : 'مراجعة موصى بها'}
                </p>
              </div>
            </div>

            {/* Detailed Mastery Recommendations */}
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 text-right space-y-3 max-w-lg mx-auto">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>توصيات الذكاء الاصطناعي الأكاديمية لتحسين أدائك:</span>
              </h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>راجع قاعدة ثبوت حجم الموصل عند السحب أو التشكيل (R تتناسب مع مربع الطول).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>تأكد من تمييز الفرق بين تأثير المقاومة على التيار وثبوت المقاومة بتغير الجهد.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={handleResetQuiz}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>إعادة خوض الاختبار</span>
              </button>

              <button
                onClick={() => {
                  setQuizCompleted(false);
                  setCurrentIndex(0);
                }}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>مراجعة الأسئلة وتفسيراتها</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                العودة للمنصة
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

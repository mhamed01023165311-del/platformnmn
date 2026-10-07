import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Smartphone,
  Check,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, UserProfile } from '../types';

interface CourseCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  userProfile: UserProfile;
  onConfirmPurchase: (course: Course) => void;
  onGoToRecharge: (amountNeeded: number) => void;
  onViewCourseLessons: (course: Course) => void;
}

export const CourseCheckoutModal: React.FC<CourseCheckoutModalProps> = ({
  isOpen,
  onClose,
  course,
  userProfile,
  onConfirmPurchase,
  onGoToRecharge,
  onViewCourseLessons
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!isOpen || !course) return null;

  const isAlreadyEnrolled = userProfile.enrolledCourseIds.includes(course.id);
  const coursePrice = course.discountedPrice;
  const currentBalance = userProfile.walletBalance;
  const isSufficient = currentBalance >= coursePrice;
  const shortageAmount = Math.max(0, coursePrice - currentBalance);
  const remainingAfter = currentBalance - coursePrice;

  const handleExecutePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseSuccess(true);
      onConfirmPurchase(course);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }, 800);
  };

  const handleClose = () => {
    setPurchaseSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto relative animate-fadeIn text-right">
        
        {/* Top Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-right">
            <h3 className="text-base font-black text-white">
              {purchaseSuccess ? 'تم الاشتراك بنجاح!' : 'تأكيد شراء الكورس واقتطاع الرصيد'}
            </h3>
            <p className="text-xs text-emerald-400">نظام الدفع الفوري بالمحفظة الرقمية</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* SUCCESS SCREEN */}
          {purchaseSuccess ? (
            <div className="text-center space-y-6 animate-fadeIn py-4">
              <div className="w-18 h-18 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  عملية ناجحة ومؤكدة ⚡
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  مبروك! تم تفعيل اشتراكك في الكورس
                </h4>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                  تم خصم مبلغ <strong className="text-white font-bold">{coursePrice} ج.م</strong> من محفظتك الرقمية، ورصيدك المتبقي الحالي هو <strong className="text-emerald-400 font-bold">{remainingAfter} ج.م</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-2">
                <p className="text-xs font-bold text-slate-300">الكورس المشترك به:</p>
                <p className="text-sm font-black text-white">{course.title}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>المحاضر: {course.instructor}</span>
                  <span className="text-emerald-400 font-bold">وصول كامل لجميع المحاضرات 4K</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    onViewCourseLessons(course);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ابدأ مشاهدة محاضرات الكورس الآن</span>
                </button>
              </div>
            </div>
          ) : isAlreadyEnrolled ? (
            /* ALREADY ENROLLED SCREEN */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">أنت مشترك بالفعل في هذا الكورس!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  لديك صلاحية دخول كاملة لمشاهدة جميع المحاضرات ومذكرات الـ PDF والواجبات.
                </p>
              </div>
              <button
                onClick={() => {
                  handleClose();
                  onViewCourseLessons(course);
                }}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>الانتقال لمشغل الدروس</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* CHECKOUT BREAKDOWN */
            <div className="space-y-6">
              
              {/* Course Snapshot */}
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-20 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 text-right">
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">
                    {course.gradeTitle}
                  </span>
                  <h4 className="text-sm font-black text-white mt-1 line-clamp-1">{course.title}</h4>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-400">{course.totalWeeks} أسبوعاً • {course.totalLessons} حصة</span>
                    <span className="font-black text-emerald-400 text-sm">{coursePrice} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Student Wallet Status Box */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>رصيد محفظتك الرقمية المتاح:</span>
                  </span>
                  <span className="text-base font-black text-white font-mono">{currentBalance} ج.م</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>تكلفة الكورس المطلوب:</span>
                  <span className="font-bold text-slate-200">{coursePrice} ج.م</span>
                </div>

                {isSufficient ? (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-2 border-t border-slate-800/80">
                    <span>المتبقي في محفظتك بعد الخصم:</span>
                    <span className="font-mono">{remainingAfter} ج.م</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400 pt-2 border-t border-slate-800/80">
                    <span>المبلغ الناقص لإتمام الشراء:</span>
                    <span className="font-mono">-{shortageAmount} ج.م</span>
                  </div>
                )}
              </div>

              {/* STATUS LOGIC BRANCHES */}
              {isSufficient ? (
                /* 1. SUFFICIENT FUNDS: CONFIRM PURCHASE */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>رصيد محفظتك كافٍ تماماً. سيتم تفعيل الكورس فوراً دون أي رسوم إضافية.</span>
                  </div>

                  <button
                    onClick={handleExecutePurchase}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري خصم المبلغ وتفعيل الكورس...</span>
                      </span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>تأكيد الشراء والخصم من المحفظة ({coursePrice} ج.م)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* 2. INSUFFICIENT FUNDS: DIRECT TO VODAFONE CASH RECHARGE */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>رصيد المحفظة الحالي ({currentBalance} ج.م) غير كافٍ!</span>
                    </div>
                    <p className="leading-relaxed">
                      تحتاج لشحن محفظتك بمبلغ لا يقل عن <strong className="text-white font-bold">{shortageAmount} ج.م</strong> عبر فودافون كاش لتتمكن من شراء هذا الكورس.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleClose();
                      onGoToRecharge(shortageAmount);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>شحن المحفظة عبر فودافون كاش الآن ({shortageAmount} ج.م)</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>دفع آمن 100% ومحمي</span>
                </span>
                <span>فواتير وسجلات إلكترونية موثقة</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

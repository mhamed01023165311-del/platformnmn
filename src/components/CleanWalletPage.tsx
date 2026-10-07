import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  Phone, 
  RefreshCw, 
  Clock, 
  History, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at?: string;
  status?: string;
}

interface CleanWalletPageProps {
  balance: number;
  studentName: string;
  studentPhone: string;
  transactions: Transaction[];
  onDepositSubmit: (phone: string, amount: string) => Promise<{ success: boolean; message: string; matched?: boolean }>;
  onWithdrawSubmit: (amount: string, phone: string) => Promise<{ success: boolean; message: string }>;
  onRefresh: () => void;
}

export const CleanWalletPage: React.FC<CleanWalletPageProps> = ({
  balance,
  studentName,
  studentPhone,
  transactions,
  onDepositSubmit,
  onWithdrawSubmit,
  onRefresh
}) => {
  // Modal states
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Deposit Form
  const [depositPhone, setDepositPhone] = useState(studentPhone || '01507404506');
  const [depositAmount, setDepositAmount] = useState('10');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [copiedWalletNumber, setCopiedWalletNumber] = useState(false);

  // Withdraw Form
  const [withdrawAmount, setWithdrawAmount] = useState('10');
  const [withdrawPhone, setWithdrawPhone] = useState(studentPhone || '01507404506');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Feedback Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5500);
  };

  const handleCopyWalletNumber = () => {
    navigator.clipboard.writeText('01019920811');
    setCopiedWalletNumber(true);
    setTimeout(() => setCopiedWalletNumber(false), 2500);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositPhone.trim()) {
      showToast('error', 'يرجى إدخال رقم الموبايل الذي قمت بالتحويل منه');
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      const res = await onDepositSubmit(depositPhone.trim(), depositAmount);
      if (res.success) {
        setIsDepositOpen(false);
        showToast(res.matched ? 'success' : 'info', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', 'خطأ في معالجة طلب الإيداع: ' + err.message);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('error', 'يرجى إدخال مبلغ سحب صالح');
      return;
    }
    if (amt > balance) {
      showToast('error', `رصيدك الحالي (${balance} جنيه) لا يكفي لسحب ${amt} جنيه`);
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await onWithdrawSubmit(withdrawAmount, withdrawPhone.trim());
      if (res.success) {
        setIsWithdrawOpen(false);
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', 'فشلت عملية السحب: ' + err.message);
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn" dir="rtl">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border backdrop-blur-md animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-900/30' 
            : toast.type === 'error'
            ? 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-900/30'
            : 'bg-indigo-950/95 border-indigo-500/50 text-indigo-200 shadow-indigo-900/30'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Clock className="w-5 h-5 text-indigo-400 shrink-0" />}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white shrink-0 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. البطاقة الرئيسية: رصيد الطالب الحالي */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Card Top Details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">محفظة الطالب الرقمية</span>
                <h1 className="text-base sm:text-lg font-bold text-white">{studentName}</h1>
              </div>
            </div>

            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
              title="تحديث الرصيد"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Balance Amount Presentation */}
          <div className="text-center sm:text-right py-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-400 block mb-1">
              رصيد الطالب الحالي:
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-mono">
                {balance.toLocaleString('ar-EG')}
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400">
                جنيه مصري
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              <span>رصيد مفعّل ومباشر لشراء الكورسات والمحاضرات والمراجعات</span>
            </p>
          </div>

          {/* Action Buttons: [ إيداع ] و [ سحب ] */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="py-3.5 sm:py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition cursor-pointer border border-emerald-400/30"
            >
              <ArrowDownLeft className="w-5 h-5 text-white" />
              <span>إيداع رصيد</span>
            </button>

            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="py-3.5 sm:py-4 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-slate-200 hover:text-white font-bold text-sm sm:text-base border border-slate-700 shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-400" />
              <span>طلب سحب</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. قسم: سجل المعاملات والتحويلات */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">سجل المعاملات والتحويلات</h2>
          </div>
          <span className="text-xs text-slate-400">
            {transactions.length} عمليات مسجلة
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 text-center text-slate-400 text-xs sm:text-sm space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">لا توجد حركات مسجلة بالمحفظة حتى الآن</p>
            <p className="text-slate-500 text-[11px]">عند قيامك بإيداع رصيد أو شراء كورسات ستظهر تفاصيل العملية هنا فوراً.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden shadow-xl">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="p-4 sm:p-4.5 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPositive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-xs sm:text-sm text-slate-100 block">
                        {tx.description}
                      </span>
                      {tx.created_at && (
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5 block">
                          {new Date(tx.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <span className={`text-sm sm:text-base font-extrabold block ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositive ? `+${tx.amount}` : tx.amount} ج.م
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: نافذة الإيداع البسيطة */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 text-right space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <span>إيداع رصيد في المحفظة</span>
              </h3>
              <button
                onClick={() => setIsDepositOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              
              {/* بطاقة تثبيت رقم المحفظة الثابتة في الأعلى */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      يرجى التحويل إلى رقم فودافون كاش التالي:
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tracking-wider block" dir="ltr">
                      01019920811
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyWalletNumber}
                  className="py-1.5 px-3 rounded-xl bg-slate-805 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedWalletNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>

              {/* Field 1: رقم الموبايل المحول منه */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رقم الموبايل الذي قمت بالتحويل منه:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={depositPhone}
                    onChange={e => setDepositPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: المبلغ المحول */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  المبلغ المحول:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="200"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-500 absolute left-3 top-3 font-sans">جنيه</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingDeposit}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingDeposit ? (
                  <span>جاري تأكيد التحويل واعتماد الرصيد...</span>
                ) : (
                  <span>إرسال الطلب</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: نافذة السحب */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 text-right space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                <span>سحب رصيد من المحفظة</span>
              </h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  المبلغ المراد سحبه:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-xs text-slate-500 absolute left-3 top-3 font-sans">جنيه</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  رصيدك المتاح للسحب: {balance} جنيه
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رقم محفظة فودافون كاش المراد التحويل إليها:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={withdrawPhone}
                    onChange={e => setWithdrawPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingWithdraw ? (
                  <span>جاري تنفيذ السحب...</span>
                ) : (
                  <span>تأكيد السحب</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Wallet, 
  Smartphone, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  History, 
  ShieldCheck, 
  UploadCloud, 
  Image as ImageIcon, 
  Zap, 
  FileSearch, 
  RefreshCw, 
  MessageSquare,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, WalletTransaction, VodafoneCashDepositRequest, VodafoneSMSMessage, OCRScanResult } from '../types';
import { TEACHER_VODAFONE_CASH_CONFIG, SAMPLE_TEACHER_SMS_INBOX, SAMPLE_RECEIPT_PRESETS } from '../data/mockData';
import { runAIPaymentVerification } from '../services/aiPaymentVerificationEngine';
import { BackendTestingConsole } from './BackendTestingConsole';

interface StudentWalletPageProps {
  userProfile: UserProfile;
  transactions: WalletTransaction[];
  depositRequests: VodafoneCashDepositRequest[];
  initialAmountToRecharge?: number;
  onSubmitDepositRequest: (request: Omit<VodafoneCashDepositRequest, 'id' | 'createdAt' | 'status'>, ocrResult?: OCRScanResult) => void;
  onApproveDepositSimulated: (requestId: string) => void;
  onNavigateToCourses: () => void;
}

export const StudentWalletPage: React.FC<StudentWalletPageProps> = ({
  userProfile,
  transactions,
  depositRequests,
  initialAmountToRecharge = 250,
  onSubmitDepositRequest,
  onApproveDepositSimulated,
  onNavigateToCourses
}) => {
  const [copied, setCopied] = useState(false);
  const [senderPhone, setSenderPhone] = useState(userProfile.phone || '01012345678');
  const [amount, setAmount] = useState<number>(initialAmountToRecharge || 550);
  const [transactionId, setTransactionId] = useState('VF-994321');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(SAMPLE_RECEIPT_PRESETS[0].image);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-match');
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [scanStage, setScanStage] = useState<'idle' | 'ocr' | 'sms' | 'done'>('idle');
  const [latestScanResult, setLatestScanResult] = useState<OCRScanResult | null>(null);
  const [showSMSInboxModal, setShowSMSInboxModal] = useState(false);
  const [showBackendConsole, setShowBackendConsole] = useState(false);

  const teacherConfig = TEACHER_VODAFONE_CASH_CONFIG;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(teacherConfig.walletNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle preset selection
  const handleSelectPreset = (preset: typeof SAMPLE_RECEIPT_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setUploadedImagePreview(preset.image);
    setSenderPhone(preset.phone);
    setAmount(preset.amount);
    setTransactionId(preset.txId);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImagePreview(url);
      setSelectedPresetId('custom_upload');
    }
  };

  // Run AI Verification & Submit
  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone || !amount || !transactionId) return;

    setIsScanningAI(true);
    setScanStage('ocr');

    // Stage 1: OCR scan
    await new Promise(r => setTimeout(r, 600));
    setScanStage('sms');

    // Stage 2: SMS Gateway query
    const result = await runAIPaymentVerification({
      claimedPhone: senderPhone,
      claimedAmount: Number(amount),
      claimedTxId: transactionId,
      imageFileOrUrl: uploadedImagePreview || undefined,
      receiptPresetId: selectedPresetId,
      smsInbox: SAMPLE_TEACHER_SMS_INBOX
    });

    setScanStage('done');
    setLatestScanResult(result);
    setIsScanningAI(false);

    // Call submit handler with OCR data
    onSubmitDepositRequest({
      studentId: userProfile.id,
      studentName: userProfile.name,
      studentEmail: userProfile.email,
      senderPhone,
      amount: Number(amount),
      transactionId: transactionId.trim().toUpperCase(),
      receiptImage: uploadedImagePreview || undefined,
      receiptImagePreview: uploadedImagePreview || undefined,
      teacherWalletPhone: teacherConfig.walletNumber,
      aiVerified: result.decision === 'auto_approved',
      aiMatchScore: result.overallScore,
      ocrScan: result,
      verificationMode: result.decision === 'auto_approved' ? 'ai_auto' : 'manual_review',
      notes: result.decisionReason
    }, result);

    if (result.decision === 'auto_approved') {
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
  };

  const studentDeposits = depositRequests.filter(d => d.studentId === userProfile.id);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10 text-right animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>نظام الشحن الذكي بالـ AI OCR والـ SMS Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            شحن المحفظة بالذكاء الاصطناعي (فودافون كاش)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            ارفع صورة إيصال التحويل، وسيقوم محرك الذكاء الاصطناعي بمطابقة بيانات الصورة مع رسائل الـ SMS الواردة لهاتف المعلم واعتماد الرصيد فوراً في ثوانٍ معدودة!
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setShowBackendConsole(!showBackendConsole)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border shadow-sm ${
              showBackendConsole
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg'
                : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300'
            }`}
            title="فحص واختبار سيرفر Backend الـ Webhook و الـ SMS"
          >
            <Terminal className="w-4 h-4 text-cyan-300" />
            <span>{showBackendConsole ? 'إخفاء وحدة السيرفر' : 'سيرفر الـ Webhook ⚡'}</span>
          </button>

          <button
            onClick={() => setShowSMSInboxModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            title="معاينة رسائل SMS هاتف المعلم"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>صندوق رسائل SMS المعلم 📱</span>
          </button>

          <button
            onClick={onNavigateToCourses}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Wallet className="w-4 h-4" />
            <span>شراء الكورسات بالرصيد</span>
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE BACKEND TESTING CONSOLE */}
      {showBackendConsole && (
        <div className="animate-fadeIn">
          <BackendTestingConsole 
            userProfile={userProfile}
            onRefreshWallet={() => {}}
          />
        </div>
      )}

      {/* Top Grid: Balance Card + Teacher Vodafone Cash Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Digital Wallet Card (Col 7) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col justify-between h-full space-y-6">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">محفظة الطالب الرقمية</h3>
                  <span className="text-[10px] text-emerald-400 font-mono">AI-POWERED WALLET</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>شحن تلقائي ذكي مفعّل</span>
              </span>
            </div>

            <div className="py-4 relative z-10">
              <span className="text-xs text-slate-400 font-bold block mb-1">الرصيد المتاح حالياً بالجنيه المصري</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  {(Number.isFinite(userProfile.walletBalance) ? userProfile.walletBalance : 0).toLocaleString('ar-EG')}
                </span>
                <span className="text-lg font-black text-emerald-400">ج.م</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                مربوط بحساب: <strong className="text-slate-200 font-mono">{userProfile.email}</strong>
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300 relative z-10">
              <div>
                <p className="font-bold text-white text-sm">{userProfile.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">هاتف الطالب: {userProfile.phone}</p>
              </div>

              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                <Zap className="w-3.5 h-3.5" />
                <span>اعتماد لحظي بأقل من ثانية</span>
              </div>
            </div>

          </div>
        </div>

        {/* Teacher Vodafone Cash Account (Col 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 flex-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>رقم فودافون كاش المعتمد للتحويل</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>رقم محفظة المعلم:</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">
                  الحساب الرسمي
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider dir-ltr">
                  {teacherConfig.walletNumber}
                </span>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                الاسم المعتمد: <strong className="text-slate-200">{teacherConfig.accountHolder}</strong>
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 text-[11px] block mb-1">كود التحويل السريع من خط فودافون:</span>
              <code className="bg-slate-900 px-2 py-1 rounded text-cyan-300 font-mono text-xs block text-center dir-ltr">
                *9*7*{teacherConfig.walletNumber.replace(/\s+/g, '')}*المبلغ#
              </code>
            </div>

            <div className="text-[11px] text-slate-400">
              💡 بمجرد إتمام التحويل، التقط لقطة شاشة للإيصال وارفعها بالنموذج أدناه لتفعيل الرصيد تلقائياً.
            </div>
          </div>
        </div>

      </div>

      {/* AI DEMO PRESETS BAR (Quick Test Scenarios) */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>نماذج إيصالات جاهزة للاختبار الفوري (AI Verification Demo Presets):</span>
          </div>
          <span className="text-[10px] text-slate-400">اضغط لتجربة سلوك الذكاء الاصطناعي</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_RECEIPT_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-gradient-to-l from-indigo-950 via-slate-800 to-slate-900 border-emerald-400 shadow-md text-white'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs line-clamp-1">{preset.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      preset.id === 'preset-match' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' 
                        : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                    }`}>
                      {preset.id === 'preset-match' ? 'تطابق تام 100%' : 'حالة تدقيق'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                  <span className="font-mono text-cyan-300 font-bold">{preset.amount} ج.م</span>
                  <span>كود: {preset.txId}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN AI OCR RECHARGE FORM */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>المحرك الذكي للمسح والمطابقة (AI Vision OCR & SMS Gateway)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            رفع إيصال التحويل والشحن التلقائي الفوري
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ارفع صورة الإيصال ليقوم الذكاء الاصطناعي باستخراج رقم العملية والمبلغ، ومطابقتها مع رسائل هاتف المعلم الرسمية.
          </p>
        </div>

        <form onSubmit={handleVerifyAndSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Col (Image Upload & Preview Canvas - Col 5) */}
            <div className="lg:col-span-5 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                صورة سكرين شوت إيصال التحويل <span className="text-rose-400">*</span>
              </label>

              {/* Image Preview Box with Scanner Effect */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-700 p-3 flex flex-col items-center justify-center min-h-[260px] group">
                {uploadedImagePreview ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={uploadedImagePreview}
                      alt="إيصال فودافون كاش"
                      className="max-h-60 w-auto rounded-xl object-contain shadow-md"
                    />

                    {/* Laser scanning line animation when scanning */}
                    {isScanningAI && (
                      <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none flex flex-col justify-start">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-lg shadow-cyan-400" />
                        <div className="p-3 text-center text-xs font-mono font-bold text-cyan-300 bg-black/70 mt-auto">
                          {scanStage === 'ocr' ? '⚡ جاري استخراج النصوص من الإيصال (Vision OCR)...' : '📡 جاري الاستعلام عن رسالة الـ SMS من الشبكة...'}
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-black/70 backdrop-blur-sm p-2 rounded-xl text-[11px] text-slate-300">
                      <span>إيصال محدد للتحليل</span>
                      <label className="text-cyan-400 hover:underline cursor-pointer font-bold">
                        تغيير الصورة
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 p-6 text-center">
                    <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 transition" />
                    <p className="text-xs font-bold text-slate-300">اسحب صورة الإيصال هنا أو اضغط للاختيار</p>
                    <p className="text-[10px] text-slate-500">يدعم PNG, JPG, JPEG (سكرين شوت من تطبيق أنا فودافون أو الرسالة)</p>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Right Col (Form Inputs - Col 7) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم هاتف فودافون كاش الذي حوّلت منه <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={senderPhone}
                    onChange={e => setSenderPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    المبلغ المحول (ج.م) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={5000}
                    placeholder="550"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    كود العملية المرجعي (Transaction ID) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VF-994321"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* AI Verification Mechanism Explanation */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4" />
                  <span>آلية التحقق الذاتي (Automated 3-Way Cross Check):</span>
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  سيتم تحليل صورة الإيصال واستخراج النصوص، ومقارنتها برسائل هاتف المعلم الرسمية. في حال التطابق (100%) يُعتمد الطلب آلياً ويُضاف الرصيد فوراً إلى محفظتك دون انتظار!
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isScanningAI}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isScanningAI ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري المسح الضوئي والمطابقة الذكية...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>فحص الإيصال واعتماد الشحن بالذكاء الاصطناعي ({amount} ج.م)</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </form>
      </div>

      {/* LATEST AI SCAN RESULT REPORT CARD */}
      {latestScanResult && (
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-5 animate-fadeIn text-right ${
          latestScanResult.decision === 'auto_approved'
            ? 'bg-slate-900 border-emerald-500/60 shadow-emerald-500/10'
            : 'bg-slate-900 border-amber-500/60 shadow-amber-500/10'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                latestScanResult.decision === 'auto_approved'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {latestScanResult.decision === 'auto_approved' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 font-mono">AI MATCH RESULT REPORT</span>
                <h3 className="text-lg font-black text-white">
                  {latestScanResult.decision === 'auto_approved'
                    ? '⚡ تم الاعتماد الآلي الفوري بالذكاء الاصطناعي بنجاح!'
                    : '⚠️ تم تعليق الطلب وتحويله للمراجعة اليدوية لدى المعلم'}
                </h3>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-xs text-slate-400 block">نسبة التطابق الذكي</span>
              <span className={`text-2xl font-black ${
                latestScanResult.decision === 'auto_approved' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {latestScanResult.overallScore}%
              </span>
            </div>
          </div>

          {/* 3-Way Matching Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              latestScanResult.phoneMatch 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>تطابق رقم هاتف المحول</span>
                <span>{latestScanResult.phoneMatch ? 'مطابق ✅' : 'غير متطابق ❌'}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{latestScanResult.extractedPhone}</p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              latestScanResult.amountMatch 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>تطابق المبلغ المالي</span>
                <span>{latestScanResult.amountMatch ? 'مطابق ✅' : 'تناقض ❌'}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">المستخرج: {latestScanResult.extractedAmount} ج.م</p>
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              latestScanResult.smsMatch 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>رسالة SMS هاتف المعلم</span>
                <span>{latestScanResult.smsMatch ? 'مؤكدة ✅' : 'لم تسجل بعد ⏳'}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">كود: {latestScanResult.extractedTxId}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-1">التقرير التحليلي للقرار:</strong>
            <p>{latestScanResult.decisionReason}</p>
          </div>
        </div>
      )}

      {/* PENDING & RECENT DEPOSIT REQUESTS */}
      {studentDeposits.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white">سجل طلبات الشحن السابقة والجارية</h3>
              <p className="text-xs text-slate-400">متابعة حالة الطلبات وتحديثات الرصيد</p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl">
              {studentDeposits.length} طلبات
            </span>
          </div>

          <div className="space-y-3">
            {studentDeposits.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{req.amount} ج.م</span>
                    <span className="text-xs text-slate-400">• كود: <code className="text-cyan-300">{req.transactionId}</code></span>
                    <span className="text-xs text-slate-500">من: {req.senderPhone}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {req.createdAt} {req.verificationMode === 'ai_auto' && <span className="text-emerald-400 font-bold">• اعتماد آلي بالذكاء الاصطناعي ⚡</span>}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>قيد المراجعة لدى المعلم ⏳</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => onApproveDepositSimulated(req.id)}
                        className="px-3 py-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="محاكاة موافقة المعلم الآن"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>اعتماد يدوي تجريبي ⚡</span>
                      </button>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم الاعتماد وإيداع الرصيد ✅</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORY */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-black text-white">سجل المعاملات وحركات المحفظة</h3>
          </div>
          <span className="text-xs text-slate-400">توثيق مالي متكامل</span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">لا توجد حركات مالية سابقة بعد.</p>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.amount > 0 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <p className="font-bold text-white text-xs sm:text-sm">{tx.description}</p>
                    <p className="text-[11px] text-slate-500">{tx.date}</p>
                  </div>
                </div>

                <div className="text-left font-mono font-black text-sm">
                  <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ج.م
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: TEACHER'S SIMULATED SMS INBOX VIEW */}
      {showSMSInboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-right space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button onClick={() => setShowSMSInboxModal(false)} className="text-slate-400 hover:text-white">إغلاق</button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">صندوق رسائل SMS فودافون كاش المعلم</span>
                <Smartphone className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <p className="text-xs text-slate-400">
              هذه محاكاة لبوابة استقبال رسائل الـ SMS الرسمية (SMS Gateway / Android Webhook) على هاتف المعلم والتي يقرأ منها محرك الذكاء الاصطناعي للتحقق من صدق التحويل:
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {SAMPLE_TEACHER_SMS_INBOX.map((sms) => (
                <div key={sms.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="text-cyan-400 font-bold">{sms.sender}</span>
                    <span>{sms.receivedAt}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans">{sms.body}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    <span>المبلغ المستخرج: {sms.extractedAmount} ج.م</span>
                    <span>كود العملية: {sms.extractedTxId}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSMSInboxModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              فهمت، العودة لنموذج الشحن
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

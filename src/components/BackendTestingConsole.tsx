import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Database, 
  Code, 
  Layers, 
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types';

interface BackendTestingConsoleProps {
  userProfile: UserProfile;
  onRefreshWallet: () => void;
}

export const BackendTestingConsole: React.FC<BackendTestingConsoleProps> = ({
  userProfile,
  onRefreshWallet
}) => {
  const [activeTab, setActiveTab] = useState<'webhook_tester' | 'student_tester' | 'db_viewer' | 'curl_docs'>('webhook_tester');
  
  // Webhook SMS form state
  const [webhookMessage, setWebhookMessage] = useState(
    'تم استلام مبلغ 550.00 جنيه مصري من رقم 01012345678. مصاريف الخدمة 0.00 جنيه. رصيدك الحالي هو 42850.00 جنيه. رقم العملية: VF-994321 بتاريخ 07/10/2026 14:18'
  );
  const [webhookSecret, setWebhookSecret] = useState('VODAFONE_WEBHOOK_SECRET_2026');
  const [webhookResponse, setWebhookResponse] = useState<any>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  // Student deposit form state
  const [depositPhone, setDepositPhone] = useState(userProfile.phone || '01012345678');
  const [depositAmount, setDepositAmount] = useState('550');
  const [depositTxId, setDepositTxId] = useState('VF-994321');
  const [depositResponse, setDepositResponse] = useState<any>(null);
  const [isSendingDeposit, setIsSendingDeposit] = useState(false);

  // Live Database Viewer state
  const [liveDbData, setLiveDbData] = useState<any>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);

  const fetchLiveDatabase = async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const json = await res.json();
        setLiveDbData(json);
      }
    } catch (err) {
      console.error('Failed to fetch admin transactions:', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabase();
  }, []);

  const handleSendWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingWebhook(true);
    setWebhookResponse(null);

    try {
      const res = await fetch('/api/sms/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret
        },
        body: JSON.stringify({
          sender: 'VodafoneCash',
          message: webhookMessage,
          secret_token: webhookSecret
        })
      });

      const data = await res.json();
      setWebhookResponse({
        status: res.status,
        statusText: res.statusText,
        body: data
      });

      fetchLiveDatabase();
      onRefreshWallet();
    } catch (err: any) {
      setWebhookResponse({
        status: 500,
        error: err.message
      });
    } finally {
      setIsSendingWebhook(false);
    }
  };

  const handleSendStudentDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingDeposit(true);
    setDepositResponse(null);

    try {
      const res = await fetch('/api/student/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: userProfile.id,
          sender_phone: depositPhone,
          claimed_amount: parseFloat(depositAmount),
          transaction_id: depositTxId
        })
      });

      const data = await res.json();
      setDepositResponse({
        status: res.status,
        statusText: res.statusText,
        body: data
      });

      fetchLiveDatabase();
      onRefreshWallet();
    } catch (err: any) {
      setDepositResponse({
        status: 500,
        error: err.message
      });
    } finally {
      setIsSendingDeposit(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCurl(id);
    setTimeout(() => setCopiedCurl(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-right shadow-2xl">
      
      {/* Console Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-1.5">
            <Terminal className="w-4 h-4" />
            <span>وحدة تحكم واختبار سيرفر فودافون كاش (Express Backend Tester)</span>
          </div>
          <h3 className="text-xl font-black text-white">
            فحص واختبار مسارات الـ Webhook ونظام المطابقة التلقائي
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            سيرفر الـ Backend يعمل بشكل مباشر على المنفذ 3000 ويمكنك اختباره فوراً من هنا أو عبر cURL و Postman.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>POST /api/sms/webhook LIVE</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('webhook_tester')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'webhook_tester'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>1. اختبار الـ Webhook (محاكاة وصول SMS)</span>
        </button>

        <button
          onClick={() => setActiveTab('student_tester')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'student_tester'
              ? 'bg-indigo-600 text-white font-black shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>2. اختبار تأكيد الطالب (Student Deposit)</span>
        </button>

        <button
          onClick={() => { setActiveTab('db_viewer'); fetchLiveDatabase(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'db_viewer'
              ? 'bg-emerald-600 text-white font-black shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>3. جداول قاعدة البيانات الحية ({liveDbData?.stats?.total_incoming_sms ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('curl_docs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'curl_docs'
              ? 'bg-cyan-600 text-white font-black shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>4. أوامر cURL وأكواد الربط</span>
        </button>
      </div>

      {/* TAB 1: WEBHOOK TESTER */}
      {activeTab === 'webhook_tester' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-mono font-bold">POST</span>
                <span className="font-mono text-cyan-300">/api/sms/webhook</span>
              </span>
              <span className="text-slate-400 text-[11px]">يستقبل الرسائل من تطبيق Forwarder بالموبايل</span>
            </div>

            <form onSubmit={handleSendWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نص رسالة فودافون كاش (SMS Message Body):
                </label>
                <textarea
                  rows={3}
                  value={webhookMessage}
                  onChange={e => setWebhookMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono leading-relaxed"
                />
              </div>

              {/* Sample SMS Quick Fill Buttons */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="text-slate-500 py-1">نماذج رسائل سريعة:</span>
                <button
                  type="button"
                  onClick={() => setWebhookMessage('تم استلام مبلغ 550.00 جنيه مصري من رقم 01012345678. مصاريف الخدمة 0.00 جنيه. رصيدك الحالي هو 42850.00 جنيه. رقم العملية: VF-994321 بتاريخ 07/10/2026 14:18')}
                  className="bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800"
                >
                  رسالة 550 ج.م كورس فيزياء
                </button>
                <button
                  type="button"
                  onClick={() => setWebhookMessage('تم استلام مبلغ 250.00 جنيه مصري من رقم 01077788990. مصاريف الخدمة 0.00 جنيه. رقم العملية: VF-881240')}
                  className="bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800"
                >
                  رسالة 250 ج.م اشتراك شهري
                </button>
                <button
                  type="button"
                  onClick={() => setWebhookMessage('You have received 850.00 EGP from 01055566778. Transaction ID: VF-773190')}
                  className="bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800 font-mono"
                >
                  English Template 850 EGP
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    X-Webhook-Secret Header / Secret Token:
                  </label>
                  <input
                    type="text"
                    value={webhookSecret}
                    onChange={e => setWebhookSecret(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSendingWebhook}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSendingWebhook ? (
                      <span>جاري إرسال الطلب...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>إرسال الـ Webhook ومعالجة الرسالة فوراً</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Webhook Response Box */}
          {webhookResponse && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 animate-fadeIn font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>استجابة السيرفر: HTTP {webhookResponse.status}</span>
                </span>
                <span>Content-Type: application/json</span>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed dir-ltr">
                {JSON.stringify(webhookResponse.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT DEPOSIT TESTER */}
      {activeTab === 'student_tester' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">POST</span>
                <span className="font-mono text-cyan-300">/api/student/deposit</span>
              </span>
              <span className="text-slate-400 text-[11px]">يستدعى عندما يضغط الطالب على «لقد قمت بالتحويل»</span>
            </div>

            <form onSubmit={handleSendStudentDeposit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم هاتف الطالب (Sender Phone):
                  </label>
                  <input
                    type="tel"
                    required
                    value={depositPhone}
                    onChange={e => setDepositPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المبلغ المطالب به (Claimed Amount):
                  </label>
                  <input
                    type="number"
                    required
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    كود العملية المرجعي (اختياري):
                  </label>
                  <input
                    type="text"
                    value={depositTxId}
                    onChange={e => setDepositTxId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                الطالب المسجل: <strong className="text-white">{userProfile.name}</strong> (معرف الطالب: <code className="text-cyan-300">{userProfile.id}</code>)
              </div>

              <button
                type="submit"
                disabled={isSendingDeposit}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSendingDeposit ? (
                  <span>جاري تنفيذ المطابقة...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>إرسال طلب التأكيد وفحص المطابقة في السيرفر</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Student Response Box */}
          {depositResponse && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 animate-fadeIn font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span className={`font-bold flex items-center gap-1.5 ${
                  depositResponse.body?.matched ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {depositResponse.body?.matched ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  <span>{depositResponse.body?.matched ? 'MATCH SUCCESSFUL (COMPLETED)' : 'NO MATCH YET (PENDING_VERIFICATION)'}</span>
                </span>
                <span>HTTP {depositResponse.status}</span>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed dir-ltr">
                {JSON.stringify(depositResponse.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE DATABASE TABLES */}
      {activeTab === 'db_viewer' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>جداول قاعدة البيانات (IncomingTransactions & DepositRequests)</span>
            </h4>
            <button
              onClick={fetchLiveDatabase}
              disabled={isLoadingDb}
              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
              <span>تحديث البيانات</span>
            </button>
          </div>

          {/* Table 1: IncomingTransactions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>جدول: IncomingTransactions (رسائل الـ SMS الواردة)</span>
              <span className="text-slate-500 font-mono font-normal">
                {liveDbData?.incoming_transactions?.length ?? 0} سجلات
              </span>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 font-mono text-[11px]">
                    <th className="p-3">ID</th>
                    <th className="p-3">sender_phone</th>
                    <th className="p-3">amount</th>
                    <th className="p-3">transaction_id</th>
                    <th className="p-3">status</th>
                    <th className="p-3">is_used</th>
                    <th className="p-3">matched_student_id</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {liveDbData?.incoming_transactions?.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-900/50">
                      <td className="p-3 text-slate-400">{tx.id}</td>
                      <td className="p-3 text-white font-bold">{tx.sender_phone}</td>
                      <td className="p-3 text-emerald-400 font-bold">{tx.amount} ج.م</td>
                      <td className="p-3 text-cyan-300">{tx.transaction_id || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{tx.is_used ? 'TRUE' : 'FALSE'}</td>
                      <td className="p-3 text-indigo-400">{tx.matched_student_id || 'null'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: DepositRequests */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>جدول: DepositRequests (طلبات إيداع الطلاب)</span>
              <span className="text-slate-500 font-mono font-normal">
                {liveDbData?.deposit_requests?.length ?? 0} طلبات
              </span>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 font-mono text-[11px]">
                    <th className="p-3">ID</th>
                    <th className="p-3">student_id</th>
                    <th className="p-3">sender_phone</th>
                    <th className="p-3">claimed_amount</th>
                    <th className="p-3">status</th>
                    <th className="p-3">matched_incoming_id</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {liveDbData?.deposit_requests?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 font-sans">
                        لم يتم تسجيل أي طلب إيداع من الطلاب بعد. قم بتجربة تبويب «2. اختبار تأكيد الطالب».
                      </td>
                    </tr>
                  ) : (
                    liveDbData?.deposit_requests?.map((dep: any) => (
                      <tr key={dep.id} className="hover:bg-slate-900/50">
                        <td className="p-3 text-slate-400">{dep.id}</td>
                        <td className="p-3 text-indigo-400">{dep.student_id}</td>
                        <td className="p-3 text-white font-bold">{dep.sender_phone}</td>
                        <td className="p-3 text-emerald-400 font-bold">{dep.claimed_amount} ج.م</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dep.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {dep.status}
                          </span>
                        </td>
                        <td className="p-3 text-cyan-300">{dep.matched_incoming_id || 'null'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CURL EXAMPLES & CLIENT INTEGRATION */}
      {activeTab === 'curl_docs' && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <h4 className="text-sm font-black text-white">طريقة ربط تطبيق الموبايل واستدعاء السيرفر (cURL & API Examples)</h4>
            <p className="text-xs text-slate-400 mt-1">
              يمكنك نسخ أي من هذه الأوامر وتشغيلها في الـ Terminal لاختبار السيرفر الحقيقي مباشرة:
            </p>
          </div>

          {/* cURL 1: Webhook */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 font-mono">1. استدعاء الـ Webhook عند وصول رسالة SMS:</span>
              <button
                onClick={() => handleCopy(
`curl -X POST http://localhost:3000/api/sms/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Secret: VODAFONE_WEBHOOK_SECRET_2026" \\
  -d '{
    "sender": "VodafoneCash",
    "message": "تم استلام مبلغ 550.00 جنيه مصري من رقم 01012345678. مصاريف الخدمة 0.00 جنيه. رقم العملية: VF-994321 بتاريخ 07/10/2026"
  }'`, 'curl1')}
                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCurl === 'curl1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl === 'curl1' ? 'تم النسخ!' : 'نسخ cURL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto dir-ltr">
{`curl -X POST http://localhost:3000/api/sms/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Secret: VODAFONE_WEBHOOK_SECRET_2026" \\
  -d '{
    "sender": "VodafoneCash",
    "message": "تم استلام مبلغ 550.00 جنيه مصري من رقم 01012345678. مصاريف الخدمة 0.00 جنيه. رقم العملية: VF-994321 بتاريخ 07/10/2026"
  }'`}
            </pre>
          </div>

          {/* cURL 2: Student Deposit */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 font-mono">2. استدعاء تأكيد الطالب لإجراء المطابقة والشحن:</span>
              <button
                onClick={() => handleCopy(
`curl -X POST http://localhost:3000/api/student/deposit \\
  -H "Content-Type: application/json" \\
  -d '{
    "student_id": "std-current",
    "sender_phone": "01012345678",
    "claimed_amount": 550,
    "transaction_id": "VF-994321"
  }'`, 'curl2')}
                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCurl === 'curl2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl === 'curl2' ? 'تم النسخ!' : 'نسخ cURL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto dir-ltr">
{`curl -X POST http://localhost:3000/api/student/deposit \\
  -H "Content-Type: application/json" \\
  -d '{
    "student_id": "std-current",
    "sender_phone": "01012345678",
    "claimed_amount": 550,
    "transaction_id": "VF-994321"
  }'`}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};

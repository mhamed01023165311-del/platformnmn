import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  EyeOff, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  ShieldAlert, 
  Wallet, 
  ArrowLeft,
  Bell,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { SECURITY_FEATURES_GUIDE, PAYMENT_GATEWAYS_GUIDE } from '../data/mockData';

export const SecurityAndManagementSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'students' | 'payments'>('security');
  const [simulatorWatermark, setSimulatorWatermark] = useState(true);
  const [screenRecordedTriggered, setScreenRecordedTriggered] = useState(false);

  const handleSimulateScreenRecord = () => {
    setScreenRecordedTriggered(true);
    setTimeout(() => {
      // auto reset warning after 4 seconds
      setScreenRecordedTriggered(false);
    }, 4500);
  };

  return (
    <section id="security-management" className="py-20 bg-slate-900 relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>المنظومة التقنية والإدارية المتطورة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            حماية الفيديوهات من التسريب، إدارة الطلاب، وبوابات الدفع
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            دليل عملي شامل ومعمارية تقنية متكاملة تضمن للمعلم حماية جهده الفكري بنسبة 100%، ومتابعة دقيقة لكل طالب، وتحصيل سلس للاشتراكات.
          </p>

          {/* Tab Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 text-cyan-300" />
              <span>حماية الفيديوهات ومحاكي مكافحة التسريب</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>خطوات إدارة ومتابعة الطلاب</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>بوابات الدفع المناسبة وتكاملها</span>
            </button>
          </div>
        </div>

        {/* TAB 1: VIDEO LEAK PROTECTION & LIVE SIMULATOR */}
        {activeTab === 'security' && (
          <div className="space-y-12 animate-fadeIn">
            
            {/* Interactive Video Anti-Leak Simulator Box */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 text-right">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>محاكي الحماية الحية (Live DRM & Anti-Leak Simulator)</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                    جرّب بنفسك تقنيات إحباط محاولات تسريب المحتوى
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    شاهد كيف تظهر البصمة المائية الرقمية، وماذا يحدث لحظياً عند رصد برنامج تسجيل شاشة خارجي!
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setSimulatorWatermark(!simulatorWatermark)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      simulatorWatermark
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{simulatorWatermark ? 'البصمة المائية مفعلة' : 'تعطيل البصمة'}</span>
                  </button>

                  <button
                    onClick={handleSimulateScreenRecord}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-rose-600/30 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>محاكاة تسجيل الشاشة (Simulate Screen Capture)</span>
                  </button>
                </div>
              </div>

              {/* The Video Canvas Container */}
              <div className="mt-6 relative rounded-2xl overflow-hidden bg-black aspect-video max-h-96 border border-slate-800 flex items-center justify-center select-none shadow-2xl">
                
                {/* Normal Video Slide Content */}
                {!screenRecordedTriggered ? (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 p-6 flex flex-col justify-between text-right relative">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-cyan-400 font-bold">● LIVE STREAM • AES-128 ENCRYPTED</span>
                      <span className="font-bold text-white">محاضرة كيرشوف المتقدمة - د. أحمد ممدوح</span>
                    </div>

                    <div className="space-y-2 max-w-md">
                      <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full">
                        HLS DRM STREAM
                      </span>
                      <h4 className="text-xl font-black text-white">قانون كيرشوف الثاني وحفظ الطاقة</h4>
                      <p className="text-xs text-slate-300">
                        ∑ V_B = ∑ (I · R) في أي مسار كهربي مغلق.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-2">
                      <span>Token #7781-A29 • Single Session Active</span>
                      <span>معاينة حية لمشغل الفيديو المحمي</span>
                    </div>

                    {/* DYNAMIC WATERMARK ON TOP */}
                    {simulatorWatermark && (
                      <div className="absolute top-1/3 left-1/3 pointer-events-none transition-all duration-700">
                        <div className="bg-black/40 backdrop-blur-[2px] border border-white/10 px-3.5 py-2 rounded-xl text-white/70 text-xs font-mono select-none tracking-wide shadow-md -rotate-6">
                          <p className="font-bold text-emerald-400">عمر شريف إبراهيم</p>
                          <p className="text-[10px]">01012345678 • IP: 197.34.120.45</p>
                          <p className="text-[9px] text-slate-400 font-mono">ID: STD-2026-8841</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* TRIGGERED ANTI-LEAK SCREEN BLOCK */
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center animate-bounce">
                      <ShieldAlert className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">
                        تم رصد محاولة تسجيل شاشة أو التقاط لقطة شاشة!
                      </h4>
                      <p className="text-xs text-rose-400 mt-1 max-w-md">
                        تم تفعيل الشاشة السوداء تلقائياً. تم تسجيل محاولة التسريب باسم الطالب (عمر شريف إبراهيم) وعنوان IP الخاص به وإرسال إنذار لإدارة المنصة.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                      Event Logged: SEC_ALERT_SCREEN_GRAB_BLOCKED
                    </span>
                  </div>
                )}

              </div>

              {/* Explanatory notes below simulator */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>تتحرك العلامة المائية عشوائياً كل 10-15 ثانية على كامل مساحة الفيديو فلا يمكن إزالتها بالفوتوشوب أو التعتيم.</span>
                </span>
                <span className="text-cyan-400 font-mono text-[11px]">Dynamic Positioning Algorithm</span>
              </div>
            </div>

            {/* The 4 Architectural Defense Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SECURITY_FEATURES_GUIDE.map((feat, i) => (
                <div 
                  key={i}
                  className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-right space-y-3 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-cyan-300">
                      {feat.tag}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>

                  <h4 className="text-base font-black text-white">{feat.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: STUDENT MANAGEMENT WORKFLOW */}
        {activeTab === 'students' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-right space-y-10 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-emerald-400">المنظومة الإدارية والتربوية</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                دورة متابعة الطالب الأسبوعية (Student Operational Lifecycle)
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                نظام حازم يضمن الانضباط ويمنع تراكم الدروس، مع ربط دائم لولي الأمر دون استهلاك وقت المعلم.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-white text-base">تسجيل الحضور والمشاهدة</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  حساب نسبة مشاهدة الفيديو بدقة (Completion Rate). لا يتم اعتبار الدرس مكتملاً إلا بمشاهدة ما لا يقل عن 85% من مدة الشرح الفعلي.
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>منع التقديم السريع العشوائي</span>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-white text-base">بوابة الواجب الإجباري</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  (Gated Content Progression): يغلق النظام الدرس القادم آلياً حتى يقوم الطالب بحل واجب الدرس الحالي بنجاح بنسبة لا تقل عن 75%.
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تصحيح فوري مع حلول تفصيلية</span>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-white text-base">كشف الأوائل ولوحة الشرف</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تحفيز وتنافس إيجابي أسبوعي بين آلاف الطلاب، مع نقاط تميز (Gamification Points) تمنح خصومات وجوائز للملتزمين.
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تحديث لحظي لترتيب الجمهورية</span>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h4 className="font-bold text-white text-base">تقارير واتساب التلقائية</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يرسل روبوت المنصة رسالة أسبوعية مفصلة لهاتف ولي الأمر تشمل: عدد ساعات المذاكرة، درجات الواجب، ونقاط القوة والضعف.
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>شفافية تامة مع الأسرة</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT GATEWAYS GUIDE */}
        {activeTab === 'payments' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PAYMENT_GATEWAYS_GUIDE.map((gateway, i) => (
                <div
                  key={i}
                  className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-right space-y-4 hover:border-emerald-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {gateway.badge}
                      </span>
                      <Wallet className="w-5 h-5 text-indigo-400" />
                    </div>

                    <h4 className="text-base font-black text-white">{gateway.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold">تغطية المعاملات: {gateway.coverage}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{gateway.method}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد آلي فوري (Instant Webhook)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Practical Setup Recommendations for the Educator */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-right space-y-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span>نصائح تطبيقية لمعمارية المدفوعات في المنصات التعليمية:</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>بوابة Paymob أو Fawry Accept:</strong> أفضل خيار لتجميع كافة المحافظ الإلكترونية وكروت فيزا وميزة وماستركارد في كود واحد.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>أكواد الشحن المطبوعة (Prepaid Scratch Cards):</strong> وسيلة ممتازة لبيع اشتراكات السناتر والمكتبات المحلية وتسليمها للطلاب يداً بيد.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>الأمان ضد الاحتيال:</strong> عدم تفعيل الكورس إلا بعد استقبال حدث الدفع الناجح (Payment Succeeded Webhook) المؤكد من البوابة.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

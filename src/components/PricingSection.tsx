import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  ArrowLeft,
  Zap,
  Star
} from 'lucide-react';
import { PRICING_PLANS } from '../data/mockData';
import { PricingPlan } from '../types';

interface PricingSectionProps {
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan
}) => {
  const [currency] = useState('ج.م');

  return (
    <section id="pricing" className="py-20 bg-slate-950/90 relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
            <CreditCard className="w-4 h-4" />
            <span>القسم الرابع: استراتيجية التسعير المرنة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            خطط اشتراك مصممة لتناسب كل طالب وميزانية
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            نوفر نموذج تسعير هجين (Hybrid Pricing) يتيح للطالب الاختيار بين الدفع لكل كورس، الاشتراك الشهري الميسر، أو باقة الفصل الشاملة مع خصومات تصل إلى 35%.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 text-right transition-all duration-300 flex flex-col justify-between relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/10 transform lg:-translate-y-2'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>الأكثر اختياراً من الطلاب</span>
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Name & Tagline */}
                  <div>
                    <h3 className="text-lg font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="py-3 border-y border-slate-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-xs font-bold text-emerald-400">{currency}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{plan.period}</p>
                  </div>

                  {/* Suitable For */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-indigo-300">
                    <strong>الأنسب لـ:</strong> {plan.suitableFor}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-bold text-slate-300">المميزات المشمولة:</p>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Limitations if any */}
                    {plan.limitations && (
                      <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                        <ul className="space-y-1.5 text-[11px] text-slate-500">
                          {plan.limitations.map((lim, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              <span>{lim}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>اختيار هذه الباقة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Guarantees & Payment Trust Banner */}
        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-right">
          <div className="space-y-1">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ضمان كامل وأمان بنكي معتمد</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl">
              تفعيل فوري للاشتراك خلال 30 ثانية من الدفع. جميع المعاملات مشفرة وتتم عبر بوابات دفع رسمية معتمدة (فوري، فودافون كاش، وبطاقات الدفع).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-slate-300">
            <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">تفعيل فوري</span>
            <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">دعم فني 24/7</span>
            <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">فواتير رسمية</span>
          </div>
        </div>

      </div>
    </section>
  );
};

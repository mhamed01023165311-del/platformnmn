import React from 'react';
import { 
  GraduationCap, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Youtube,
  Send,
  Facebook,
  Menu
} from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  onNavigate?: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleGo = (page: PageId) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-right pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info (Col 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-white">منصة الأستاذ الذكية EduMaster</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              أول منصة تعليمية ذكية متخصصة في تبسيط وتدريس مناهج الثانوية العامة بنظام الصفحات المستقلة وقائمة التنقل السريع، تجمع بين الشرح العميق وحماية المحتوى بأحدث تقنيات الـ DRM.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-rose-400 transition">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-indigo-400 transition">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Page Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">صفحات المنصة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleGo('home')} className="hover:text-emerald-400 transition cursor-pointer">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => handleGo('curriculum')} className="hover:text-emerald-400 transition cursor-pointer">
                  هيكل المنهج والدروس
                </button>
              </li>
              <li>
                <button onClick={() => handleGo('courses')} className="hover:text-emerald-400 transition cursor-pointer">
                  الكورسات المتاحة
                </button>
              </li>
              <li>
                <button onClick={() => handleGo('quiz')} className="hover:text-emerald-400 transition cursor-pointer">
                  الاختبار الذكي (MCQ)
                </button>
              </li>
            </ul>
          </div>

          {/* More Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">الإدارة والحماية</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleGo('pricing')} className="hover:text-emerald-400 transition cursor-pointer">
                  باقات الاشتراك والأسعار
                </button>
              </li>
              <li>
                <button onClick={() => handleGo('security')} className="hover:text-emerald-400 transition cursor-pointer">
                  أنظمة حماية الفيديوهات
                </button>
              </li>
              <li>
                <button onClick={() => handleGo('teacher')} className="hover:text-emerald-400 transition cursor-pointer">
                  لوحة تحكم المعلم
                </button>
              </li>
            </ul>
          </div>

          {/* Support and Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">الدعم الفني والاشتراكات</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span dir="ltr">010 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>support@edumaster-eg.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>القاهرة، جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and legal disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} منصة الأستاذ التعليمية الذكية. جميع حقوق الملكية الفكرية والشروحات مسجلة ومحمية قانونياً.</p>
          
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DRM Encrypted Platform</span>
            </span>
            <span>سياسة الخصوصية</span>
            <span>شروط الاستخدام</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

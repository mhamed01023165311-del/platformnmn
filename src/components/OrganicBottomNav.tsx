import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Wallet, 
  UserCheck,
  User,
  Users
} from 'lucide-react';
import { PageId } from '../types';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

const STUDENT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'courses', label: 'الكورسات', icon: BookOpen },
  { id: 'my_courses', label: 'كورساتي', icon: GraduationCap },
  { id: 'wallet', label: 'المحفظة', icon: Wallet },
  { id: 'teacher', label: 'عن الأستاذ', icon: UserCheck },
  { id: 'profile', label: 'البروفايل', icon: User },
];

const DEVELOPER_NAV_ITEMS: NavItem[] = [
  { id: 'teacher', label: 'عن المدرس', icon: UserCheck },
  { id: 'courses', label: 'الكورسات', icon: BookOpen },
  { id: 'admin_students', label: 'إدارة الطلاب', icon: Users },
];

interface OrganicBottomNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  walletBalance?: number;
  isDeveloper?: boolean;
}

export const OrganicBottomNav: React.FC<OrganicBottomNavProps> = ({
  currentPage,
  onNavigate,
  walletBalance,
  isDeveloper = false
}) => {
  const items = isDeveloper ? DEVELOPER_NAV_ITEMS : STUDENT_NAV_ITEMS;

  return (
    <nav 
      aria-label="شريط التنقل السفلي الذكي" 
      className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] pointer-events-auto transition-all ${
        isDeveloper ? 'max-w-xs sm:max-w-sm' : 'max-w-md sm:max-w-lg'
      }`}
      dir="rtl"
    >
      {/* Outer Glow Halo */}
      <div className={`absolute inset-0 -z-10 rounded-full blur-xl pointer-events-none transition-opacity duration-500 ${
        isDeveloper ? 'bg-amber-500/20' : 'bg-emerald-500/15'
      }`} />

      {/* Main Glassmorphic Dock Container */}
      <div className={`relative rounded-full bg-slate-950/90 backdrop-blur-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] px-2 sm:px-3 py-2 flex items-center justify-between gap-1 overflow-visible ${
        isDeveloper ? 'border-amber-500/40 shadow-amber-950/40' : 'border-white/10'
      }`}>
        
        {items.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex-1 py-1.5 sm:py-2 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 select-none group focus:outline-none"
            >
              {/* Elastic / Fluid Active Indicator (Sunken Organic Capsule) */}
              {isActive && (
                <motion.div
                  layoutId="organic-active-glow"
                  className="absolute inset-0 rounded-full z-0 overflow-hidden"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 30,
                    mass: 0.8
                  }}
                >
                  {/* Sunken fabric indentation background */}
                  <div className={`absolute inset-0 rounded-full border shadow-inner ${
                    isDeveloper
                      ? 'bg-gradient-to-b from-amber-500/25 via-amber-600/15 to-amber-950/30 border-amber-400/40 shadow-[inset_0_2px_6px_rgba(245,158,11,0.35),0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-gradient-to-b from-emerald-500/25 via-emerald-600/15 to-emerald-950/30 border-emerald-400/35 shadow-[inset_0_2px_6px_rgba(16,185,129,0.35),0_0_15px_rgba(16,185,129,0.25)]'
                  }`} />
                  
                  {/* Fluid Central Radiant Orb (The sinking ball light) */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-md pointer-events-none ${
                    isDeveloper ? 'bg-amber-400/25' : 'bg-emerald-400/20'
                  }`} />
                  
                  {/* Subtle Top Rim Light */}
                  <div className={`absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent to-transparent ${
                    isDeveloper ? 'via-amber-300/70' : 'via-emerald-300/60'
                  }`} />
                </motion.div>
              )}

              {/* Icon Container with Floating Lift when active */}
              <motion.div
                className="relative z-10 flex flex-col items-center justify-center"
                animate={{
                  y: isActive ? -2 : 0,
                  scale: isActive ? 1.08 : 1
                }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 25
                }}
              >
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-colors duration-200 ${
                      isActive 
                        ? (isDeveloper ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]')
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`} 
                  />

                  {/* Wallet live balance mini dot badge */}
                  {!isDeveloper && item.id === 'wallet' && typeof walletBalance === 'number' && walletBalance > 0 && !isActive && (
                    <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                  )}
                </div>

                {/* Text Label */}
                <span 
                  className={`text-[10px] sm:text-[11px] font-bold mt-1 transition-all duration-200 tracking-tight ${
                    isActive 
                      ? 'text-white font-extrabold opacity-100 scale-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' 
                      : 'text-slate-400/90 group-hover:text-slate-300 font-medium scale-95 opacity-80'
                  }`}
                >
                  {item.label}
                </span>

              </motion.div>
            </button>
          );
        })}

      </div>
    </nav>
  );
};

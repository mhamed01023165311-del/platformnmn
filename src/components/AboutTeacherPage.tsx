import React, { useState } from 'react';
import { 
  MessageCircle, 
  Youtube, 
  Facebook, 
  Send, 
  PhoneCall, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Edit3, 
  X, 
  Save, 
  Camera, 
  Check, 
  Plus, 
  Trash2, 
  Globe, 
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';
import { TeacherProfileData, TeacherSocialLink } from '../types';

interface AboutTeacherPageProps {
  isDeveloper?: boolean;
  teacherData?: TeacherProfileData;
  onUpdateTeacher?: (data: TeacherProfileData) => Promise<boolean>;
}

const DEFAULT_SOCIAL_LINKS: TeacherSocialLink[] = [
  {
    id: 'link-whatsapp',
    name: 'محادثة واتساب المباشرة (WhatsApp)',
    handle: '010 1234 5678',
    description: 'للاستفسار عن مواعيد الحصص، تفعيل الاشتراكات، ومتابعة الواجبات',
    url: 'https://wa.me/201012345678?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%8A%D8%A7%20%D8%AF%D9%83%D8%AA%D9%88%D8%B1%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%83%D9%88%D8%B1%D8%B3%D8%A7%D8%AA%20%D8%A7%D9%84%D9%81%D9%8A%D8%B2%D9%8A%D8%A7%D8%A1',
    iconType: 'whatsapp',
    actionLabel: 'تحدث عبر واتساب الآن'
  },
  {
    id: 'link-youtube',
    name: 'قناة اليوتيوب الرسمية (YouTube)',
    handle: '@El-Naggar-Physics',
    description: 'شروحات مجانية، مراجعات ليلة الامتحان، وحل نماذج الوزارة الاسترشادية',
    url: 'https://www.youtube.com',
    iconType: 'youtube',
    actionLabel: 'زيارة قناة اليوتيوب'
  },
  {
    id: 'link-telegram',
    name: 'قناة التليجرام (Telegram)',
    handle: 't.me/elnaggar_physics_2026',
    description: 'تحميل مذكرات الشرح بصيغة PDF، بنوك الأسئلة، والواجبات الدورية',
    url: 'https://t.me',
    iconType: 'telegram',
    actionLabel: 'الانضمام للقناة'
  },
  {
    id: 'link-facebook',
    name: 'الصفحة الرسمية على فيسبوك (Facebook)',
    handle: 'facebook.com/Dr.Ahmed.Elnaggar.Physics',
    description: 'جداول المحاضرات، تكريم الطلاب الأوائل، وآخر الإعلانات الهامة',
    url: 'https://www.facebook.com',
    iconType: 'facebook',
    actionLabel: 'متابعة الصفحة'
  },
  {
    id: 'link-phone',
    name: 'الاتصال الهاتفي المباشر',
    handle: '010 1234 5678 / 010 9876 5432',
    description: 'فريق الدعم الفني والمتابعة الأكاديمية متاح يومياً من 10 صباحاً إلى 10 مساءً',
    url: 'tel:+201012345678',
    iconType: 'phone',
    actionLabel: 'اتصال هاتفي'
  }
];

const DEFAULT_TEACHER_INFO: TeacherProfileData = {
  name: 'أ. د. أحمد ممدوح النجار',
  title: 'خبير تدريس الفيزياء للثانوية العامة ومؤلف سلسلة المعلم',
  experience: 'أكثر من 20 عاماً من الخبرة',
  location: 'جمهورية مصر العربية',
  bio: 'مدرس أول ومحاضر مادة الفيزياء للثانوية العامة. متخصص في تفكيك المناهج المعقدة وتحويلها إلى أفكار منطقية مبسطة باستخدام أحدث وسائل المحاكاة البصرية والتجارب المعملية، مع سجل حافل بتخريج أوائل الجمهورية على مدار عقدين كاملين.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
  whatsapp: '01012345678',
  youtube: 'https://www.youtube.com',
  telegram: 'https://t.me',
  facebook: 'https://www.facebook.com',
  phone: '01012345678',
  socialLinks: DEFAULT_SOCIAL_LINKS,
  keyStats: [
    { label: 'سنة خبرة تعليمية', value: '+20' },
    { label: 'طالب متفوق وخريج', value: '+15,000' },
    { label: 'من أوائل الجمهورية', value: '+45' },
    { label: 'نسبة النجاح والتفوق', value: '99%' }
  ]
};

export const AboutTeacherPage: React.FC<AboutTeacherPageProps> = ({
  isDeveloper = false,
  teacherData,
  onUpdateTeacher
}) => {
  const [info, setInfo] = useState<TeacherProfileData>(() => {
    if (teacherData) {
      return {
        ...DEFAULT_TEACHER_INFO,
        ...teacherData,
        socialLinks: teacherData.socialLinks && teacherData.socialLinks.length > 0
          ? teacherData.socialLinks
          : DEFAULT_SOCIAL_LINKS
      };
    }
    return DEFAULT_TEACHER_INFO;
  });

  // Keep in sync with prop updates
  React.useEffect(() => {
    if (teacherData) {
      setInfo({
        ...DEFAULT_TEACHER_INFO,
        ...teacherData,
        socialLinks: teacherData.socialLinks && teacherData.socialLinks.length > 0
          ? teacherData.socialLinks
          : DEFAULT_SOCIAL_LINKS
      });
    }
  }, [teacherData]);

  // Main Teacher Edit Modal State
  const [isMainEditModalOpen, setIsMainEditModalOpen] = useState(false);
  const [mainEditForm, setMainEditForm] = useState<TeacherProfileData>(info);
  const [isSaving, setIsSaving] = useState(false);

  // Single Social Link Edit / Add Modal State
  const [editingLink, setEditingLink] = useState<TeacherSocialLink | null>(null);
  const [isAddingNewLink, setIsAddingNewLink] = useState(false);
  const [linkForm, setLinkForm] = useState<TeacherSocialLink>({
    id: '',
    name: '',
    handle: '',
    description: '',
    url: '',
    iconType: 'whatsapp',
    actionLabel: ''
  });

  const handleOpenMainEdit = () => {
    setMainEditForm({ ...info });
    setIsMainEditModalOpen(true);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setMainEditForm(prev => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMainProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onUpdateTeacher) {
        await onUpdateTeacher(mainEditForm);
      }
      setInfo(mainEditForm);
      setIsMainEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Modal for a specific Social Link
  const handleOpenEditLink = (link: TeacherSocialLink) => {
    setEditingLink(link);
    setIsAddingNewLink(false);
    setLinkForm({ ...link });
  };

  // Open Add Modal for a new Social Link
  const handleOpenAddNewLink = () => {
    const newLink: TeacherSocialLink = {
      id: 'link-' + Date.now(),
      name: 'قناة تواصل جديدة',
      handle: '@username أو 010...',
      description: 'وصف وسيلة التواصل وطريقة الاستفسار',
      url: 'https://',
      iconType: 'whatsapp',
      actionLabel: 'تواصل معنا الآن'
    };
    setEditingLink(newLink);
    setIsAddingNewLink(true);
    setLinkForm(newLink);
  };

  // Save Social Link (Add or Edit)
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const currentLinks = info.socialLinks || DEFAULT_SOCIAL_LINKS;
      let updatedLinks: TeacherSocialLink[];

      if (isAddingNewLink) {
        updatedLinks = [...currentLinks, linkForm];
      } else {
        updatedLinks = currentLinks.map(l => l.id === linkForm.id ? linkForm : l);
      }

      const updatedInfo: TeacherProfileData = {
        ...info,
        socialLinks: updatedLinks
      };

      if (onUpdateTeacher) {
        await onUpdateTeacher(updatedInfo);
      }
      setInfo(updatedInfo);
      setEditingLink(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Social Link
  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف وسيلة التواصل هذه؟')) return;
    setIsSaving(true);
    try {
      const currentLinks = info.socialLinks || DEFAULT_SOCIAL_LINKS;
      const updatedLinks = currentLinks.filter(l => l.id !== linkId);
      const updatedInfo: TeacherProfileData = {
        ...info,
        socialLinks: updatedLinks
      };

      if (onUpdateTeacher) {
        await onUpdateTeacher(updatedInfo);
      }
      setInfo(updatedInfo);
    } finally {
      setIsSaving(false);
    }
  };

  const getLinkMeta = (iconType: string) => {
    switch (iconType) {
      case 'whatsapp':
        return {
          icon: MessageCircle,
          color: 'from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgHover: 'hover:border-emerald-500/60'
        };
      case 'youtube':
        return {
          icon: Youtube,
          color: 'from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          bgHover: 'hover:border-rose-500/60'
        };
      case 'telegram':
        return {
          icon: Send,
          color: 'from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400',
          textColor: 'text-sky-400',
          borderColor: 'border-sky-500/30',
          bgHover: 'hover:border-sky-500/60'
        };
      case 'facebook':
        return {
          icon: Facebook,
          color: 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          bgHover: 'hover:border-blue-500/60'
        };
      case 'phone':
        return {
          icon: PhoneCall,
          color: 'from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500',
          textColor: 'text-slate-300',
          borderColor: 'border-slate-700',
          bgHover: 'hover:border-slate-600'
        };
      default:
        return {
          icon: Globe,
          color: 'from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400',
          textColor: 'text-indigo-400',
          borderColor: 'border-indigo-500/30',
          bgHover: 'hover:border-indigo-500/60'
        };
    }
  };

  const currentSocialLinks = info.socialLinks || DEFAULT_SOCIAL_LINKS;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn" dir="rtl">
      
      {/* Developer Edit Bar */}
      {isDeveloper && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 block">وضع تعديل صفحة المعلم والسوشيال ميديا (Admin Mode)</span>
              <span className="text-[11px] text-slate-400">يمكنك تعديل نبذة المدرس وتعديل روابط وأرقام السوشيال ميديا وحفظها في Firestore مباشرة.</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenMainEdit}
              className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل نبذة المدرس</span>
            </button>

            <button
              onClick={handleOpenAddNewLink}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ وسيلة تواصل</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. بطاقة التعريف الشخصية والنبذة المختصرة */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-right">
          
          {/* صورة الأستاذ */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/50 bg-slate-950">
              <img 
                src={info.avatar} 
                alt={info.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl shadow-lg border border-slate-900" title="معلم معتمد">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* تفاصيل النبذة */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  التعريف بالأستاذ ومسيرته التعليمية
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                  {info.name}
                </h1>
              </div>

              {isDeveloper && (
                <button
                  onClick={handleOpenMainEdit}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 self-center md:self-start cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل النبذة</span>
                </button>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-300">
              {info.title}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              {info.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{info.experience}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{info.location}</span>
              </span>
            </div>
          </div>
        </div>

        {/* أرقام سريعة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-slate-800/80">
          {info.keyStats.map((stat, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                {stat.value}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. قسم قنوات التواصل المباشرة والواتساب والسوشيال ميديا */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              قنوات التواصل المباشرة وحسابات السوشيال ميديا
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              تواصل مع الأستاذ وفريق العمل مباشرة للمتابعة والدعم الأكاديمي.
            </p>
          </div>

          {isDeveloper && (
            <button
              onClick={handleOpenAddNewLink}
              className="py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وسيلة تواصل جديدة</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSocialLinks.map((item) => {
            const meta = getLinkMeta(item.iconType);
            const Icon = meta.icon;

            return (
              <div 
                key={item.id}
                className={`p-5 rounded-3xl bg-slate-900 border ${meta.borderColor} ${meta.bgHover} shadow-xl flex flex-col justify-between transition space-y-4 group relative`}
              >
                {/* Developer Quick Edit Button on Card */}
                {isDeveloper && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => handleOpenEditLink(item)}
                      className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1 cursor-pointer"
                      title="تعديل الرابط والمعلومات"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>تعديل الرابط</span>
                    </button>

                    <button
                      onClick={() => handleDeleteLink(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs transition cursor-pointer"
                      title="حذف هذه الوسيلة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${meta.textColor}`} />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <span className={`text-xs font-mono font-bold ${meta.textColor} block`} dir="ltr">
                    {item.handle}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r ${meta.color} text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer text-center`}
                >
                  <span>{item.actionLabel || 'تواصل الآن'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: تعديل رابط أو وسيلة تواصل محددة (Edit Single Social Link Modal) */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-lg w-full p-6 text-right space-y-5 shadow-2xl relative my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isAddingNewLink ? 'إضافة وسيلة تواصل وسوشيال ميديا جديدة' : `تعديل: ${linkForm.name}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingLink(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-3.5">
              
              {/* Type / Icon Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع القناة / الأيقونة:</label>
                <select
                  value={linkForm.iconType}
                  onChange={e => setLinkForm({ ...linkForm, iconType: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="whatsapp">واتساب (WhatsApp)</option>
                  <option value="youtube">يوتيوب (YouTube)</option>
                  <option value="telegram">تليجرام (Telegram)</option>
                  <option value="facebook">فيسبوك (Facebook)</option>
                  <option value="phone">اتصال هاتفي (Phone)</option>
                  <option value="website">موقع إلكتروني / رابط عام</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              {/* Title / Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم القناة / العنوان:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محادثة واتساب المباشرة أو قناة التليجرام"
                  value={linkForm.name}
                  onChange={e => setLinkForm({ ...linkForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Handle / Phone / Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المعرف / الرقم المعروض (Handle):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 01012345678 أو @TeacherName"
                  value={linkForm.handle}
                  onChange={e => setLinkForm({ ...linkForm, handle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوصف المختصر:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: للاستفسار عن مواعيد الحصص والاشتراكات"
                  value={linkForm.description}
                  onChange={e => setLinkForm({ ...linkForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* URL / Link */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>الرابط الفعلي (Target URL / Link):</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://wa.me/2010... أو https://youtube.com/..."
                  value={linkForm.url}
                  onChange={e => setLinkForm({ ...linkForm, url: e.target.value })}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Action Button Label */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص الزر:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تحدث عبر واتساب الآن أو الانضمام للقناة"
                  value={linkForm.actionLabel}
                  onChange={e => setLinkForm({ ...linkForm, actionLabel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 mt-4"
              >
                {isSaving ? (
                  <span>جاري حفظ الرابط في Firestore...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ وتحديث الرابط فوراً</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: تعديل بيانات ونبذة المعلم الكاملة */}
      {isMainEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 text-right space-y-5 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">تعديل صفحة وبيانات الأستاذ</h3>
              </div>
              <button
                onClick={() => setIsMainEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMainProfile} className="space-y-4 overflow-y-auto p-1 flex-1">
              
              {/* Avatar Upload */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                  <img src={mainEditForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="block text-xs font-bold text-slate-300">صورة الأستاذ الشخصية:</label>
                  <div className="flex gap-2">
                    <label className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer flex items-center gap-1.5 transition">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>رفع صورة من الجهاز</span>
                      <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الأستاذ:</label>
                <input
                  type="text"
                  required
                  value={mainEditForm.name}
                  onChange={e => setMainEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Title / Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المسمى الوظيفي / التخصص:</label>
                <input
                  type="text"
                  required
                  value={mainEditForm.title}
                  onChange={e => setMainEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">النبذة والتعريف المختصر:</label>
                <textarea
                  rows={3}
                  required
                  value={mainEditForm.bio}
                  onChange={e => setMainEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
              >
                {isSaving ? (
                  <span>جاري حفظ التعديلات في Firestore...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ ونشر التعديلات</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

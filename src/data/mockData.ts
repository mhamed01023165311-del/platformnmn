import { Course, QuizQuestion, PricingPlan, StudentRecord, UserProfile, WalletTransaction, VodafoneCashDepositRequest, VodafoneSMSMessage } from '../types';

export const SAMPLE_TEACHER_SMS_INBOX: VodafoneSMSMessage[] = [
  {
    id: 'sms-1',
    sender: 'VF-Cash',
    body: 'تم استلام مبلغ 550.00 جنيه مصري من رقم 01012345678. مصاريف الخدمة 0.00 جنيه. رصيدك الحالي هو 42,850.00 جنيه. رقم العملية: VF-994321 بتاريخ اليوم 14:18',
    receivedAt: 'اليوم 14:18',
    extractedAmount: 550,
    extractedPhone: '01012345678',
    extractedTxId: 'VF-994321',
    isMatched: false
  },
  {
    id: 'sms-2',
    sender: 'VF-Cash',
    body: 'تم استلام مبلغ 250.00 جنيه مصري من رقم 01077788990. مصاريف الخدمة 0.00 جنيه. رصيدك الحالي هو 42,300.00 جنيه. رقم العملية: VF-881240 بتاريخ اليوم 13:45',
    receivedAt: 'اليوم 13:45',
    extractedAmount: 250,
    extractedPhone: '01077788990',
    extractedTxId: 'VF-881240',
    isMatched: false
  },
  {
    id: 'sms-3',
    sender: 'VF-Cash',
    body: 'تم استلام مبلغ 850.00 جنيه مصري من رقم 01055566778. مصاريف الخدمة 0.00 جنيه. رصيدك الحالي هو 42,050.00 جنيه. رقم العملية: VF-773190 بتاريخ اليوم 12:30',
    receivedAt: 'اليوم 12:30',
    extractedAmount: 850,
    extractedPhone: '01055566778',
    extractedTxId: 'VF-773190',
    isMatched: false
  }
];

export const SAMPLE_RECEIPT_PRESETS = [
  {
    id: 'preset-match',
    name: 'إيصال مطابق تماماً (تحويل كورس 550 ج.م)',
    tag: 'تطابق 100% ⚡ اعتماد آلي فوري',
    phone: '01012345678',
    amount: 550,
    txId: 'VF-994321',
    time: 'اليوم 14:18',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    description: 'إيصال حقيقي يطابق رسالة الـ SMS ورقم هاتف الطالب والمبلغ بالتمام.'
  },
  {
    id: 'preset-mismatch',
    name: 'إيصال متناقض ومشكوك فيه (200 ج.م بدل 550)',
    tag: 'تناقض في المبلغ ⚠️ تحويل للمراجعة',
    phone: '01012345678',
    amount: 550, // student claims 550
    ocrAmount: 200, // but OCR reads 200
    txId: 'VF-331200',
    time: 'أمس 18:20',
    image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
    description: 'الطالب أدخل 550 ج.م لكن الذكاء الاصطناعي قرأ من الصورة 200 ج.م فقط.'
  },
  {
    id: 'preset-no-sms',
    name: 'إيصال برقم عملية غير مسجل في الـ SMS',
    tag: 'لم تصل رسالة الـ SMS بعد ⏳',
    phone: '01099988877',
    amount: 300,
    txId: 'VF-000999',
    time: 'منذ 5 دقائق',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
    description: 'تم التحويل ولكن رسالة فودافون كاش لم تصل هاتف المعلم بعد.'
  }
];

export const TEACHER_VODAFONE_CASH_CONFIG = {
  walletNumber: '010 9876 5432',
  accountHolder: 'أ.د. أحمد ممدوح النجار (الحساب الرسمي المعتمد)',
  ussdCodeTemplate: '*9*7*01098765432*{AMOUNT}#',
  minDeposit: 50,
  maxDeposit: 5000,
  supportPhone: '010 1234 5678',
  notes: [
    'تأكد من إرسال المبلغ من محفظة فودافون كاش مفعّلة حصراً.',
    'احتفظ برسالة التأكيد النصية (SMS) التي تحتوي على رقم العملية والمبلغ.',
    'يتم تأكيد الطلب وإضافة الرصيد إلى محفظتك الرقمية خلال 5 إلى 15 دقيقة بعد مراجعة العملية من الإدارة.'
  ]
};

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'std-current',
  name: 'عمر شريف إبراهيم',
  email: 'omar.sherif2026@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  phone: '01012345678',
  parentPhone: '01098765432',
  grade: 'الصف الثالث الثانوي',
  walletBalance: 300, // Starts at 300 EGP: course is 550 EGP, letting user see "insufficient funds" or charge up!
  enrolledCourseIds: [],
  authProvider: 'google'
};

export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-101',
    type: 'bonus',
    amount: 100,
    description: 'مكافأة تسجيل حساب طالب جديد وتفعيل المحفظة',
    status: 'completed',
    date: '2026-10-01 10:30'
  },
  {
    id: 'tx-102',
    type: 'deposit_vodafone_cash',
    amount: 200,
    description: 'شحن رصيد محفظة عبر فودافون كاش (عملية #VF-88210)',
    status: 'completed',
    referenceId: 'VF-88210',
    date: '2026-10-03 14:15'
  }
];

export const INITIAL_DEPOSIT_REQUESTS: VodafoneCashDepositRequest[] = [
  {
    id: 'dep-201',
    studentId: 'std-103',
    studentName: 'يوسف حازم قاسم',
    studentEmail: 'youssef.hazem@gmail.com',
    senderPhone: '01055566778',
    amount: 550,
    transactionId: 'VF-994321',
    teacherWalletPhone: '010 9876 5432',
    status: 'pending',
    createdAt: 'منذ 12 دقيقة',
    notes: 'تم التحويل لحساب كورس الفيزياء كاملاً'
  },
  {
    id: 'dep-202',
    studentId: 'std-104',
    studentName: 'ندى محمد عبد الرازق',
    studentEmail: 'nada.razek@gmail.com',
    senderPhone: '01077788990',
    amount: 250,
    transactionId: 'VF-881240',
    teacherWalletPhone: '010 9876 5432',
    status: 'pending',
    createdAt: 'منذ 35 دقيقة',
    notes: 'اشتراك شهري لشهر أكتوبر'
  },
  {
    id: 'dep-200',
    studentId: 'std-current',
    studentName: 'عمر شريف إبراهيم',
    studentEmail: 'omar.sherif2026@gmail.com',
    senderPhone: '01012345678',
    amount: 200,
    transactionId: 'VF-88210',
    teacherWalletPhone: '010 9876 5432',
    status: 'approved',
    createdAt: 'منذ 3 أيام',
    processedAt: 'تم التأكيد وإضافة الرصيد'
  }
];

export const COURSES_DATA: Course[] = [
  {
    id: 'phys-3sec-comprehensive',
    title: 'الفيزياء الحديثة والكهربية للثانوية العامة (دفعة 2026)',
    gradeLevel: 'third_secondary',
    gradeTitle: 'الصف الثالث الثانوي',
    subject: 'الفيزياء العامة والتطبيقية',
    instructor: 'أ. د. أحمد ممدوح النجار',
    instructorTitle: 'خبير تدريس الفيزياء ومؤلف سلسلة المعلم للفيزياء',
    badge: 'الأكثر طلباً وتفوقاً 🔥',
    rating: 4.96,
    studentsCount: 14850,
    totalWeeks: 32,
    totalModules: 8,
    totalLessons: 64,
    totalHours: '110 ساعة تدريبية',
    originalPrice: 850,
    discountedPrice: 550,
    currency: 'ج.م',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80',
    overview: 'منهج الفيزياء الكامل للثانوية العامة مصمم طبقاً لأحدث معايير نواتج التعلم ووزارة التربية والتعليم، يربط الفهم العميق للظواهر بحل أكثر من 3000 مسألة متدرجة من مستويات الفهم حتى الإبداع.',
    modules: [
      {
        id: 'mod-1',
        moduleNumber: 1,
        title: 'الوحدة الأولى: التيار الكهربي وقانون أوم وقوانين كيرشوف',
        description: 'تأسيس عميق لمفاهيم شدة التيار، فرق الجهد، المقاومة النوعية والتوصيلية الكهربية، مع تحليل الدوائر المعقدة بطرق اختزال وكيرشوف.',
        totalHours: '16 ساعة شرح وحل',
        lessons: [
          {
            id: 'les-1',
            weekNumber: 1,
            title: 'الأسبوع الأول: المفهوم الفيزيائي للتيار الكهربي وقانون أوم',
            duration: '115 دقيقة',
            isFreePreview: true,
            quizId: 'quiz-physics-week1',
            objectives: [
              'استنتاج العلاقة الرياضية لشدة التيار كدالة في كمية الشحنة والزمن (I = Q/t).',
              'التمييز بين الاتجاه الفعلي (الإلكتروني) والاتجاه التقليدي (الاصطلاحي) للتيار.',
              'تفسير المقاومة الكهربية من منظور حركة الإلكترونات وتصادمها مع ذرات الموصل.',
              'حساب المقاومة النوعية والتوصيلية الكهربية وتأثير درجة الحرارة عليهما.'
            ],
            explanationMethod: {
              videoDuration: 'ساعة و 45 دقيقة (جودة 4K مع رسومات ثلاثية الأبعاد لمحاكاة تدفق الشحنات)',
              videoQuality: '4K HLS مشفر بعلامة مائية ديناميكية',
              pdfPages: 28,
              exercisesCount: 45,
              description: 'شرح نظري مدعم بتجارب بصرية معملية + حل مسائل كتاب الوزارة وبنك المعرفة خطوة بخطوة.'
            },
            resources: [
              { type: 'video', title: 'محاضرة الفيديو التأسيسية عالية الدقة', durationOrPages: '1:45:00', url: '#' },
              { type: 'pdf', title: 'مذكرة الأسبوع الأول: ملخص المفاهيم والقوانين', durationOrPages: '28 صفحة', downloadable: true },
              { type: 'exercise', title: 'واجب إلكتروني تفاعلي متدرج الصعوبة', durationOrPages: '45 سؤال' },
              { type: 'summary', title: 'خريطة ذهنية (Mind Map) لتلخيص الدرس في صفحة واحدة', durationOrPages: 'PDF ملخص' }
            ]
          },
          {
            id: 'les-2',
            weekNumber: 2,
            title: 'الأسبوع الثاني: طرق توصيل المقاومات (التوالي والتوازي وحالات إلغاء المقاومة)',
            duration: '130 دقيقة',
            quizId: 'quiz-physics-week2',
            objectives: [
              'استنتاج المقاومة المكافئة لمجموعة مقاومات على التوالي والتوازي ببرهان رياضي.',
              'إتقان طريقة الترقيم (Node Voltage Numbering) لتبسيط أعقد الدوائر الكهربية.',
              'تحديد شروط إلغاء المقاومة الكهربية (تساوي فروق الجهد ووجود سلك عديم المقاومة).',
              'حل مسائل تقسيم التيار الكهربي على الفروع المتوازية بدقة بالغة وبأقصر الطرق.'
            ],
            explanationMethod: {
              videoDuration: 'ساعتان و 10 دقائق (تحليل دقيق لأكثر من 30 مسألة فكر عالي)',
              videoQuality: '4K HLS مشفر بعلامة مائية ديناميكية',
              pdfPages: 36,
              exercisesCount: 60,
              description: 'استراتيجية الخطوات الثلاث لتبسيط الدوائر الكهربية المعقدة مع أسئلة امتحانات سابقة.'
            },
            resources: [
              { type: 'video', title: 'محاضرة توصيل المقاومات وطريقة الترقيم', durationOrPages: '2:10:00' },
              { type: 'pdf', title: 'مذكرة بنك أفكار التوالي والتوازي وتطبيقات كيرشوف', durationOrPages: '36 صفحة', downloadable: true },
              { type: 'exercise', title: 'تحدي الأوائل: 60 سؤال بنمط الثانوية العامة الجديد', durationOrPages: '60 سؤال' }
            ]
          },
          {
            id: 'les-3',
            weekNumber: 3,
            title: 'الأسبوع الثالث: قانون أوم للدائرة المغلقة وقوانين كيرشوف للأفرع المتشعبة',
            duration: '140 دقيقة',
            objectives: [
              'فهم العلاقة العكسية بين المقاومة وفرق الجهد بين قطبي البطارية (الهبوط في الجهد).',
              'تطبيق قانون حفظ الشحنة (كيرشوف الأول) وقانون حفظ الطاقة (كيرشوف الثاني).',
              'حل المعادلات الخطية الثلاث باستخدام الآلة الحاسبة لاختزال زمن الحل.'
            ],
            explanationMethod: {
              videoDuration: 'ساعتان و 20 دقيقة (حل أمثلة امتحانات الأعوام السابقة 2021-2025)',
              videoQuality: '4K HLS مشفر',
              pdfPages: 42,
              exercisesCount: 55,
              description: 'شرح تطبيقي مع نماذج دوائر بطاريات متعددة وحالات الشحن والتفريغ.'
            },
            resources: [
              { type: 'video', title: 'محاضرة كيرشوف المتقدمة وإشارات الجهود', durationOrPages: '2:20:00' },
              { type: 'pdf', title: 'ملحق شفرات كيرشوف في 10 دقائق', durationOrPages: '42 صفحة' },
              { type: 'exercise', title: 'امتحان شامل على الوحدة الأولى (MCQ)', durationOrPages: '50 سؤال' }
            ]
          }
        ]
      },
      {
        id: 'mod-2',
        moduleNumber: 2,
        title: 'الوحدة الثانية: التأثير المغناطيسي للتيار الكهربي وأجهزة القياس',
        description: 'دراسة المجال المغناطيسي لسلك مستقيم وملف دائري ولولبي، عزم الازدواج، وأجهزة الجلفانومتر، الأميتر، الفولتميتر، والأوميتر.',
        totalHours: '18 ساعة شرح وتطبيقات',
        lessons: [
          {
            id: 'les-4',
            weekNumber: 4,
            title: 'الأسبوع الرابع: المجال المغناطيسي لسلك مستقيم وملف دائري ولولبي',
            duration: '120 دقيقة',
            objectives: [
              'استخدام قواعد اليد اليمنى لأمبير والبريمة لتحديد اتجاه خطوط الفيض المغناطيسي.',
              'حساب كثافة الفيض المغناطيسي عند نقطة ومعرفة نقاط التعادل (Neutral Points).'
            ],
            explanationMethod: {
              videoDuration: 'ساعتان كاملتان',
              videoQuality: '4K HLS',
              pdfPages: 32,
              exercisesCount: 50,
              description: 'محاكاة تفاعلية ثلاثية الأبعاد لحركة خطوط الفيض المغناطيسي في الفراغ.'
            },
            resources: [
              { type: 'video', title: 'محاضرة التأثير المغناطيسي وقواعد تحديد الاتجاه', durationOrPages: '2:00:00' },
              { type: 'pdf', title: 'مذكرة نقاط التعادل وحسابات كثافة الفيض', durationOrPages: '32 صفحة' }
            ]
          }
        ]
      },
      {
        id: 'mod-3',
        moduleNumber: 3,
        title: 'الوحدة الثالثة: الحث الكهرومغناطيسي والدينامو والمحول',
        description: 'قانون فاراداي، قاعدة لينز، الحث الذاتي والمتبادل، المولد الكهربي (الدينامو)، المحول والمحرك الكهربي.',
        totalHours: '22 ساعة شرح تفصيلي',
        lessons: [
          {
            id: 'les-5',
            weekNumber: 5,
            title: 'الأسبوع الخامس: قانون فاراداي وقاعدة لينز وتطبيقات الحث',
            duration: '135 دقيقة',
            objectives: [
              'استنتاج القوة الدافعة الكهربية المستحثة المتولدة في ملف وسلك متحرك.',
              'تطبيق قاعدة لينز لتحديد اتجاه التيار المستحث بدقة دون التباس.'
            ],
            explanationMethod: {
              videoDuration: 'ساعتان و 15 دقيقة',
              videoQuality: '4K HLS',
              pdfPages: 38,
              exercisesCount: 50,
              description: 'تجارب تفاعلية ورسوم بيانية توضح تغير الفيض مع الزمن والزاوية.'
            },
            resources: [
              { type: 'video', title: 'محاضرة الحث الكهرومغناطيسي وفاراداي', durationOrPages: '2:15:00' },
              { type: 'pdf', title: 'مذكرة الحث الكهرومغناطيسي والرسوم البيانية', durationOrPages: '38 صفحة' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'chem-3sec-excellence',
    title: 'الكيمياء العضوية وغير العضوية الحديثة للثانوية العامة',
    gradeLevel: 'third_secondary',
    gradeTitle: 'الصف الثالث الثانوي',
    subject: 'الكيمياء العامة والعضوية',
    instructor: 'د. سامح عبد الفتاح',
    instructorTitle: 'كبير معلمي الكيمياء ومؤسس أكاديمية الرواد',
    badge: 'كورس متميز 🧪',
    rating: 4.92,
    studentsCount: 9400,
    totalWeeks: 30,
    totalModules: 5,
    totalLessons: 60,
    totalHours: '95 ساعة تدريبية',
    originalPrice: 800,
    discountedPrice: 500,
    currency: 'ج.م',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    overview: 'تفكيك الكيمياء العضوية والمعادلات من الحفظ الأصم إلى الفهم المنطقي، مع خرائط التفاعلات السحرية ومحاضرات التدريب على استنتاج الصيغ الجزيئية والبنائية.',
    modules: [
      {
        id: 'mod-c1',
        moduleNumber: 1,
        title: 'الوحدة الأولى: العناصر الانتقالية وسبائك الحديد وتفاعلاتها',
        description: 'الخواص الكيميائية والمغناطيسية لعناصر السلسلة الانتقالية الأولى، واستخلاص وتفاعلات أكاسيد الحديد.',
        totalHours: '18 ساعة',
        lessons: [
          {
            id: 'les-c1',
            weekNumber: 1,
            title: 'الأسبوع الأول: التوزيع الإلكتروني وحالات التأكسد الشائعة',
            duration: '110 دقيقة',
            objectives: [
              'تحديد الخواص البارامغناطيسية والدايامغناطيسية بناءً على الإلكترونات المفردة.',
              'استنتاج استقرار الأيونات عند امتلاء أو نصف امتلاء المستوى الفرعي 3d.'
            ],
            explanationMethod: {
              videoDuration: 'ساعة و 50 دقيقة',
              videoQuality: '4K HLS',
              pdfPages: 30,
              exercisesCount: 40,
              description: 'شرح مع مخططات ألوان الأيونات وعزمها المغناطيسي.'
            },
            resources: [
              { type: 'video', title: 'محاضرة العناصر الانتقالية وحالات التأكسد', durationOrPages: '1:50:00' },
              { type: 'pdf', title: 'مذكرة مخطط تفاعلات الحديد وأكاسيده', durationOrPages: '30 صفحة' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'math-calc-3sec',
    title: 'التفاضل والتكامل والهندسة الفراغية - دفعة الإتقان الرياضي',
    gradeLevel: 'third_secondary',
    gradeTitle: 'الصف الثالث الثانوي (علمي رياضة)',
    subject: 'الرياضيات البحتة والتطبيقية',
    instructor: 'م. حسام الصياد',
    instructorTitle: 'مهندس ومحاضر الأولمبياد الرياضي وموجه الرياضيات',
    badge: 'شرح استثنائي 📐',
    rating: 4.98,
    studentsCount: 7850,
    totalWeeks: 32,
    totalModules: 6,
    totalLessons: 64,
    totalHours: '120 ساعة تدريبية',
    originalPrice: 900,
    discountedPrice: 600,
    currency: 'ج.م',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    overview: 'منهج التفاضل والتكامل كاملاً من المشتقات العليا ومعادلات المماس والعمودي، وحتى المعدلات الزمنية المرتبطة ورسم المنحنيات والمساحات والحجوم الدورانية.',
    modules: [
      {
        id: 'mod-m1',
        moduleNumber: 1,
        title: 'الوحدة الأولى: اشتقاق الدوال المثلثية والمشتقات العليا',
        description: 'اشتقاق مقلوب الدوال المثلثية، الاشتقاق البارامتري والضمني، ومعادلة المماس والعمودي.',
        totalHours: '20 ساعة',
        lessons: [
          {
            id: 'les-m1',
            weekNumber: 1,
            title: 'الأسبوع الأول: اشتقاق الدوال المثلثية (القا، القتا، والظتا)',
            duration: '125 دقيقة',
            objectives: [
              'إثبات مشتقات دوال القلوب المثلثية باستخدام قاعدة القسمة وسلسلة الدوال.',
              'حل مسائل النهايات المرتبطة باشتقاق الدوال المثلثية بسرعة فائقة.'
            ],
            explanationMethod: {
              videoDuration: 'ساعتان و 5 دقائق',
              videoQuality: '4K HLS',
              pdfPages: 35,
              exercisesCount: 50,
              description: 'حل أكثر من 40 تدريباً على التباديل والتوافيق واشتقاق الدوال المعقدة.'
            },
            resources: [
              { type: 'video', title: 'محاضرة اشتقاق الدوال المثلثية والقواعد الأساسية', durationOrPages: '2:05:00' },
              { type: 'pdf', title: 'ملخص قوانين حساب المثلثات والتفاضل', durationOrPages: '35 صفحة' }
            ]
          }
        ]
      }
    ]
  }
];

export const SMART_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    questionNumber: 1,
    lessonReference: 'الأسبوع الأول: المقاومة الكهربية وقانون أوم',
    difficulty: 'medium',
    questionText: 'سلك نحاسي أسطواني الشكل تم سحبه بانتظام حتى زاد طوله بنسبة 20%، فما هي النسبة المئوية التقريبية للزيادة في مقاومته الكهربية (مع ثبوت الحجم ودرجة الحرارة)؟',
    options: [
      { id: 'opt_a', text: 'أ) تزداد المقاومة بنسبة 20%' },
      { id: 'opt_b', text: 'ب) تزداد المقاومة بنسبة 44%' },
      { id: 'opt_c', text: 'ج) تزداد المقاومة بنسبة 40%' },
      { id: 'opt_d', text: 'د) تظل المقاومة ثابتة لأن المادة لم تتغير' }
    ],
    correctOptionId: 'opt_b',
    conceptFormula: 'R ∝ L² (عند ثبوت الحجم والكتلة: R = ρₑ · L / A = ρₑ · L² / Vol)',
    explanation: 'عند سحب السلك، يظل حجمه ثابتاً (Vol = A · L = ثا). إذا زاد الطول بنسبة 20%، فإن الطول الجديد L₂ = 1.2 L₁. وحيث إن مساحة المقطع تتناقص بنفس النسبة (A₂ = A₁ / 1.2)، تصبح المقاومة الجديدة R₂ = (1.2)² · R₁ = 1.44 R₁. وبالتالي فإن مقدار الزيادة في المقاومة هو ΔR = R₂ - R₁ = 0.44 R₁، أي زيادة قدرها 44% بالضبط.',
    feedbacks: {
      opt_a: '⚠️ خطأ شائع: اعتبرت أن المقاومة تتناسب طردياً فقط مع الطول، وأهملت أن مساحة المقطع قد تناقصت عند السحب للحفاظ على ثبات حجم السلك.',
      opt_b: '✅ إجابة نموذجية ممتازة! طبقّت مفهوم ثبوت الحجم وأن (R₂/R₁) = (L₂/L₁)² = (1.2)² = 1.44، أي أن الزيادة هي 44%.',
      opt_c: '❌ غير صحيح: قمت بمضاعفة نسبة الزيادة دون أخذ التربيع الحقيقي في الاعتبار (1.2² = 1.44 وليس 1.40).',
      opt_d: '❌ خطأ فادح: المقاومة النوعية (ρₑ) هي فقط التي تظل ثابتة لثبات المادة، أما المقاومة الكهربية (R) فتتغير حتماً بتغير الأبعاد الهندسية.'
    }
  },
  {
    id: 'q2',
    questionNumber: 2,
    lessonReference: 'الأسبوع الثاني: طرق توصيل المقاومات والتجزئة',
    difficulty: 'hard',
    questionText: 'وصلت ثلاث مقاومات متماثلة قيمة كل منها (R) معاً في دائرة كهربية. أي من التشكيلات الآتية تعطي مقاومة مكافئة قيمتها (1.5 R)؟',
    options: [
      { id: 'opt_a', text: 'أ) توصيل الثلاث مقاومات على التوالي' },
      { id: 'opt_b', text: 'ب) توصيل مقاومة على التوالي مع مقاومتين متصلتين على التوازي' },
      { id: 'opt_c', text: 'ج) توصيل الثلاث مقاومات على التوازي' },
      { id: 'opt_d', text: 'د) توصيل مقاومتين على التوالي بالتوازي مع المقاومة الثالثة' }
    ],
    correctOptionId: 'opt_b',
    conceptFormula: 'R_eq = R + (R // R) = R + (R / 2) = 1.5 R',
    explanation: 'عند توصيل مقاومتين على التوازي تكون محصلتهما المكافئة R/2 = 0.5R. وبإضافة المقاومة الثالثة معهما على التوالي تصبح المقاومة الكلية: R_eq = R + 0.5R = 1.5R، وهو المطلوب بالضبط.',
    feedbacks: {
      opt_a: '❌ غير صحيح: توصيل 3 مقاومات متماثلة على التوالي يعطي 3R وليس 1.5R.',
      opt_b: '✅ أحسنت عملاً! مقاومتان توازي قيمتهما 0.5R، مع مقاومة توالي R يعطي المحصلة 1.5R.',
      opt_c: '❌ غير صحيح: توصيل 3 مقاومات متماثلة على التوازي يعطي R/3 = 0.33R.',
      opt_d: '❌ خطأ: هذا التشكيل يعطي (2R × R) / (2R + R) = 2/3 R = 0.67R.'
    }
  },
  {
    id: 'q3',
    questionNumber: 3,
    lessonReference: 'الأسبوع الأول: قانون أوم والمقاومة النوعية',
    difficulty: 'easy',
    questionText: 'إذا زادت شدة التيار الكهربي المار في موصل أومي للضعف عند ثبوت درجة الحرارة، فماذا يحدث لمقاومته الكهربية (R)؟',
    options: [
      { id: 'opt_a', text: 'أ) تزداد للضعف' },
      { id: 'opt_b', text: 'ب) تقل إلى النصف' },
      { id: 'opt_c', text: 'ج) تظل ثابتة لا تتغير' },
      { id: 'opt_d', text: 'د) تزداد لأربعة أمثالها' }
    ],
    correctOptionId: 'opt_c',
    conceptFormula: 'R = ρₑ · (L / A) | المقاومة تسبب انخفاض التيار ولا تتأثر به',
    explanation: 'مقاومة الموصل تعتمد فقط على خواص الموصل نفسه (نوع المادة، الطول، مساحة المقطع، ودرجة الحرارة). تغير شدة التيار ينتج عن تغير فرق الجهد المؤثر وليس بسبب تغير المقاومة نفسها. المقاومة هي التي تتحكم في التيار وليس العكس!',
    feedbacks: {
      opt_a: '⚠️ خطأ شائع جداً: تظن أن قانون R = V/I يعني أن R تتغير بتغير I. المقاومة تظل ثابتة والجهد هو الذي يتضاعف طردياً مع التيار.',
      opt_b: '❌ غير صحيح: المقاومة لا تقل، فالمقاومة خاصية هندسية وفيزيائية للموصل ما دامت درجة الحرارة ثابتة.',
      opt_c: '✅ إجابة علمية دقيقة وواعية! المقاومة تؤثر في التيار ولكن التيار لا يؤثر في قيمة المقاومة.',
      opt_d: '❌ غير صحيح: القدرة الكهربية المستنفذة (P = I²R) هي التي تزداد 4 أمثال، وليس المقاومة.'
    }
  },
  {
    id: 'q4',
    questionNumber: 4,
    lessonReference: 'الأسبوع الثالث: قانون أوم للدائرة المغلقة',
    difficulty: 'hard',
    questionText: 'في دائرة كهربية تحتوي على بطارية لها مقاومة داخلية (r) متصلة بمقاومة متغيرة (ريوستات R)، عند زيادة قيمة المقاومة R، ماذا يحدث لقراءة فولتميتر متصل بين قطبي البطارية؟',
    options: [
      { id: 'opt_a', text: 'أ) تقل قراءة الفولتميتر' },
      { id: 'opt_b', text: 'ب) تزداد قراءة الفولتميتر وتقترب من القوة الدافعة V_B' },
      { id: 'opt_c', text: 'ج) تظل قراءة الفولتميتر ثابتة دائماً' },
      { id: 'opt_d', text: 'د) تنعدم قراءة الفولتميتر وتصبح صفراً' }
    ],
    correctOptionId: 'opt_b',
    conceptFormula: 'V = V_B - I · r (علاقة تناقصية بين فرق الجهد وشده التيار)',
    explanation: 'فرق الجهد بين قطبي البطارية يُعطى بالعلاقة: V = V_B - I · r. عند زيادة المقاومة الخارجية R، تقل شدة التيار الكلي I في الدائرة. وبنقصان التيار يقل مقدار الهبوط في الجهد الداخلي (I · r)، وبالتالي تزداد قراءة الفولتميتر V وتقترب من القيمة العظمى V_B.',
    feedbacks: {
      opt_a: '❌ خطأ: العلاقة بين قراءة الفولتميتر بين قطبي البطارية وتيار الدائرة علاقة تناقصية، فنقص التيار يزيد قراءة الفولتميتر.',
      opt_b: '✅ رائع وعبقري! قانون أوم للدائرة المغلقة V = V_B - Ir، بنقصان التيار يقل الهبوط في الجهد فيزداد V.',
      opt_c: '❌ غير صحيح: تظل ثابتة فقط إذا كانت المقاومة الداخلية مهملة تماماً (r = 0)، ولكن السؤال حدد أن للبطارية مقاومة داخلية.',
      opt_d: '❌ غير صحيح: الفولتميتر لا ينعدم إلا إذا أصبحت الدائرة قصيرة جداً (Short Circuit) ومقاومة الحمل صفر.'
    }
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan-course',
    name: 'باقة الكورس المنفرد',
    tagline: 'مثالية للطلاب الراغبين في تقوية وحدة أو مادة محددة',
    price: 550,
    period: 'تدفع لمرة واحدة للكورس كاملاً',
    colorScheme: 'indigo',
    suitableFor: 'الطلاب الذين يحتاجون دراسة مادة محددة فقط',
    features: [
      'وصول غير محدود لجميع فيديوهات الكورس بجودة 4K طوال العام',
      'تحميل جميع مذكرات الشرح والملخصات بتنسيق PDF',
      'حل الواجبات الأسبوعية وتصحيحها إلكترونياً فورياً',
      'دخول بنك أسئلة الكورس والامتحانات التراكمية',
      'حماية كاملة للجلسة بعلامة مائية رقمية'
    ],
    limitations: [
      'لا يشمل حصص المراجعة النهائية الحية عبر Zoom',
      'المتابعة الهاتفية مع مساعد المعلم مقتصرة على منصة الأسئلة'
    ]
  },
  {
    id: 'plan-monthly',
    name: 'باقة الاشتراك الشهري المتجدد',
    tagline: 'مرونة الدفع شهراً بشهر مع إمكانية الإلغاء بأي وقت',
    price: 250,
    period: 'شهرياً مع تجديد تلقائي أو يدوي',
    popular: true,
    colorScheme: 'emerald',
    suitableFor: 'أكثر من 70% من الطلاب لمرونة الميزانية والالتزام الدراسي',
    features: [
      'حضور 4 أسابيع دراسية مكثفة شهرياً في المادة',
      'امتحان أسبوعي إجباري مع إعلان كشف الأوائل',
      'دعم واستفسارات علمية عبر شات المنصة مع المعلم ومساعديه',
      'تقرير أداء تفصيلي يُرسل لولي الأمر شهرياً عبر واتساب',
      'تحديثات ومذكرات حصرية لكل درس أسبوعياً'
    ],
    limitations: [
      'يتوقف الوصول للمحتوى في حال عدم سداد اشتراك الشهر الجديد'
    ]
  },
  {
    id: 'plan-semester',
    name: 'باقة الترم الكامل الشاملة',
    tagline: 'وفّر 35% واحصل على حزمة التدريب والمراجعات كاملة',
    price: 1100,
    period: 'للفصل الدراسي كاملاً (توفير 550 ج.م)',
    colorScheme: 'amber',
    suitableFor: 'الطلاب وأولياء الأمور الباحثين عن راحة البال والاستقرار لنهاية الترم',
    features: [
      'جميع محاضرات الفصل الدراسي كاملاً دون انقطاع',
      'شامل كورس المراجعة النهائية ليلة الامتحان مجاناً',
      'توصيل النسخة الورقية الفاخرة من المذكرات للمنزل مجاناً',
      'جلسات زووم تفاعلية نصف شهرية لحل أسئلة الطلاب الصعبة',
      'بنك أسئلة محاكاة امتحانات الوزارة الرسمية مع الحل النموذجي',
      'أولوية الإجابة على الأسئلة في أقل من ساعتين'
    ]
  },
  {
    id: 'plan-vip',
    name: 'باقة النخبة VIP مع الإشراف الخاص',
    tagline: 'مرافقة فردية ومتابعة خاصة لضمان الحصول على الدرجة النهائية',
    price: 1850,
    period: 'للفصل الدراسي (مقاعد محدودة لـ 50 طالباً فقط)',
    colorScheme: 'purple',
    suitableFor: 'الطلاب الطامحين لأوائل الجمهورية وكليات القمة',
    features: [
      'كل مميزات باقة الترم الشاملة',
      'جلسة فردية أسبوعية 1-on-1 مع المعلم أو كبير المساعدين للمراجعة',
      'تخطيط جدول استذكار خاص وتحديد نقاط الضعف أسبوعياً',
      'خط واتساب خاص مباشر مع د. أحمد ممدوح شخصياً',
      'اتصال هاتفي دوري بولي الأمر كل أسبوعين لإحاطته بمستوى الطالب',
      'تصحيح مقالي يدوي مفصل لجميع الإجابات مع توجيهات كتابية'
    ]
  }
];

export const MOCK_STUDENTS: StudentRecord[] = [
  {
    id: 'std-101',
    name: 'عمر شريف إبراهيم',
    phone: '01012345678',
    parentPhone: '01098765432',
    grade: 'الصف الثالث الثانوي',
    enrolledCourse: 'الفيزياء الحديثة والكهربية 2026',
    progressPercentage: 88,
    quizAverage: 94,
    lastActive: 'منذ 15 دقيقة',
    paymentStatus: 'paid'
  },
  {
    id: 'std-102',
    name: 'مريم طارق العوضي',
    phone: '01123456789',
    parentPhone: '01187654321',
    grade: 'الصف الثالث الثانوي',
    enrolledCourse: 'الفيزياء الحديثة والكهربية 2026',
    progressPercentage: 95,
    quizAverage: 98,
    lastActive: 'منذ ساعة',
    paymentStatus: 'paid'
  },
  {
    id: 'std-103',
    name: 'يوسف حازم قاسم',
    phone: '01234567890',
    parentPhone: '01298765430',
    grade: 'الصف الثالث الثانوي',
    enrolledCourse: 'التفاضل والتكامل والهندسة الفراغية',
    progressPercentage: 42,
    quizAverage: 62,
    lastActive: 'منذ يومين',
    paymentStatus: 'paid',
    suspiciousDeviceAlert: true
  },
  {
    id: 'std-104',
    name: 'ندى محمد عبد الرازق',
    phone: '01512344321',
    parentPhone: '01598761234',
    grade: 'الصف الثاني الثانوي',
    enrolledCourse: 'الكيمياء العضوية وغير العضوية',
    progressPercentage: 74,
    quizAverage: 89,
    lastActive: 'منذ 4 ساعات',
    paymentStatus: 'pending'
  }
];

export const SECURITY_FEATURES_GUIDE = [
  {
    title: 'العلامة المائية الرقمية الحية (Dynamic Forensic Watermark)',
    tag: 'مستوى حماية عتادي فوري',
    icon: 'ShieldCheck',
    color: 'emerald',
    description: 'يتم حقن نص مائي شفاف ومتحرك فوق الفيديو يحمل (الاسم الكامل للطالب، رقم هاتفه، رقم الآي بي IP الخاص به، وبصمة الجلسة Session ID). تتحرك العلامة عشوائياً كل 15 ثانية وتغير شفافيتها مما يجعل أي تصوير بالموبايل أو برنامج تسجيل شاشة يكشف فوراً هوية المسرب ويؤدي لحظياً لإيقاف حسابه وتتبعه قانونياً.'
  },
  {
    title: 'تشفير الفيديو بتقنية HLS DRM (Apple FairPlay & Widevine)',
    tag: 'منع تحميل الملفات',
    icon: 'Lock',
    color: 'indigo',
    description: 'لا يتم تقديم الفيديو كملف MP4 مباشر أبداً. يتم تقطيع الفيديو إلى أجزاء مجزأة مشفرة بتشفير عسكري AES-128، مع توليد مفاتيح فك تشفير مؤقتة صالحة لمدة دقيقة واحدة فقط ومربوطة بـ Cookie مشفرة لا تسمح بأي أداة مثل IDM أو مشغلات الفيديو الخارجية بسحب المحتوى.'
  },
  {
    title: 'قفل الجلسة المفردة وبصمة المتصفح (Single Concurrent Session Lock)',
    tag: 'منع مشاركة الحسابات',
    icon: 'Smartphone',
    color: 'amber',
    description: 'تطبيق آلية فحص الجلسات في الوقت الفعلي عبر WebSockets/Tokens. في حال قام الطالب بفتح الحساب من جهاز أو متصفح ثانٍ لمشاركة الحساب مع زميله، يتم فوراً تسجيل خروج الجهاز الأول وإرسال رسالة تحذير لولي الأمر تسجل الموقع الجغرافي ونوع الجهاز.'
  },
  {
    title: 'رصد وتعطيل أدوات تسجيل الشاشة وتطبيقات الـ Screen Capture',
    tag: 'حظر الـ Screen Recorder',
    icon: 'EyeOff',
    color: 'rose',
    description: 'استخدام واجهات برمجية في المتصفح لرصد محاولة أخذ لقطة شاشة أو بدء مشاركة شاشة (Screen Capture API / PrintScreen detection)، حيث يتحول مشغل الفيديو تلقائياً إلى شاشة سوداء مع صوت تنبيهي وتجميد مؤقت للحساب لحين مراجعة الإدارة.'
  }
];

export const PAYMENT_GATEWAYS_GUIDE = [
  {
    name: 'المحافظ الإلكترونية وفودافون كاش (Vodafone Cash & Wallets)',
    badge: 'الأكثر شعبية في مصر',
    coverage: 'أكثر من 85% من معاملات الطلاب',
    method: 'تحويل لحظي للمحفظة مع إرفاق سكرين شوت أو كود فوري يتم تأكيده آلياً بواسطة Webhook خلال ثوانٍ معدودة.'
  },
  {
    name: 'شبكة فوري وأمان ومصاري (Fawry / Aman Pay)',
    badge: 'دفع نقدي في أقرب منفذ',
    coverage: 'لجميع الطلاب بدون بطاقات بنكية',
    method: 'إصدار رقم مرجعي (Reference Code) ينتهي خلال 48 ساعة، يقوم الطالب أو ولي أمره بالدفع في أي محل تجاري وتفعيل الكورس تلقائياً.'
  },
  {
    name: 'البطاقات البنكية ومدى و Apple Pay (Paymob / Tap / Stripe)',
    badge: 'دفع لحظي آمن',
    coverage: 'فيزا، ماستركارد، بطاقات ميزة، ومدى في الخليج',
    method: 'تكامل مباشر عبر بوابات معتمدة متوافقة مع معايير PCI-DSS لفتح الكورس للطالب فور إتمام العملية بدون تدخل بشري.'
  }
];

export type PageId = 'home' | 'curriculum' | 'courses' | 'my_courses' | 'wallet' | 'quiz' | 'pricing' | 'security' | 'teacher' | 'backend_api' | 'profile' | 'admin_students';

export interface TeacherSocialLink {
  id: string;
  name: string;
  handle: string;
  description: string;
  url: string;
  iconType: 'whatsapp' | 'youtube' | 'telegram' | 'facebook' | 'phone' | 'website' | 'other';
  actionLabel: string;
}

export interface TeacherProfileData {
  name: string;
  title: string;
  experience: string;
  location: string;
  bio: string;
  avatar: string;
  whatsapp?: string;
  youtube?: string;
  telegram?: string;
  facebook?: string;
  phone?: string;
  socialLinks?: TeacherSocialLink[];
  keyStats: { label: string; value: string }[];
}

export interface UserProfile {
  id: string;
  studentCode?: string;
  name: string;
  email: string;
  avatar?: string;
  phone: string;
  parentPhone?: string;
  grade: string;
  walletBalance: number;
  enrolledCourseIds: string[];
  authProvider: 'google' | 'phone';
}

export interface WalletTransaction {
  id: string;
  type: 'deposit_vodafone_cash' | 'course_purchase' | 'refund' | 'bonus';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'rejected';
  date: string;
  referenceId?: string;
  courseId?: string;
}

export interface VodafoneSMSMessage {
  id: string;
  sender: string;
  body: string;
  receivedAt: string;
  extractedAmount: number;
  extractedPhone: string;
  extractedTxId: string;
  isMatched?: boolean;
}

export interface OCRScanResult {
  extractedPhone: string;
  extractedAmount: number;
  extractedTxId: string;
  extractedTimestamp: string;
  confidenceScore: number;
  rawExtractedLines: string[];
  phoneMatch: boolean;
  amountMatch: boolean;
  smsMatch: boolean;
  overallScore: number;
  decision: 'auto_approved' | 'flagged_for_review';
  decisionReason: string;
}

export interface VodafoneCashDepositRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  senderPhone: string;
  amount: number;
  transactionId: string;
  receiptImage?: string;
  receiptImagePreview?: string;
  notes?: string;
  teacherWalletPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  aiVerified?: boolean;
  aiMatchScore?: number;
  ocrScan?: OCRScanResult;
  matchedSmsId?: string;
  verificationMode?: 'ai_auto' | 'manual_review';
}

export type GradeLevel = 'first_secondary' | 'second_secondary' | 'third_secondary' | 'all';

export interface LessonResource {
  type: 'video' | 'pdf' | 'exercise' | 'summary';
  title: string;
  durationOrPages?: string;
  url?: string;
  downloadable?: boolean;
}

export interface Lesson {
  id: string;
  weekNumber: number;
  title: string;
  duration: string;
  objectives: string[];
  explanationMethod: {
    videoDuration: string;
    videoQuality: string;
    pdfPages: number;
    exercisesCount: number;
    description: string;
  };
  resources: LessonResource[];
  isFreePreview?: boolean;
  quizId?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  totalHours: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  gradeLevel: GradeLevel;
  gradeTitle: string;
  subject: string;
  instructor: string;
  instructorTitle: string;
  badge?: string;
  rating: number;
  studentsCount: number;
  totalWeeks: number;
  totalModules: number;
  totalLessons: number;
  totalHours: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  thumbnail: string;
  overview: string;
  modules: CourseModule[];
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  lessonReference: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
  conceptFormula?: string;
  feedbacks: {
    [optionId: string]: string; // Feedback specific to chosen option
  };
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  period: string;
  popular?: boolean;
  features: string[];
  limitations?: string[];
  suitableFor: string;
  colorScheme: 'indigo' | 'emerald' | 'amber' | 'purple';
}

export interface StudentRecord {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  grade: string;
  enrolledCourse: string;
  progressPercentage: number;
  quizAverage: number;
  lastActive: string;
  paymentStatus: 'paid' | 'pending' | 'expired';
  suspiciousDeviceAlert?: boolean;
}

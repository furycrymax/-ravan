export type ImportanceLevel = 'critical' | 'high' | 'medium';

export type StudyStatus = 'not_started' | 'in_progress' | 'summarized' | 'mastered';

export type ExamTarget = 'all' | 'science' | 'health' | 'both';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  bookTitle: string;
  authors: string;
  importance: ImportanceLevel; // critical (⭐⭐⭐), high (⭐⭐), medium (⭐)
  averageQuestions: string; // e.g. "۲ تا ۴ سوال مستقیم"
  healthFrequency?: string; // e.g. "تست قطعی در وزارت بهداشت (۱ تا ۲ سوال)"
  keyTopics: string[]; // Important exam concepts
  examTips: string; // Practical tips for Konkur 1405
  studyEstimatedHours: number;
  targetExam?: 'science' | 'health' | 'both';
  referenceCitation?: {
    book: string;
    edition?: string;
    authors?: string;
    officialCurriculumNote?: string;
    officialSyllabusLink?: string;
  };
}

export interface Book {
  id: string;
  title: string;
  authors: string;
  translators?: string;
  publisher?: string;
  description: string;
  chaptersCount: number;
  priority: 'اصلی و ضروری' | 'تکمیلی و مرجع';
  targetExam?: 'science' | 'health' | 'both';
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  coefficient: number; // ضریب در کنکور وزارت علوم (کد ۱۱۳۳)
  clinicalScienceCoefficient?: number; // ضریب ویژه در گرایش بالینی در صورت تفکیک از سایر گرایش‌ها
  scienceExamNote?: string; // توضیح سرفصل و ضرایب در آزمون علوم
  healthCoefficient?: number; // ضریب در کنکور وزارت بهداشت
  totalQuestions: number; // تعداد تست در دفترچه کنکور وزارت علوم
  healthQuestions?: number; // تعداد تست در دفترچه کنکور وزارت بهداشت
  importanceNote: string;
  color: string;
  accentBg: string;
  targetExam: 'science' | 'health' | 'both';
  books: Book[];
}

export interface ChapterUserData {
  status: StudyStatus;
  notes: string;
  readBookText: boolean;
  doneTrainingTests: boolean;
  doneReviewTests: boolean;
  lastStudiedDate?: string;
}

export interface ChapterProgress {
  chapterId: string;
  userId?: string;
  status: StudyStatus;
  notes?: string;
  rating?: number;
  testScore?: number;
  lastStudiedAt?: string;
}

export type UserProgressRecord = Record<string, ChapterProgress>;

export interface StudyActivityMeta {
  lastActiveDate: string; // ISO string of user's last study session or interactive update
  dismissedAlertDate?: string; // Date user dismissed the 3-day inactivity banner
}

export type UserProgressMap = Record<string, ChapterUserData>;

export interface FilterState {
  subjectId: string | 'all';
  searchQuery: string;
  importance: 'all' | ImportanceLevel;
  status: 'all' | StudyStatus;
  bookId?: string;
  examTarget?: ExamTarget;
}

export interface DailyStudyLog {
  dateKey: string; // Format: YYYY-MM-DD
  customHours: number;
  notes?: string;
  manualMarked?: boolean;
}

export type DailyStudyLogMap = Record<string, DailyStudyLog>;

export interface DailySubjectTask {
  subjectId: string;
  subjectName: string;
  bookTitle: string;
  suggestedChapters: string; // e.g. "فصل ۳ و ۴ کاپلان (اختلالات اضطرابی)"
  allocatedHours: number;
  studyType: 'concept_reading' | 'question_practice' | 'spaced_review' | 'summary_note';
  focusTip: string; // e.g. "تمرکز بر ملاک‌های زمانی DSM-5 و تست‌های سنجش پزشکی ۱۴۰۲"
}

export interface DailyScheduleDay {
  dayName: string; // "شنبه", "یکشنبه", ...
  dayNumber: number; // 1 to 7
  primaryTask: DailySubjectTask;
  secondaryTask: DailySubjectTask;
  totalHours: number;
  dailyAdvice: string;
  isRestOrCatchupDay?: boolean;
}

export interface MonthlyMilestone {
  monthNumber: number;
  monthName: string;
  targetChaptersCount: number;
  totalStudyHours: number;
  keyGoals: string[];
  expectedMastery: string;
  reviewCheckpoint: string;
}

export interface RoadmapPhase {
  phaseId: string;
  phaseTitle: string;
  durationLabel: string;
  targetTimeline: string;
  methodology: string;
  weeklyHoursRecommended: number;
  keyDeliverables: string[];
  testStrategy: string;
}

export interface AIStudyPlan {
  id: string;
  createdAt: string;
  targetExam: 'both' | 'health' | 'science';
  dailyHours: number;
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  selectedBookIds: string[];
  totalSelectedChapters: number;
  totalEstimatedHours: number;
  overviewAdvice: string;
  scientificMethodologyNote: string;
  examLogicInsights: string; // تحلیل منطق کنکورهای ۱۴۰۰ تا ۱۴۰۴
  weeklySchedule: DailyScheduleDay[]; // الگو و برنامه هفتگی
  monthlyMilestones: MonthlyMilestone[]; // ماه‌های مانده تا کنکور
  roadmapPhases: RoadmapPhase[]; // ۴ فاز کلان تا کنکور
}

export interface StudyReminderSettings {
  enabled: boolean;
  cutoffTime: string; // e.g. "18:00" (6:00 PM)
  dailyTargetHours: number; // e.g. 4
  browserPushEnabled: boolean;
  googleCalendarRemindersEnabled: boolean;
  lastTriggeredDate?: string; // YYYY-MM-DD
}


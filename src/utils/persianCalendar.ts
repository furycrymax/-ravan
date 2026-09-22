import { Chapter, Subject, UserProgressMap, DailyStudyLogMap } from '../types';

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
export const PERSIAN_WEEK_DAYS_FULL = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(n: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

/**
 * Parses a Date into Persian year, month, day, and dayOfWeek (0=Saturday..6=Friday)
 */
export function getPersianDate(date: Date): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
} {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const map: Record<string, string> = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  const jsDay = date.getDay(); // 0=Sunday..6=Saturday
  const dayOfWeek = (jsDay + 1) % 7; // 0=Saturday, 1=Sunday, ..., 6=Friday

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    dayOfWeek,
  };
}

/**
 * Formats a Date into Persian full string (e.g., "دوشنبه ۳۰ شهریور ۱۴۰۵")
 */
export function formatPersianFullDate(date: Date): string {
  const p = getPersianDate(date);
  const dayName = PERSIAN_WEEK_DAYS_FULL[p.dayOfWeek];
  const monthName = PERSIAN_MONTH_NAMES[p.month - 1];
  return `${dayName} ${toPersianDigits(p.day)} ${monthName} ${toPersianDigits(p.year)}`;
}

/**
 * Formats date key YYYY-MM-DD to Persian string
 */
export function formatDateKeyToPersian(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return formatPersianFullDate(date);
}

export interface StudiedChapterSummary {
  chapterId: string;
  chapterTitle: string;
  bookTitle: string;
  subjectName: string;
  subjectColor: string;
  status: string;
  estimatedHours: number;
}

export interface CalendarDayItem {
  persianYear: number;
  persianMonth: number;
  persianDay: number;
  persianDayOfWeek: number; // 0=Saturday, 6=Friday
  dateKey: string; // YYYY-MM-DD
  gregorianDate: Date;
  isToday: boolean;
  isPastOrToday: boolean;
  hasStudied: boolean;
  totalEstimatedHours: number;
  studiedChapters: StudiedChapterSummary[];
  customHours: number;
  notes?: string;
}

/**
 * Generates all calendar days of a specific Persian month
 */
export function getPersianMonthDays(
  year: number,
  month: number,
  userProgress: UserProgressMap,
  subjects: Subject[],
  dailyStudyLogs: DailyStudyLogMap
): CalendarDayItem[] {
  // Find first Gregorian date of Persian (year, month, 1)
  const approxGregYear = year + 621;
  let d = new Date(Date.UTC(approxGregYear, month - 1, 15, 12, 0, 0));
  let curP = getPersianDate(d);
  let step = 0;

  while ((curP.year !== year || curP.month !== month || curP.day !== 1) && step < 120) {
    step++;
    if (curP.year < year || (curP.year === year && curP.month < month)) {
      d.setUTCDate(d.getUTCDate() + 5);
    } else if (curP.year > year || (curP.year === year && curP.month > month)) {
      d.setUTCDate(d.getUTCDate() - 5);
    } else {
      d.setUTCDate(d.getUTCDate() - (curP.day - 1));
    }
    curP = getPersianDate(d);
  }

  // Pre-index chapters by ID for quick lookup
  const chapterLookup = new Map<string, { chapter: Chapter; subject: Subject }>();
  for (const subject of subjects) {
    for (const book of subject.books) {
      for (const chapter of book.chapters) {
        chapterLookup.set(chapter.id, { chapter, subject });
      }
    }
  }

  // Group studied chapters by dateKey
  const progressByDate = new Map<string, StudiedChapterSummary[]>();
  for (const [chId, userData] of Object.entries(userProgress)) {
    if (userData.lastStudiedDate) {
      const dateKey = userData.lastStudiedDate.split('T')[0];
      const entry = chapterLookup.get(chId);
      if (entry) {
        const { chapter, subject } = entry;
        // Calculate estimated hours based on study status & checkboxes
        let hours = chapter.studyEstimatedHours || 5;
        if (userData.status === 'in_progress') hours = Math.max(2, Math.round(hours * 0.5));
        if (userData.status === 'summarized') hours = Math.max(3, Math.round(hours * 0.75));

        const list = progressByDate.get(dateKey) || [];
        list.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          bookTitle: chapter.bookTitle,
          subjectName: subject.name,
          subjectColor: subject.color,
          status: userData.status,
          estimatedHours: hours,
        });
        progressByDate.set(dateKey, list);
      }
    }
  }

  const todayKey = new Date().toISOString().split('T')[0];
  const now = new Date();
  const days: CalendarDayItem[] = [];

  while (curP.year === year && curP.month === month) {
    const jsDay = d.getUTCDay();
    const persianDayOfWeek = (jsDay + 1) % 7;
    const dateKey = d.toISOString().split('T')[0];

    const isToday = dateKey === todayKey;
    const isPastOrToday = d.getTime() <= now.getTime() || isToday;

    const chaptersForDay = progressByDate.get(dateKey) || [];
    const customLog = dailyStudyLogs[dateKey];
    const customHours = customLog?.customHours || 0;

    // Sum chapter hours
    const chaptersHours = chaptersForDay.reduce((acc, c) => acc + c.estimatedHours, 0);
    const totalEstimatedHours = chaptersHours + customHours;

    const hasStudied = totalEstimatedHours > 0 || !!customLog?.manualMarked || chaptersForDay.length > 0;

    days.push({
      persianYear: curP.year,
      persianMonth: curP.month,
      persianDay: curP.day,
      persianDayOfWeek,
      dateKey,
      gregorianDate: new Date(d),
      isToday,
      isPastOrToday,
      hasStudied,
      totalEstimatedHours,
      studiedChapters: chaptersForDay,
      customHours,
      notes: customLog?.notes,
    });

    d.setUTCDate(d.getUTCDate() + 1);
    curP = getPersianDate(d);
  }

  return days;
}

/**
 * Calculates current study streak (consecutive days of study ending today or yesterday)
 */
export function calculateStudyStreak(
  userProgress: UserProgressMap,
  dailyStudyLogs: DailyStudyLogMap
): number {
  const activeDates = new Set<string>();

  // From chapter progress
  for (const userData of Object.values(userProgress)) {
    if (userData.lastStudiedDate) {
      activeDates.add(userData.lastStudiedDate.split('T')[0]);
    }
  }

  // From daily study logs
  for (const [dateKey, log] of Object.entries(dailyStudyLogs)) {
    if (log.customHours > 0 || log.manualMarked) {
      activeDates.add(dateKey);
    }
  }

  if (activeDates.size === 0) return 0;

  const today = new Date();
  let checkDate = new Date(today);
  let streak = 0;

  const todayKey = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  // If today hasn't been studied yet, streak might be unbroken from yesterday
  if (!activeDates.has(todayKey)) {
    if (!activeDates.has(yesterdayKey)) {
      return 0;
    }
    checkDate = yesterday;
  }

  while (true) {
    const key = checkDate.toISOString().split('T')[0];
    if (activeDates.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

import React, { useState, useMemo } from 'react';
import { Chapter, Subject, UserProgressMap, DailyStudyLogMap, DailyStudyLog } from '../types';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEK_DAYS_SHORT,
  PERSIAN_WEEK_DAYS_FULL,
  toPersianDigits,
  getPersianDate,
  formatPersianFullDate,
  getPersianMonthDays,
  calculateStudyStreak,
  CalendarDayItem,
} from '../utils/persianCalendar';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Flame,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  Minus,
  BookOpen,
  Award,
  RotateCcw,
  Check,
  CalendarDays,
  Info,
} from 'lucide-react';

interface InteractiveStudyCalendarProps {
  userProgress: UserProgressMap;
  subjects: Subject[];
  dailyStudyLogs: DailyStudyLogMap;
  onUpdateDailyStudyLog: (dateKey: string, log: Partial<DailyStudyLog>) => void;
  onScrollToChapter?: (chapterId: string) => void;
  onSyncWithGoogleCalendar?: (preset: { date: string; summary: string; description: string; hours: number }) => void;
}

export const InteractiveStudyCalendar: React.FC<InteractiveStudyCalendarProps> = ({
  userProgress,
  subjects,
  dailyStudyLogs,
  onUpdateDailyStudyLog,
  onScrollToChapter,
  onSyncWithGoogleCalendar,
}) => {
  // Current date in Persian calendar
  const todayPersian = useMemo(() => getPersianDate(new Date()), []);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Current viewed month and year (defaults to current Persian month and year)
  const [viewYear, setViewYear] = useState<number>(todayPersian.year);
  const [viewMonth, setViewMonth] = useState<number>(todayPersian.month); // 1 to 12

  // Selected day for detail inspect & interactive quick hours
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // View mode: 'month' (full grid) or 'week' (compact 7-day strip)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Collapse / expand toggle
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setViewYear(todayPersian.year);
    setViewMonth(todayPersian.month);
    setSelectedDateKey(todayKey);
  };

  // Generate calendar days for the active month
  const monthDays: CalendarDayItem[] = useMemo(() => {
    return getPersianMonthDays(viewYear, viewMonth, userProgress, subjects, dailyStudyLogs);
  }, [viewYear, viewMonth, userProgress, subjects, dailyStudyLogs]);

  // Overall statistics for active month
  const monthStats = useMemo(() => {
    let totalHours = 0;
    let activeDaysCount = 0;

    monthDays.forEach((day) => {
      if (day.hasStudied) {
        activeDaysCount++;
        totalHours += day.totalEstimatedHours;
      }
    });

    const avgHours = activeDaysCount > 0 ? (totalHours / activeDaysCount).toFixed(1) : '۰';

    return {
      totalHours: Number(totalHours.toFixed(1)),
      activeDaysCount,
      totalMonthDays: monthDays.length,
      avgHours,
    };
  }, [monthDays]);

  // Current streak calculation
  const streak = useMemo(() => {
    return calculateStudyStreak(userProgress, dailyStudyLogs);
  }, [userProgress, dailyStudyLogs]);

  // Find selected day item
  const selectedDayItem = useMemo(() => {
    return monthDays.find((d) => d.dateKey === selectedDateKey) || monthDays[0] || null;
  }, [monthDays, selectedDateKey]);

  // Week days view (7 days surrounding selected date or today)
  const weekDays = useMemo(() => {
    const targetKey = selectedDateKey || todayKey;
    const idx = monthDays.findIndex((d) => d.dateKey === targetKey);
    if (idx === -1) {
      return monthDays.slice(0, 7);
    }
    // Take 7 days around idx
    const start = Math.max(0, Math.min(idx - 3, monthDays.length - 7));
    return monthDays.slice(start, start + 7);
  }, [monthDays, selectedDateKey, todayKey]);

  // Handler to adjust custom study hours for a specific date
  const handleAddCustomHours = (dateKey: string, deltaHours: number) => {
    const currentLog = dailyStudyLogs[dateKey];
    const currentHours = currentLog?.customHours || 0;
    const newHours = Math.max(0, Number((currentHours + deltaHours).toFixed(1)));

    onUpdateDailyStudyLog(dateKey, {
      customHours: newHours,
      manualMarked: newHours > 0 || !!currentLog?.manualMarked,
    });
  };

  // Handler to toggle study status for a day
  const handleToggleStudyDay = (dateKey: string) => {
    const currentLog = dailyStudyLogs[dateKey];
    const isCurrentlyMarked = currentLog?.manualMarked || (currentLog?.customHours || 0) > 0;

    if (isCurrentlyMarked) {
      onUpdateDailyStudyLog(dateKey, {
        customHours: 0,
        manualMarked: false,
      });
    } else {
      // Default to 2 hours study session when marked
      onUpdateDailyStudyLog(dateKey, {
        customHours: 2.5,
        manualMarked: true,
      });
    }
  };

  // Calendar cells padding: find starting day of week for first day of month
  const startingDayOfWeek = monthDays.length > 0 ? monthDays[0].persianDayOfWeek : 0;
  const paddingSlots = Array.from({ length: startingDayOfWeek });

  return (
    <div
      id="interactive-study-calendar"
      className="mb-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-300"
    >
      {/* Top Header Bar */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Title & Month Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <CalendarIcon className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wide px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  تقویم استمرار کنکور
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {PERSIAN_MONTH_NAMES[viewMonth - 1]} {toPersianDigits(viewYear)}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ثبت و محاسبه ساعات مطالعه روزانه و رهگیری زنجیره پیوستگی تا کنکور
              </p>
            </div>
          </div>

          {/* Quick Metrics & Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
            {/* Streak Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                streak > 0
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-xs'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
              title="تعداد روزهای متوالی مطالعه فعال"
            >
              <Flame
                className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`}
              />
              <span>
                {streak > 0 ? `${toPersianDigits(streak)} روز متوالی مطالعه` : 'شروع زنجیره جدید'}
              </span>
            </div>

            {/* Total Month Hours */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>
                {toPersianDigits(monthStats.totalHours)} ساعت مطالعه این ماه
              </span>
            </div>

            {/* Minimize / Expand Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {isCollapsed ? 'نمایش تقویم' : 'کوچک‌نمایی'}
            </button>
          </div>
        </div>

        {/* Secondary Navigation & View Switcher (Visible when not collapsed) */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            {/* Month Switcher */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                title="ماه قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-2 text-indigo-200">
                {PERSIAN_MONTH_NAMES[viewMonth - 1]} {toPersianDigits(viewYear)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                title="ماه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleGoToToday}
                className="mr-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                امروز
              </button>
            </div>

            {/* View Mode Toggle & Legend */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'month'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  نمای کامل ماه
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'week'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  نوار هفتگی
                </button>
              </div>

              {/* Study Days Count */}
              <span className="text-xs text-slate-300 mr-2">
                {toPersianDigits(monthStats.activeDaysCount)} از {toPersianDigits(monthStats.totalMonthDays)} روز فعال
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Calendar Grid View */}
          {viewMode === 'month' ? (
            <div className="space-y-2">
              {/* Weekday Labels Header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                {PERSIAN_WEEK_DAYS_FULL.map((name, i) => (
                  <div key={i} className="py-1">
                    <span className="hidden sm:inline">{name}</span>
                    <span className="sm:hidden">{PERSIAN_WEEK_DAYS_SHORT[i]}</span>
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty padding slots for days before start of month */}
                {paddingSlots.map((_, i) => (
                  <div
                    key={`pad-${i}`}
                    className="min-h-[58px] sm:min-h-[66px] rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-transparent opacity-40 pointer-events-none"
                  />
                ))}

                {/* Days of the month */}
                {monthDays.map((day) => {
                  const isSelected = day.dateKey === selectedDateKey;
                  const hasHours = day.totalEstimatedHours > 0;

                  // Intensity colors for study hours with dark mode support
                  let intensityClass = 'bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700';
                  if (day.hasStudied) {
                    if (day.totalEstimatedHours >= 5) {
                      intensityClass =
                        'bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500 shadow-xs font-bold hover:bg-emerald-700';
                    } else if (day.totalEstimatedHours >= 3) {
                      intensityClass =
                        'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900';
                    } else {
                      intensityClass =
                        'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60';
                    }
                  } else if (day.isToday) {
                    intensityClass = 'bg-amber-50/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700';
                  }

                  return (
                    <button
                      key={day.dateKey}
                      onClick={() => setSelectedDateKey(day.dateKey)}
                      className={`relative flex flex-col justify-between p-1.5 sm:p-2 min-h-[58px] sm:min-h-[66px] rounded-xl border text-right transition-all cursor-pointer ${intensityClass} ${
                        isSelected
                          ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900 z-10 scale-[1.02]'
                          : ''
                      } ${day.isToday ? 'border-amber-400 dark:border-amber-500 font-extrabold' : ''}`}
                    >
                      {/* Top row in cell: Day number + Today / Check badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs sm:text-sm font-bold">
                          {toPersianDigits(day.persianDay)}
                        </span>

                        {day.hasStudied && (
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                              day.totalEstimatedHours >= 5 ? 'text-amber-300' : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                            title="مطالعه ثبت‌شده"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}

                        {day.isToday && !day.hasStudied && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400 text-slate-900 font-black">
                            امروز
                          </span>
                        )}
                      </div>

                      {/* Bottom row in cell: Estimated Hours */}
                      <div className="mt-1 w-full text-left">
                        {hasHours ? (
                          <span
                            className={`inline-block text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded ${
                              day.totalEstimatedHours >= 5
                                ? 'bg-emerald-900/40 text-emerald-100'
                                : 'bg-white/80 dark:bg-slate-900/80 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                            }`}
                          >
                            {toPersianDigits(day.totalEstimatedHours)} س
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 opacity-60">−</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Weekly View (7 Days Strip) */
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((day) => {
                const isSelected = day.dateKey === selectedDateKey;
                const hasHours = day.totalEstimatedHours > 0;

                let intensityClass = 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (day.hasStudied) {
                  if (day.totalEstimatedHours >= 5) {
                    intensityClass = 'bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500 shadow-xs';
                  } else if (day.totalEstimatedHours >= 3) {
                    intensityClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700';
                  } else {
                    intensityClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                  }
                }

                return (
                  <button
                    key={day.dateKey}
                    onClick={() => setSelectedDateKey(day.dateKey)}
                    className={`flex flex-col items-center justify-between p-2 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${intensityClass} ${
                      isSelected ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900 scale-[1.02]' : ''
                    }`}
                  >
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                      {PERSIAN_WEEK_DAYS_FULL[day.persianDayOfWeek]}
                    </span>
                    <span className="text-base sm:text-lg font-black">
                      {toPersianDigits(day.persianDay)}
                    </span>
                    <span className="text-xs mt-1 font-bold">
                      {hasHours ? `${toPersianDigits(day.totalEstimatedHours)} ساعت` : 'بدون مطالعه'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Heatmap Legend */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-slate-600 dark:text-slate-300">راهنمای رنگ ساعات:</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                <span>بدون مطالعه</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800" />
                <span>۱ تا ۳ ساعت</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700" />
                <span>۳ تا ۵ ساعت</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-600 text-white" />
                <span>۵+ ساعت (فوق‌العاده)</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              میانگین بازدهی روزانه: <span className="font-bold text-slate-800 dark:text-slate-200">{toPersianDigits(monthStats.avgHours)} ساعت</span>
            </div>
          </div>

          {/* Selected Day Details Panel */}
          {selectedDayItem && (
            <div className="mt-4 rounded-xl border border-indigo-100 dark:border-slate-800 bg-linear-to-br from-indigo-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/80 dark:border-slate-800">
                {/* Day Header Info */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-indigo-600 text-white">
                      روز انتخابی
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {formatPersianFullDate(selectedDayItem.gregorianDate)}
                    </h3>
                    {selectedDayItem.isToday && (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                        امروز
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    وضعیت: {selectedDayItem.hasStudied ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        مطالعه ثبت‌شده ({toPersianDigits(selectedDayItem.totalEstimatedHours)} ساعت تخمینی)
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 font-medium">هیچ فعالیتی ثبت نشده است</span>
                    )}
                  </p>
                </div>

                {/* Quick Hours Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleToggleStudyDay(selectedDayItem.dateKey)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      selectedDayItem.hasStudied
                        ? 'bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    }`}
                  >
                    {selectedDayItem.hasStudied ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                        <span>پاک کردن وضعیت</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>علامت‌گذاری مطالعه این روز</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleAddCustomHours(selectedDayItem.dateKey, 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                    title="افزودن ۱ ساعت به مطالعه این روز"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>۱ ساعت تست/مرور</span>
                  </button>

                  <button
                    onClick={() => handleAddCustomHours(selectedDayItem.dateKey, 2)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                    title="افزودن ۲ ساعت به مطالعه این روز"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>۲ ساعت مبحثی</span>
                  </button>

                  {selectedDayItem.customHours > 0 && (
                    <button
                      onClick={() => handleAddCustomHours(selectedDayItem.dateKey, -1)}
                      className="inline-flex items-center p-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="کاهش ۱ ساعت"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onSyncWithGoogleCalendar && (
                    <button
                      onClick={() => {
                        const chaptersSummary = selectedDayItem.studiedChapters.length > 0
                          ? selectedDayItem.studiedChapters.map(c => `${c.subjectName}: ${c.chapterTitle}`).join('، ')
                          : 'مطالعه مبحثی و مرور فشرده آزمون';
                        const totalHours = (selectedDayItem.totalEstimatedHours || 0) + (selectedDayItem.customHours || 0) || 2;
                        const dateFormatted = `${selectedDayItem.persianYear}/${selectedDayItem.persianMonth}/${selectedDayItem.persianDay}`;
                        onSyncWithGoogleCalendar({
                          date: selectedDayItem.dateKey,
                          summary: `مطالعه کنکور ارشد روانشناسی بالینی (${dateFormatted})`,
                          description: `برنامه و سرفصل‌ها: ${chaptersSummary}\nمجموع ساعات مفید: ${totalHours} ساعت`,
                          hours: totalHours,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                      title="ارسال و تنظیم یادآور در Google Calendar"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>ثبت در تقویم گوگل</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Studied Chapters List on this specific date */}
              {selectedDayItem.studiedChapters.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>فصول مطالعه یا مرور شده در این روز:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDayItem.studiedChapters.map((sc) => (
                      <div
                        key={sc.chapterId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                              style={{ backgroundColor: sc.subjectColor }}
                            >
                              {sc.subjectName}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] truncate">{sc.bookTitle}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {sc.chapterTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {toPersianDigits(sc.estimatedHours)} ساعت
                          </span>

                          {onScrollToChapter && (
                            <button
                              onClick={() => onScrollToChapter(sc.chapterId)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-[11px] font-bold underline cursor-pointer"
                            >
                              مشاهده
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedDayItem.customHours > 0 ? (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  <span>
                    ساعت مطالعه متفرقه/مروری ثبت‌شده: <strong className="text-indigo-700 dark:text-indigo-400">{toPersianDigits(selectedDayItem.customHours)} ساعت</strong>
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    با زدن تیک مطالعه در هر فصل یا کلیک روی دکمه‌های بالا، فعالیت این روز به تقویم اضافه خواهد شد.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

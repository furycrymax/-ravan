import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BUDGETING_FREQUENCY_DATA,
  SubjectBudgetingProfile,
  ChapterYearlyFrequency,
} from '../data/budgetingFrequencyData';
import {
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  Layers,
  ChevronLeft,
  Flame,
  CheckCircle2,
  Calendar,
  BookOpen,
  Filter,
} from 'lucide-react';

interface BudgetingFrequencyChartProps {
  initialSubjectId?: string;
}

export const BudgetingFrequencyChart: React.FC<BudgetingFrequencyChartProps> = ({
  initialSubjectId = 'clinical',
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [chartMode, setChartMode] = useState<'yearly' | 'total' | 'coefficients'>('yearly');
  const [selectedYearFilter, setSelectedYearFilter] = useState<'all' | '1404' | '1403' | '1402'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high_yield'>('all');
  const [sortOrder, setSortOrder] = useState<'yield' | 'chapter' | 'recent1404'>('yield');

  const currentSubject = useMemo(() => {
    return (
      BUDGETING_FREQUENCY_DATA.find((s) => s.subjectId === selectedSubjectId) ||
      BUDGETING_FREQUENCY_DATA[0]
    );
  }, [selectedSubjectId]);

  // High-Yield statistics for current subject
  const highYieldStats = useMemo(() => {
    const chapters = currentSubject.chapters || [];
    const totalQuestions = chapters.reduce((sum, ch) => sum + ch.totalFiveYears, 0);
    const sortedByYield = [...chapters].sort((a, b) => b.totalFiveYears - a.totalFiveYears);
    const top3 = sortedByYield.slice(0, 3);
    const top3Questions = top3.reduce((sum, ch) => sum + ch.totalFiveYears, 0);
    const top3Percentage = totalQuestions > 0 ? Math.round((top3Questions / totalQuestions) * 100) : 0;
    const criticalCount = chapters.filter((ch) => ch.importanceLevel === 'critical').length;
    const highCount = chapters.filter((ch) => ch.importanceLevel === 'high').length;

    return {
      totalQuestions,
      top3,
      top3Questions,
      top3Percentage,
      criticalCount,
      highCount,
      allCount: chapters.length,
    };
  }, [currentSubject]);

  // Filtered and sorted chapters for the chart and table
  const processedChapters = useMemo(() => {
    let result = [...currentSubject.chapters];

    // Priority filtering
    if (priorityFilter === 'critical') {
      result = result.filter((ch) => ch.importanceLevel === 'critical');
    } else if (priorityFilter === 'high_yield') {
      result = result.filter((ch) => ch.importanceLevel === 'critical' || ch.importanceLevel === 'high');
    }

    // Sorting
    if (sortOrder === 'yield') {
      result.sort((a, b) => b.totalFiveYears - a.totalFiveYears);
    } else if (sortOrder === 'recent1404') {
      result.sort((a, b) => b.y1404 - a.y1404 || b.totalFiveYears - a.totalFiveYears);
    } else if (sortOrder === 'chapter') {
      result.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    return result;
  }, [currentSubject, priorityFilter, sortOrder]);

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return processedChapters.map((ch) => {
      const priorityPrefix = ch.importanceLevel === 'critical' ? '🔥 ' : ch.importanceLevel === 'high' ? '⭐ ' : '';
      return {
        id: ch.id,
        name: `${priorityPrefix}فصل ${ch.chapterNumber}: ${ch.chapterTitle.length > 18 ? ch.chapterTitle.slice(0, 18) + '...' : ch.chapterTitle}`,
        fullName: ch.chapterTitle,
        bookTitle: ch.bookTitle,
        chapterNumber: ch.chapterNumber,
        y1400: ch.y1400,
        y1401: ch.y1401,
        y1402: ch.y1402,
        y1403: ch.y1403,
        y1404: ch.y1404,
        total: ch.totalFiveYears,
        average: ch.averagePerYear,
        trend: ch.trend,
        maxFocusYear: ch.maxFocusYear,
        maxFocusCount: ch.maxFocusCount,
        tip: ch.highYieldTip,
        importance: ch.importanceLevel,
      };
    });
  }, [processedChapters]);

  // Overall cross-subject coefficients data
  const coefficientsData = useMemo(() => {
    return BUDGETING_FREQUENCY_DATA.map((s) => ({
      name: s.subjectName,
      scienceCoeff: s.scienceCoefficient,
      healthCoeff: s.healthCoefficient,
      scienceQuestions: s.totalQuestionsScience,
      healthQuestions: s.totalQuestionsHealth,
    }));
  }, []);

  // Find the top chapter with the maximum focus
  const peakChapter = useMemo(() => {
    if (!currentSubject.chapters.length) return null;
    return [...currentSubject.chapters].sort((a, b) => b.totalFiveYears - a.totalFiveYears)[0];
  }, [currentSubject]);

  // Custom Tooltip for yearly comparison
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-2 max-w-xs z-50">
          <div className="font-bold text-sm text-amber-300 border-b border-slate-800 pb-1.5 flex items-center justify-between gap-2">
            <span>{data.fullName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              فصل {data.chapterNumber}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span className="truncate">{data.bookTitle}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800 text-[11px]">
            <div className="bg-slate-800/80 p-1.5 rounded flex justify-between">
              <span className="text-indigo-300 font-semibold">سال ۱۴۰۴:</span>
              <span className="font-bold text-white">{data.y1404} سوال</span>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded flex justify-between">
              <span className="text-emerald-300 font-semibold">سال ۱۴۰۳:</span>
              <span className="font-bold text-white">{data.y1403} سوال</span>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded flex justify-between">
              <span className="text-cyan-300 font-semibold">سال ۱۴۰۲:</span>
              <span className="font-bold text-white">{data.y1402} سوال</span>
            </div>
            <div className="bg-slate-800/80 p-1.5 rounded flex justify-between">
              <span className="text-amber-300 font-semibold">سال ۱۴۰۱:</span>
              <span className="font-bold text-white">{data.y1401} سوال</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">مجموع ۵ سال اخیر:</span>
            <span className="font-bold text-emerald-400 text-xs">{data.total} سوال</span>
          </div>

          <div className="text-[10px] text-amber-200 bg-amber-950/40 p-1.5 rounded border border-amber-800/40 leading-relaxed">
            <span className="font-bold">بیشترین تمرکز: </span>
            سال {data.maxFocusYear} با {data.maxFocusCount} سوال
          </div>

          {data.tip && (
            <div className="text-[10px] text-slate-300 italic pt-1 leading-relaxed">
              💡 {data.tip}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="budgeting-frequency-dashboard">
      {/* Top Banner & Insight Summary */}
      <div className="p-4 rounded-xl bg-linear-to-r from-indigo-950 via-slate-900 to-teal-950 text-white border border-indigo-800/50 shadow-md space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-600/80 text-white shadow-2xs">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                تحلیل آماری ضرایب و فراوانی بودجه‌بندی سال‌های اخیر (۱۴۰۰ تا ۱۴۰۴)
              </h3>
              <p className="text-xs text-indigo-200">
                بررسی روند و توزیع سوالات کنکور کارشناسی ارشد روان‌شناسی بالینی (وزارت علوم کد ۱۱۳۳ و وزارت بهداشت)
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setChartMode('yearly')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartMode === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              مقایسه سال‌به‌سال (۱۴۰۰-۱۴۰۴)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('total')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartMode === 'total'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              مجموع فراوانی ۵ ساله
            </button>
            <button
              type="button"
              onClick={() => setChartMode('coefficients')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartMode === 'coefficients'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              مقایسه ضرایب دروس
            </button>
          </div>
        </div>

        {/* Dynamic Highlight Card for Selected Subject */}
        {chartMode !== 'coefficients' && (
          <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 text-sm">{currentSubject.subjectName}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  ضریب وزارت علوم: {currentSubject.scienceCoefficient} | ضریب وزارت بهداشت: {currentSubject.healthCoefficient}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {currentSubject.totalQuestionsScience} سوال علوم / {currentSubject.totalQuestionsHealth} سوال بهداشت
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                {currentSubject.keyInsights}
              </p>
            </div>

            {peakChapter && (
              <div className="bg-amber-400/20 border border-amber-400/40 p-2.5 rounded-lg text-amber-100 shrink-0 max-w-xs text-right">
                <div className="flex items-center gap-1 font-bold text-amber-300 text-[11px] mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>بیشترین تمرکز طراحان:</span>
                </div>
                <div className="font-bold text-xs text-white truncate">{peakChapter.chapterTitle}</div>
                <div className="text-[10px] text-amber-200 mt-0.5">
                  {peakChapter.totalFiveYears} سوال در ۵ سال اخیر (اوج در سال {peakChapter.maxFocusYear} با {peakChapter.maxFocusCount} تست)
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subject Navigation Pills */}
      {chartMode !== 'coefficients' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              انتخاب درس جهت مشاهده نمودار بودجه‌بندی فصول:
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              کلیک روی هر درس، نمودار و فصول آن را فوراً بارگذاری می‌کند
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {BUDGETING_FREQUENCY_DATA.map((sub) => {
              const isSelected = sub.subjectId === selectedSubjectId;
              return (
                <button
                  key={sub.subjectId}
                  type="button"
                  onClick={() => setSelectedSubjectId(sub.subjectId)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm scale-102'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{sub.subjectName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    ضریب {sub.scienceCoefficient || sub.healthCoefficient}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* High-Yield Content Prioritization Card */}
      {chartMode !== 'coefficients' && (
        <div className="p-3 sm:p-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black shadow-2xs">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>اولویت‌بندی مباحث پربازده و طلایی (High-Yield Prioritization)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold border border-amber-400/40">
                    قانون طلایی ۸۰/۲۰
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  تمرکز حداکثری بر فصول با بازده تستی بالا جهت کسب بیشترین درصد در کمترین زمان مطالعه
                </p>
              </div>
            </div>

            {/* Quick Priority Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">فیلتر اولویت:</span>
              <button
                type="button"
                onClick={() => setPriorityFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  priorityFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                همه فصول ({highYieldStats.allCount})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('critical')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  priorityFilter === 'critical'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>فقط اولویت ۱ طلایی ({highYieldStats.criticalCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('high_yield')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  priorityFilter === 'high_yield'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>مباحث پربازده اولویت ۱ و ۲ ({highYieldStats.criticalCount + highYieldStats.highCount})</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-amber-500/20 text-[11px]">
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">تمرکز ۳ فصل اول درس:</span>
              <span className="font-extrabold text-amber-700 dark:text-amber-400 text-xs">
                {highYieldStats.top3Percentage}٪ کل تست‌ها ({highYieldStats.top3Questions} از {highYieldStats.totalQuestions})
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">فصول درجه‌یک (Tier 1):</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs">
                {highYieldStats.criticalCount} مبحث فوق حیاتی
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">استراتژی بازدهی زمانی:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[10px]">
                اختصاص ۷۰٪ زمان مطالعه به فصول طلایی
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Chart Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {chartMode === 'yearly' && (
                <span>نمودار میله‌ای مقایسه‌ای سالانه: فصول درس {currentSubject.subjectName} (۱۴۰۰ تا ۱۴۰۴)</span>
              )}
              {chartMode === 'total' && (
                <span>نمودار مجموع فراوانی و بازدهی تستی فصول درس {currentSubject.subjectName}</span>
              )}
              {chartMode === 'coefficients' && (
                <span>نمودار مقایسه‌ای ضرایب دروس: وزارت علوم در برابر وزارت بهداشت</span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {chartMode === 'yearly' && 'ارتفاع میله‌ها نشان‌دهنده تعداد تست‌های مستقیم طرح شده در هر سال کنکور است'}
              {chartMode === 'total' && 'فصول مرتب شده بر اساس بیشترین سهم تستی در ۵ سال اخیر کنکور ارشد'}
              {chartMode === 'coefficients' && 'مقایسه وزن هر درس و تعداد تست‌های اختصاص داده شده در دفترچه آزمون'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Order Selector */}
            {chartMode !== 'coefficients' && (
              <div className="flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 px-1 font-medium">مرتب‌سازی:</span>
                <button
                  type="button"
                  onClick={() => setSortOrder('yield')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    sortOrder === 'yield'
                      ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="فصول با بیشترین فراوانی و تست ۵ سال اخیر اول نمایش داده می‌شوند"
                >
                  پربازده‌ترین‌ها
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('recent1404')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    sortOrder === 'recent1404'
                      ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="فصولی که در آخرین کنکور (۱۴۰۴) بیشترین سوال را داشته‌اند"
                >
                  اوج ۱۴۰۴
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('chapter')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    sortOrder === 'chapter'
                      ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="مرتب‌سازی بر اساس توالی فصول در رفرنس"
                >
                  ترتیب کتاب
                </button>
              </div>
            )}

            {/* Quick Year Filter for yearly mode */}
            {chartMode === 'yearly' && (
              <div className="flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400 px-1 font-medium">سال:</span>
                <button
                  type="button"
                  onClick={() => setSelectedYearFilter('all')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedYearFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  همه ۵ سال
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedYearFilter('1404')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedYearFilter === '1404'
                      ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ۱۴۰۴
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedYearFilter('1403')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedYearFilter === '1403'
                      ? 'bg-white dark:bg-slate-700 font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ۱۴۰۳
                </button>
              </div>
            )}
          </div>
        </div>

        {/* The Recharts Canvas */}
        <div className="w-full h-72 sm:h-84 text-xs">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'yearly' ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -15, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={50}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{
                    value: 'تعداد تست',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#94a3b8' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                />

                {(selectedYearFilter === 'all' || selectedYearFilter === '1404') && (
                  <Bar
                    dataKey="y1404"
                    name="کنکور ۱۴۰۴ (اخیر)"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {(selectedYearFilter === 'all' || selectedYearFilter === '1403') && (
                  <Bar
                    dataKey="y1403"
                    name="کنکور ۱۴۰۳"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                )}
                {selectedYearFilter === 'all' && (
                  <>
                    <Bar
                      dataKey="y1402"
                      name="کنکور ۱۴۰۲"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="y1401"
                      name="کنکور ۱۴۰۱"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="y1400"
                      name="کنکور ۱۴۰۰"
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                )}
              </BarChart>
            ) : chartMode === 'total' ? (
              <BarChart
                data={[...chartData].sort((a, b) => b.total - a.total)}
                margin={{ top: 20, right: 10, left: -15, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={50}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{
                    value: 'مجموع تست‌های ۵ سال',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#94a3b8' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="total"
                  name="مجموع سوالات طرح شده (۱۴۰۰ تا ۱۴۰۴)"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => {
                    // Color based on importance
                    const color =
                      entry.importance === 'critical'
                        ? '#ef4444'
                        : entry.importance === 'high'
                        ? '#10b981'
                        : '#64748b';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={coefficientsData}
                margin={{ top: 20, right: 10, left: -15, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={50}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{
                    value: 'ضریب درس در آزمون',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#94a3b8' },
                  }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} ${name.includes('ضریب') ? '(ضریب)' : '(تست)'}`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="scienceCoeff"
                  name="ضریب وزارت علوم (کد ۱۱۳۳)"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="healthCoeff"
                  name="ضریب وزارت بهداشت (سنجش پزشکی)"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              کنکور ۱۴۰۴ (آخرین دوره)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              کنکور ۱۴۰۳
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
              کنکور ۱۴۰۲
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              کنکور ۱۴۰۱
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            منبع: پردازش داده‌های سازمان سنجش و مرکز سنجش آموزش پزشکی (۱۴۰۰-۱۴۰۴)
          </span>
        </div>
      </div>

      {/* Chapters Table Breakdown */}
      {chartMode !== 'coefficients' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                جدول جزئیات فراوانی و سال بیشترین تمرکز فصول: {currentSubject.subjectName}
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentSubject.chapters.length} مبحث کلیدی
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5">فصل و مبحث</th>
                  <th className="p-2.5">سطح اولویت (Yield)</th>
                  <th className="p-2.5">کتاب مرجع</th>
                  <th className="p-2.5 text-center">۱۴۰۰</th>
                  <th className="p-2.5 text-center">۱۴۰۱</th>
                  <th className="p-2.5 text-center">۱۴۰۲</th>
                  <th className="p-2.5 text-center">۱۴۰۳</th>
                  <th className="p-2.5 text-center bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300">
                    ۱۴۰۴
                  </th>
                  <th className="p-2.5 text-center">مجموع</th>
                  <th className="p-2.5">سال بیشترین تمرکز</th>
                  <th className="p-2.5">نکته طلایی طراحان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {processedChapters.map((ch) => (
                  <tr
                    key={ch.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {ch.chapterNumber}
                        </span>
                        <span>{ch.chapterTitle}</span>
                      </div>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      {ch.importanceLevel === 'critical' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                          <Flame className="w-3 h-3 text-rose-500" />
                          <span>اولویت ۱ (فوق پربازده)</span>
                        </span>
                      ) : ch.importanceLevel === 'high' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>اولویت ۲ (استراتژیک)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span>اولویت ۳ (تکمیلی)</span>
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs">
                      {ch.bookTitle}
                    </td>
                    <td className="p-2.5 text-center text-slate-600 dark:text-slate-400">{ch.y1400}</td>
                    <td className="p-2.5 text-center text-slate-600 dark:text-slate-400">{ch.y1401}</td>
                    <td className="p-2.5 text-center text-slate-600 dark:text-slate-400">{ch.y1402}</td>
                    <td className="p-2.5 text-center text-emerald-700 dark:text-emerald-400 font-semibold">
                      {ch.y1403}
                    </td>
                    <td className="p-2.5 text-center font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/30 dark:bg-indigo-950/20">
                      {ch.y1404}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 dark:text-slate-100">
                      {ch.totalFiveYears}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                        <Flame className="w-3 h-3 text-amber-600" />
                        سال {ch.maxFocusYear} ({ch.maxFocusCount} تست)
                      </span>
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
                      {ch.highYieldTip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Subject, UserProgressMap, Chapter } from '../types';
import { PieChart as PieIcon, BarChart3, CheckCircle2, Clock, BookOpen, Sparkles, TrendingUp } from 'lucide-react';

interface SubjectProgressChartProps {
  subject: Subject | null;
  allSubjects: Subject[];
  userProgress: UserProgressMap;
  onFilterStatus?: (status: string) => void;
}

const STATUS_COLORS = {
  mastered: '#10b981', // emerald-500
  summarized: '#0ea5e9', // sky-500
  in_progress: '#f59e0b', // amber-500
  not_started: '#cbd5e1', // slate-300
};

export const SubjectProgressChart: React.FC<SubjectProgressChartProps> = ({
  subject,
  allSubjects,
  userProgress,
  onFilterStatus,
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Chapters for current view
  const currentChapters = useMemo(() => {
    if (subject) {
      return subject.books.flatMap((b) => b.chapters);
    }
    return allSubjects.flatMap((s) => s.books.flatMap((b) => b.chapters));
  }, [subject, allSubjects]);

  // Status breakdown data for Pie Chart
  const pieData = useMemo(() => {
    let mastered = 0;
    let summarized = 0;
    let inProgress = 0;
    let notStarted = 0;

    currentChapters.forEach((ch) => {
      const st = userProgress[ch.id]?.status || 'not_started';
      if (st === 'mastered') mastered++;
      else if (st === 'summarized') summarized++;
      else if (st === 'in_progress') inProgress++;
      else notStarted++;
    });

    return [
      { name: 'تسلط کامل', statusKey: 'mastered', value: mastered, color: STATUS_COLORS.mastered },
      { name: 'خلاصه‌نویسی شده', statusKey: 'summarized', value: summarized, color: STATUS_COLORS.summarized },
      { name: 'در حال مطالعه', statusKey: 'in_progress', value: inProgress, color: STATUS_COLORS.in_progress },
      { name: 'مطالعه‌نشده', statusKey: 'not_started', value: notStarted, color: STATUS_COLORS.not_started },
    ].filter((item) => item.value > 0 || currentChapters.length === 0);
  }, [currentChapters, userProgress]);

  // Percentage mastered
  const { masteredCount, totalCount, percentMastered, activeStudyCount } = useMemo(() => {
    const total = currentChapters.length;
    let mastered = 0;
    let summarized = 0;
    let inProg = 0;

    currentChapters.forEach((ch) => {
      const st = userProgress[ch.id]?.status || 'not_started';
      if (st === 'mastered') mastered++;
      else if (st === 'summarized') summarized++;
      else if (st === 'in_progress') inProg++;
    });

    const masteredEquivalent = mastered + summarized * 0.75 + inProg * 0.35;
    const pct = total > 0 ? Math.round((masteredEquivalent / total) * 100) : 0;

    return {
      masteredCount: mastered,
      totalCount: total,
      percentMastered: pct,
      activeStudyCount: inProg + summarized,
    };
  }, [currentChapters, userProgress]);

  // Bar Chart Data
  // If a single subject is active -> compare books in that subject
  // If 'all' is active -> compare each of the 7 subjects
  const barData = useMemo(() => {
    if (subject) {
      return subject.books.map((book) => {
        let bookMastered = 0;
        let bookInProgress = 0;
        let bookNotStarted = 0;

        book.chapters.forEach((ch) => {
          const st = userProgress[ch.id]?.status || 'not_started';
          if (st === 'mastered' || st === 'summarized') {
            bookMastered++;
          } else if (st === 'in_progress') {
            bookInProgress++;
          } else {
            bookNotStarted++;
          }
        });

        const shortTitle =
          book.title.length > 24 ? book.title.substring(0, 22) + '...' : book.title;

        return {
          name: shortTitle,
          fullTitle: book.title,
          'مسلط / خلاصه': bookMastered,
          'در جریان': bookInProgress,
          مطالعه‌نشده: bookNotStarted,
          total: book.chapters.length,
        };
      });
    }

    // All subjects comparison
    return allSubjects.map((sub) => {
      const subChapters = sub.books.flatMap((b) => b.chapters);
      let subMastered = 0;
      let subInProgress = 0;
      let subNotStarted = 0;

      subChapters.forEach((ch) => {
        const st = userProgress[ch.id]?.status || 'not_started';
        if (st === 'mastered' || st === 'summarized') {
          subMastered++;
        } else if (st === 'in_progress') {
          subInProgress++;
        } else {
          subNotStarted++;
        }
      });

      return {
        name: sub.name,
        fullTitle: sub.name,
        'مسلط / خلاصه': subMastered,
        'در جریان': subInProgress,
        مطالعه‌نشده: subNotStarted,
        total: subChapters.length,
        coeff: sub.coefficient,
      };
    });
  }, [subject, allSubjects, userProgress]);

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent =
        totalCount > 0 ? Math.round((data.value / totalCount) * 100) : 0;
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            {data.name}
          </div>
          <div className="text-slate-300">
            تعداد: <span className="font-bold text-white">{data.value}</span> فصل (
            {percent}٪)
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none min-w-[140px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1.5">
            {payload[0]?.payload?.fullTitle || label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs mb-6 transition-colors"
      id="subject-progress-chart-card"
    >
      {/* Header & Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
              نمودار پیشرفت تحلیلی {subject ? subject.name : 'کل دروس کنکور ۱۴۰۵'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {subject
                ? `پایش وضعیت یادگیری و مرور فصول کتب مرجع ${subject.name}`
                : 'مقایسه میزان تسلط در ۷ سرفصل آزمون کارشناسی ارشد روانشناسی بالینی'}
            </p>
          </div>
        </div>

        {/* Toggle between Pie and Bar Chart */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setChartType('pie')}
            id="btn-chart-pie"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              chartType === 'pie'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>نمودار دایره‌ای</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            id="btn-chart-bar"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>نمودار میله‌ای</span>
          </button>
        </div>
      </div>

      {/* Main Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Chart Visualization Column */}
        <div className="lg:col-span-8 h-[220px] w-full relative flex items-center justify-center">
          {chartType === 'pie' ? (
            <div className="w-full h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    cursor="pointer"
                    onClick={(entry: any) => {
                      const key = entry?.payload?.statusKey || entry?.statusKey;
                      if (onFilterStatus && key) {
                        onFilterStatus(key);
                      }
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Metric Label inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-none">
                  %{percentMastered}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                  پیشرفت موثر
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  barSize={subject ? 24 : 16}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
                  />
                  <Bar
                    dataKey="مسلط / خلاصه"
                    stackId="a"
                    fill={STATUS_COLORS.mastered}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="در جریان"
                    stackId="a"
                    fill={STATUS_COLORS.in_progress}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="مطالعه‌نشده"
                    stackId="a"
                    fill={STATUS_COLORS.not_started}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Statistical KPI Badges Column */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700/60">
            <span>آمار فصول {subject ? subject.name : 'کل دروس'}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalCount} فصل در مجموع</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onFilterStatus && onFilterStatus('mastered')}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-right transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>مسلط</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-50">
                {masteredCount}{' '}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">فصل</span>
              </div>
            </button>

            <button
              onClick={() => onFilterStatus && onFilterStatus('in_progress')}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-right transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-bold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>در حال مطالعه</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-50">
                {activeStudyCount}{' '}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">فصل</span>
              </div>
            </button>
          </div>

          <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {subject && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
                <span>ضریب درس در کنکور:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400">ضریب {subject.coefficient}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>فصول باقی‌مانده تا تسلط کامل:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {totalCount - masteredCount} فصل
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

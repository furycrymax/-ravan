import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  CalendarDays,
  Target,
  Printer,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  Check,
  Flame,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Save,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { EXAM_SUBJECTS } from '../data/curriculumData';
import { AIStudyPlan, DailyScheduleDay, DailyStudyLog } from '../types';
import { requestAIStudyPlan } from '../services/aiStudyPlanService';
import { toPersianDigits } from '../utils/persianCalendar';
import { PrintableStudyPlanDocument } from './PrintableStudyPlanDocument';

const LOCAL_STORAGE_PLAN_KEY = 'konkur_1405_ai_study_plan';

interface AIStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDayToCalendar?: (dateKey: string, log: Partial<DailyStudyLog>) => void;
  onSyncWithGoogleCalendar?: (preset: { date: string; summary: string; description: string; hours: number }) => void;
}

export const AIStudyPlanModal: React.FC<AIStudyPlanModalProps> = ({
  isOpen,
  onClose,
  onApplyDayToCalendar,
  onSyncWithGoogleCalendar,
}) => {
  // Plan State
  const [activePlan, setActivePlan] = useState<AIStudyPlan | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PLAN_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // Config parameters
  const allBookIds = useMemo(() => {
    const ids: string[] = [];
    EXAM_SUBJECTS.forEach((s) => s.books.forEach((b) => ids.push(b.id)));
    return ids;
  }, []);

  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(allBookIds);
  const [dailyHours, setDailyHours] = useState<number>(6);
  const [targetExam, setTargetExam] = useState<'both' | 'health' | 'science'>('both');
  const [studentLevel, setStudentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBooksDropdownOpen, setIsBooksDropdownOpen] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(!activePlan);
  const [activeViewTab, setActiveViewTab] = useState<'daily' | 'weekly' | 'monthly' | 'roadmap' | 'print_doc'>('daily');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1); // 1 = شنبه, ..., 7 = جمعه
  const [appliedDays, setAppliedDays] = useState<Record<number, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Save plan in localStorage whenever updated
  useEffect(() => {
    if (activePlan) {
      try {
        localStorage.setItem(LOCAL_STORAGE_PLAN_KEY, JSON.stringify(activePlan));
      } catch (err) {
        console.error('Failed to save study plan locally', err);
      }
    }
  }, [activePlan]);

  // Lock document body scroll on mount/open to avoid Android viewport scroll trap
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Calculate stats for current book selection
  const selectedStats = useMemo(() => {
    let chapters = 0;
    let hours = 0;
    EXAM_SUBJECTS.forEach((s) => {
      s.books.forEach((b) => {
        if (selectedBookIds.includes(b.id)) {
          chapters += b.chapters.length;
          b.chapters.forEach((ch) => {
            hours += ch.studyEstimatedHours || 5;
          });
        }
      });
    });
    return { chapters, hours, count: selectedBookIds.length };
  }, [selectedBookIds]);

  if (!isOpen) return null;

  // Book selection helpers
  const handleToggleBook = (bookId: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSelectAllBooks = () => {
    setSelectedBookIds(allBookIds);
  };

  const handleSelectHealthBooks = () => {
    const healthIds: string[] = [];
    EXAM_SUBJECTS.forEach((s) => {
      if (s.id === 'clinical' || s.id === 'general' || s.id === 'developmental' || s.id === 'english') {
        s.books.forEach((b) => healthIds.push(b.id));
      }
    });
    setSelectedBookIds(healthIds);
    setTargetExam('health');
  };

  const handleSelectScienceBooks = () => {
    const scienceIds: string[] = [];
    EXAM_SUBJECTS.forEach((s) => {
      s.books.forEach((b) => scienceIds.push(b.id));
    });
    setSelectedBookIds(scienceIds);
    setTargetExam('science');
  };

  const handleClearBooks = () => {
    setSelectedBookIds([]);
  };

  // Generate Plan Handler
  const handleGeneratePlan = async () => {
    if (selectedBookIds.length === 0) {
      alert('لطفاً حداقل یک کتاب یا سرفصل مطالعاتی را انتخاب کنید.');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedBookTitles: string[] = [];
      EXAM_SUBJECTS.forEach((s) => {
        s.books.forEach((b) => {
          if (selectedBookIds.includes(b.id)) {
            selectedBookTitles.push(b.title);
          }
        });
      });

      const plan = await requestAIStudyPlan({
        selectedBookIds,
        dailyHours,
        targetExam,
        studentLevel,
        selectedBookTitles,
      });

      setActivePlan(plan);
      setShowConfigPanel(false);
      setActiveViewTab('daily');
    } catch (err) {
      console.error(err);
      alert('خطا در برقراری ارتباط با هوش مصنوعی. لطفاً مجدداً امتحان کنید.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Mark / Apply day to Interactive Calendar
  const handleApplyToCalendar = (day: DailyScheduleDay) => {
    const todayKey = new Date().toISOString().split('T')[0];
    if (onApplyDayToCalendar) {
      onApplyDayToCalendar(todayKey, {
        customHours: day.totalHours,
        notes: `برنامه هوشمند (${day.dayName}): ${day.primaryTask.subjectName} (${day.primaryTask.allocatedHours}h) + ${day.secondaryTask.subjectName} (${day.secondaryTask.allocatedHours}h)`,
        manualMarked: true,
      });
      setAppliedDays((prev) => ({ ...prev, [day.dayNumber]: true }));
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeDay = activePlan?.weeklySchedule.find((d) => d.dayNumber === selectedDayNumber) || activePlan?.weeklySchedule[0];

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center print:p-0"
      id="ai-study-plan-modal"
      dir="rtl"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100vw',
        maxWidth: '100vw',
        minHeight: '100dvh',
      }}
    >
      <div
        className="modal-interactive-ui relative w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh] max-h-[92dvh] min-w-0 box-border text-right"
        style={{
          width: '100%',
          maxWidth: 'min(100%, 64rem)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shrink-0 gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Brain className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-base font-bold text-white truncate">
                  برنامه‌ریزی هوشمند کنکور ارشد بالینی ۱۴۰۵
                </h2>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  قانون ۲ درس در روز
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/80 hidden md:block truncate">
                طراحی علمی مسیر مطالعه تا کنکور مبتنی بر بودجه‌بندی ۱۴۰۰ تا ۱۴۰۴ و نظریه بار شناختی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {activePlan && (
              <button
                onClick={() => setShowConfigPanel((prev) => !prev)}
                className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium bg-indigo-800/60 hover:bg-indigo-700/80 text-indigo-100 border border-indigo-600/40 transition-colors flex items-center gap-1 cursor-pointer"
                title="تغییر کتاب‌ها و زمان مطالعه"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">تنظیم مجدد</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="بستن"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-800 dark:text-slate-100 flex-1 min-w-0">
          {/* Config / Allocation Drawer */}
          {showConfigPanel && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 sm:p-5 space-y-5 transition-all">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    تنظیمات تخصیص برنامه توسط هوش مصنوعی
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {toPersianDigits(selectedStats.count)} کتاب انتخابی ({toPersianDigits(selectedStats.chapters)} فصل)
                </span>
              </div>

              {/* Grid of Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Daily Study Hours Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>میزان زمان مطالعه ممکن در روز:</span>
                  </label>
                  <select
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={3}>۳ ساعت در روز (شاغل / دانشجو)</option>
                    <option value={4.5}>۴.۵ ساعت در روز (متوسط)</option>
                    <option value={6}>۶ ساعت در روز (استاندارد کنکور ارشد)</option>
                    <option value={8}>۸ ساعت در روز (تمرکز تمام‌وقت)</option>
                    <option value={10}>۱۰ ساعت در روز (فشرده و پیشرفته)</option>
                    <option value={12}>۱۲ ساعت در روز (ماراتن نهایی)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    تفکیک علمی به ۲ درس (حدود {toPersianDigits(Math.round(dailyHours * 0.58 * 10) / 10)} س برای درس سنگین + {toPersianDigits(Math.round(dailyHours * 0.42 * 10) / 10)} س برای درس مکمل)
                  </p>
                </div>

                {/* Target Exam */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    <span>کنکور و گرایش هدف:</span>
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value as 'both' | 'health' | 'science')}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="both">هر دو کنکور (همزمان وزارت بهداشت و علوم)</option>
                    <option value="health">صرفاً وزارت بهداشت (سنجش پزشکی)</option>
                    <option value="science">صرفاً وزارت علوم (کد ۱۱۳۳)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    تنظیم ضرایب بر اساس دفترچه رسمی ۱۴۰۴ و تطبیق منابع مشترک
                  </p>
                </div>

                {/* Student Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    <span>سطح آمادگی فعلی:</span>
                  </label>
                  <select
                    value={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="beginner">شروع از صفر (نیاز به مطالعه خط‌به‌خط)</option>
                    <option value="intermediate">متوسط (آشنا با مباحث و شروع تست‌زنی)</option>
                    <option value="advanced">پیشرفته (تثبیت، آزمون‌های جامع و جمع‌بندی)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    تطبیق نسبت مطالعه مفهومی به تست‌زنی سرعتی
                  </p>
                </div>
              </div>

              {/* Books Multi-Select Dropdown Menu */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>کتاب‌ها و منابع انتخابی برای گنجاندن در برنامه:</span>
                  </label>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllBooks}
                      className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                      تمام منابع
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectHealthBooks}
                      className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                      وزارت بهداشت
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectScienceBooks}
                      className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                      وزارت علوم
                    </button>
                    <button
                      type="button"
                      onClick={handleClearBooks}
                      className="px-2 py-0.5 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      پاک کردن
                    </button>
                  </div>
                </div>

                {/* Dropdown Accordion Toggle */}
                <button
                  type="button"
                  onClick={() => setIsBooksDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {toPersianDigits(selectedStats.count)} کتاب انتخاب‌شده
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[280px] sm:max-w-md">
                      {selectedStats.count === allBookIds.length
                        ? 'کلیه منابع اصلی و کتب مرجع دو کنکور'
                        : `${toPersianDigits(selectedStats.chapters)} فصل مطالعاتی در دسترس`}
                    </span>
                  </div>
                  {isBooksDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Dropdown Checklist Container */}
                {isBooksDropdownOpen && (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 max-h-60 overflow-y-auto">
                    {EXAM_SUBJECTS.map((subject) => (
                      <div key={subject.id} className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 pb-2 last:pb-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full bg-${subject.color}-500`} />
                          <span>{subject.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (ضریب بهداشت: {toPersianDigits(subject.healthCoefficient || '-')} / علوم: {toPersianDigits(subject.coefficient)})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pr-3">
                          {subject.books.map((book) => {
                            const isChecked = selectedBookIds.includes(book.id);
                            return (
                              <label
                                key={book.id}
                                className={`flex items-start gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-100 font-medium'
                                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleBook(book.id)}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <div className="leading-tight flex-1">
                                  <div className="font-semibold">{book.title}</div>
                                  <div className="text-[10px] text-slate-400">{book.authors} ({toPersianDigits(book.chaptersCount)} فصل)</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {activePlan && (
                  <button
                    type="button"
                    onClick={() => setShowConfigPanel(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    انصراف
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating || selectedBookIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer transition-all"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>
                    {isGenerating ? 'در حال نگارش علمی برنامه با هوش مصنوعی...' : 'تولید برنامه اختصاصی با هوش مصنوعی'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* If No Plan Generated Yet and Config not open */}
          {!activePlan && !showConfigPanel && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                هنوز برنامه هوشمندی تولید نشده است
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                با مشخص کردن کتاب‌های انتخابی و ساعات مطالعه، هوش مصنوعی برنامه‌ای با رعایت قانون ۲ درس در روز برای شما تدوین می‌کند.
              </p>
              <button
                onClick={() => setShowConfigPanel(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                شروع تنظیم برنامه
              </button>
            </div>
          )}

          {/* Generated Plan Views */}
          {activePlan && (
            <div className="space-y-6">
              {/* Scientific Methodology & Konkur Logic Insight Banner */}
              <div className="p-4 rounded-xl bg-linear-to-r from-indigo-50 via-sky-50 to-emerald-50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-emerald-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>اصول علمی و منطق کنکورهای ۱۴۰۰ تا ۱۴۰۴ در این برنامه:</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {activePlan.scientificMethodologyNote}
                </p>
                <div className="pt-1.5 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    قانون ۲ درس در روز برای پیشگیری از خستگی شناختی
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ترکیب درس سنگین (بالینی/مرضی) با درس مهارتی (رشد/آمار/زبان)
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    روزهای مرور فاصله‌دار (پنج‌شنبه) و خودسنجی (جمعه)
                  </span>
                </div>
              </div>

              {/* View Switcher Tabs (4 Views as requested) */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2.5 min-w-0 w-full">
                <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] sm:text-xs font-semibold overflow-x-auto max-w-full w-full sm:w-auto min-w-0 no-scrollbar">
                  <button
                    onClick={() => setActiveViewTab('daily')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                      activeViewTab === 'daily'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>نمای روزانه</span>
                  </button>

                  <button
                    onClick={() => setActiveViewTab('weekly')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                      activeViewTab === 'weekly'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>نمای هفتگی</span>
                  </button>

                  <button
                    onClick={() => setActiveViewTab('monthly')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                      activeViewTab === 'monthly'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="sm:hidden">ماهانه</span>
                    <span className="hidden sm:inline">نمای ماهانه (۸ ماه)</span>
                  </button>

                  <button
                    onClick={() => setActiveViewTab('roadmap')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                      activeViewTab === 'roadmap'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="sm:hidden">نقشه راه</span>
                    <span className="hidden sm:inline">نمای تا کنکور (نقشه راه)</span>
                  </button>

                  <button
                    onClick={() => setActiveViewTab('print_doc')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                      activeViewTab === 'print_doc'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    title="پیش‌نمایش فرمت سند چاپی رسمی متناسب با کاغذ A4 / PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="sm:hidden">سند چاپی</span>
                    <span className="hidden sm:inline">قالب چاپی و PDF</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePrint}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="خروجی مستقیم به قالب PDF استاندارد کاغذ A4"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    <span className="hidden sm:inline">چاپ / خروجی PDF</span>
                    <span className="sm:hidden">چاپ PDF</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: DAILY VIEW */}
              {activeViewTab === 'daily' && activeDay && (
                <div className="space-y-4">
                  {/* Day Picker Pill List */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {activePlan.weeklySchedule.map((day) => {
                      const isSelected = day.dayNumber === selectedDayNumber;
                      const isMarked = appliedDays[day.dayNumber];
                      return (
                        <button
                          key={day.dayNumber}
                          onClick={() => setSelectedDayNumber(day.dayNumber)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{day.dayName}</span>
                          {isMarked && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="text-[10px] opacity-80">({toPersianDigits(day.totalHours)}س)</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Day Detail Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    {/* Day Advice */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                          <span>برنامه روز {activeDay.dayName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            مجموع: {toPersianDigits(activeDay.totalHours)} ساعت مطالعه مفید
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {activeDay.dailyAdvice}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        {/* Apply to Interactive Calendar Button */}
                        <button
                          onClick={() => handleApplyToCalendar(activeDay)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                        >
                          {appliedDays[activeDay.dayNumber] ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>ثبت شد در تقویم</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>ثبت در تقویم داخلی</span>
                            </>
                          )}
                        </button>

                        {/* Sync to Google Calendar Button */}
                        {onSyncWithGoogleCalendar && (
                          <button
                            type="button"
                            onClick={() => {
                              const todayKey = new Date().toISOString().split('T')[0];
                              onSyncWithGoogleCalendar({
                                date: todayKey,
                                summary: `برنامه هوشمند کنکور: ${activeDay.primaryTask.subjectName} + ${activeDay.secondaryTask.subjectName}`,
                                description: `روز ${activeDay.dayName} (${activeDay.totalHours} ساعت):\n- درس ۱: ${activeDay.primaryTask.subjectName} (${activeDay.primaryTask.allocatedHours} ساعت) - سرفصل: ${activeDay.primaryTask.suggestedChapters}\n- درس ۲: ${activeDay.secondaryTask.subjectName} (${activeDay.secondaryTask.allocatedHours} ساعت) - سرفصل: ${activeDay.secondaryTask.suggestedChapters}\n\nتوصیه روز: ${activeDay.dailyAdvice}`,
                                hours: activeDay.totalHours,
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                            title="ثبت این روز در Google Calendar"
                          >
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>ثبت در Google Calendar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {copyFeedback && (
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ساعات و عنوان دروس برنامه این روز با موفقیت در تقویم مطالعه امروز شما ثبت گردید.</span>
                      </div>
                    )}

                    {/* The 2 Daily Subjects Grid (Strict Dual-Subject Principle) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary Subject */}
                      <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                            بخش اول: درس اصلی / ضریب بالا
                          </span>
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {toPersianDigits(activeDay.primaryTask.allocatedHours)} ساعت
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {activeDay.primaryTask.subjectName}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            مرجع: {activeDay.primaryTask.bookTitle}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            سرفصل و فصول پیشنهادی:
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            {activeDay.primaryTask.suggestedChapters}
                          </div>
                        </div>

                        <div className="text-[11px] text-indigo-950 dark:text-indigo-200/90 bg-indigo-100/60 dark:bg-indigo-900/40 p-2 rounded-lg leading-relaxed flex items-start gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span>نکته تمرکزی: {activeDay.primaryTask.focusTip}</span>
                        </div>
                      </div>

                      {/* Secondary Subject */}
                      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                            بخش دوم: درس مکمل / مهارتی و جذاب
                          </span>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {toPersianDigits(activeDay.secondaryTask.allocatedHours)} ساعت
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {activeDay.secondaryTask.subjectName}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            مرجع: {activeDay.secondaryTask.bookTitle}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            سرفصل و فصول پیشنهادی:
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            {activeDay.secondaryTask.suggestedChapters}
                          </div>
                        </div>

                        <div className="text-[11px] text-emerald-950 dark:text-emerald-200/90 bg-emerald-100/60 dark:bg-emerald-900/40 p-2 rounded-lg leading-relaxed flex items-start gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>نکته تمرکزی: {activeDay.secondaryTask.focusTip}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: WEEKLY VIEW */}
              {activeViewTab === 'weekly' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>ماتریس برنامه هفتگی بر پایه قانون دقیق ۲ درس در روز:</span>
                    <span>مجموع ساعات هفته: {toPersianDigits(activePlan.weeklySchedule.reduce((acc, d) => acc + d.totalHours, 0))} ساعت</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activePlan.weeklySchedule.map((day) => (
                      <div
                        key={day.dayNumber}
                        className={`p-3.5 rounded-xl border transition-all ${
                          day.isRestOrCatchupDay
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{day.dayName}</span>
                            {day.isRestOrCatchupDay && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-normal">
                                آزمون و ریکاوری
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {toPersianDigits(day.totalHours)} ساعت
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          {/* Subject 1 */}
                          <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30">
                            <div className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                              <span className="truncate">{day.primaryTask.subjectName}</span>
                              <span className="text-[10px] text-indigo-600 font-bold">{toPersianDigits(day.primaryTask.allocatedHours)}س</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {day.primaryTask.suggestedChapters}
                            </div>
                          </div>

                          {/* Subject 2 */}
                          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30">
                            <div className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                              <span className="truncate">{day.secondaryTask.subjectName}</span>
                              <span className="text-[10px] text-emerald-600 font-bold">{toPersianDigits(day.secondaryTask.allocatedHours)}س</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {day.secondaryTask.suggestedChapters}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                          {day.dailyAdvice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 3: MONTHLY VIEW (8 Months Milestones) */}
              {activeViewTab === 'monthly' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    نقشه ماهانه تا کنکور (اهداف فصلی، ساعات کل، و سطوح تسلط مورد انتظار):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activePlan.monthlyMilestones.map((m) => (
                      <div
                        key={m.monthNumber}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs">
                              {toPersianDigits(m.monthNumber)}
                            </span>
                            <span>{m.monthName}</span>
                          </div>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {toPersianDigits(m.totalStudyHours)} ساعت مطالعه
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            اهداف کلیدی ماه:
                          </div>
                          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                            {m.keyGoals.map((g, idx) => (
                              <li key={idx} className="leading-relaxed">{g}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            سطح تسلط: {m.expectedMastery}
                          </span>
                          <span className="text-slate-400">
                            {m.reviewCheckpoint}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 4: ROADMAP TO EXAM (Macro 4 Phases) */}
              {activeViewTab === 'roadmap' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    نقشه کلان ۴ فاز موفقیت از امروز تا روز جلسه کنکور ارشد روانشناسی بالینی:
                  </div>

                  <div className="space-y-3.5">
                    {activePlan.roadmapPhases.map((phase, idx) => (
                      <div
                        key={phase.phaseId}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              {toPersianDigits(idx + 1)}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {phase.phaseTitle}
                              </h4>
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                {phase.durationLabel} ({phase.targetTimeline})
                              </span>
                            </div>
                          </div>

                          <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                            توصیه: {toPersianDigits(phase.weeklyHoursRecommended)} ساعت در هفته
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {phase.methodology}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              دستاوردهای الزامی این فاز:
                            </span>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
                              {phase.keyDeliverables.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-500" />
                              استراتژی سنجش و تست‌زنی:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                              {phase.testStrategy}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 5: PRINTABLE PDF DOCUMENT PREVIEW */}
              {activeViewTab === 'print_doc' && activePlan && (
                <div className="space-y-4">
                  <PrintableStudyPlanDocument
                    activePlan={activePlan}
                    selectedStats={selectedStats}
                    isInteractivePreview={true}
                    onDirectPrint={handlePrint}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 shrink-0 gap-2">
          <span className="text-[11px] sm:text-xs">سامانه تخصیص برنامه هوشمند کنکور ارشد روانشناسی بالینی ۱۴۰۵</span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activePlan && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ / دریافت PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED CLEAN PRINTABLE PDF DOCUMENT (Rendered purely when window.print() is executed) */}
      {activePlan && (
        <div className="hidden print:block w-full">
          <PrintableStudyPlanDocument
            activePlan={activePlan}
            selectedStats={selectedStats}
            isInteractivePreview={false}
          />
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

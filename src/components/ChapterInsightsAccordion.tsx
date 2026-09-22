import React, { useState, useMemo } from 'react';
import { Chapter } from '../types';
import {
  getChapterTestInsights,
  generateAiAdvancedChapterTips,
  TestPointItem,
} from '../data/chapterInsights';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Brain,
  Copy,
  Check,
  PlusCircle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Flame,
  Wand2,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface ChapterInsightsAccordionProps {
  chapter: Chapter;
  subjectCoefficient?: number;
  onAppendToNotes?: (textToAppend: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChapterInsightsAccordion: React.FC<ChapterInsightsAccordionProps> = ({
  chapter,
  subjectCoefficient,
  onAppendToNotes,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'golden' | 'traps' | 'mnemonics' | 'quiz'>('all');
  const [copied, setCopied] = useState(false);
  const [noteAdded, setNoteAdded] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [extraAiPoints, setExtraAiPoints] = useState<TestPointItem[]>([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizNoteAdded, setQuizNoteAdded] = useState(false);

  // Base insights from our curated psychology database and context engine
  const baseInsights = useMemo(() => {
    return getChapterTestInsights(chapter);
  }, [chapter]);

  // Combined points including any dynamically generated AI points
  const allGoldenPoints = useMemo(() => {
    const aiGold = extraAiPoints.filter((p) => p.type === 'golden');
    return [...baseInsights.goldenPoints, ...aiGold];
  }, [baseInsights.goldenPoints, extraAiPoints]);

  const allTraps = useMemo(() => {
    const aiTraps = extraAiPoints.filter((p) => p.type === 'trap');
    return [...baseInsights.traps, ...aiTraps];
  }, [baseInsights.traps, extraAiPoints]);

  const allMnemonics = baseInsights.mnemonics;

  const totalPointsCount = allGoldenPoints.length + allTraps.length + allMnemonics.length;

  const handleCopyAll = async () => {
    const q = baseInsights.sampleQuestion;
    const textLines: string[] = [
      `📌 نکات کلیدی و تست‌خیز: فصل ${chapter.number} - ${chapter.title}`,
      `کتاب مرجع: ${chapter.bookTitle}`,
      `اهمیت در بودجه‌بندی: ${chapter.averageQuestions}`,
      '',
      '⭐ نکات طلایی و خط‌به‌خط:',
      ...allGoldenPoints.map((g, i) => `${i + 1}. [${g.title}]: ${g.content}`),
      '',
      '⚠️ دام‌های تستی طراحان کنکور:',
      ...allTraps.map((t, i) => `${i + 1}. [${t.title}]: ${t.content}`),
      '',
      '🧠 کدهای یادسپاری و رمزگردانی:',
      ...allMnemonics.map((m, i) => `${i + 1}. [${m.title}]: ${m.content}`),
      '',
      `🩺 تحلیل تطبیقی کنکور: ${baseInsights.comparativeAnalysis}`,
    ];

    if (q) {
      textLines.push(
        '',
        '📝 تست خودسنجی کنکور:',
        q.questionText,
        ...q.options.map((opt, i) => `  ${i + 1}) ${opt}`),
        `گزینه صحیح: ${q.correctIndex + 1}`,
        `تحلیل تشریحی: ${q.explanation}`
      );
    }

    try {
      await navigator.clipboard.writeText(textLines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToNotes = () => {
    if (!onAppendToNotes) return;
    const formattedNotes = `\n--- 📌 نکات تستی منتخب فصل ${chapter.number} ---\n` +
      allGoldenPoints.slice(0, 2).map((g) => `• ${g.title}: ${g.content}`).join('\n') +
      '\n' +
      allTraps.slice(0, 1).map((t) => `• دام تستی: ${t.content}`).join('\n');

    onAppendToNotes(formattedNotes);
    setNoteAdded(true);
    setTimeout(() => setNoteAdded(false), 2500);
  };

  const handleAddQuizToNotes = () => {
    if (!onAppendToNotes || !baseInsights.sampleQuestion) return;
    const q = baseInsights.sampleQuestion;
    const text =
      `\n\n📝 تست خودسنجی فصل ${chapter.number} (${chapter.title}):\n` +
      `سوال: ${q.questionText}\n` +
      q.options.map((opt, i) => `${i + 1}) ${opt} ${i === q.correctIndex ? '✅ (صحیح)' : ''}`).join('\n') +
      `\n💡 تحلیل تشریحی: ${q.explanation}`;

    onAppendToNotes(text);
    setQuizNoteAdded(true);
    setTimeout(() => setQuizNoteAdded(false), 2500);
  };

  const handleFetchAiTips = async () => {
    if (isLoadingAi) return;
    setIsLoadingAi(true);
    try {
      const generated = await generateAiAdvancedChapterTips(chapter);
      setExtraAiPoints((prev) => [...prev, ...generated]);
    } catch (e) {
      console.error('Failed to generate AI points', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="mt-3 border-t border-slate-200/80 dark:border-slate-800 pt-3" id={`accordion-wrapper-${chapter.id}`}>
      {/* Accordion Header / Trigger Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={onToggle}
          id={`btn-toggle-accordion-${chapter.id}`}
          className={`flex-1 min-w-[240px] flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
            isOpen
              ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700/80 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-500 text-white shadow-2xs">
              <Flame className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              نکات کلیدی و تست‌خیز کنکور
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
              {totalPointsCount} نکته و ۱ تست خودسنجی
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span>{isOpen ? 'بستن پنل' : 'مشاهده تحلیل و دام‌های تستی'}</span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* Quick actions in trigger row when open */}
        {isOpen && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyAll}
              title="کپی کردن تمام نکات در کلیپ‌بورد"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد!' : 'کپی نکات'}</span>
            </button>

            {onAppendToNotes && (
              <button
                type="button"
                onClick={handleAddToNotes}
                title="اضافه کردن خلاصه نکات به بخش یادداشت‌های شخصی این فصل"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                {noteAdded ? <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{noteAdded ? 'به یادداشت اضافه شد' : 'افزودن به یادداشت'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Accordion Content Body */}
      {isOpen && (
        <div
          className="mt-3 p-4 rounded-xl bg-linear-to-b from-amber-50/40 via-white to-slate-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-amber-200/70 dark:border-slate-800 shadow-xs space-y-4 animate-fadeIn"
          id={`accordion-content-${chapter.id}`}
        >
          {/* Sub-Header / Strategic overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-amber-500/10 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 dark:text-amber-200">ارزیابی آماری و استراتژی فصل: </span>
                <span className="text-amber-900 dark:text-amber-300">{baseInsights.importanceSummary}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFetchAiTips}
              disabled={isLoadingAi}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-slate-700 transition-all cursor-pointer shrink-0 self-start sm:self-auto disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${isLoadingAi ? 'animate-spin' : ''}`} />
              <span>{isLoadingAi ? 'در حال تحلیل هوش مصنوعی...' : 'تحلیل تکمیلی با هوش مصنوعی'}</span>
            </button>
          </div>

          {/* Filter Tabs inside Accordion */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              همه سرفصل‌ها ({totalPointsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('golden')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                activeTab === 'golden'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-slate-700'
              }`}
            >
              <Lightbulb className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              نکات طلایی خط‌به‌خط ({allGoldenPoints.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('traps')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                activeTab === 'traps'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              دام‌های تستی طراحان ({allTraps.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mnemonics')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                activeTab === 'mnemonics'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-slate-700'
              }`}
            >
              <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              کدهای یادسپاری ({allMnemonics.length})
            </button>
            {baseInsights.sampleQuestion && (
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                  activeTab === 'quiz'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-slate-700'
                }`}
              >
                <HelpCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                تست خودسنجی کنکور (شبیه‌ساز)
              </button>
            )}
          </div>

          {/* Interactive Self-Assessment Quiz Section */}
          {(activeTab === 'all' || activeTab === 'quiz') && baseInsights.sampleQuestion && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-linear-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-600 text-white shadow-2xs">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      تست خودسنجی و سناریوی تستی استاندارد کنکور ارشد
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      بر اساس منابع آزمون ۱۴۰۵ ({chapter.bookTitle})
                    </span>
                  </div>
                </div>

                {selectedQuizOption !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedQuizOption(null)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>پاسخ مجدد</span>
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 ml-1">سوال:</span>
                {baseInsights.sampleQuestion.questionText}
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 gap-2">
                {baseInsights.sampleQuestion.options.map((option, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  const isCorrect = idx === baseInsights.sampleQuestion!.correctIndex;
                  const hasAnswered = selectedQuizOption !== null;

                  let cardStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-slate-200';
                  let badgeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

                  if (hasAnswered) {
                    if (isCorrect) {
                      cardStyle = 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold shadow-2xs';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100';
                      badgeStyle = 'bg-rose-600 text-white';
                    } else {
                      cardStyle = 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 opacity-60';
                    }
                  }

                  const persianNumerals = ['۱', '۲', '۳', '۴'];
                  const persianLetters = ['الف', 'ب', 'ج', 'د'];

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => setSelectedQuizOption(idx)}
                      className={`w-full text-right p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-2.5 transition-all cursor-pointer ${cardStyle}`}
                    >
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold shrink-0 mt-0.5 ${badgeStyle}`}>
                        {persianNumerals[idx]}
                      </span>
                      <span className="flex-1 leading-relaxed">
                        <span className="font-bold ml-1">({persianLetters[idx]})</span>
                        {option}
                      </span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {selectedQuizOption !== null && (
                <div className="mt-3 p-3.5 rounded-lg bg-white dark:bg-slate-800/95 border border-emerald-300 dark:border-emerald-700 space-y-2 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 font-bold">
                      {selectedQuizOption === baseInsights.sampleQuestion.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-900 dark:text-emerald-300">
                            پاسخ شما کاملاً صحیح است! ✨ (گزینه {selectedQuizOption + 1})
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <span className="text-rose-900 dark:text-rose-300">
                            پاسخ نادرست. گزینه صحیح: گزینه {baseInsights.sampleQuestion.correctIndex + 1}
                          </span>
                        </>
                      )}
                    </div>

                    {onAppendToNotes && (
                      <button
                        type="button"
                        onClick={handleAddQuizToNotes}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                      >
                        {quizNoteAdded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        <span>{quizNoteAdded ? 'تست به یادداشت اضافه شد' : 'افزودن تست به یادداشت'}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      💡 تحلیل تشریحی و نکته کلیدی رفرنس:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {baseInsights.sampleQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Golden Points Section */}
          {(activeTab === 'all' || activeTab === 'golden') && allGoldenPoints.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>نکات طلایی و سوال‌خیز خط‌به‌خط (High-Yield):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {allGoldenPoints.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-amber-200/90 dark:border-slate-700 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        {item.title}
                      </span>
                      {item.tag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Traps Section */}
          {(activeTab === 'all' || activeTab === 'traps') && allTraps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>دام‌های تستی و اشتباهات رایج داوطلبان (Exam Pitfalls):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {allTraps.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-2xs hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        {item.title}
                      </span>
                      {item.tag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mnemonics Section */}
          {(activeTab === 'all' || activeTab === 'mnemonics') && allMnemonics.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 dark:text-purple-200">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>کدهای یادسپاری و رمزگردانی ذهنی (Mnemonics):</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {allMnemonics.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        {item.title}
                      </span>
                      {item.tag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-950 dark:text-purple-200 font-medium leading-relaxed bg-white/70 dark:bg-slate-800/80 p-2 rounded border border-purple-100 dark:border-purple-800">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparative Ministry Analysis Card */}
          <div className="p-3 rounded-lg bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-teal-950 dark:text-teal-200">
                <Stethoscope className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>تحلیل تطبیقی کنکور بهداشت (سنجش پزشکی) و وزارت علوم:</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 font-semibold text-teal-800 dark:text-teal-200">
                تحلیل دفترچه‌ای
              </span>
            </div>
            <p className="text-teal-900 dark:text-teal-200 leading-relaxed text-xs">
              {baseInsights.comparativeAnalysis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

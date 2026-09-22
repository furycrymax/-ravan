import React, { useState, useEffect } from 'react';
import {
  Chapter,
  ChapterUserData,
  ImportanceLevel,
  StudyStatus,
} from '../types';
import { ChapterInsightsAccordion } from './ChapterInsightsAccordion';
import {
  CheckCircle,
  Clock,
  HelpCircle,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
  Tag,
  BookMarked,
  Sparkles,
  Stethoscope,
  GraduationCap,
  Flame,
  Globe,
  ShieldCheck,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface ChapterCardProps {
  chapter: Chapter;
  userData?: ChapterUserData;
  onUpdateUserData: (chapterId: string, data: Partial<ChapterUserData>) => void;
  subjectCoefficient?: number;
  onOpenSearchGrounding?: (chapter: Chapter) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  userData = {
    status: 'not_started',
    notes: '',
    readBookText: false,
    doneTrainingTests: false,
    doneReviewTests: false,
  },
  onUpdateUserData,
  subjectCoefficient,
  onOpenSearchGrounding,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [localNotes, setLocalNotes] = useState(userData.notes || '');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    setLocalNotes(userData.notes || '');
  }, [userData.notes]);

  const handleStatusChange = (status: StudyStatus) => {
    onUpdateUserData(chapter.id, { status });
  };

  const handleCheckboxToggle = (
    field: 'readBookText' | 'doneTrainingTests' | 'doneReviewTests'
  ) => {
    const updatedValue = !userData[field];
    const updates: Partial<ChapterUserData> = { [field]: updatedValue };

    // Auto-update status if all 3 are completed
    const willHaveAllChecked =
      (field === 'readBookText' ? updatedValue : userData.readBookText) &&
      (field === 'doneTrainingTests' ? updatedValue : userData.doneTrainingTests) &&
      (field === 'doneReviewTests' ? updatedValue : userData.doneReviewTests);

    if (willHaveAllChecked && userData.status !== 'mastered') {
      updates.status = 'mastered';
    } else if (updatedValue && userData.status === 'not_started') {
      updates.status = 'in_progress';
    }

    onUpdateUserData(chapter.id, updates);
  };

  const handleNotesBlur = () => {
    if (localNotes !== userData.notes) {
      onUpdateUserData(chapter.id, { notes: localNotes });
    }
  };

  const handleAppendToNotes = (textToAppend: string) => {
    const updated = (localNotes ? localNotes + '\n' : '') + textToAppend;
    setLocalNotes(updated);
    onUpdateUserData(chapter.id, { notes: updated });
    setShowNotes(true);
  };

  const renderImportanceBadge = (importance: ImportanceLevel) => {
    switch (importance) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            بسیار پرتست (طلایی)
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            مهم و پرسوال
          </span>
        );
      case 'medium':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800">
            پایه‌ای / متوسط
          </span>
        );
    }
  };

  const getStatusBorderColor = () => {
    switch (userData.status) {
      case 'mastered':
        return 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/10 dark:bg-emerald-950/10';
      case 'summarized':
        return 'border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/10 dark:bg-indigo-950/10';
      case 'in_progress':
        return 'border-amber-200 dark:border-amber-800/80 bg-amber-50/10 dark:bg-amber-950/10';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md p-5 ${getStatusBorderColor()}`}
      id={`chapter-card-${chapter.id}`}
    >
      {/* Top row: Chapter number, title, book info, and importance */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              فصل {chapter.number}
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <BookMarked className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              {chapter.bookTitle}
            </span>
            {subjectCoefficient && (
              <>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-amber-800 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.2 rounded border border-amber-200/60 dark:border-amber-800/60">
                  ضریب درس: {subjectCoefficient}
                </span>
              </>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
            {chapter.title}
          </h3>
        </div>

        {/* Badges & Budgeting */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Target Exam Badge */}
          {chapter.targetExam === 'health' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              اختصاصی بهداشت
            </span>
          ) : chapter.targetExam === 'science' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              اختصاصی علوم
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              مشترک هر دو کنکور
            </span>
          )}

          {renderImportanceBadge(chapter.importance)}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            بودجه‌بندی: {chapter.averageQuestions}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
            <Clock className="w-3 h-3 text-slate-400" />
            ~{chapter.studyEstimatedHours} ساعت
          </span>
        </div>
      </div>

      {/* Key topics pills */}
      <div className="mt-3.5">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
          <Tag className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
          سرفصل‌ها و مباحث کلیدی سوال‌خیز:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chapter.keyTopics.map((topic, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Exam Tips Box */}
      {chapter.examTips && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-900 dark:text-amber-300">نکته طلایی و استراتژی کنکور: </strong>
            <span>{chapter.examTips}</span>
          </div>
        </div>
      )}

      {/* Ministry of Health Analysis Box */}
      {chapter.healthFrequency && (
        <div className="mt-2.5 p-3 rounded-lg bg-teal-50/90 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-950 dark:text-teal-200 flex items-start gap-2">
          <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-teal-900 dark:text-teal-300">تحلیل دفترچه‌های کنکور وزارت بهداشت: </strong>
            <span>{chapter.healthFrequency}</span>
          </div>
        </div>
      )}

      {/* Interactive Controls: 3-step checklist & Status buttons */}
      <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* 3-Step Study Checklist */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              id={`chk-text-${chapter.id}`}
              checked={userData.readBookText}
              onChange={() => handleCheckboxToggle('readBookText')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
            />
            <span>۱. مطالعه متن کتاب</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              id={`chk-tests-${chapter.id}`}
              checked={userData.doneTrainingTests}
              onChange={() => handleCheckboxToggle('doneTrainingTests')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
            />
            <span>۲. تست‌زنی آموزشی</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              id={`chk-review-${chapter.id}`}
              checked={userData.doneReviewTests}
              onChange={() => handleCheckboxToggle('doneReviewTests')}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
            />
            <span>۳. مرور و تست زمان‌دار</span>
          </label>
        </div>

        {/* Study Status Button Group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">وضعیت:</span>
          {(
            [
              { id: 'not_started', label: 'نخوانده', color: 'slate' },
              { id: 'in_progress', label: 'در حال مطالعه', color: 'amber' },
              { id: 'summarized', label: 'خلاصه‌نویسی', color: 'indigo' },
              { id: 'mastered', label: 'کاملاً مسلط', color: 'emerald' },
            ] as const
          ).map((st) => {
            const isActive = userData.status === st.id;
            return (
              <button
                key={st.id}
                type="button"
                id={`btn-status-${chapter.id}-${st.id}`}
                onClick={() => handleStatusChange(st.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer border ${
                  isActive
                    ? st.id === 'mastered'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : st.id === 'summarized'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : st.id === 'in_progress'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-slate-700 dark:bg-slate-600 text-white border-slate-700 dark:border-slate-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            );
          })}

          {/* Toggle Notes Button */}
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            id={`btn-notes-toggle-${chapter.id}`}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
              userData.notes || showNotes
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>یادداشت‌ها</span>
            {userData.notes && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>}
            {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Quick Accordion Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            id={`btn-quick-accordion-${chapter.id}`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
              isAccordionOpen
                ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isAccordionOpen ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
            <span>نکات تستی</span>
            {isAccordionOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Quick Real-time Search Grounding Button */}
          {onOpenSearchGrounding && (
            <button
              type="button"
              onClick={() => onOpenSearchGrounding(chapter)}
              id={`btn-search-grounding-${chapter.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
              title="استعلام آخرین تغییرات و نکات این فصل با جستجوی زنده گوگل و Gemini"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>استعلام وب</span>
            </button>
          )}

          {/* Reference & Data Authenticity Button */}
          <button
            type="button"
            onClick={() => setShowCitation(!showCitation)}
            id={`btn-reference-citation-${chapter.id}`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
              showCitation
                ? 'bg-slate-700 text-white border-slate-800 dark:bg-slate-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="اعتبارسنجی منبع، کد دفترچه و سند مصوب وزارتین"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>منبع و سند</span>
          </button>
        </div>
      </div>

      {/* Expandable Reference & Citation Drawer */}
      {showCitation && (
        <div className="mt-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>شناسنامه علمی، رفرنس کتاب و استناد به دفترچه‌های کنکور</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              سند معتبر
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">کتاب و منبع اصلی: </span>
              <strong className="text-slate-800 dark:text-slate-200">{chapter.referenceCitation?.book || chapter.bookTitle}</strong>
              {chapter.authors && <span className="block text-[11px] text-slate-500 dark:text-slate-400">تألیف: {chapter.authors}</span>}
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium">وضعیت در سرفصل رسمی: </span>
              <span className="text-slate-800 dark:text-slate-200">
                {chapter.referenceCitation?.officialCurriculumNote ||
                  'مطابق سرفصل شورای عالی برنامه‌ریزی علوم پزشکی و وزارت علوم (کد ۱۱۳۳)'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              بودجه‌بندی مستخرج از کلید رسمی سنجش و مرکز سنجش آموزش پزشکی (۱۳۹۴ تا ۱۴۰۴)
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://sanjesh.org"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <span>سنجش علوم</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://sanjeshp.ir"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                <span>سنجش پزشکی</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Notes Box */}
      {showNotes && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              یادداشت شخصی، کدهای حفظی، و سوالات شبهه‌دار این فصل:
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">ذخیره خودکار در حافظه مرورگر</span>
          </div>
          <textarea
            id={`textarea-notes-${chapter.id}`}
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="مثال: یادآوری فرمول شاخص‌های وکسلر، رمز گردانی مراحل پیاژه (حسی، پیش، عینی، صوری)، صفحه تست‌های دام‌دار..."
            rows={2}
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>
      )}

      {/* Accordion Component: High-yield key points, traps, mnemonics & exam comparison */}
      <ChapterInsightsAccordion
        chapter={chapter}
        subjectCoefficient={subjectCoefficient}
        onAppendToNotes={handleAppendToNotes}
        isOpen={isAccordionOpen}
        onToggle={() => setIsAccordionOpen((prev) => !prev)}
      />
    </div>
  );
};

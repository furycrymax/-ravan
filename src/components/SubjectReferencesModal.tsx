import React, { useEffect, useState } from 'react';
import { Subject, Book, Chapter } from '../types';
import {
  X,
  BookOpen,
  Library,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Award,
  Layers,
  GraduationCap,
  Bookmark,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { getAICitationRationale } from '../utils/subjectReferenceResolver';

interface SubjectReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  taskTitle?: string;
  onSelectBook?: (bookId: string) => void;
}

export const SubjectReferencesModal: React.FC<SubjectReferencesModalProps> = ({
  isOpen,
  onClose,
  subject,
  taskTitle,
  onSelectBook,
}) => {
  const [copiedBookId, setCopiedBookId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !subject) return null;

  const rationale = getAICitationRationale(subject, taskTitle);

  const handleCopyBookCitation = async (book: Book) => {
    const citation = `📚 منبع مرجع استناد شده: ${book.title}\n✍️ پدیدآورندگان: ${book.authors}${
      book.translators ? ` | مترجمان: ${book.translators}` : ''
    }${book.publisher ? ` | ناشر: ${book.publisher}` : ''}\n🎯 اولویت در کنکور: ${book.priority}\n📖 تعداد فصول: ${
      book.chaptersCount || book.chapters.length
    } فصل\n💡 جایگاه در آزمون: ${book.description}`;

    try {
      await navigator.clipboard.writeText(citation);
      setCopiedBookId(book.id);
      setTimeout(() => setCopiedBookId(null), 2500);
    } catch {
      setCopiedBookId(book.id);
      setTimeout(() => setCopiedBookId(null), 2500);
    }
  };

  const handleCopyAllCitations = async () => {
    const allText = [
      `🏛️ فهرست کتب مرجع مورد استناد هوش مصنوعی برای درس «${subject.name}»`,
      `ضریب آزمون ارشد وزارت بهداشت: ${subject.healthCoefficient || 'فاقد سوال'} | ضریب وزارت علوم: ${subject.coefficient}`,
      `تعداد سوالات دفترچه: بهداشت ${subject.healthQuestions || 0} تست | علوم ${subject.totalQuestions} تست`,
      '',
      `📌 منطق استناد هوش مصنوعی:`,
      rationale.rationale,
      '',
      '--- فهرست کتب مرجع ---',
      ...subject.books.map((b, i) => {
        return `${i + 1}. ${b.title}\n   نویسندگان: ${b.authors}${
          b.translators ? ` (ترجمه: ${b.translators})` : ''
        }\n   ناشر: ${b.publisher || 'ناشر معتبر دانشگاهی'}\n   نقش در آزمون: ${
          b.priority
        }\n   توضیحات: ${b.description}\n`;
      }),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-right dir-rtl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-indigo-50/70 via-white to-purple-50/70 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
              <Library className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  منابع و کتب مرجع استناد شده هوش مصنوعی
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  درس: {subject.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                فهرست کتب مرجع مصوب شورای عالی سنجش پزشکی و علوم با ضرایب آزمون
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Exam Weights & Questions Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">ضریب کنکور بهداشت</span>
              <span className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
                {subject.healthCoefficient !== undefined ? `ضریب ${subject.healthCoefficient}` : 'فاقد سوال'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">ضریب کنکور علوم</span>
              <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                ضریب {subject.coefficient}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">تست‌های دفترچه بهداشت</span>
              <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
                {subject.healthQuestions ? `${subject.healthQuestions} سوال` : '-'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">تست‌های دفترچه علوم</span>
              <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
                {subject.totalQuestions} سوال
              </span>
            </div>
          </div>

          {/* AI Citation Rationale Card */}
          <div className="p-4 rounded-xl bg-linear-to-br from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>منطق هوش مصنوعی در استناد به این کتب:</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {rationale.rationale}
            </p>
            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-800 dark:text-indigo-300/90 flex-wrap gap-2">
              <span className="font-semibold">🎯 سطح انطباق: {rationale.syllabusAlignment}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 font-bold border border-indigo-200/60 dark:border-indigo-800">
                {rationale.targetExamEmphasis}
              </span>
            </div>
          </div>

          {/* Reference Books List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>کتب مرجع معتبر برای درس «{subject.name}» ({subject.books.length} منبع)</span>
              </h4>

              <button
                type="button"
                onClick={handleCopyAllCitations}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی کل فهرست منابع</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {subject.books.map((book, idx) => {
                const isCopied = copiedBookId === book.id;
                // High-yield chapters with critical importance
                const criticalChapters = book.chapters.filter((c) => c.importance === 'critical');
                const isSelectedForStudy = taskTitle && taskTitle.includes(book.title);

                return (
                  <div
                    key={book.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelectedForStudy
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-xs'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            {book.title}
                          </h5>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              book.priority === 'اصلی و ضروری'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            {book.priority}
                          </span>
                          {isSelectedForStudy && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                              مرجع این نوبت مطالعه
                            </span>
                          )}
                        </div>

                        {/* Authors & Translators */}
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <span>پدیدآورندگان: {book.authors}</span>
                          {book.translators && (
                            <span className="mr-2 pr-2 border-r border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                              مترجم: {book.translators}
                            </span>
                          )}
                          {book.publisher && (
                            <span className="mr-2 pr-2 border-r border-slate-200 dark:border-slate-700 text-slate-400 text-[11px]">
                              ناشر: {book.publisher}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Copy single book citation */}
                      <button
                        type="button"
                        onClick={() => handleCopyBookCitation(book)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="کپی استناد این کتاب"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Book Description / AI Note */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      💡 {book.description}
                    </p>

                    {/* High-yield Chapters Preview */}
                    {criticalChapters.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>فصول با اهمیت بحرانی (⭐⭐⭐) در بودجه‌بندی کنکور:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {criticalChapters.slice(0, 4).map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/40 font-medium"
                              title={`${c.title} - ${c.averageQuestions}`}
                            >
                              فصل {c.number}: {c.title} ({c.averageQuestions})
                            </span>
                          ))}
                          {criticalChapters.length > 4 && (
                            <span className="text-[10px] text-slate-400">
                              و {criticalChapters.length - 4} فصل کلیدی دیگر...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Direct Action to Jump to this Book */}
                    {onSelectBook && (
                      <div className="mt-3 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBook(book.id);
                            onClose();
                          }}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>مشاهده همه فصول در داشبورد مطالعه</span>
                          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
            استناد شده بر مبنای آخرین مصوبات شورای سنجش آموزش پزشکی و وزارت علوم
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer ml-auto"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

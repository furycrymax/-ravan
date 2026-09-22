import React from 'react';
import { Subject, Book } from '../types';
import { BookOpen, Award, FileQuestion, HelpCircle, CheckCircle, Info } from 'lucide-react';

interface SubjectOverviewCardProps {
  subject: Subject;
  selectedBookId?: string;
  onSelectBook: (bookId: string) => void;
}

export const SubjectOverviewCard: React.FC<SubjectOverviewCardProps> = ({
  subject,
  selectedBookId,
  onSelectBook,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs mb-6 transition-colors" id={`subject-overview-${subject.id}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">{subject.name}</h2>
            {/* Science Exam Badge */}
            {subject.id === 'psychometrics' ? (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800"
                title="در دفترچه وزارت علوم (کد ۱۱۳۳، درس ۸ با ۲۰ تست): ضریب ۲ در گرایش‌های عمومی و سنجش؛ در گرایش بالینی مباحث در درس روان‌شناسی بالینی با ضریب ۳ می‌آید"
              >
                علوم (کد ۱۱۳۳): ضریب ۲ در عمومی و سنجش (۲۰ تست) | بالینی: مبحثی در ضریب ۳
              </span>
            ) : subject.coefficient > 0 ? (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  subject.coefficient === 3
                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : subject.coefficient === 2
                    ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title="ضریب در کنکور کارشناسی ارشد وزارت علوم (کد ۱۱۳۳)"
              >
                علوم: ضریب {subject.coefficient} ({subject.totalQuestions} تست)
              </span>
            ) : (
              <span
                className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                title="این عنوان در دفترچه آزمون وزارت علوم وجود ندارد"
              >
                در آزمون وزارت علوم نیست
              </span>
            )}

            {/* Health Exam Badge */}
            {subject.healthCoefficient && subject.healthCoefficient > 0 ? (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  subject.healthCoefficient === 3
                    ? 'bg-teal-100 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-800'
                    : subject.healthCoefficient >= 2
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                }`}
                title="ضریب در کنکور کارشناسی ارشد وزارت بهداشت (سنجش پزشکی)"
              >
                بهداشت: ضریب {subject.healthCoefficient} ({subject.healthQuestions || '—'} تست)
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                در آزمون وزارت بهداشت نیست
              </span>
            )}

            {/* Dual Status Tag */}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {subject.targetExam === 'health'
                ? 'اختصاصی وزارت بهداشت'
                : subject.targetExam === 'science'
                ? 'اختصاصی وزارت علوم'
                : 'مشترک در هر دو کنکور'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {subject.importanceNote}
          </p>

          {subject.id === 'psychometrics' && (
            <div className="mt-3 p-3 rounded-lg bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs leading-relaxed text-sky-900 dark:text-sky-200">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-sky-950 dark:text-sky-100">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>بررسی و شفاف‌سازی ضریب در کنکور وزارت علوم (کد ۱۱۳۳) و وزارت بهداشت:</span>
              </div>
              <p>
                درس <strong>«روان‌سنجی (سنجش و اندازه‌گیری)»</strong> درس شماره ۸ دفترچه کنکور کارشناسی ارشد وزارت علوم (کد ۱۱۳۳) دارای <strong>۲۰ تست مستقل</strong> است. برای <strong>گرایش روان‌شناسی عمومی و گرایش روان‌سنجی دارای ضریب ۲</strong> است. برای <strong>گرایش روان‌شناسی بالینی (کد ۱)</strong> ضریب عنوان مستقل ۰ لحاظ شده؛ اما تست‌های ارزیابی و آزمون‌های بالینی (هوش وکسلر، MMPI-2، رورشاخ، میلون و آزمون‌های فرافکن مارنات) <strong>مستقیماً در قالب درس روان‌شناسی بالینی با بالاترین ضریب (ضریب ۳)</strong> مطرح می‌شوند. در کنکور وزارت بهداشت نیز این درس عنوانی کاملاً مستقل با <strong>ضریب ۱.۵ و ۱۵ تست</strong> است.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Books row */}
      <div>
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>کتب و مراجع اصلی طراحان کنکور برای این درس:</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subject.books.map((book) => {
            const isSelected = selectedBookId === book.id;
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(isSelected ? 'all' : book.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/60 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {book.title}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                        book.priority === 'اصلی و ضروری'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {book.priority}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 mb-2">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">مؤلف:</span> {book.authors}
                    </div>
                    {book.translators && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">مترجم:</span> {book.translators}
                      </div>
                    )}
                    {book.publisher && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">ناشر:</span> {book.publisher}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 pt-2">
                    {book.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                  <span>{book.chaptersCount} فصل استاندارد</span>
                  <span className="hover:underline">
                    {isSelected ? '✓ در حال فیلتر این کتاب' : 'فیلتر کردن فقط این کتاب ←'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

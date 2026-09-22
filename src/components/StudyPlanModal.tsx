import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download, Upload, CheckCircle2, BookOpen } from 'lucide-react';
import { EXAM_SUBJECTS } from '../data/curriculumData';
import { UserProgressMap } from '../types';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgressMap;
  onImportProgress: (data: UserProgressMap) => void;
}

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  isOpen,
  onClose,
  userProgress,
  onImportProgress,
}) => {
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(userProgress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `arshad-1405-clinical-progress-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (typeof json === 'object') {
          onImportProgress(json);
          alert('اطلاعات پیشرفت با موفقیت بارگذاری شد!');
        }
      } catch (err) {
        alert('خطا در خواندن فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      id="study-plan-modal"
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
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        style={{
          width: '100%',
          maxWidth: 'min(100%, 48rem)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              چک‌لیست چاپی و پشتیبان‌گیری پیشرفت مطالعه کنکور ۱۴۰۵
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              id="btn-print-checklist"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              چاپ یا ذخیره PDF چک‌لیست
            </button>

            <button
              onClick={handleExportJSON}
              id="btn-export-progress"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              خروجی فایل پشتیبان (JSON)
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>بارگذاری فایل پشتیبان</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-slate-100">نحوه استفاده از چک‌لیست چاپی:</p>
            <p className="text-slate-600 dark:text-slate-300">
              با زدن دکمه <strong>چاپ یا ذخیره PDF</strong>، می‌توانید فهرست تمامی فصول کنکور به همراه وضعیت مطالعه را پرینت بگیرید و روی میز مطالعه خود نصب کنید تا در ماه‌های منتهی به کنکور ۱۴۰۵ دیدی کامل بر روی دوره‌های مرور داشته باشید.
            </p>
          </div>

          {/* Quick subject checklist overview */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm">
              فهرست خلاصه دروس و وضعیت فصل‌ها:
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {EXAM_SUBJECTS.map((sub) => {
                const chapters = sub.books.flatMap((b) => b.chapters);
                const masteredCount = chapters.filter((c) => userProgress[c.id]?.status === 'mastered').length;
                const inProgressCount = chapters.filter((c) => userProgress[c.id]?.status === 'in_progress').length;

                return (
                  <div key={sub.id} className="p-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 ml-2">{sub.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">(ضریب {sub.coefficient})</span>
                      <span className="text-slate-400 dark:text-slate-500 mr-2">— {chapters.length} فصل</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        {masteredCount} مسلط
                      </span>
                      {inProgressCount > 0 && (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                          {inProgressCount} در جریان
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

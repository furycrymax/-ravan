import React from 'react';
import { Subject, UserProgressMap, ExamTarget } from '../types';
import { Layers, Stethoscope, GraduationCap, Sparkles } from 'lucide-react';

interface SubjectTabsProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  userProgress: UserProgressMap;
  activeExamTarget: ExamTarget;
  onSelectExamTarget: (target: ExamTarget) => void;
}

export const SubjectTabs: React.FC<SubjectTabsProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  userProgress,
  activeExamTarget,
  onSelectExamTarget,
}) => {
  // Calculate completion percentage for each subject
  const getSubjectProgress = (subject: Subject) => {
    let totalChapters = 0;
    let completedChapters = 0;

    subject.books.forEach((book) => {
      book.chapters.forEach((ch) => {
        totalChapters++;
        const status = userProgress[ch.id]?.status;
        if (status === 'mastered') {
          completedChapters += 1;
        } else if (status === 'summarized') {
          completedChapters += 0.7;
        } else if (status === 'in_progress') {
          completedChapters += 0.3;
        }
      });
    });

    return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  };

  // Filter subjects based on active exam target
  const visibleSubjects = subjects.filter((sub) => {
    if (activeExamTarget === 'all' || activeExamTarget === 'both') return true;
    if (activeExamTarget === 'health') {
      return (sub.healthCoefficient && sub.healthCoefficient > 0) || sub.targetExam === 'health' || sub.targetExam === 'both';
    }
    if (activeExamTarget === 'science') {
      return sub.coefficient > 0 || sub.targetExam === 'science' || sub.targetExam === 'both';
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors" id="subject-tabs-container">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Exam Target Selector Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 text-xs">
            <span>تمرکز آزمونی:</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onSelectExamTarget('both')}
              id="btn-target-both"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeExamTarget === 'both' || activeExamTarget === 'all'
                  ? 'bg-white dark:bg-indigo-950 text-indigo-950 dark:text-indigo-200 shadow-xs border border-indigo-200 dark:border-indigo-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">مطالعه همزمان (هر دو کنکور)</span>
              <span className="sm:hidden">هر دو کنکور</span>
            </button>

            <button
              onClick={() => onSelectExamTarget('health')}
              id="btn-target-health"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeExamTarget === 'health'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Stethoscope className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">کنکور وزارت بهداشت (۸ درس)</span>
              <span className="sm:hidden">وزارت بهداشت</span>
            </button>

            <button
              onClick={() => onSelectExamTarget('science')}
              id="btn-target-science"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeExamTarget === 'science'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <GraduationCap className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">کنکور وزارت علوم (کد ۱۱۳۳)</span>
              <span className="sm:hidden">وزارت علوم</span>
            </button>
          </div>
        </div>

        {/* Subject Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-thin no-scrollbar">
          {/* All Subjects Tab */}
          <button
            onClick={() => onSelectSubject('all')}
            id="tab-subject-all"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>همه دروس ({visibleSubjects.length})</span>
          </button>

          {/* Individual Subjects */}
          {visibleSubjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            const progress = getSubjectProgress(sub);

            // Determine effective coefficient to display
            let coeffBadge = `ضریب ${sub.coefficient}`;
            if (activeExamTarget === 'health') {
              coeffBadge = `ضریب بهداشت: ${sub.healthCoefficient ?? sub.coefficient}`;
            } else if (activeExamTarget === 'both') {
              if (sub.id === 'psychometrics') {
                coeffBadge = `بهداشت: ۱.۵ | علوم: ۲ (عمومی) / مبحثی در بالینی`;
              } else if (sub.id === 'health_services') {
                coeffBadge = `بهداشت: ۱ | علوم: ندارد`;
              } else if (sub.healthCoefficient && sub.healthCoefficient !== sub.coefficient) {
                coeffBadge = `علوم: ${sub.coefficient} | بهداشت: ${sub.healthCoefficient}`;
              } else {
                coeffBadge = `ضریب مشترک: ${sub.coefficient}`;
              }
            } else {
              if (sub.id === 'psychometrics') {
                coeffBadge = `علوم: ۲ (عمومی) | بالینی: مبحثی در ضریب ۳`;
              } else {
                coeffBadge = `ضریب علوم: ${sub.coefficient}`;
              }
            }

            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                id={`tab-subject-${sub.id}`}
                className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-xs'
                    : 'bg-white dark:bg-slate-850/80 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Coefficient badge */}
                <span
                  className={`inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    (activeExamTarget === 'health' ? sub.healthCoefficient : sub.coefficient) === 3
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : (activeExamTarget === 'health' ? sub.healthCoefficient : sub.coefficient) === 2
                      ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      : sub.id === 'health_services' || sub.id === 'psychometrics'
                      ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={`ضرایب: علوم ${sub.coefficient} | بهداشت ${sub.healthCoefficient ?? 'ندارد'}`}
                >
                  {coeffBadge}
                </span>

                <span>{sub.name}</span>

                {sub.id === 'psychopathology' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                    شامل کاپلان و سادوک
                  </span>
                )}

                {/* Subject progress mini pill */}
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
                    progress >= 80
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : progress > 0
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : 'bg-transparent text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {progress}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


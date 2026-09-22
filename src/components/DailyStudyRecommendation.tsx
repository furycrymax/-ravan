import React, { useState } from 'react';
import { Chapter, ChapterUserData, ExamTarget } from '../types';
import { RecommendedChapterItem, DailyRecommendationResult } from '../utils/studyRecommender';
import {
  Sparkles,
  Target,
  ArrowLeft,
  CheckCircle2,
  Clock,
  BookMarked,
  Lightbulb,
  Flame,
  Globe,
  ChevronLeft,
  Layers,
  Award,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';

interface DailyStudyRecommendationProps {
  recommendationResult: DailyRecommendationResult;
  userProgress: Record<string, ChapterUserData>;
  onUpdateUserData: (chapterId: string, partialData: Partial<ChapterUserData>) => void;
  onOpenSearchGrounding?: (chapter: Chapter) => void;
  onScrollToChapter?: (chapterId: string) => void;
  examTarget?: ExamTarget;
}

export const DailyStudyRecommendation: React.FC<DailyStudyRecommendationProps> = ({
  recommendationResult,
  userProgress,
  onUpdateUserData,
  onOpenSearchGrounding,
  onScrollToChapter,
  examTarget = 'both',
}) => {
  const { primary, alternatives, stats } = recommendationResult;
  const [selectedTab, setSelectedTab] = useState<'primary' | number>('primary');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!primary) {
    return null;
  }

  const activeItem: RecommendedChapterItem =
    selectedTab === 'primary' || typeof selectedTab !== 'number'
      ? primary
      : alternatives[selectedTab] || primary;

  const activeUserData = userProgress[activeItem.chapter.id];
  const isMastered = activeUserData?.status === 'mastered';
  const isInProgress = activeUserData?.status === 'in_progress';

  const handleStartOrResume = () => {
    if (activeUserData?.status === 'not_started') {
      onUpdateUserData(activeItem.chapter.id, {
        status: 'in_progress',
        readBookText: true,
      });
    }
    if (onScrollToChapter) {
      onScrollToChapter(activeItem.chapter.id);
    }
  };

  const handleMarkMastered = () => {
    onUpdateUserData(activeItem.chapter.id, {
      status: 'mastered',
      readBookText: true,
      doneTrainingTests: true,
      doneReviewTests: true,
    });
  };

  return (
    <div
      id="daily-recommendation-card"
      className="mb-6 rounded-2xl border border-amber-300/80 bg-linear-to-br from-amber-50/70 via-white to-orange-50/40 shadow-sm overflow-hidden transition-all duration-300"
    >
      {/* Top Banner & Heading */}
      <div className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <Target className="w-5 h-5 text-amber-100 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wide px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                پیشنهاد روز
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                بهترین فصل برای مطالعه امروز
              </h2>
            </div>
            <p className="text-xs text-amber-100 font-medium">
              محاسبه‌شده بر اساس بودجه‌بندی کنکورهای اخیر و وضعیت تسلط شما
            </p>
          </div>
        </div>

        {/* Stats Pill & Collapse button */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {stats.unmasteredCriticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/40 text-amber-200 border border-amber-300/30">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.unmasteredCriticalCount} فصل طلایی در انتظار تسلط</span>
            </span>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            {isCollapsed ? 'نمایش جزئیات' : 'جمع‌کردن'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Alternatives Tabs Selector (if there are runners-up) */}
          {alternatives.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap border-b border-amber-200/60 pb-3">
              <span className="text-xs font-bold text-slate-700 ml-1">انتخاب مبحث امروز:</span>
              <button
                onClick={() => setSelectedTab('primary')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  selectedTab === 'primary'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100/60 border-slate-200'
                }`}
              >
                ⭐ اولویت ۱: {primary.subject.name} (فصل {primary.chapter.number})
              </button>

              {alternatives.map((alt, idx) => (
                <button
                  key={alt.chapter.id}
                  onClick={() => setSelectedTab(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    selectedTab === idx
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-amber-100/60 border-slate-200'
                  }`}
                >
                  گزینه {idx + 2}: {alt.subject.name} (فصل {alt.chapter.number})
                </button>
              ))}
            </div>
          )}

          {/* Main Card Content */}
          <div className="bg-white rounded-xl border border-amber-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Top Meta: Subject badge, Book info, Question budget badge */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                  {activeItem.subject.name} (ضریب {activeItem.effectiveCoefficient})
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                  <BookMarked className="w-3.5 h-3.5 text-amber-600" />
                  {activeItem.book.title}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  فصل {activeItem.chapter.number}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  ⭐⭐⭐ بودجه‌بندی: {activeItem.questionWeight}
                </span>

                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  تخمین مطالعه: {activeItem.chapter.studyEstimatedHours || 6} ساعت
                </span>
              </div>
            </div>

            {/* Chapter Main Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {activeItem.chapter.title}
              </h3>
            </div>

            {/* Why Recommended Callout Box */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                <span>تحلیل هوشمند و علت پیشنهاد:</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                {activeItem.reason}
              </p>
              {activeItem.focusTip && (
                <p className="text-amber-900/90 text-xs pt-1 border-t border-amber-200/60 font-semibold">
                  📌 نکته طلایی طراحان آزمون: {activeItem.focusTip}
                </p>
              )}
            </div>

            {/* Key Topics Badges */}
            {activeItem.chapter.keyTopics && activeItem.chapter.keyTopics.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700">مباحث تست‌خیز و پرتکرار این فصل:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeItem.chapter.keyTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                    >
                      • {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-daily-recommendation-start"
                  onClick={handleStartOrResume}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 text-amber-100" />
                  <span>{activeItem.actionLabel}</span>
                </button>

                {!isMastered && (
                  <button
                    onClick={handleMarkMastered}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تسلط کامل یافتم</span>
                  </button>
                )}

                {onOpenSearchGrounding && (
                  <button
                    onClick={() => onOpenSearchGrounding(activeItem.chapter)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 transition-colors cursor-pointer"
                    title="جستجوی زنده در وب با هوش مصنوعی و تطبیق با آخرین ویرایش DSM و کاپلان"
                  >
                    <Globe className="w-4 h-4 text-teal-600" />
                    <span>استعلام نکات آنلاین</span>
                  </button>
                )}
              </div>

              {onScrollToChapter && (
                <button
                  onClick={() => onScrollToChapter(activeItem.chapter.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer py-1"
                >
                  <span>مشاهده فصل در فهرست کتب</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

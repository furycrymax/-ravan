import React, { useState } from 'react';
import { RecommendationItem } from '../utils/recommender';
import { ChapterUserData } from '../types';
import {
  Sparkles,
  Flame,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Clock,
  Target,
  ChevronRight,
  ChevronLeft,
  Globe,
  Tag,
  HelpCircle,
} from 'lucide-react';

interface DailyRecommendationBannerProps {
  recommendations: RecommendationItem[];
  onSelectChapter: (chapterId: string) => void;
  onUpdateUserData: (chapterId: string, data: Partial<ChapterUserData>) => void;
  userDataMap: Record<string, ChapterUserData | undefined>;
  onOpenSearchGrounding?: (chapter: RecommendationItem['chapter']) => void;
}

export const DailyRecommendationBanner: React.FC<DailyRecommendationBannerProps> = ({
  recommendations,
  onSelectChapter,
  onUpdateUserData,
  userDataMap,
  onOpenSearchGrounding,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const currentItem = recommendations[activeIndex] || recommendations[0];
  const {
    chapter,
    book,
    subject,
    priorityLabel,
    reasons,
    urgencyType,
    effectiveCoefficient,
    masteryLevelLabel,
    budgetingSummary,
  } = currentItem;
  const currentChapterUser = userDataMap[chapter.id];

  const handleStartOrJump = () => {
    // If not started yet, automatically transition to in_progress to encourage momentum
    if (!currentChapterUser || currentChapterUser.status === 'not_started') {
      onUpdateUserData(chapter.id, { status: 'in_progress', readBookText: true });
    }
    onSelectChapter(chapter.id);
  };

  const handleQuickMaster = () => {
    onUpdateUserData(chapter.id, {
      status: 'mastered',
      readBookText: true,
      doneTrainingTests: true,
      doneReviewTests: true,
    });
  };

  const handleToggleStep1 = () => {
    const isChecked = currentChapterUser?.readBookText;
    onUpdateUserData(chapter.id, {
      readBookText: !isChecked,
      status: !isChecked && (!currentChapterUser || currentChapterUser.status === 'not_started')
        ? 'in_progress'
        : currentChapterUser?.status || 'in_progress',
    });
  };

  const getPriorityBadgeColor = (type: RecommendationItem['urgencyType']) => {
    switch (type) {
      case 'finish_started':
        return 'bg-rose-500 text-white border-rose-400';
      case 'high_yield_untouched':
        return 'bg-amber-500 text-slate-950 border-amber-400';
      case 'needs_testing':
        return 'bg-indigo-600 text-white border-indigo-500';
      default:
        return 'bg-teal-600 text-white border-teal-500';
    }
  };

  return (
    <div
      className="mb-6 rounded-2xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border border-indigo-500/30 shadow-lg relative overflow-hidden"
      id="daily-recommendation-card"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute -top-16 -left-16 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar: Badge, Tagline & Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-xs">
            <Target className="w-3.5 h-3.5 text-slate-950" />
            پیشنهاد روز: بهترین فصل بعدی برای مطالعه
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeColor(
              urgencyType
            )}`}
          >
            <Flame className="w-3.5 h-3.5" />
            {priorityLabel}
          </span>

          <span className="text-xs text-slate-300 hidden md:inline">
            تحلیل هوشمند بر اساس بودجه‌بندی آزمون‌های قبلی و سطح تسلط کاربر
          </span>
        </div>

        {/* Top-3 Selector Tabs */}
        {recommendations.length > 1 && (
          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl self-start sm:self-auto flex-wrap">
            <span className="text-xs text-slate-300 px-1 font-medium hidden sm:inline">گزینه‌های امروز:</span>
            {recommendations.map((item, idx) => (
              <button
                key={item.chapter.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeIndex === idx
                    ? 'bg-amber-400 text-slate-950 shadow-xs scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {idx === 0 ? '⭐ پیشنهاد ۱' : `گزینه ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Body Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* Left/Main Column: Chapter Meta and Target Reasons (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Breadcrumb Info */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-indigo-200">
            <span className="font-semibold text-white px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/20">
              {subject.name} (ضریب {effectiveCoefficient})
            </span>
            <span>•</span>
            <span className="text-slate-300">{book.title}</span>
            <span>•</span>
            <span className="text-amber-300 font-semibold">فصل {chapter.number}</span>
            <span>•</span>
            <span className="bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded border border-amber-400/20 font-mono">
              {budgetingSummary}
            </span>
          </div>

          {/* Chapter Title */}
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {chapter.title}
          </h3>

          {/* Rationale / Why this chapter? */}
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>چرا مطالعه این فصل امروز بیشترین بازدهی را دارد؟</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Topics Pills */}
          {chapter.keyTopics && chapter.keyTopics.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>مباحث کلیدی این فصل:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chapter.keyTopics.slice(0, 4).map((topic, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status Summary & Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 border-b border-white/10 pb-2 flex items-center justify-between">
              <span>وضعیت تسلط شما:</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {masteryLevelLabel}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <div className="text-slate-400 text-[11px]">زمان تخمینی</div>
                <div className="font-bold text-white mt-0.5">{chapter.studyEstimatedHours} ساعت</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <div className="text-slate-400 text-[11px]">بودجه‌بندی تست</div>
                <div className="font-bold text-amber-300 mt-0.5">{chapter.averageQuestions}</div>
              </div>
            </div>

            {/* Step 1 Quick Action */}
            <label className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors border border-white/5">
              <input
                type="checkbox"
                checked={Boolean(currentChapterUser?.readBookText)}
                onChange={handleToggleStep1}
                className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 border-slate-600 bg-slate-800 cursor-pointer"
              />
              <span className="text-slate-200">گام ۱: مطالعه متن کتاب انجام شد</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleStartOrJump}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
              id="btn-recommendation-jump"
            >
              <span>
                {currentChapterUser?.status === 'in_progress' ? 'ادامه مطالعه و مشاهده در فهرست' : 'شروع مطالعه این فصل'}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickMaster}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-colors cursor-pointer"
                title="علامت‌گذاری تسلط کامل و به‌روزرسانی پیشنهاد بعدی"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>ثبت تسلط کامل</span>
              </button>

              {onOpenSearchGrounding && (
                <button
                  onClick={() => onOpenSearchGrounding(chapter)}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 transition-colors cursor-pointer"
                  title="استعلام آنلاین تغییرات و تست‌های این فصل با گوگل"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-300" />
                  <span>استعلام گوگل</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

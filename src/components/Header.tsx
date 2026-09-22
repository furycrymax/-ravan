import React from 'react';
import { Award, BarChart3, RotateCcw, Globe, Sun, Moon, Brain, Calendar, Bell } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserAuthControl } from './UserAuthControl';
import { PWAInstallButton } from './PWAInstallButton';
import { ShareAppButton } from './ShareAppButton';

interface HeaderProps {
  weightedProgress: number;
  totalChaptersCount: number;
  completedChaptersCount: number;
  inProgressChaptersCount: number;
  onOpenAnalysis: () => void;
  onOpenAIStudyPlan: () => void;
  onOpenGoogleCalendar?: () => void;
  onOpenStudyReminder?: () => void;
  onResetProgress: () => void;
  onSimulateInactivity?: () => void;
  currentUser: User | null;
  authLoading: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
  isManualSyncing?: boolean;
  onOpenSearchGrounding: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weightedProgress,
  totalChaptersCount,
  completedChaptersCount,
  inProgressChaptersCount,
  onOpenAnalysis,
  onOpenAIStudyPlan,
  onOpenGoogleCalendar,
  onOpenStudyReminder,
  onResetProgress,
  currentUser,
  authLoading,
  isSyncing = false,
  onManualSync,
  isManualSyncing = false,
  onOpenSearchGrounding,
  darkMode = false,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors shadow-2xs" id="main-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand & Mini-Badge */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              ارشد بالینی ۱۴۰۵
            </h1>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/70 dark:border-slate-700/70 hidden md:inline-flex">
              کد ۱۱۳۳ علوم + بهداشت
            </span>
          </div>

          {/* Action Toolbar with smooth touch scroll and compact icons for complete visibility */}
          <div className="header-scroll-container flex items-center gap-1 sm:gap-1.5 shrink min-w-0 max-w-full justify-start sm:justify-end pb-0.5">
            {/* PWA Install Button (Desktop & Android & iOS) */}
            <PWAInstallButton />

            {/* AI Study Planner Allocation Menu */}
            <button
              onClick={onOpenAIStudyPlan}
              id="btn-header-ai-study-plan"
              className="inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xs border border-indigo-400/40 transition-all cursor-pointer shrink-0"
              title="برنامه هوشمند مطالعه با هوش مصنوعی (قانون ۲ درس در روز)"
              aria-label="برنامه هوشمند مطالعه"
            >
              <span className="text-xs leading-none shrink-0" role="img" aria-label="مغز">🧠</span>
              <span className="text-[11px] sm:text-xs">برنامه هوشمند</span>
            </button>

            {/* Google Calendar Sync Button */}
            {onOpenGoogleCalendar && (
              <button
                onClick={onOpenGoogleCalendar}
                id="btn-header-google-calendar"
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/60 transition-colors cursor-pointer shrink-0"
                title="همگام‌سازی و ثبت جلسات مطالعه در Google Calendar"
              >
                <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">تقویم گوگل</span>
              </button>
            )}

            {/* Daily Study Reminder Trigger Button */}
            {onOpenStudyReminder && (
              <button
                onClick={onOpenStudyReminder}
                id="btn-header-study-reminder"
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/60 transition-colors cursor-pointer shrink-0"
                title="تنظیمات و فعال‌سازی یادآور روزانه مطالعه (مرورگر و تقویم گوگل)"
              >
                <Bell className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">یادآور روزانه</span>
              </button>
            )}

            {/* Google Live Grounding Button */}
            <button
              onClick={onOpenSearchGrounding}
              id="btn-header-search-grounding"
              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/60 transition-colors cursor-pointer shrink-0"
              title="استعلام آنلاین تغییرات و مباحث با جستجوی گوگل"
            >
              <Globe className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">استعلام آنلاین</span>
            </button>

            {/* Test Budgeting & Coefficients */}
            <button
              onClick={onOpenAnalysis}
              id="btn-open-analysis"
              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 transition-colors cursor-pointer shrink-0"
              title="برنامه راهبردی، تحلیل ضرایب و بودجه‌بندی تستی سالانه"
            >
              <BarChart3 className="w-3 h-3 shrink-0" />
              <span className="text-[11px] sm:text-xs">بودجه‌بندی</span>
            </button>

            {/* Share Direct App Button */}
            <ShareAppButton />

            {/* Auth / Cloud Sync */}
            <UserAuthControl
              currentUser={currentUser}
              authLoading={authLoading}
              isSyncing={isSyncing}
              onManualSync={onManualSync}
              isManualSyncing={isManualSyncing}
            />

            {/* Dark Mode */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                id="btn-toggle-dark-mode"
                title={darkMode ? 'حالت روز' : 'حالت شب'}
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 transition-colors cursor-pointer shrink-0"
              >
                {darkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Reset */}
            <button
              onClick={onResetProgress}
              id="btn-reset-progress"
              title="بازنشانی پیشرفت"
              className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Progress Micro-Bar (1.5x Spacing) */}
        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 text-[10px] sm:text-xs leading-tight text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap overflow-x-auto no-scrollbar">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {totalChaptersCount} فصل
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              مسلط: {completedChaptersCount}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              مطالعه: {inProgressChaptersCount}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {weightedProgress}%
            </span>
            <div className="w-12 sm:w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 dark:bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, weightedProgress))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

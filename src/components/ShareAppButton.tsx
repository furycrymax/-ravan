import React, { useState } from 'react';
import { Share2, Check, Copy, ExternalLink } from 'lucide-react';

export const ShareAppButton: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const getDirectAppUrl = (): string => {
    if (typeof window === 'undefined') return '';

    // If running in development or preview mode inside iframe, detect direct standalone origin
    let url = window.location.href;

    // Remove any iframe or studio embed hash/query parameters if present
    try {
      const parsed = new URL(url);
      // Clean query parameters like ais_context, etc. if any
      parsed.searchParams.delete('ais_context');
      url = parsed.origin + parsed.pathname;
    } catch {
      // fallback
    }

    return url;
  };

  const handleShare = async () => {
    const directUrl = getDirectAppUrl();
    const shareData = {
      title: 'سامانه جامع کنکور کارشناسی ارشد روان‌شناسی بالینی ۱۴۰۵',
      text: 'برنامه راهبردی، بودجه‌بندی تستی و پیگیری مطالعه کنکور ارشد بالینی ۱۴۰۵ (وزارت بهداشت و علوم)',
      url: directUrl,
    };

    // Try native Web Share API first (on mobile devices/browsers)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return; // user cancelled share
        }
      }
    }

    // Fallback: Copy direct app URL to clipboard
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Prompt fallback
      prompt('لینک مستقیم برنامه را کپی کنید:', directUrl);
    }
  };

  return (
    <button
      onClick={handleShare}
      id="btn-share-direct-app"
      className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer shrink-0 shadow-2xs"
      title="اشتراک‌گذاری لینک مستقیم برنامه (بدون محیط AI Studio)"
      aria-label="اشتراک‌گذاری برنامه"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-emerald-700 dark:text-emerald-300 font-bold">کپی شد!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">اشتراک مستقیم</span>
        </>
      )}
    </button>
  );
};

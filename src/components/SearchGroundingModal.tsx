import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ExternalLink,
  Sparkles,
  Loader2,
  X,
  BookOpen,
  BookmarkPlus,
  Check,
  RefreshCw,
  Globe,
  AlertCircle,
} from "lucide-react";
import {
  queryGoogleSearchGrounding,
  SearchGroundingResult,
} from "../services/searchGroundingService";
import { saveResearchToCloud } from "../services/firebase";
import { User } from "firebase/auth";

interface SearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  initialTopic?: string;
  initialChapterTitle?: string;
  chapterId?: string;
  onAppendNotes?: (chapterId: string, text: string) => void;
}

const PRESET_QUERIES = [
  "تغییرات کلیدی ملاک‌های تشخیصی در DSM-5-TR نسبت به DSM-5",
  "جدیدترین داروهای روان‌پزشکی تایید شده و خطوط درمان در کاپلان",
  "بودجه‌بندی و مباحث تست‌خیز روان‌پزشکی کنکور ارشد وزارت بهداشت",
  "تفاوت‌های نشانه‌شناسی هذیان و توهم و ارزیابی MSE در کاپلان",
];

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTopic = "",
  initialChapterTitle = "",
  chapterId,
  onAppendNotes,
}) => {
  const [query, setQuery] = useState(
    initialChapterTitle
      ? `آخرین نکات تست‌خیز و به‌روزرسانی‌های تشخیصی برای فصل ${initialChapterTitle}`
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedCloud, setSavedCloud] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialChapterTitle) {
        setQuery(`آخرین نکات تست‌خیز و به‌روزرسانی‌های تشخیصی برای فصل ${initialChapterTitle}`);
      } else if (initialTopic) {
        setQuery(`مهم‌ترین نکات تستی و تغییرات منابع ${initialTopic}`);
      } else if (!query) {
        setQuery("تغییرات ملاک‌های تشخیصی DSM-5-TR و منابع کنکور ارشد روانشناسی بالینی ۱۴۰۵");
      }
      setError(null);
      setSavedCloud(false);
      setCopiedNote(false);
    }
  }, [isOpen, initialChapterTitle, initialTopic]);

  if (!isOpen) return null;

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery || query).trim();
    if (!q) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError("دستگاه شما در حالت آفلاین قرار دارد. استعلام زنده از موتور هوش مصنوعی گوگل نیازمند برقراری اتصال به اینترنت است. بقیه بخش‌های برنامه مانند کتب، تست‌ها و بودجه‌بندی بدون نیاز به شبکه به طور کامل در دسترس شما هستند.");
      return;
    }

    setLoading(true);
    setError(null);
    setSavedCloud(false);
    setCopiedNote(false);

    try {
      const res = await queryGoogleSearchGrounding({
        query: q,
        topic: initialTopic,
        chapterTitle: initialChapterTitle,
      });
      setResult(res);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "خطا در برقراری ارتباط با سرویس هوش مصنوعی و جستجوی گوگل."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!currentUser || !result) return;
    try {
      const researchId = `res_${Date.now()}`;
      await saveResearchToCloud(currentUser.uid, {
        id: researchId,
        query: query,
        chapterId: chapterId,
        topic: initialTopic || initialChapterTitle || "پژوهش بالینی",
        responseText: result.text,
        sources: result.sources,
        createdAt: new Date().toISOString(),
      });
      setSavedCloud(true);
      setTimeout(() => setSavedCloud(false), 3000);
    } catch (err) {
      console.error("Save to cloud error:", err);
    }
  };

  const handleAppendToChapterNotes = () => {
    if (!result || !chapterId || !onAppendNotes) return;
    const noteContent = `\n\n📌 [نکات جستجوی زنده گوگل و DSM-5-TR]:\n${result.text.slice(0, 800)}...`;
    onAppendNotes(chapterId, noteContent);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 3000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      id="search-grounding-modal"
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
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 'min(100%, 42rem)',
        }}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-teal-900 via-slate-900 to-indigo-950 p-4 sm:p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
              <Globe className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  استعلام زنده با گوگل و هوش مصنوعی
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini 3.8 Flash + Google Search
                </span>
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                دسترسی مستقیم به آخرین مقالات وب، تغییرات DSM-5-TR و مباحث کاپلان با استناد به منابع معتبر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Active Context Chapter Info if any */}
          {initialChapterTitle && (
            <div className="flex items-center gap-2 p-2.5 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-lg text-xs text-teal-950 dark:text-teal-200">
              <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>
                مرتبط با: <strong>{initialChapterTitle}</strong>
              </span>
            </div>
          )}

          {/* Search Input Box */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleSearch();
                  }
                }}
                placeholder="سوال، نام اختلال، داروی جدید یا ابهام کنکوری خود را بنویسید..."
                className="w-full pl-24 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="absolute left-1.5 top-1.5 bottom-1.5 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جستجو...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>استعلام</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick preset suggestions */}
            {!result && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  پرسش‌های متداول و تست‌خیز داوطلبان:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_QUERIES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(preset);
                        handleSearch(preset);
                      }}
                      className="text-right text-[11px] px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-900 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="inline-flex p-3 bg-teal-100 dark:bg-teal-950/60 rounded-full text-teal-700 dark:text-teal-300 animate-pulse">
                <Globe className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                در حال جستجوی بلادرنگ در گوگل و تطبیق با مراجع روان‌پزشکی و DSM-5-TR...
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                استخراج اطلاعات با استفاده از مدل Gemini 3.8 Flash با ابزار Google Search Grounding
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">خطا در دریافت اطلاعات</p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">{error}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-800/60">
                <button
                  onClick={() => handleSearch()}
                  className="px-2.5 py-1 bg-rose-200 dark:bg-rose-900/60 hover:bg-rose-300 text-rose-900 dark:text-rose-100 rounded text-[11px] font-bold cursor-pointer"
                >
                  تلاش مجدد
                </button>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(query + " کنکور ارشد روانشناسی بالینی کاپلان")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 rounded text-[11px] font-medium hover:bg-rose-100/50"
                >
                  <span>جستجوی مستقیم در گوگل</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && !loading && (
            <div className="space-y-4">
              {/* Result Mode Indicator Badge */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-teal-900 dark:text-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    {result.mode === "curated_fallback"
                      ? "تحلیل تحلیلی و مستند از پایگاه داده تخصصی DSM-5-TR و کاپلان"
                      : "تحلیل بلادرنگ استعلام‌شده از گوگل با مدل Gemini 3.8 Flash"}
                  </span>
                </div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(query + " کنکور ارشد روانشناسی بالینی")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                >
                  <span>نتایج زنده گوگل</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Answer Content */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed max-h-96 overflow-y-auto whitespace-pre-line">
                {result.text}
              </div>

              {/* Web Grounding Citations */}
              {result.sources && result.sources.length > 0 && (
                <div className="p-3.5 bg-teal-50/50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/70 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>منابع مستند یافته‌شده در وب (Google Search Grounding):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-teal-200/80 dark:border-teal-800/80 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-all text-xs text-teal-900 dark:text-teal-200 group"
                      >
                        <span className="truncate flex-1 font-medium pl-2">
                          {src.title || src.uri}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex-wrap">
                <div className="flex items-center gap-2">
                  {currentUser ? (
                    <button
                      onClick={handleSaveToCloud}
                      disabled={savedCloud}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {savedCloud ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>در Firestore ذخیره شد</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>ذخیره در آرشیو پژوهش‌های من</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      (برای ذخیره در ابر، با حساب کاربری گوگل وارد شوید)
                    </span>
                  )}

                  {chapterId && onAppendNotes && (
                    <button
                      onClick={handleAppendToChapterNotes}
                      disabled={copiedNote}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {copiedNote ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>به یادداشت فصل افزوده شد</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                          <span>افزودن این نکات به یادداشت‌های فصل</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleSearch()}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>جستجوی مجدد</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

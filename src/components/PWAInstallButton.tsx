import React, { useState } from 'react';
import { Download, Monitor, Smartphone, Check, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already installed and running as standalone app, hide the button
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
        <Check className="w-3.5 h-3.5" />
        <span>اپلیکیشن نصب شده و آفلاین</span>
      </div>
    );
  }

  // Chromium / Android / Edge / Windows direct install
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          type="button"
          onClick={install}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-sm hover:from-indigo-700 hover:to-violet-700 active:scale-95 transition-all cursor-pointer ${className}`}
          title="نصب اپلیکیشن روی ویندوز یا اندروید (دسترسی سریع و آفلاین)"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>نصب برنامه آفلاین</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 ${className}`}
      >
        <Download className="w-3 h-3 animate-bounce shrink-0" />
        <span className="hidden sm:inline text-xs">نصب آفلاین (ویندوز / اندروید)</span>
        <span className="sm:hidden text-[11px]">نصب آفلاین</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer shrink-0 ${className}`}
        >
          <Smartphone className="w-3 h-3 shrink-0" />
          <span className="text-[11px] sm:text-xs">نصب در iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>راهنمای نصب روی iOS (آیفون / آیپد)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    ۱
                  </span>
                  <p>
                    در نوار پایین مرورگر سافاری (Safari)، روی آیکون <strong>اشتراک‌گذاری (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-600" /> ضربه بزنید.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    ۲
                  </span>
                  <p>
                    در منوی باز شده به پایین اسکرول کنید و گزینه <strong>Add to Home Screen (افزودن به صفحه اصلی)</strong> را انتخاب نمایید.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    ۳
                  </span>
                  <p>
                    در گوشه بالا دکمه <strong>Add</strong> را بزنید. آیکون اختصاصی برنامه به صفحه گوشی شما اضافه شده و به شکل آفلاین کار خواهد کرد.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers / desktop when prompt is not yet triggered
  return (
    <>
      <button
        type="button"
        onClick={() => setShowDesktopGuide(true)}
        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer shrink-0 ${className}`}
        title="راهنمای اجرای آفلاین و نصب برنامه روی ویندوز و اندروید"
      >
        <Monitor className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span className="hidden sm:inline text-xs">نصب آفلاین (ویندوز / اندروید)</span>
        <span className="sm:hidden text-[11px]">نصب آفلاین</span>
      </button>

      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" />
                <span>نصب و استفاده آفلاین روی ویندوز و اندروید</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDesktopGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>نصب روی ویندوز (Chrome یا Microsoft Edge):</span>
                </div>
                <p className="text-[11px]">
                  در بالای مرورگر در انتهای سمت راست نوار آدرس URL، روی آیکون <strong>«نصب برنامه (Install App)»</strong> یا منوی سه‌نقطه مرورگر و سپس <strong>«Install روانشناسی۱۴۰۵»</strong> کلیک کنید. برنامه با آیکون اختصاصی در دسکتاپ و منوی استارت ویندوز ذخیره می‌شود.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>نصب روی گوشی اندروید (Chrome):</span>
                </div>
                <p className="text-[11px]">
                  روی منوی ۳ نقطه در گوشه بالای کروم ضربه بزنید و گزینه <strong>«افزودن به صفحه اصلی (Add to Home screen)»</strong> یا <strong>«نصب برنامه»</strong> را بزنید. برنامه بدون نیاز به پلی‌استور مانند یک اپ بومی نصب می‌شود.
                </p>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                ⚡ <strong>تضمین دسترسی آفلاین:</strong> تمام دستنامه کتب، تست‌های خودسنجی، بودجه‌بندی سال‌های ۱۴۰۰ تا ۱۴۰۴ و تحلیل فصول در حافظه دستگاه کش شده و حتی بدون اینترنت در هر زمان و مکان به سرعت باز می‌شوند.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDesktopGuide(false)}
              className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer"
            >
              متوجه شدم، بستن پنجره
            </button>
          </div>
        </div>
      )}
    </>
  );
};

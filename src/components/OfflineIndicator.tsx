import React, { useState } from 'react';
import { WifiOff, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) return null;

  return (
    <aside
      aria-label="وضعیت اتصال شبکه"
      className="fixed bottom-4 left-4 z-50 max-w-sm rounded-2xl bg-slate-900/95 text-white p-3.5 shadow-2xl border border-amber-500/40 backdrop-blur-md text-xs space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-300"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </span>
          <span>حالت آفلاین (Offline Mode)</span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          title="بستن پیام"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-slate-200 text-[11px] leading-relaxed">
        ارتباط شما با اینترنت قطع است، اما جای نگرانی نیست! تمامی بخش‌های اصلی برنامه شامل:
      </p>

      <ul className="text-[10px] text-slate-300 space-y-1 pr-1 border-r-2 border-emerald-500/50">
        <li className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>برنامه راهبردی و بودجه‌بندی ۱۴۰۰ تا ۱۴۰۴</span>
        </li>
        <li className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>دستنامه جامع فصول کاپلان و کتب مرجع</span>
        </li>
        <li className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>بانک تست‌های خودسنجی و پاسخ‌های تشریحی</span>
        </li>
      </ul>

      <div className="pt-1.5 border-t border-slate-800 text-[10px] text-amber-200/90 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
        <span>تنها دستیار هوش مصنوعی و استعلام‌های آنلاین نیازمند اتصال مجدد هستند.</span>
      </div>
    </aside>
  );
};

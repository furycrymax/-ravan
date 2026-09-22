import React from 'react';
import { AlertTriangle, Clock, ChevronLeft, X, Flame, Sparkles } from 'lucide-react';

interface InactivityAlertBannerProps {
  daysInactive: number;
  lastStudiedDate: string | null;
  onDismiss: () => void;
  onQuickResume: () => void;
}

export const InactivityAlertBanner: React.FC<InactivityAlertBannerProps> = ({
  daysInactive,
  lastStudiedDate,
  onDismiss,
  onQuickResume,
}) => {
  const formattedLastDate = lastStudiedDate
    ? new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(lastStudiedDate))
    : null;

  return (
    <div
      id="inactivity-reminder-banner"
      role="alert"
      className="bg-linear-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md border-b border-orange-600/30 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Main message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25 shadow-xs">
              <Flame className="w-5 h-5 text-amber-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-200 inline" />
                  هشدار پیگیری برنامه مطالعاتی کنکور ۱۴۰۵
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/25 text-amber-100 border border-white/20">
                  {daysInactive} روز وقفه در مطالعه
                </span>
              </div>
              <p className="text-xs text-orange-50 leading-relaxed mt-0.5">
                {formattedLastDate ? (
                  <>
                    آخرین فعالیت ثبت‌شده شما در تاریخ{' '}
                    <strong className="text-white font-bold">{formattedLastDate}</strong> بوده است.
                    پیوستگی مطالعه رمز موفقیت در کنکور کارشناسی ارشد روانشناسی بالینی است؛ همین امروز حداقل ۱ فصل طلایی را مرور کنید!
                  </>
                ) : (
                  <>
                    بیش از ۳ روز از ورود یا ثبت برنامه شما می‌گذرد و فعالیتی ثبت نشده است. پیوستگی مطالعه مهم‌ترین فاکتور رتبه‌برترهاست؛ بیایید با یک مبحث کوتاه شروع کنیم!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={onQuickResume}
              id="btn-quick-resume-study"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-orange-950 hover:bg-orange-50 font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>مشاهده فصول اولویت‌دار</span>
              <ChevronLeft className="w-3.5 h-3.5 text-orange-700" />
            </button>
            <button
              onClick={onDismiss}
              id="btn-dismiss-inactivity-banner"
              aria-label="بستن هشدار"
              title="بستن برای امروز"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

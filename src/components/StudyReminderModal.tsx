import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  X,
  Clock,
  Target,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { StudyReminderSettings, UserProgressMap, DailyStudyLogMap } from '../types';
import {
  getStoredReminderSettings,
  saveStoredReminderSettings,
  requestNotificationPermission,
  triggerBrowserNotification,
  scheduleGoogleCalendarReminder,
  hasLoggedStudyToday,
  isPastCutoffTime
} from '../utils/studyNotificationService';
import { getCachedCalendarToken } from '../services/googleCalendarService';
import { toPersianDigits } from '../utils/persianCalendar';

interface StudyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgressMap;
  dailyStudyLogs: DailyStudyLogMap;
  onOpenGoogleCalendarConnect?: () => void;
}

export const StudyReminderModal: React.FC<StudyReminderModalProps> = ({
  isOpen,
  onClose,
  userProgress,
  dailyStudyLogs,
  onOpenGoogleCalendarConnect,
}) => {
  const [settings, setSettings] = useState<StudyReminderSettings>(getStoredReminderSettings);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(false);
  const [isTestingNotification, setIsTestingNotification] = useState<boolean>(false);
  const [isSchedulingCalendar, setIsSchedulingCalendar] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
    const token = getCachedCalendarToken();
    setIsCalendarConnected(!!token);
    setSettings(getStoredReminderSettings());
  }, [isOpen]);

  const activityStatus = hasLoggedStudyToday(userProgress, dailyStudyLogs);
  const pastCutoff = isPastCutoffTime(settings.cutoffTime);

  const handleToggleEnabled = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveStoredReminderSettings(updated);
  };

  const handleSaveField = <K extends keyof StudyReminderSettings>(field: K, value: StudyReminderSettings[K]) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveStoredReminderSettings(updated);
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      const updated = { ...settings, browserPushEnabled: true };
      setSettings(updated);
      saveStoredReminderSettings(updated);
      setStatusMessage({
        type: 'success',
        text: 'مجوز اعلان مرورگر با موفقیت فعال شد. یادآورها سر وقت ارسال می‌شوند.',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'مجوز اعلان رد شد. می‌توانید از تنظیمات مرورگر به برنامه دسترسی دهید.',
      });
    }
  };

  const handleTestBrowserPush = () => {
    setIsTestingNotification(true);
    if (permissionState !== 'granted') {
      requestNotificationPermission().then((res) => {
        setPermissionState(res);
        if (res === 'granted') {
          triggerBrowserNotification(
            '🔔 تست یادآور مطالعه کنکور ارشد روانشناسی بالینی',
            `ساعت مشخص‌شده (${settings.cutoffTime}) گذشته و هدف مطالعه امروز شما (${settings.dailyTargetHours} ساعت) هنوز ثبت نشده است!`
          );
          setStatusMessage({ type: 'success', text: 'اعلان تستی مرورگر با موفقیت ارسال شد.' });
        } else {
          setStatusMessage({ type: 'error', text: 'ابتدا باید مجوز اعلان‌های مرورگر را فعال کنید.' });
        }
        setIsTestingNotification(false);
      });
      return;
    }

    const fired = triggerBrowserNotification(
      '🔔 تست یادآور مطالعه کنکور ارشد روانشناسی بالینی',
      `ساعت مشخص‌شده (${settings.cutoffTime}) گذشته و هدف مطالعه امروز شما (${settings.dailyTargetHours} ساعت) هنوز ثبت نشده است!`
    );
    if (fired) {
      setStatusMessage({ type: 'success', text: 'اعلان تستی مرورگر با موفقیت در سیستم ارسال شد.' });
    } else {
      setStatusMessage({ type: 'error', text: 'ارسال اعلان با خطا مواجه شد. تنظیمات مرورگر را بررسی نمایید.' });
    }
    setIsTestingNotification(false);
  };

  const handleTestCalendarReminder = async () => {
    if (!isCalendarConnected) {
      setStatusMessage({
        type: 'error',
        text: 'ابتدا حساب تقویم گوگل (Google Calendar) خود را از دکمه هدر متصل نمایید.',
      });
      return;
    }
    setIsSchedulingCalendar(true);
    setStatusMessage(null);
    const res = await scheduleGoogleCalendarReminder(settings.cutoffTime, settings.dailyTargetHours);
    setIsSchedulingCalendar(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `یادآور آزمایشی مطالعه با هشدار Popup و ایمیل برای ساعت ${settings.cutoffTime} در تقویم گوگل شما درج شد!`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'خطا در ثبت رویداد در تقویم گوگل.',
      });
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                یادآور روزانه مطالعه (مرورگر و تقویم گوگل)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ارسال هشدار در صورت عدم ثبت مطالعه تا ساعت معین
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Real-time Status Card */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                وضعیت فعالیت امروز شما:
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {activityStatus.hasActivity ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    مطالعه ثبت شده ({toPersianDigits(activityStatus.totalHours)} ساعت)
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    هنوز مطالعه‌ای ثبت نشده است
                  </span>
                )}
              </div>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400">ساعت مقرر:</span>
              <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {settings.cutoffTime}
              </div>
            </div>
          </div>

          {/* Master Enable/Disable */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
            <div className="space-y-0.5">
              <span className="font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                فعال‌سازی سیستم یادآور هوشمند
              </span>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                پایش خودکار گزارشات و ارسال هشدار پیگیری هدف روزانه
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleToggleEnabled}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cutoff Time */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                ساعت بازرسی و هشدار روزانه
              </label>
              <input
                type="time"
                value={settings.cutoffTime}
                onChange={(e) => handleSaveField('cutoffTime', e.target.value)}
                disabled={!settings.enabled}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-center font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-400">اگر تا این ساعت مطالعه ثبت نشود هشدار فعال می‌شود.</p>
            </div>

            {/* Target Hours */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                هدف ساعت مطالعه روزانه
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={settings.dailyTargetHours}
                  onChange={(e) => handleSaveField('dailyTargetHours', Math.max(1, Number(e.target.value)))}
                  disabled={!settings.enabled}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="text-slate-500 shrink-0 text-xs">ساعت</span>
              </div>
              <p className="text-[10px] text-slate-400">معیار تکمیل برای حفظ استمرار هفتگی</p>
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              کانال‌های دریافت اعلان
            </h3>

            {/* Browser Push Channel */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">اعلان مرورگر (Web Push)</span>
                    <p className="text-[10px] text-slate-400">حتی در حالت بسته بودن پنجره در دستگاه‌های پشتیبانی‌شده</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.browserPushEnabled && permissionState === 'granted'}
                  onChange={(e) => {
                    if (permissionState !== 'granted') {
                      handleRequestPermission();
                    } else {
                      handleSaveField('browserPushEnabled', e.target.checked);
                    }
                  }}
                  disabled={!settings.enabled}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {permissionState !== 'granted' ? (
                  <button
                    onClick={handleRequestPermission}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition cursor-pointer"
                  >
                    فعال‌سازی مجوز اعلان در مرورگر
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    مجوز مرورگر مجاز است
                  </span>
                )}

                <button
                  onClick={handleTestBrowserPush}
                  disabled={isTestingNotification}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                >
                  {isTestingNotification ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  تست اعلان مرورگر
                </button>
              </div>
            </div>

            {/* Google Calendar Channel */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">رویداد هشدار در تقویم گوگل</span>
                    <p className="text-[10px] text-slate-400">ثبت جلسه هشدار با نوتیفیکیشن ۱۰ دقیقه قبل و ایمیل</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.googleCalendarRemindersEnabled}
                  onChange={(e) => handleSaveField('googleCalendarRemindersEnabled', e.target.checked)}
                  disabled={!settings.enabled}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {!isCalendarConnected ? (
                  <button
                    onClick={() => {
                      if (onOpenGoogleCalendarConnect) {
                        onClose();
                        onOpenGoogleCalendarConnect();
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition cursor-pointer"
                  >
                    اتصال به Google Calendar
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    تقویم گوگل متصل است
                  </span>
                )}

                {isCalendarConnected && (
                  <button
                    onClick={handleTestCalendarReminder}
                    disabled={isSchedulingCalendar}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                  >
                    {isSchedulingCalendar ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarDays className="w-3 h-3" />}
                    ارسال رویداد هشدار به تقویم
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Status Alert */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer"
          >
            ذخیره و تأیید
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  X,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Loader2,
  Sparkles,
  RefreshCw,
  LogOut,
  CalendarCheck,
  CalendarDays
} from 'lucide-react';
import {
  authenticateWithGoogleCalendar,
  getCachedCalendarToken,
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  GoogleCalendarItem,
  setCachedCalendarToken
} from '../services/googleCalendarService';
import { toPersianDigits, getPersianDate, formatPersianFullDate } from '../utils/persianCalendar';
import { EXAM_SUBJECTS } from '../data/curriculumData';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetEvent?: {
    summary?: string;
    description?: string;
    date?: string; // YYYY-MM-DD
    hours?: number;
  };
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  presetEvent,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<GoogleCalendarItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State for creating new study session in Google Calendar
  const todayISO = new Date().toISOString().split('T')[0];
  const [eventDate, setEventDate] = useState<string>(presetEvent?.date || todayISO);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [durationHours, setDurationHours] = useState<number>(presetEvent?.hours || 2);
  const [selectedSubject, setSelectedSubject] = useState<string>(EXAM_SUBJECTS[0].name);
  const [eventTitle, setEventTitle] = useState<string>(
    presetEvent?.summary || `مطالعه ${EXAM_SUBJECTS[0].name} (کنکور ارشد ۱۴۰۵)`
  );
  const [eventDescription, setEventDescription] = useState<string>(
    presetEvent?.description || 'جلسه مطالعه و تست‌زنی مبحثی طبق برنامه راهبردی ارشد بالینی ۱۴۰۵'
  );

  // State for confirming event deletion (MANDATORY User Confirmation for destructive ops)
  const [eventToDelete, setEventToDelete] = useState<GoogleCalendarItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Check auth state on open
  useEffect(() => {
    if (isOpen) {
      const token = getCachedCalendarToken();
      if (token) {
        setIsAuthenticated(true);
        loadEvents();
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [isOpen]);

  // Update preset event if provided
  useEffect(() => {
    if (presetEvent) {
      if (presetEvent.summary) setEventTitle(presetEvent.summary);
      if (presetEvent.description) setEventDescription(presetEvent.description);
      if (presetEvent.date) setEventDate(presetEvent.date);
      if (presetEvent.hours) setDurationHours(presetEvent.hours);
    }
  }, [presetEvent]);

  const handleConnectCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      await authenticateWithGoogleCalendar();
      setIsAuthenticated(true);
      setSuccessMessage('اتصال به Google Calendar با موفقیت برقرار شد.');
      setTimeout(() => setSuccessMessage(null), 3500);
      await loadEvents();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'خطا در اتصال به تقویم گوگل. لطفاً دسترسی پنجره پاپ‌آپ را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    setError(null);
    try {
      const now = new Date();
      // Fetch upcoming events from today onwards
      const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const items = await listGoogleCalendarEvents(minDate, maxDate, 15);
      setEvents(items);
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('اعتبار نشست')) {
        setIsAuthenticated(false);
      }
      setError(err?.message || 'دریافت رویدادهای تقویم با خطا مواجه شد.');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      setError('لطفاً عنوان رویداد مطالعه را وارد فرمایید.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Calculate start and end ISO strings with local timezone
      const [hoursStr, minutesStr] = startTime.split(':');
      const startDateTime = new Date(`${eventDate}T${hoursStr.padStart(2, '0')}:${minutesStr.padStart(2, '0')}:00`);
      
      const durationMs = durationHours * 60 * 60 * 1000;
      const endDateTime = new Date(startDateTime.getTime() + durationMs);

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tehran';

      await createGoogleCalendarEvent({
        summary: eventTitle,
        description: `${eventDescription}\n\n[ثبت‌شده توسط دستیار جامع ارشد روانشناسی بالینی ۱۴۰۵]`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone,
        },
        colorId: '9', // Blueberry / Indigo color in Google Calendar
      });

      setSuccessMessage('جلسه مطالعه با موفقیت در Google Calendar شما ثبت و یادآور فعال شد!');
      setTimeout(() => setSuccessMessage(null), 4000);
      await loadEvents();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'خطا در ثبت رویداد در تقویم گوگل.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteGoogleCalendarEvent(eventToDelete.id);
      setSuccessMessage(`رویداد «${eventToDelete.summary}» با موفقیت از تقویم گوگل حذف شد.`);
      setEventToDelete(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadEvents();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'خطا در حذف رویداد.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDisconnect = () => {
    setCachedCalendarToken(null);
    setIsAuthenticated(false);
    setEvents([]);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center"
      id="google-calendar-modal"
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
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh] max-h-[92dvh] animate-in fade-in zoom-in-95 duration-200 text-right"
        style={{
          width: '100%',
          maxWidth: 'min(100%, 46rem)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  همگام‌سازی با Google Calendar
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                ثبت خودکار جلسات مطالعه، مرورها و برنامه‌های هوشمند در تقویم اصلی گوگل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banners */}
        {error && (
          <div className="m-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {!isAuthenticated ? (
            /* Unauthenticated / Connect Prompt */
            <div className="py-8 px-4 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  اتصال به تقویم گوگل
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  با اجازه و تأیید شما، برنامه می‌تواند ساعات مطالعه، جلسات تست‌زنی و مرورهای فواصل زمانی کنکور را مستقیماً در Google Calendar شما ثبت و اعلان‌های یادآوری را فعال کند.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConnectCalendar}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>اتصال و اجازه دسترسی به Google Calendar</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                🔒 توکن امنیتی تنها در حافظه موقت کلاینت نگه‌داری شده و هیچ‌گاه در فضای ناامن ذخیره نمی‌گردد.
              </div>
            </div>
          ) : (
            /* Authenticated View: Add Event & Manage Events */
            <div className="space-y-6">
              {/* Connection Status Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>تقویم گوگل شما متصل است (حساب اصلی Google Calendar)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadEvents}
                    disabled={eventsLoading}
                    className="p-1 rounded text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                    title="بروزرسانی رویدادها"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${eventsLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="قطع اتصال موقت تقویم"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Add New Study Event Form */}
              <form onSubmit={handleCreateEvent} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>افزودن جلسه مطالعه به Google Calendar</span>
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    ارسال به همراه آلارم تقویم
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      درس منتخب:
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => {
                        const subj = e.target.value;
                        setSelectedSubject(subj);
                        setEventTitle(`مطالعه ${subj} (کنکور ارشد بالینی)`);
                      }}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      {EXAM_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} (ضریب {toPersianDigits(s.coefficient)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      عنوان رویداد در تقویم:
                    </label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="مثال: مطالعه آسیب شناسی روانی کاپلان"
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      تاریخ میلادی رویداد:
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        ساعت شروع:
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        مدت (ساعت):
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="8"
                        step="0.5"
                        value={durationHours}
                        onChange={(e) => setDurationHours(parseFloat(e.target.value) || 1)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    توضیحات و نکات مرور:
                  </label>
                  <textarea
                    rows={2}
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="فصول مشخص، تست‌های آموزشی یا مرور جعبه لایتنر..."
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>ثبت مستقیم در Google Calendar</span>
                  </button>
                </div>
              </form>

              {/* Upcoming Google Calendar Study Events List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>رویدادهای ثبت‌شده در تقویم گوگل شما</span>
                  </h4>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>باز کردن وب تقویم</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {eventsLoading ? (
                  <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>در حال بارگذاری رویدادها از Google Calendar...</span>
                  </div>
                ) : events.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                    رویدادی در ۳۰ روز آینده یافت نشد. می‌توانید با فرم بالا اولین جلسه مطالعه خود را اضافه کنید.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {events.map((ev) => {
                      const startTimeDisplay = ev.start.dateTime
                        ? new Date(ev.start.dateTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
                        : 'تمام روز';
                      const startDateDisplay = ev.start.dateTime
                        ? new Date(ev.start.dateTime).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', weekday: 'short' })
                        : ev.start.date || '';

                      return (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-2xs"
                        >
                          <div className="flex flex-col gap-0.5 max-w-[75%]">
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {ev.summary}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>📅 {startDateDisplay}</span>
                              <span>•</span>
                              <span>⏰ {startTimeDisplay}</span>
                            </div>
                            {ev.description && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {ev.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {ev.htmlLink && (
                              <a
                                href={ev.htmlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="مشاهده در تقویم گوگل"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {/* Delete Button triggering Mandatory User Confirmation Modal */}
                            <button
                              type="button"
                              onClick={() => setEventToDelete(ev)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                              title="حذف رویداد از Google Calendar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>هماهنگ‌سازی با تقویم اصلی کاربر در Google Calendar</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
          >
            بستن
          </button>
        </div>

        {/* Mandatory User Confirmation Dialog for Destructive Operations (Deleting Event) */}
        {eventToDelete && (
          <div className="absolute inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 max-w-sm w-full text-right shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  تأیید حذف رویداد از Google Calendar
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  آیا اطمینان دارید که می‌خواهید رویداد «<strong>{eventToDelete.summary}</strong>» را از حساب تقویم گوگل خود حذف کنید؟ این عمل غیرقابل بازگشت است.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setEventToDelete(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteEvent}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>بله، حذف شود</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

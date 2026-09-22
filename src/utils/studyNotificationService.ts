import { StudyReminderSettings, UserProgressMap, DailyStudyLogMap } from '../types';
import { createGoogleCalendarEvent, getCachedCalendarToken } from '../services/googleCalendarService';

export const REMINDER_SETTINGS_KEY = 'konkur_study_reminder_settings_v1';

export const DEFAULT_REMINDER_SETTINGS: StudyReminderSettings = {
  enabled: true,
  cutoffTime: '18:00', // 6:00 PM
  dailyTargetHours: 4, // 4 hours goal
  browserPushEnabled: true,
  googleCalendarRemindersEnabled: false,
};

/**
 * Load reminder settings from localStorage.
 */
export function getStoredReminderSettings(): StudyReminderSettings {
  try {
    const saved = localStorage.getItem(REMINDER_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load study reminder settings:', e);
  }
  return DEFAULT_REMINDER_SETTINGS;
}

/**
 * Save reminder settings to localStorage.
 */
export function saveStoredReminderSettings(settings: StudyReminderSettings): void {
  try {
    localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save study reminder settings:', e);
  }
}

/**
 * Request Web Notification permission safely.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

/**
 * Determine if user has logged study activity today.
 */
export function hasLoggedStudyToday(
  userProgress: UserProgressMap,
  dailyStudyLogs: DailyStudyLogMap,
  targetDateKey?: string
): { hasActivity: boolean; totalHours: number } {
  const todayKey = targetDateKey || new Date().toISOString().split('T')[0];

  // 1. Check direct daily log for today
  const todayLog = dailyStudyLogs[todayKey];
  let customHours = 0;
  if (todayLog) {
    customHours = todayLog.customHours || 0;
    if (todayLog.manualMarked || customHours > 0) {
      return { hasActivity: true, totalHours: customHours };
    }
  }

  // 2. Check user progress entries updated today
  let progressCount = 0;
  Object.values(userProgress).forEach((ch) => {
    if (ch.lastStudiedDate && ch.lastStudiedDate.startsWith(todayKey)) {
      progressCount++;
    }
  });

  if (progressCount > 0) {
    return { hasActivity: true, totalHours: Math.max(customHours, progressCount * 1.5) };
  }

  return { hasActivity: false, totalHours: customHours };
}

/**
 * Check if the current time has passed the configured cutoff time today.
 */
export function isPastCutoffTime(cutoffTime: string): boolean {
  const [targetHour, targetMinute] = cutoffTime.split(':').map(Number);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour > targetHour) return true;
  if (currentHour === targetHour && currentMinute >= targetMinute) return true;
  return false;
}

/**
 * Fire the browser push notification.
 */
export function triggerBrowserNotification(title: string, body: string): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const options: NotificationOptions = {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'konkur-daily-study-reminder',
      dir: 'rtl',
      lang: 'fa-IR',
      requireInteraction: true,
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, options);
      }).catch(() => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
    return true;
  } catch (err) {
    console.warn('Native notification failed, falling back:', err);
    return false;
  }
}

/**
 * Dispatch or schedule a Google Calendar study reminder event for today if not already scheduled.
 */
export async function scheduleGoogleCalendarReminder(
  cutoffTime: string,
  targetHours: number
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const token = getCachedCalendarToken();
    if (!token) {
      return { success: false, error: 'Google Calendar متصل نیست. لطفاً ابتدا از هدر متصل شوید.' };
    }

    const todayISO = new Date().toISOString().split('T')[0];
    const [cutoffH, cutoffM] = cutoffTime.split(':').map((n) => Number(n) || 0);

    const startDateTime = new Date();
    startDateTime.setHours(cutoffH, cutoffM, 0, 0);

    const endDateTime = new Date(startDateTime.getTime() + targetHours * 60 * 60 * 1000);

    const event = await createGoogleCalendarEvent({
      summary: `🔔 یادآور مطالعه کنکور ارشد روانشناسی بالینی (هدف: ${targetHours} ساعت)`,
      description: `یادآور خودکار روزانه برنامه راهبردی ارشد بالینی ۱۴۰۵:\nتا ساعت ${cutoffTime} هنوز گزارشی از مطالعه امروز ثبت نشده است.\nهدف روزانه شما: ${targetHours} ساعت.\nلطفاً برای ادامه زنجیره مطالعه، مباحث تعیین‌شده را آغاز نمایید.`,
      start: {
        dateTime: startDateTime.toISOString(),
      },
      end: {
        dateTime: endDateTime.toISOString(),
      },
      colorId: '11', // Red/Orange flamingo for attention
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
          { method: 'email', minutes: 30 },
        ],
      },
    });

    return { success: true, eventId: event.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

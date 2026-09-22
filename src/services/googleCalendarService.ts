import { auth, googleProvider, saveUserProfile } from './firebase';
import { signInWithPopup, User } from 'firebase/auth';

// Google Calendar API Scopes configured for the application
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

// Ensure GoogleAuthProvider has Calendar scopes added
CALENDAR_SCOPES.forEach((scope) => {
  try {
    googleProvider.addScope(scope);
  } catch {
    // Ignore duplicate additions
  }
});

// Cache the access token in memory as required by workspace integration skill
let cachedAccessToken: string | null = null;

export interface CalendarEventPayload {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'popup' | 'email';
      minutes: number;
    }>;
  };
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

/**
 * Prompt user to sign in with Google with Calendar scopes and cache access token in memory.
 */
export async function authenticateWithGoogleCalendar(): Promise<{ user: User; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Extract access token from GoogleAuthProvider credential
    const credential = (result as unknown as { _tokenResponse?: { oauthAccessToken?: string } })._tokenResponse;
    const accessToken = credential?.oauthAccessToken;

    if (!accessToken) {
      // Fallback check
      const anyResult = result as any;
      const token = anyResult.credential?.accessToken || anyResult._tokenResponse?.oauthAccessToken;
      if (token) {
        cachedAccessToken = token;
        return { user: result.user, accessToken: token };
      }
      throw new Error('توکن دسترسی Google Calendar دریافت نشد. لطفاً مجوزهای تقویم گوگل را تأیید نمایید.');
    }

    cachedAccessToken = accessToken;

    if (result.user) {
      await saveUserProfile(result.user.uid, {
        userId: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'داوطلب کنکور',
        photoURL: result.user.photoURL || '',
        calendarConnected: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return { user: result.user, accessToken };
  } catch (error) {
    console.error('Calendar Auth Error:', error);
    throw error;
  }
}

/**
 * Retrieve current cached access token in memory.
 */
export function getCachedCalendarToken(): string | null {
  return cachedAccessToken;
}

/**
 * Set or clear cached access token in memory.
 */
export function setCachedCalendarToken(token: string | null): void {
  cachedAccessToken = token;
}

/**
 * Helper to ensure a valid token is available, or trigger sign-in.
 */
export async function getValidAccessToken(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  const { accessToken } = await authenticateWithGoogleCalendar();
  return accessToken;
}

/**
 * List upcoming events from Primary Google Calendar for this week/month.
 */
export async function listGoogleCalendarEvents(
  timeMin?: string,
  timeMax?: string,
  maxResults = 20
): Promise<GoogleCalendarItem[]> {
  const token = await getValidAccessToken();
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    orderBy: 'startTime',
    singleEvents: 'true',
  });

  if (timeMin) params.append('timeMin', timeMin);
  else params.append('timeMin', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (timeMax) params.append('timeMax', timeMax);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );

  if (response.status === 401) {
    cachedAccessToken = null;
    throw new Error('اعتبار نشست تقویم گوگل منقضی شده است. لطفاً مجدداً متصل شوید.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Calendar list error:', errorText);
    throw new Error('خطا در دریافت رویدادهای تقویم گوگل.');
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Create a new study event in the Primary Google Calendar.
 */
export async function createGoogleCalendarEvent(
  event: CalendarEventPayload
): Promise<GoogleCalendarItem> {
  const token = await getValidAccessToken();

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (response.status === 401) {
    cachedAccessToken = null;
    throw new Error('اعتبار نشست منقضی شد. لطفاً دوباره دکمه اتصال به تقویم گوگل را بزنید.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Calendar create error:', errorText);
    throw new Error('خطا در ثبت رویداد در تقویم گوگل.');
  }

  return await response.json();
}

/**
 * Delete an event from Primary Google Calendar (Requires mandatory user confirmation).
 */
export async function deleteGoogleCalendarEvent(eventId: string): Promise<void> {
  const token = await getValidAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    cachedAccessToken = null;
    throw new Error('اعتبار نشست تقویم منقضی شده است.');
  }

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    console.error('Google Calendar delete error:', errorText);
    throw new Error('خطا در حذف رویداد از تقویم گوگل.');
  }
}

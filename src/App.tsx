/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EXAM_SUBJECTS, EXAM_STATISTICS } from './data/curriculumData';
import { Subject, Book, Chapter, UserProgressMap, ChapterUserData, FilterState, ExamTarget, StudyStatus, ChapterProgress, DailyStudyLog, DailyStudyLogMap } from './types';
import { Header } from './components/Header';
import { SubjectTabs } from './components/SubjectTabs';
import { FilterBar } from './components/FilterBar';
import { ChapterCard } from './components/ChapterCard';
import { SubjectOverviewCard } from './components/SubjectOverviewCard';
import { BudgetingAnalysisModal } from './components/BudgetingAnalysisModal';
import { StudyPlanModal } from './components/StudyPlanModal';
import { AIStudyPlanModal } from './components/AIStudyPlanModal';
import { GoogleCalendarSyncModal } from './components/GoogleCalendarSyncModal';
import { StudyReminderModal } from './components/StudyReminderModal';
import { InactivityAlertBanner } from './components/InactivityAlertBanner';
import { SubjectProgressChart } from './components/SubjectProgressChart';
import { SearchGroundingModal } from './components/SearchGroundingModal';
import { DailyRecommendationBanner } from './components/DailyRecommendationBanner';
import { InteractiveStudyCalendar } from './components/InteractiveStudyCalendar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SyncStatusToast, SyncToastState } from './components/SyncStatusToast';
import { getRecommendedChapters } from './utils/recommender';
import { BookOpen, Sparkles, AlertCircle, FileText, CheckCircle2, BookmarkCheck, Stethoscope, GraduationCap, Globe, Brain } from 'lucide-react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  testConnection,
  subscribeToUserProgress,
  saveChapterProgressToCloud,
  syncProgressBidirectional,
} from './services/firebase';
import {
  getStoredReminderSettings,
  saveStoredReminderSettings,
  hasLoggedStudyToday,
  isPastCutoffTime,
  triggerBrowserNotification,
  scheduleGoogleCalendarReminder,
} from './utils/studyNotificationService';

const STORAGE_KEY = 'konkur_arshad_1405_clinical_progress_v1';
const ACTIVITY_META_KEY = 'konkur_arshad_1405_activity_meta_v1';
const DAILY_STUDY_LOGS_KEY = 'konkur_arshad_1405_daily_study_logs_v1';
const THEME_STORAGE_KEY = 'konkur_arshad_1405_theme_v1';
const INACTIVITY_THRESHOLD_DAYS = 3;

export default function App() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('clinical');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAIPlanModalOpen, setIsAIPlanModalOpen] = useState(false);
  const [isGoogleCalendarModalOpen, setIsGoogleCalendarModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [calendarPresetEvent, setCalendarPresetEvent] = useState<{
    summary?: string;
    description?: string;
    date?: string;
    hours?: number;
  } | undefined>(undefined);

  // Dark Mode State with localStorage and system preference detection
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync dark class on document.documentElement whenever darkMode changes
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
      }
    } catch (e) {
      console.error('Failed to sync theme preference:', e);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Firebase Auth and Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<SyncToastState | null>(null);

  // Auto-dismiss sync toast after 4.5 seconds
  useEffect(() => {
    if (syncToast?.show && syncToast.type !== 'syncing') {
      const timer = setTimeout(() => {
        setSyncToast((prev) => (prev ? { ...prev, show: false } : null));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [syncToast]);

  // Handler to manually trigger a sync of progress between localStorage and Firestore
  const handleManualSync = async () => {
    if (!currentUser) {
      setSyncToast({
        show: true,
        type: 'info',
        title: 'ورود به حساب کاربری',
        message: 'برای همگام‌سازی ابری با دیتابیس Firestore، ابتدا با حساب کاربری گوگل خود وارد شوید.',
      });
      return;
    }

    if (!navigator.onLine) {
      setSyncToast({
        show: true,
        type: 'error',
        title: 'عدم اتصال به اینترنت',
        message: 'همگام‌سازی با Firestore نیازمند دسترسی به اینترنت است. اطلاعات شما در حافظه دستگاه (localStorage) به صورت محلی ذخیره است.',
      });
      return;
    }

    setIsManualSyncing(true);
    setSyncToast({
      show: true,
      type: 'syncing',
      title: 'در حال همگام‌سازی...',
      message: 'در حال مقایسه و همگام‌سازی دوطرفه داده‌های حافظه محلی و دیتابیس ابری Firestore...',
    });

    try {
      const result = await syncProgressBidirectional(currentUser.uid, userProgress);
      setUserProgress(result.mergedProgress);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.mergedProgress));
      } catch (storageErr) {
        console.warn('Failed to update localStorage directly after sync:', storageErr);
      }

      setSyncToast({
        show: true,
        type: 'success',
        title: 'همگام‌سازی با موفقیت انجام شد',
        message: `تغییرات با Firestore همگام شد: ${result.uploadedCount} فصل در ابر به‌روز شد، ${result.downloadedCount} مورد دریافت شد (${result.mergedCount} فصل ثبت‌شده).`,
      });
    } catch (err: unknown) {
      console.error('Manual sync error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setSyncToast({
        show: true,
        type: 'error',
        title: 'خطا در همگام‌سازی ابری',
        message: `خطا در برقراری ارتباط با Firestore (${errorMessage.slice(0, 80)}...). لطفاً اتصال خود را بررسی و دوباره تلاش کنید.`,
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Search Grounding Modal State (Gemini 3.5 Flash + Google Search tool)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchModalContext, setSearchModalContext] = useState<{
    topic?: string;
    chapterTitle?: string;
    chapterId?: string;
  }>({});

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    subjectId: 'clinical',
    searchQuery: '',
    importance: 'all',
    status: 'all',
    bookId: 'all',
    examTarget: 'both',
  });

  // User study progress state with localStorage sync
  const [userProgress, setUserProgress] = useState<UserProgressMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved progress from localStorage', e);
    }
    return {};
  });

  // Activity tracking state (for tracking inactivity > 3 days)
  const [activityMeta, setActivityMeta] = useState<{
    lastActiveDate: string;
    dismissedDate?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_META_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse activity meta from localStorage', e);
    }
    // Default to current time on very first visit
    const now = new Date().toISOString();
    return { lastActiveDate: now };
  });

  // Save activity meta
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_META_KEY, JSON.stringify(activityMeta));
    } catch (e) {
      console.error('Failed to save activity meta to localStorage', e);
    }
  }, [activityMeta]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }, [userProgress]);

  // Daily study logs state for custom hours and manual day marks
  const [dailyStudyLogs, setDailyStudyLogs] = useState<DailyStudyLogMap>(() => {
    try {
      const saved = localStorage.getItem(DAILY_STUDY_LOGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved daily study logs from localStorage', e);
    }
    return {};
  });

  // Save daily study logs
  useEffect(() => {
    try {
      localStorage.setItem(DAILY_STUDY_LOGS_KEY, JSON.stringify(dailyStudyLogs));
    } catch (e) {
      console.error('Failed to save daily study logs to localStorage', e);
    }
  }, [dailyStudyLogs]);

  // Automated Daily Push Notification & Google Calendar Trigger Check
  useEffect(() => {
    const checkStudyReminderTrigger = async () => {
      const settings = getStoredReminderSettings();
      if (!settings.enabled) return;

      const todayKey = new Date().toISOString().split('T')[0];
      // Do not re-trigger if already triggered today
      if (settings.lastTriggeredDate === todayKey) return;

      // Check if time is past cutoff time
      if (!isPastCutoffTime(settings.cutoffTime)) return;

      // Check if user has logged study activity today
      const activity = hasLoggedStudyToday(userProgress, dailyStudyLogs, todayKey);
      if (activity.hasActivity && activity.totalHours >= settings.dailyTargetHours) {
        return; // Goal reached, no reminder needed
      }

      let triggered = false;

      // 1. Browser Push Notification
      if (settings.browserPushEnabled) {
        const title = '🔔 یادآور مطالعه کنکور ارشد روانشناسی بالینی';
        const body = `ساعت ${settings.cutoffTime} فرا رسیده و هنوز فعالیت مطالعه امروز شما (هدف: ${settings.dailyTargetHours} ساعت) ثبت نشده است. برای تداوم زنجیره مطالعاتی کلیک کنید!`;
        const pushed = triggerBrowserNotification(title, body);
        if (pushed) triggered = true;
      }

      // 2. Google Calendar Event Trigger
      if (settings.googleCalendarRemindersEnabled) {
        const res = await scheduleGoogleCalendarReminder(settings.cutoffTime, settings.dailyTargetHours);
        if (res.success) triggered = true;
      }

      if (triggered) {
        const updated = { ...settings, lastTriggeredDate: todayKey };
        saveStoredReminderSettings(updated);
      }
    };

    // Check immediately on mount/data change, then every 60 seconds
    checkStudyReminderTrigger();
    const interval = setInterval(checkStudyReminderTrigger, 60000);
    return () => clearInterval(interval);
  }, [userProgress, dailyStudyLogs]);

  // Initialize Firebase Auth listener and connection
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Progress Sync when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    setIsSyncing(true);
    const unsubscribe = subscribeToUserProgress(
      currentUser.uid,
      (cloudProgressMap) => {
        setUserProgress((prev) => {
          const merged: UserProgressMap = { ...prev };
          Object.entries(cloudProgressMap).forEach(([chId, chProg]: [string, ChapterProgress]) => {
            merged[chId] = {
              status: chProg.status as StudyStatus,
              notes: chProg.notes || prev[chId]?.notes || '',
              readBookText: chProg.status === 'mastered' || prev[chId]?.readBookText,
              doneTrainingTests: prev[chId]?.doneTrainingTests,
              doneReviewTests: prev[chId]?.doneReviewTests,
              lastStudiedDate: chProg.lastStudiedAt || prev[chId]?.lastStudiedDate,
            };
          });
          return merged;
        });
        setIsSyncing(false);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setIsSyncing(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  // Update study progress for a chapter
  const handleUpdateUserData = (chapterId: string, partialData: Partial<ChapterUserData>) => {
    const nowISO = new Date().toISOString();
    
    // Update active date
    setActivityMeta((prev) => ({
      ...prev,
      lastActiveDate: nowISO,
      dismissedDate: undefined, // clear dismiss on new activity
    }));

    const current = userProgress[chapterId] || {
      status: 'not_started',
      notes: '',
      readBookText: false,
      doneTrainingTests: false,
      doneReviewTests: false,
    };
    const updatedChapter: ChapterUserData = {
      ...current,
      ...partialData,
      lastStudiedDate: nowISO,
    };

    setUserProgress((prev) => ({
      ...prev,
      [chapterId]: updatedChapter,
    }));

    // If authenticated, persist to Firestore in real-time
    if (currentUser) {
      setIsSyncing(true);
      saveChapterProgressToCloud(currentUser.uid, chapterId, {
        chapterId,
        status: updatedChapter.status as any,
        notes: updatedChapter.notes || '',
        lastStudiedAt: nowISO,
      })
        .catch((e) => console.error('Failed to save to Firestore:', e))
        .finally(() => setIsSyncing(false));
    }
  };

  const handleOpenSearchGroundingForChapter = (chapter: Chapter) => {
    setSearchModalContext({
      chapterTitle: chapter.title,
      topic: chapter.keyTopics?.[0] || chapter.bookTitle,
      chapterId: chapter.id,
    });
    setIsSearchModalOpen(true);
  };

  const handleOpenGeneralSearchGrounding = () => {
    setSearchModalContext({});
    setIsSearchModalOpen(true);
  };

  const handleAppendNotesFromSearch = (chapterId: string, text: string) => {
    handleUpdateUserData(chapterId, {
      notes: (userProgress[chapterId]?.notes || '') + text,
    });
  };

  // Calendar update handler for daily custom study hours and manual markings
  const handleUpdateDailyStudyLog = (dateKey: string, partialLog: Partial<DailyStudyLog>) => {
    const nowISO = new Date().toISOString();
    setActivityMeta((prev) => ({
      ...prev,
      lastActiveDate: nowISO,
      dismissedDate: undefined,
    }));

    setDailyStudyLogs((prev) => {
      const current = prev[dateKey] || { dateKey, customHours: 0 };
      return {
        ...prev,
        [dateKey]: {
          ...current,
          ...partialLog,
          dateKey,
        },
      };
    });
  };

  // Scroll to a specific chapter when clicked from calendar or recommendation
  const handleScrollToChapter = (chapterId: string) => {
    for (const sub of EXAM_SUBJECTS) {
      for (const book of sub.books) {
        const found = book.chapters.some((c) => c.id === chapterId);
        if (found) {
          setSelectedSubjectId(sub.id);
          setFilters((prev) => ({
            ...prev,
            subjectId: sub.id,
            bookId: book.id,
            searchQuery: '',
          }));
          setTimeout(() => {
            const el =
              document.getElementById(`chapter-card-${chapterId}`) ||
              document.getElementById('chapters-list-container');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          return;
        }
      }
    }
  };

  // Check inactivity calculation: check all chapter lastStudiedDates as well as activityMeta.lastActiveDate
  const inactivityStatus = useMemo(() => {
    // Find the latest study timestamp among all chapters
    let latestStudyTimestamp = 0;
    let latestStudyDateStr: string | null = null;

    Object.values(userProgress).forEach((userData) => {
      if (userData.lastStudiedDate) {
        const t = new Date(userData.lastStudiedDate).getTime();
        if (t > latestStudyTimestamp) {
          latestStudyTimestamp = t;
          latestStudyDateStr = userData.lastStudiedDate;
        }
      }
    });

    // If no chapter has been studied yet, fallback to activityMeta.lastActiveDate
    const fallbackTimestamp = activityMeta.lastActiveDate
      ? new Date(activityMeta.lastActiveDate).getTime()
      : 0;

    const referenceTimestamp = latestStudyTimestamp > 0 ? latestStudyTimestamp : fallbackTimestamp;
    const now = Date.now();

    if (!referenceTimestamp) {
      return { isInactive: false, daysInactive: 0, lastStudiedDate: null };
    }

    const diffMs = now - referenceTimestamp;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Check if dismissed today
    const isDismissedToday = activityMeta.dismissedDate
      ? new Date(activityMeta.dismissedDate).toDateString() === new Date().toDateString()
      : false;

    const isInactive = diffDays >= INACTIVITY_THRESHOLD_DAYS && !isDismissedToday;

    return {
      isInactive,
      daysInactive: diffDays,
      lastStudiedDate: latestStudyDateStr || activityMeta.lastActiveDate,
    };
  }, [userProgress, activityMeta]);

  // Handler to simulate 4-day gap for testing/demo
  const handleSimulateInactivity = () => {
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    
    // Set all chapter dates if any exist to 4 days ago
    setUserProgress((prev) => {
      const updated: UserProgressMap = {};
      Object.keys(prev).forEach((chId) => {
        updated[chId] = {
          ...prev[chId],
          lastStudiedDate: prev[chId].lastStudiedDate ? fourDaysAgo : undefined,
        };
      });
      return updated;
    });

    setActivityMeta({
      lastActiveDate: fourDaysAgo,
      dismissedDate: undefined,
    });
  };

  // Handler to dismiss inactivity alert for today
  const handleDismissInactivityAlert = () => {
    setActivityMeta((prev) => ({
      ...prev,
      dismissedDate: new Date().toISOString(),
    }));
  };

  // Handler to quick resume study by filtering critical chapters and focusing on Clinical Psychology
  const handleQuickResumeStudy = () => {
    setSelectedSubjectId('clinical');
    setFilters({
      subjectId: 'clinical',
      searchQuery: '',
      importance: 'critical',
      status: 'all',
      bookId: 'all',
    });
    // Scroll smoothly to chapters container
    const el = document.getElementById('chapters-list-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset progress with confirmation
  const handleResetProgress = () => {
    if (window.confirm('آیا از بازنشانی کامل وضعیت مطالعه و تقویم اطمینان دارید؟')) {
      setUserProgress({});
      setDailyStudyLogs({});
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(DAILY_STUDY_LOGS_KEY);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Switch subject tab
  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    setFilters((prev) => ({
      ...prev,
      subjectId: id,
      bookId: 'all', // reset book filter when switching subject
    }));
  };

  const handleExamTargetChange = (target: ExamTarget) => {
    setFilters((prev) => {
      const updated = { ...prev, examTarget: target };
      // If currently selected subject is not valid for target, reset to 'all' or 'clinical'
      if (target === 'health' && selectedSubjectId === 'islamic') {
        setSelectedSubjectId('clinical');
        updated.subjectId = 'clinical';
      } else if (target === 'science' && selectedSubjectId === 'health_services') {
        setSelectedSubjectId('clinical');
        updated.subjectId = 'clinical';
      }
      return updated;
    });
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // All chapters flat list
  const allChaptersWithMeta = useMemo(() => {
    const list: Array<{ chapter: Chapter; subject: Subject; book: Book }> = [];
    EXAM_SUBJECTS.forEach((subject) => {
      subject.books.forEach((book) => {
        book.chapters.forEach((chapter) => {
          list.push({ chapter, subject, book });
        });
      });
    });
    return list;
  }, []);

  // Available books for currently active subject
  const currentSubject = useMemo(() => {
    if (selectedSubjectId === 'all') return null;
    return EXAM_SUBJECTS.find((s) => s.id === selectedSubjectId) || null;
  }, [selectedSubjectId]);

  const availableBooks = useMemo(() => {
    if (currentSubject) {
      if (currentSubject.id === 'clinical') {
        const kaplanBook = EXAM_SUBJECTS.find((s) => s.id === 'psychopathology')?.books.find((b) => b.id === 'pp-kaplan');
        return kaplanBook ? [...currentSubject.books, kaplanBook] : currentSubject.books;
      }
      return currentSubject.books;
    }
    return EXAM_SUBJECTS.flatMap((s) => s.books);
  }, [currentSubject]);

  // Filtered chapters
  const filteredChaptersWithMeta = useMemo(() => {
    return allChaptersWithMeta.filter(({ chapter, subject, book }) => {
      // Exam target filter
      if (filters.examTarget === 'health') {
        if (subject.targetExam === 'science' || chapter.targetExam === 'science') {
          return false;
        }
      } else if (filters.examTarget === 'science') {
        if (subject.targetExam === 'health' || chapter.targetExam === 'health') {
          return false;
        }
      }

      // Subject filter
      if (selectedSubjectId !== 'all' && subject.id !== selectedSubjectId) {
        // Allow Kaplan chapters if selected from clinical subject
        if (selectedSubjectId === 'clinical' && (filters.bookId === 'pp-kaplan' || filters.examTarget === 'health') && book.id === 'pp-kaplan') {
          // Allowed
        } else {
          return false;
        }
      }

      // Book filter
      if (filters.bookId && filters.bookId !== 'all' && book.id !== filters.bookId) {
        return false;
      }

      // Importance filter
      if (filters.importance !== 'all' && chapter.importance !== filters.importance) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const currentStatus = userProgress[chapter.id]?.status || 'not_started';
        if (currentStatus !== filters.status) {
          return false;
        }
      }

      // Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const inTitle = chapter.title.toLowerCase().includes(query);
        const inBook = chapter.bookTitle.toLowerCase().includes(query);
        const inAuthors = chapter.authors.toLowerCase().includes(query);
        const inTopics = chapter.keyTopics.some((t) => t.toLowerCase().includes(query));
        const inTips = chapter.examTips.toLowerCase().includes(query);
        const inHealthFreq = (chapter.healthFrequency || '').toLowerCase().includes(query);
        const inNotes = (userProgress[chapter.id]?.notes || '').toLowerCase().includes(query);

        if (!inTitle && !inBook && !inAuthors && !inTopics && !inTips && !inHealthFreq && !inNotes) {
          return false;
        }
      }

      return true;
    });
  }, [allChaptersWithMeta, selectedSubjectId, filters, userProgress]);

  // Overall Statistics & Weighted Progress
  const { totalChapters, completedChapters, inProgressChapters, weightedProgress } = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let totalWeightedScore = 0;
    let totalCoeffs = 0;

    const isHealthOnly = filters.examTarget === 'health';
    const isScienceOnly = filters.examTarget === 'science';

    EXAM_SUBJECTS.forEach((subject) => {
      // Skip subjects not part of the active exam target
      if (isHealthOnly && subject.targetExam === 'science') return;
      if (isScienceOnly && subject.targetExam === 'health') return;

      const coeff = isHealthOnly
        ? (subject.healthCoefficient || 0)
        : subject.coefficient;

      if (coeff <= 0 && (isHealthOnly || isScienceOnly)) return;

      const effectiveCoeff = coeff > 0 ? coeff : 1;
      totalCoeffs += effectiveCoeff;
      let subjectTotal = 0;
      let subjectScore = 0;

      subject.books.forEach((b) => {
        if (isHealthOnly && b.targetExam === 'science') return;
        if (isScienceOnly && b.targetExam === 'health') return;

        b.chapters.forEach((ch) => {
          if (isHealthOnly && ch.targetExam === 'science') return;
          if (isScienceOnly && ch.targetExam === 'health') return;

          total++;
          subjectTotal++;
          const status = userProgress[ch.id]?.status || 'not_started';
          if (status === 'mastered') {
            completed++;
            subjectScore += 1;
          } else if (status === 'summarized') {
            subjectScore += 0.75;
          } else if (status === 'in_progress') {
            inProgress++;
            subjectScore += 0.35;
          }
        });
      });

      if (subjectTotal > 0) {
        totalWeightedScore += (subjectScore / subjectTotal) * effectiveCoeff;
      }
    });

    const weighted = totalCoeffs > 0 ? Math.round((totalWeightedScore / totalCoeffs) * 100) : 0;

    return {
      totalChapters: total,
      completedChapters: completed,
      inProgressChapters: inProgress,
      weightedProgress: weighted,
    };
  }, [userProgress, filters.examTarget]);

  // Intelligent Recommendation Engine: Calculates best chapter to study today
  const dailyRecommendations = useMemo(() => {
    return getRecommendedChapters(
      EXAM_SUBJECTS,
      userProgress,
      filters.examTarget || 'both',
      selectedSubjectId !== 'all' ? selectedSubjectId : undefined,
      3
    );
  }, [userProgress, filters.examTarget, selectedSubjectId]);

  const handleSelectRecommendedChapter = (chapterId: string) => {
    for (const sub of EXAM_SUBJECTS) {
      for (const bk of sub.books) {
        const found = bk.chapters.find((c) => c.id === chapterId);
        if (found) {
          setSelectedSubjectId(sub.id);
          setFilters((prev) => ({
            ...prev,
            subjectId: sub.id,
            bookId: 'all',
            searchQuery: '',
          }));
          setTimeout(() => {
            const el = document.getElementById(`chapter-card-${chapterId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-amber-400');
              setTimeout(() => {
                el.classList.remove('ring-4', 'ring-amber-400');
              }, 2500);
            }
          }, 150);
          return;
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200" id="app-root">
      {/* 3+ Days Inactivity Reminder Banner */}
      {inactivityStatus.isInactive && (
        <InactivityAlertBanner
          daysInactive={inactivityStatus.daysInactive}
          lastStudiedDate={inactivityStatus.lastStudiedDate}
          onDismiss={handleDismissInactivityAlert}
          onQuickResume={handleQuickResumeStudy}
        />
      )}

      {/* Top Header */}
      <Header
        weightedProgress={weightedProgress}
        totalChaptersCount={totalChapters}
        completedChaptersCount={completedChapters}
        inProgressChaptersCount={inProgressChapters}
        onOpenAnalysis={() => setIsAnalysisModalOpen(true)}
        onOpenAIStudyPlan={() => setIsAIPlanModalOpen(true)}
        onOpenGoogleCalendar={() => {
          setCalendarPresetEvent(undefined);
          setIsGoogleCalendarModalOpen(true);
        }}
        onOpenStudyReminder={() => setIsReminderModalOpen(true)}
        onResetProgress={handleResetProgress}
        onSimulateInactivity={handleSimulateInactivity}
        currentUser={currentUser}
        authLoading={authLoading}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        isManualSyncing={isManualSyncing}
        onOpenSearchGrounding={handleOpenGeneralSearchGrounding}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Subject Tabs Navigation */}
      <SubjectTabs
        subjects={EXAM_SUBJECTS}
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={handleSelectSubject}
        userProgress={userProgress}
        activeExamTarget={filters.examTarget || 'both'}
        onSelectExamTarget={handleExamTargetChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-4">
        {/* Interactive Study Calendar (تقویم تعاملی استمرار و ساعات مطالعه تخمینی) */}
        <InteractiveStudyCalendar
          userProgress={userProgress}
          subjects={EXAM_SUBJECTS}
          dailyStudyLogs={dailyStudyLogs}
          onUpdateDailyStudyLog={handleUpdateDailyStudyLog}
          onScrollToChapter={handleScrollToChapter}
          onSyncWithGoogleCalendar={(preset) => {
            setCalendarPresetEvent(preset);
            setIsGoogleCalendarModalOpen(true);
          }}
        />

        {/* Quick Guide & Shortcuts Strip (Compact) */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap bg-linear-to-r from-indigo-950 via-slate-900 to-teal-950 text-white p-2.5 sm:p-3 rounded-lg shadow-xs">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAnalysisModalOpen(true)}
                id="btn-strategic-plan-badge"
                className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 shrink-0 cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                title="کلیک برای باز کردن برنامه راهبردی، تحلیل ضرایب و نمودار مقایسه‌ای بودجه‌بندی سالانه"
              >
                <span>برنامه راهبردی ۱۴۰۵</span>
                <span className="text-[9px] bg-slate-950 text-amber-300 px-1 py-0.2 rounded font-normal">تحلیل ضرایب و فراوانی</span>
              </button>
              <span className="text-[11px] sm:text-xs text-indigo-200 truncate">
                {filters.examTarget === 'health'
                  ? 'کنکور کارشناسی ارشد وزارت بهداشت (سنجش پزشکی)'
                  : filters.examTarget === 'science'
                  ? 'کنکور کارشناسی ارشد وزارت علوم (کد ۱۱۳۳)'
                  : 'داوطلبان هر دو کنکور وزارت بهداشت و وزارت علوم'}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate">
              {filters.examTarget === 'health'
                ? 'فهرست تحلیلی کتب و فصول وزارت بهداشت (دستنامه کاپلان، مارنات، سارافینو)'
                : filters.examTarget === 'science'
                ? 'فهرست تحلیلی کتب و فصول وزارت علوم (فیرس، پروچاسکا، DSM-5، هیلگارد)'
                : 'برنامه تلفیقی کتب و فصول مرجع هر دو کنکور'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  importance: prev.importance === 'critical' ? 'all' : 'critical',
                }));
              }}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer border ${
                filters.importance === 'critical'
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>فقط فصول طلایی (⭐⭐⭐)</span>
            </button>

            <button
              onClick={() => {
                handleExamTargetChange(filters.examTarget === 'health' ? 'both' : 'health');
              }}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer border ${
                filters.examTarget === 'health'
                  ? 'bg-teal-500 text-white border-teal-400'
                  : 'bg-teal-900/60 hover:bg-teal-800/80 text-teal-100 border-teal-700/60'
              }`}
            >
              <Stethoscope className="w-3 h-3 text-teal-300" />
              <span>{filters.examTarget === 'health' ? 'فیلتر بهداشت فعال' : 'فیلتر بهداشت'}</span>
            </button>

            <button
              onClick={() => setIsAIPlanModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold text-white bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border border-indigo-400/50 cursor-pointer shadow-xs shrink-0"
              title="تخصیص برنامه پیشنهادی هوش مصنوعی بر اساس کتب انتخابی و قانون ۲ درس در روز"
            >
              <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-100 shrink-0" />
              <span>برنامه هوشمند مطالعه</span>
            </button>

            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            >
              <BookmarkCheck className="w-3 h-3 text-emerald-300" />
              <span>چک‌لیست چاپی</span>
            </button>
          </div>
        </div>

        {/* Selected Subject Overview (if a single subject is selected) */}
        {currentSubject && (
          <SubjectOverviewCard
            subject={currentSubject}
            selectedBookId={filters.bookId}
            onSelectBook={(bId) => setFilters((prev) => ({ ...prev, bookId: bId }))}
          />
        )}

        {/* Visual Progress Chart (Recharts: Pie/Donut & Bar Charts) */}
        <SubjectProgressChart
          subject={currentSubject}
          allSubjects={EXAM_SUBJECTS}
          userProgress={userProgress}
          onFilterStatus={(status) => {
            setFilters((prev) => ({
              ...prev,
              status: prev.status === status ? 'all' : (status as any),
            }));
            const el = document.getElementById('chapters-list-container');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Filters and Search Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          availableBooks={availableBooks}
          filteredCount={filteredChaptersWithMeta.length}
          totalCount={allChaptersWithMeta.length}
        />

        {/* Daily Smart Study Recommendation (پیشنهاد هوشمند روز بر اساس بودجه‌بندی و تسلط) */}
        {dailyRecommendations.length > 0 && (
          <DailyRecommendationBanner
            recommendations={dailyRecommendations}
            onSelectChapter={handleSelectRecommendedChapter}
            onUpdateUserData={handleUpdateUserData}
            userDataMap={userProgress}
            onOpenSearchGrounding={handleOpenSearchGroundingForChapter}
          />
        )}

        {/* Chapters Grid / List */}
        {filteredChaptersWithMeta.length > 0 ? (
          <div className="space-y-4" id="chapters-list-container">
            {filteredChaptersWithMeta.map(({ chapter, subject }) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                userData={userProgress[chapter.id]}
                onUpdateUserData={handleUpdateUserData}
                onOpenSearchGrounding={handleOpenSearchGroundingForChapter}
                subjectCoefficient={
                  filters.examTarget === 'health'
                    ? (subject.healthCoefficient ?? subject.coefficient)
                    : subject.coefficient
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">هیچ فصلی با فیلترهای جاری پیدا نشد!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              عبارت جستجو یا گزینه‌های فیلتر اهمیت و وضعیت مطالعه را تغییر دهید تا فصول مرتبط نمایش داده شوند.
            </p>
            <button
              onClick={() =>
                setFilters({
                  subjectId: selectedSubjectId,
                  searchQuery: '',
                  importance: 'all',
                  status: 'all',
                  bookId: 'all',
                })
              }
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              پاک کردن فیلترها و نمایش مجدد
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <BudgetingAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
      />

      <StudyPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        userProgress={userProgress}
        onImportProgress={(importedData) => setUserProgress(importedData)}
      />

      {/* AI Study Plan Allocation & 4-View Modal */}
      <AIStudyPlanModal
        isOpen={isAIPlanModalOpen}
        onClose={() => setIsAIPlanModalOpen(false)}
        onApplyDayToCalendar={handleUpdateDailyStudyLog}
        onSyncWithGoogleCalendar={(preset) => {
          setCalendarPresetEvent(preset);
          setIsGoogleCalendarModalOpen(true);
        }}
      />

      {/* Google Calendar Sync & Management Modal */}
      <GoogleCalendarSyncModal
        isOpen={isGoogleCalendarModalOpen}
        onClose={() => {
          setIsGoogleCalendarModalOpen(false);
          setCalendarPresetEvent(undefined);
        }}
        presetEvent={calendarPresetEvent}
      />

      {/* Daily Study Reminder Trigger Modal */}
      <StudyReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        userProgress={userProgress}
        dailyStudyLogs={dailyStudyLogs}
        onOpenGoogleCalendarConnect={() => {
          setIsGoogleCalendarModalOpen(true);
        }}
      />

      {/* Live Google Search Grounding Modal (gemini-3.5-flash) */}
      <SearchGroundingModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        currentUser={currentUser}
        initialTopic={searchModalContext.topic}
        initialChapterTitle={searchModalContext.chapterTitle}
        chapterId={searchModalContext.chapterId}
        onAppendNotes={handleAppendNotesFromSearch}
      />

      {/* Offline Connectivity Indicator Banner */}
      <OfflineIndicator />

      {/* Manual Sync Status Toast */}
      <SyncStatusToast
        toast={syncToast}
        onClose={() => setSyncToast((prev) => (prev ? { ...prev, show: false } : null))}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            سامانه راهبردی و طبقه‌بندی کنکور کارشناسی ارشد روان‌شناسی بالینی ۱۴۰۵ — تلفیق کنکور وزارت بهداشت (سنجش پزشکی) و وزارت علوم (کد ۱۱۳۳)
          </div>
          <div className="text-slate-400 dark:text-slate-500">
            بر اساس تحلیل آزمون‌های سال‌های گذشته، دستنامه کاپلان و سادوک، فیرس، پروچاسکا، لورا برک، دلاور و سارافینو
          </div>
        </div>
      </footer>
    </div>
  );
}

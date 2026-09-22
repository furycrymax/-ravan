import React, { useState } from "react";
import { User } from "firebase/auth";
import { loginWithGoogle, logout } from "../services/firebase";
import { LogOut, CloudCheck, Loader2, CloudOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface UserAuthControlProps {
  currentUser: User | null;
  authLoading: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
  isManualSyncing?: boolean;
}

export const UserAuthControl: React.FC<UserAuthControlProps> = ({
  currentUser,
  authLoading,
  isSyncing = false,
  onManualSync,
  isManualSyncing = false,
}) => {
  const isOnline = useOnlineStatus();
  const [inAction, setInAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!isOnline) {
      setError("ورود به حساب گوگل نیازمند اینترنت است؛ اطلاعات و پیشرفت شما در حافظه دستگاه ذخیره می‌ماند.");
      return;
    }
    setInAction(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setError("خطا در ورود با گوگل. اتصال اینترنت یا پنجره پاپ‌آپ را بررسی کنید.");
    } finally {
      setInAction(false);
    }
  };

  const handleLogout = async () => {
    if (!isOnline) {
      setError("خروج از حساب نیازمند اتصال به اینترنت است.");
      return;
    }
    setInAction(true);
    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setInAction(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs shrink-0">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-[9px] sm:text-[10px] hidden sm:inline">بررسی...</span>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Manual Sync Trigger Button */}
        {onManualSync && (
          <button
            onClick={onManualSync}
            disabled={isManualSyncing || !isOnline}
            id="btn-manual-sync"
            title={
              !isOnline
                ? "در حالت آفلاین همگام‌سازی ابری در دسترس نیست"
                : isManualSyncing
                ? "در حال همگام‌سازی دوطرفه حافظه محلی با Firestore..."
                : "همگام‌سازی دستی پیشرفت مطالعه (بین حافظه محلی و ابری Firestore)"
            }
            className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              isManualSyncing
                ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800"
                : !isOnline
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60"
                : "bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-sky-300 dark:hover:border-sky-700"
            }`}
          >
            <RefreshCw
              className={`w-3 h-3 shrink-0 ${
                isManualSyncing ? "animate-spin text-sky-600 dark:text-sky-400" : "text-sky-600 dark:text-sky-400"
              }`}
            />
            <span className="text-[11px] sm:text-xs">همگام‌سازی</span>
          </button>
        )}

        <div
          className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs shrink-0"
          title={`${currentUser.displayName || currentUser.email || 'کاربر'} (${!isOnline ? 'حالت آفلاین - ذخیره در دستگاه' : isSyncing || isManualSyncing ? 'در حال همگام‌سازی ابری' : 'همگام با Firestore'})`}
        >
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt=""
              className="w-4 h-4 rounded-full object-cover border border-slate-300 dark:border-slate-600 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
              {(currentUser.displayName || currentUser.email || "U")[0].toUpperCase()}
            </div>
          )}

          <span className="text-[11px] sm:text-xs font-semibold max-w-[45px] sm:max-w-[75px] truncate text-slate-800 dark:text-slate-100">
            {currentUser.displayName || currentUser.email}
          </span>

          {!isOnline ? (
            <span title="آفلاین - ذخیره در دستگاه" className="inline-flex text-amber-500">
              <CloudOff className="w-3 h-3 shrink-0" />
            </span>
          ) : isSyncing || isManualSyncing ? (
            <span title="در حال همگام‌سازی ابری" className="inline-flex">
              <Loader2 className="w-3 h-3 animate-spin text-amber-500 shrink-0" />
            </span>
          ) : (
            <span title="همگام با Firestore" className="inline-flex">
              <CloudCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            </span>
          )}

          <button
            onClick={handleLogout}
            disabled={inAction}
            title="خروج از حساب"
            className="p-0.5 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center shrink-0">
      {error && (
        <span className="text-[9px] text-rose-500 dark:text-rose-300 px-1 py-0.5 rounded border border-rose-300 dark:border-rose-800 hidden md:inline ml-1">
          {error}
        </span>
      )}
      <button
        onClick={handleLogin}
        disabled={inAction}
        className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shrink-0"
        title="ورود با حساب گوگل برای ذخیره‌سازی ابری"
      >
        {inAction ? (
          <Loader2 className="w-3 h-3 animate-spin text-indigo-600 shrink-0" />
        ) : (
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
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
        <span className="hidden sm:inline">ورود با گوگل</span>
        <span className="sm:hidden">ورود</span>
      </button>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, X, Cloud, CloudOff } from 'lucide-react';

export type SyncToastType = 'success' | 'error' | 'syncing' | 'info';

export interface SyncToastState {
  show: boolean;
  type: SyncToastType;
  title: string;
  message: string;
}

interface SyncStatusToastProps {
  toast: SyncToastState | null;
  onClose: () => void;
}

export const SyncStatusToast: React.FC<SyncStatusToastProps> = ({ toast, onClose }) => {
  if (!toast || !toast.show) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isSyncing = toast.type === 'syncing';

  return (
    <div
      role="status"
      aria-live="polite"
      id="toast-sync-status"
      dir="rtl"
      className={`fixed bottom-5 right-5 z-50 flex items-start gap-3 max-w-sm sm:max-w-md p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
        isSuccess
          ? 'bg-emerald-950/90 dark:bg-emerald-950/95 border-emerald-500/40 text-emerald-100 shadow-emerald-900/20'
          : isError
          ? 'bg-rose-950/90 dark:bg-rose-950/95 border-rose-500/40 text-rose-100 shadow-rose-900/20'
          : isSyncing
          ? 'bg-sky-950/90 dark:bg-sky-950/95 border-sky-500/40 text-sky-100 shadow-sky-900/20'
          : 'bg-slate-900/90 dark:bg-slate-900/95 border-slate-700/60 text-slate-100 shadow-slate-900/30'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && (
          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        {isError && (
          <div className="p-1 rounded-full bg-rose-500/20 text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        {isSyncing && (
          <div className="p-1 rounded-full bg-sky-500/20 text-sky-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
        )}
        {!isSuccess && !isError && !isSyncing && (
          <div className="p-1 rounded-full bg-slate-500/20 text-slate-400">
            <Cloud className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-bold text-white mb-0.5">{toast.title}</h4>
        <p className="text-[11px] text-slate-200/90 leading-relaxed break-words">{toast.message}</p>
      </div>

      <button
        onClick={onClose}
        id="btn-close-sync-toast"
        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        title="بستن اعلان"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

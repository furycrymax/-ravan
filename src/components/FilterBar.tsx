import React from 'react';
import { Search, Filter, Sparkles, CheckSquare, X } from 'lucide-react';
import { FilterState, ImportanceLevel, StudyStatus, Book } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  availableBooks: Book[];
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableBooks,
  filteredCount,
  totalCount,
}) => {
  const isFiltered =
    filters.searchQuery !== '' ||
    filters.importance !== 'all' ||
    filters.status !== 'all' ||
    (filters.examTarget && filters.examTarget !== 'all') ||
    Boolean(filters.bookId && filters.bookId !== 'all');

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      importance: 'all',
      status: 'all',
      examTarget: 'all',
      bookId: 'all',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs mb-6 transition-colors" id="filter-bar">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-chapter-search"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="جستجو در عناوین فصل‌ها، مفاهیم کلیدی کنکور (مثلاً پیاژه، MMPI، هیلگارد)..."
            className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Exam Target Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">کنکور:</span>
            <select
              id="select-exam-target-filter"
              value={filters.examTarget || 'all'}
              onChange={(e) => onFilterChange({ examTarget: e.target.value as 'all' | 'both' | 'science' | 'health' })}
              className="px-2.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-indigo-900 dark:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">همه منابع (علوم و بهداشت)</option>
              <option value="health">فقط منابع کنکور وزارت بهداشت (کاپلان، مارنات و...)</option>
              <option value="science">فقط منابع کنکور وزارت علوم (DSM-5، علم‌النفس و...)</option>
            </select>
          </div>

          {/* Importance Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">اهمیت:</span>
            <select
              id="select-importance-filter"
              value={filters.importance}
              onChange={(e) => onFilterChange({ importance: e.target.value as 'all' | ImportanceLevel })}
              className="px-2.5 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">همه درجه‌های اهمیت</option>
              <option value="critical">⭐⭐⭐ طلایی و فوق‌العاده پرتست</option>
              <option value="high">⭐⭐ مهم و پرسوال</option>
              <option value="medium">⭐ متوسط و تکمیلی</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">وضعیت:</span>
            <select
              id="select-status-filter"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value as 'all' | StudyStatus })}
              className="px-2.5 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">همه وضعیت‌های مطالعه</option>
              <option value="not_started">مطالعه‌نشده</option>
              <option value="in_progress">در حال مطالعه</option>
              <option value="summarized">خلاصه‌نویسی‌شده</option>
              <option value="mastered">کاملاً مسلط و مرورشده</option>
            </select>
          </div>

          {/* Book Filter (if books are available) */}
          {availableBooks.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">کتاب:</span>
              <select
                id="select-book-filter"
                value={filters.bookId || 'all'}
                onChange={(e) => onFilterChange({ bookId: e.target.value })}
                className="max-w-[220px] sm:max-w-[280px] truncate px-2.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">تمام کتب ({availableBooks.length} کتاب)</option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id === 'pp-kaplan' ? `📘 ${b.title} (${b.chaptersCount} فصل)` : `${b.title} (${b.chaptersCount} فصل)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          {isFiltered && (
            <button
              onClick={clearFilters}
              id="btn-clear-filters"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              حذف فیلترها
            </button>
          )}
        </div>
      </div>

      {/* Result Count and Active Badges */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          نمایش <strong className="text-slate-800 dark:text-slate-200 font-bold">{filteredCount}</strong> فصل از مجموع{' '}
          <span className="text-slate-600 dark:text-slate-400">{totalCount} فصل</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            <Sparkles className="w-3 h-3 text-amber-500" />
            فصول پرتست با نشان ستاره علامت‌گذاری شده‌اند
          </span>
        </div>
      </div>
    </div>
  );
};

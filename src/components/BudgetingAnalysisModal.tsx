import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Award,
  BarChart2,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Layers,
  Stethoscope,
  GraduationCap,
  Sparkles,
  Calendar,
  FileText,
  Target,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { EXAM_SUBJECTS, EXAM_STATISTICS } from '../data/curriculumData';
import { BudgetingFrequencyChart } from './BudgetingFrequencyChart';

interface BudgetingAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetingAnalysisModal: React.FC<BudgetingAnalysisModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'frequency' | 'health' | 'science' | 'combined' | 'references'>('frequency');

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      id="analysis-modal"
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
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] max-h-[90dvh]"
        style={{
          width: '100%',
          maxWidth: 'min(100%, 64rem)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded-lg shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
                تحلیل جامع بودجه‌بندی و دفترچه‌های کنکور ارشد روانشناسی بالینی ۱۴۰۵
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مقایسه تحلیلی وزارت بهداشت (سنجش آموزش پزشکی) و وزارت علوم (کد ۱۱۳۳)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-analysis-modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('frequency')}
            id="tab-modal-frequency"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'frequency'
                ? 'border-indigo-600 text-indigo-950 dark:text-indigo-300 bg-white dark:bg-slate-900 rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>تحلیل ضرایب و فراوانی (Coefficient and Frequency Analysis)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-extrabold">
              جدید
            </span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            id="tab-modal-health"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'health'
                ? 'border-teal-600 text-teal-900 dark:text-teal-300 bg-white dark:bg-slate-900 rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>تحلیل دفترچه‌های کنکور وزارت بهداشت (سنجش پزشکی)</span>
          </button>

          <button
            onClick={() => setActiveTab('science')}
            id="tab-modal-science"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'science'
                ? 'border-indigo-600 text-indigo-950 dark:text-indigo-300 bg-white dark:bg-slate-900 rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>تحلیل بودجه‌بندی کنکور وزارت علوم (کد ۱۱۳۳)</span>
          </button>

          <button
            onClick={() => setActiveTab('combined')}
            id="tab-modal-combined"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'combined'
                ? 'border-amber-600 text-amber-950 dark:text-amber-300 bg-white dark:bg-slate-900 rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>استراتژی طلایی شرکت همزمان در هر دو آزمون</span>
          </button>

          <button
            onClick={() => setActiveTab('references')}
            id="tab-modal-references"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'references'
                ? 'border-emerald-600 text-emerald-950 dark:text-emerald-300 bg-white dark:bg-slate-900 rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>اسناد و استعلام صحت منابع (سنجش)</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto scrollbar-thin text-slate-700 dark:text-slate-300 text-xs sm:text-sm flex-1">
          {/* TAB 0: FREQUENCY & COEFFICIENTS COMPARATIVE BAR CHART */}
          {activeTab === 'frequency' && (
            <BudgetingFrequencyChart />
          )}

          {/* TAB 1: MINISTRY OF HEALTH DETAILED ANALYSIS */}
          {activeTab === 'health' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-900 dark:text-teal-300 text-sm">
                  <Stethoscope className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                  <span>ساختار سوالات کنکور ارشد بالینی وزارت بهداشت (سنجش آموزش پزشکی)</span>
                </div>
                <p className="text-xs leading-relaxed text-teal-800 dark:text-teal-300">
                  کنکور ارشد وزارت بهداشت شامل <strong>۱۶۰ تست تخصصی</strong> در ۸ درس است. مجموع ضرایب دفترچه <strong>۱۶</strong> بوده و مهم‌ترین ویژگی آن تأکید عمیق و خط‌به‌خط بر <strong>دستنامه روان‌پزشکی بالینی کاپلان و سادوک</strong> (ترجمه رضاعی/ارجمند)، <strong>سنجش روانی و آزمون‌های مارنات</strong> و <strong>اصول خدمات بهداشتی و سلامت سارافینو</strong> می‌باشد.
                </p>
              </div>

              {/* Ministry of Health Coefficients Table */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  جدول مصوب ضرایب و سهم دروس در کنکور ارشد بالینی وزارت بهداشت (مجموع ضرایب: ۱۶)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">عنوان درس در دفترچه</th>
                        <th className="p-3 text-center">ضریب بهداشت</th>
                        <th className="p-3 text-center">تعداد تست</th>
                        <th className="p-3 text-center">سهم تراز</th>
                        <th className="p-3">منابع اختصاصی طراحان وزارت بهداشت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 font-semibold">
                        <td className="p-3 text-slate-900 dark:text-slate-100">روان‌شناسی بالینی (مداخلات و سنجش)</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-black">ضریب ۳</span>
                        </td>
                        <td className="p-3 text-center">۲۵ تست</td>
                        <td className="p-3 text-center font-bold text-teal-800 dark:text-teal-300">۱۸.۷۵٪</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">فیرس، کرامر، نظریه‌های روان‌درمانی پروچاسکا، مصاحبه بالینی</td>
                      </tr>
                      <tr className="bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 font-semibold">
                        <td className="p-3 text-slate-900 dark:text-slate-100">روان‌پزشکی بالینی و روانشناسی مرضی</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-black">ضریب ۳</span>
                        </td>
                        <td className="p-3 text-center">۲۵ تست</td>
                        <td className="p-3 text-center font-bold text-teal-800 dark:text-teal-300">۱۸.۷۵٪</td>
                        <td className="p-3 text-slate-700 dark:text-slate-200 font-bold">دستنامه خلاصه روان‌پزشکی کاپلان و سادوک (فصول علائم، خلقی، سایکوتیک، اطفال، داروها)</td>
                      </tr>
                      <tr className="bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 font-semibold">
                        <td className="p-3 text-slate-900 dark:text-slate-100">زبان تخصصی و عمومی پزشکی</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-black">ضریب ۳</span>
                        </td>
                        <td className="p-3 text-center">۳۰ تست</td>
                        <td className="p-3 text-center font-bold text-teal-800 dark:text-teal-300">۱۸.۷۵٪</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">دفترچه‌های سال‌های قبل وزارت بهداشت، متون پزشکی و بالینی، ۵۰۴ و لغات تافل</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-slate-900 dark:text-slate-100">روان‌شناسی رشد و شخصیت</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-black">ضریب ۲</span>
                        </td>
                        <td className="p-3 text-center">۲۰ تست</td>
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">۱۲.۵٪</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">روانشناسی رشد لورا برک (جلدهای ۱ و ۲)، نظریه‌های رشد کرین</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-slate-900 dark:text-slate-100">روان‌سنجی و آزمون‌های روانی</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold">ضریب ۱.۵</span>
                        </td>
                        <td className="p-3 text-center">۱۵ تست</td>
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">۹.۴٪</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">راهنمای سنجش روانی گری گراث-مارنات (MMPI, WAIS, رورشاخ)، روان‌سنجی حمزه گنجی</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-slate-900 dark:text-slate-100">آمار و روش تحقیق در علوم بهداشتی</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold">ضریب ۱.۵</span>
                        </td>
                        <td className="p-3 text-center">۱۵ تست</td>
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">۹.۴٪</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">روش تحقیق دلاور و علی پاشا شریفی، آمار توصیفی و استنباطی، آزمون‌های غیرپارامتریک</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-slate-900 dark:text-slate-100">اصول خدمات بهداشتی و سلامت روان جامعه‌نگر</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold">ضریب ۱</span>
                        </td>
                        <td className="p-3 text-center">۱۵ تست</td>
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">۶.۲۵٪</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">روانشناسی سلامت سارافینو، بهداشت روان شاملو، اصول خدمات بهداشتی حاتمی، سطوح پیشگیری</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-slate-900 dark:text-slate-100">روان‌شناسی عمومی</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold">ضریب ۱</span>
                        </td>
                        <td className="p-3 text-center">۱۵ تست</td>
                        <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">۶.۲۵٪</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">زمینه روانشناسی اتکینسون و هیلگارد (مباحث حافظه، یادگیری، مغز و انگیزش)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Kaplan & Sadock Breakdown Analysis */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                <h4 className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>تحلیل تستی دفترچه‌های ۹۶ تا ۱۴۰۴: شاه‌کلید کاپلان و سادوک</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-amber-900 dark:text-amber-300">
                  <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-200 dark:border-amber-800/70">
                    <strong className="block text-amber-950 dark:text-amber-100 font-bold mb-1">۱. فصول با بیشترین تکرار در ۱۰ سال اخیر:</strong>
                    فصل نشانه‌ها و علائم روان‌پزشکی (انواع توهم، هذیان، اختلال تفکر)، فصول اختلالات خلقی (تفاوت دوقطبی I و II، ملاک‌های مالیخولیا)، اختلالات سایکوتیک، و فصول دارودرمانی (عوارض اکستراپیرامیدال، سندرم سروتونین و لیتیوم).
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-200 dark:border-amber-800/70">
                    <strong className="block text-amber-950 dark:text-amber-100 font-bold mb-1">۲. تفاوت سبک سوالات با کنکور وزارت علوم:</strong>
                    طراحان وزارت بهداشت سوالات مبتنی بر «کیس بالینی (Case-Based)»، تشخیص افتراقی دارویی، و دوز اثرات درمانی می‌آورند؛ در حالی که وزارت علوم بیشتر ملاک‌های تشخیصی DSM-5 و واژه‌شناسی نظریه‌ها را تست می‌کند.
                  </div>
                </div>
              </div>

              {/* Target Percentages for Medical Universities */}
              <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
                <h4 className="font-bold text-teal-950 dark:text-teal-200 flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>میانگین درصدها برای قبولی در قطب‌های پزشکی (شهید بهشتی، تهران، ایران، علوم توانبخشی)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-200 dark:border-teal-800/70 shadow-2xs">
                    <span className="text-slate-500 dark:text-slate-400 block">روان‌پزشکی (کاپلان)</span>
                    <span className="text-sm font-black text-teal-700 dark:text-teal-400">۶۵٪ تا ۸۰٪</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-200 dark:border-teal-800/70 shadow-2xs">
                    <span className="text-slate-500 dark:text-slate-400 block">روانشناسی بالینی</span>
                    <span className="text-sm font-black text-teal-700 dark:text-teal-400">۷۰٪ تا ۸۵٪</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-200 dark:border-teal-800/70 shadow-2xs">
                    <span className="text-slate-500 dark:text-slate-400 block">زبان عمومی و تخصصی</span>
                    <span className="text-sm font-black text-teal-700 dark:text-teal-400">۶۰٪ تا ۸۵٪</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-200 dark:border-teal-800/70 shadow-2xs">
                    <span className="text-slate-500 dark:text-slate-400 block">روانشناسی رشد</span>
                    <span className="text-sm font-black text-teal-700 dark:text-teal-400">۶۵٪ تا ۷۵٪</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-200 dark:border-teal-800/70 shadow-2xs">
                    <span className="text-slate-500 dark:text-slate-400 block">روان‌سنجی (مارنات)</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">۵۵٪ تا ۷۰٪</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-200 dark:border-teal-800/70 shadow-2xs">
                    <span className="text-slate-500 dark:text-slate-400 block">اصول خدمات بهداشتی</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">۶۰٪ تا ۷۵٪</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-200 dark:border-teal-800/70 shadow-2xs">
                    <span className="text-slate-500 dark:text-slate-400 block">آمار و روش تحقیق</span>
                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">۴۵٪ تا ۶۰٪</span>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-950/60 p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-2xs flex flex-col justify-center">
                    <span className="text-emerald-900 dark:text-emerald-300 font-bold block">رتبه کشوری هدف</span>
                    <span className="text-sm font-black text-emerald-800 dark:text-emerald-400">زیر ۳۰ کشوری</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MINISTRY OF SCIENCE BUDGETING */}
          {activeTab === 'science' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-sm">
                  <GraduationCap className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                  <span>ساختار کنکور کارشناسی ارشد وزارت علوم (مجموعه روان‌شناسی کد ۱۱۳۳)</span>
                </div>
                <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
                  کنکور کارشناسی ارشد وزارت علوم معمولاً در <strong>اوایل اسفند ماه</strong> برگزار می‌شود. در دفترچه ۱۱۳۳، درس <strong>«روان‌سنجی (سنجش و اندازه‌گیری)»</strong> دارای <strong>۲۰ تست مستقل</strong> است که برای <strong>گرایش روان‌شناسی عمومی و روان‌سنجی دارای ضریب ۲</strong> است (برای گرایش بالینی کد ۱، مباحث آزمون‌های بالینی مستقیماً در درس روان‌شناسی بالینی با <strong>ضریب ۳</strong> سنجیده می‌شود). درس علم‌النفس دارای ضریب ۱ بوده و درس خدمات بهداشتی مختص وزارت بهداشت است.
                </p>
              </div>

              {/* Science Table of Coefficients */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  جدول دروس و ضرایب در آزمون کارشناسی ارشد وزارت علوم (کد ۱۱۳۳)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">عنوان درس</th>
                        <th className="p-3 text-center">ضریب در آزمون علوم</th>
                        <th className="p-3 text-center">تعداد تست</th>
                        <th className="p-3 text-center">سهم از تراز / جایگاه</th>
                        <th className="p-3">کتب مرجع اصلی طراحان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {EXAM_SUBJECTS.filter((s) => s.targetExam !== 'health').map((sub) => {
                        const isPsychometrics = sub.id === 'psychometrics';
                        const displayCoeff = isPsychometrics ? 'ضریب ۲ (عمومی) | مبحثی در ضریب ۳ (بالینی)' : `ضریب ${sub.coefficient}`;
                        const weightPct = isPsychometrics ? '۲۰ تست اختصاصی' : `${((sub.coefficient / 12) * 100).toFixed(1)}٪ تراز بالینی`;
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                            <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                              {sub.name}
                              {isPsychometrics && (
                                <span className="block text-[10px] text-sky-600 dark:text-sky-400 font-normal mt-0.5">
                                  (درس شماره ۸ در دفترچه کنکور ۱۱۳۳)
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-black text-xs ${
                                  sub.coefficient === 3
                                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                    : isPsychometrics
                                    ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800'
                                    : sub.coefficient === 2
                                    ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {displayCoeff}
                              </span>
                            </td>
                            <td className="p-3 text-center font-medium">{sub.totalQuestions} تست</td>
                            <td className="p-3 text-center font-bold text-indigo-700 dark:text-indigo-400">{weightPct}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">
                              {sub.books.map((b) => b.title).join(' / ')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* High Yield Chapters */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  فصول فوق‌العاده طلایی در آزمون وزارت علوم (قانون ۸۰/۲۰)
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">۱. روان‌شناسی بالینی (ضریب ۳): </strong>
                    بخش سنجش فیرس (مصاحبه، هوش وکسلر، MMPI-2 و رورشاخ) و نظریه‌های روان‌درمانی پروچاسکا (به‌ویژه نظریه بک، الیس، راجرز، و موج سوم ACT و DBT) بیش از ۷۰٪ سوالات را به خود اختصاص می‌دهند.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">۲. روان‌شناسی مرضی و کودکان استثنایی (ضریب ۲): </strong>
                    در آسیب‌شناسی هالجین و گنجی، ملاک‌های زمانی DSM-5، اختلالات خلقی، اضطرابی و طیف اسکیزوفرنی تست‌های قطعی هستند. در استثنایی نیز کم‌توانی ذهنی، طیف اوتیسم و SLD در صدر تکرارند.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">۳. روان‌شناسی رشد لورا برک (ضریب ۲): </strong>
                    مراحل حسی-حرکتی پیاژه، بحران‌های اریکسون، سبک‌های دلبستگی اینسورث و نظریه‌های ویگوتسکی سالانه حداقل ۱۲ تست را تشکیل می‌دهند.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">۴. علم‌النفس و آمار (دروس ترازساز): </strong>
                    علم‌النفس با داشتن منبعی محدود و حفظی، راحت‌ترین درصد بالای ۶۰ را به شما می‌دهد. در آمار نیز فرمول‌های z و T، واریانس، ضرایب همبستگی و طرح‌های آزمایشی کاملاً قابل پیش‌بینی هستند.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMBINED DUAL-EXAM STRATEGY */}
          {activeTab === 'combined' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Banner */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-sm">
                  <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <span>نقشه راه طلایی موفقیت همزمان در کنکور علوم و بهداشت ۱۴۰۵</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  خوشبختانه بیش از <strong>۷۴٪ سرفصل‌ها و منابع</strong> بین دو کنکور مشترک هستند. به علاوه، به دلیل فاصله زمانی حدود ۳ ماهه بین کنکور علوم (اسفند) و کنکور بهداشت (خرداد)، داوطلب هوشمند می‌تواند از کنکور اسفند به عنوان سکوی پرتاب آزمون خرداد استفاده کند.
                </p>
              </div>

              {/* Timeline Roadmap */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  زمان‌بندی فصلی داوطلبان هر دو کنکور
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
                    <div className="font-bold text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                      فاز اول: تیر تا دی ماه (مشترکات بنیادین)
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      تسلط کامل بر منابع مشترک هر دو کنکور: بالینی فیرس و پروچاسکا، آسیب‌شناسی روانی بر اساس DSM-5، رشد لورا برک، آمار دلاور، و زبان تخصصی.
                    </p>
                    <div className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 bg-white/80 dark:bg-slate-800/80 p-2 rounded border border-indigo-100 dark:border-indigo-800">
                      ✓ نتیجه: با این مشترکات، ۶۰٪ آمادگی هر دو آزمون تامین می‌شود.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/40 dark:bg-sky-950/30 space-y-2">
                    <div className="font-bold text-sky-900 dark:text-sky-300 text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600 dark:bg-sky-400"></span>
                      فاز دوم: دی تا اوایل اسفند (هدف: کنکور علوم)
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      جمع‌بندی دروس وزارت علوم، مطالعه فشرده کتاب علم‌النفس، تست‌های ۱۰ سال اخیر کنکور سراسری، و شرکت پرقدرت در کنکور اسفند ماه.
                    </p>
                    <div className="text-[11px] font-semibold text-sky-800 dark:text-sky-300 bg-white/80 dark:bg-slate-800/80 p-2 rounded border border-sky-100 dark:border-sky-800">
                      ✓ نتیجه: عبور از کنکور علوم با آمادگی تست‌زنی بسیار بالا.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/40 dark:bg-teal-950/30 space-y-2">
                    <div className="font-bold text-teal-900 dark:text-teal-300 text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400"></span>
                      فاز سوم: اسفند تا خرداد (تمرکز بر کاپلان و بهداشت)
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      ورود فوری به مطالعه دستنامه کاپلان و سادوک، آزمون‌های مارنات، درس اصول خدمات بهداشتی و حل دفترچه‌های سنجش پزشکی سال‌های ۹۵ تا ۱۴۰۴.
                    </p>
                    <div className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-white/80 dark:bg-slate-800/80 p-2 rounded border border-teal-100 dark:border-teal-800">
                      ✓ نتیجه: قبولی در قطب‌های پزشکی با پایه عمیق روان‌پزشکی.
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Comparison Matrix */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ماتریس تطبیق منابع در دو کنکور
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <table className="w-full text-right">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-2.5">موضوع</th>
                        <th className="p-2.5">در کنکور وزارت علوم</th>
                        <th className="p-2.5">در کنکور وزارت بهداشت</th>
                        <th className="p-2.5">راهبرد هوشمندانه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">روان‌شناسی مرضی</td>
                        <td className="p-2.5">هالجین / گنجی (DSM-5)</td>
                        <td className="p-2.5 text-teal-800 dark:text-teal-300 font-semibold">دستنامه کاپلان و سادوک (علائم و داروها)</td>
                        <td className="p-2.5">ابتدا DSM-5 را بخوانید، سپس فصول کاپلان را اضافه کنید.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">سنجش و روان‌سنجی</td>
                        <td className="p-2.5">درس ۸ علوم (ضریب ۲ عمومی / مباحث بالینی در درس بالینی با ضریب ۳)</td>
                        <td className="p-2.5 text-teal-800 dark:text-teal-300 font-semibold">درس مستقل با ضریب ۱.۵ (۱۵ تست) - مارنات و گنجی</td>
                        <td className="p-2.5">تسلط بر آزمون‌های هوش وکسلر، MMPI-2، رورشاخ و میلون مارنات نمره تراز هر دو آزمون را تضمین می‌کند.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">زبان تخصصی</td>
                        <td className="p-2.5">ضریب ۲ (متون روانشناسی عمومی)</td>
                        <td className="p-2.5 text-teal-800 dark:text-teal-300 font-semibold">ضریب ۳ سرنوشت‌ساز (متون بالینی و پزشکی)</td>
                        <td className="p-2.5">مطالعه روزانه ۴۵ دقیقه لغات و ریدینگ‌های پزشکی.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">بهداشت و سلامت</td>
                        <td className="p-2.5">جداگانه تست ندارد</td>
                        <td className="p-2.5 text-teal-800 dark:text-teal-300 font-semibold">ضریب ۱ (سارافینو و شاملو)</td>
                        <td className="p-2.5">در اسفند تا خرداد با ۵۰ ساعت مطالعه درصد بالای ۷۰ می‌دهد.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">علم‌النفس</td>
                        <td className="p-2.5 text-indigo-800 dark:text-indigo-300 font-semibold">ضریب ۱ در کنکور علوم</td>
                        <td className="p-2.5 text-slate-400 dark:text-slate-500">در کنکور بهداشت نیست</td>
                        <td className="p-2.5">فقط تا روز کنکور علوم مطالعه شود و پس از آن کنار گذاشته شود.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'references' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                      تفکیک اصولی «عناوین دروس آزمون» از «کتب مرجع و رفرنس‌ها»
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      در ساختار رسمی آزمون‌های تحصیلات تکمیلی، دفترچه‌های سنجش شامل <strong>عناوین درسی مصوب</strong> (مانند روان‌شناسی مرضی، روان‌شناسی بالینی، روان‌سنجی، رشد و زبان) هستند. آثاری چون <strong>«خلاصه روان‌پزشکی کاپلان و سادوک»</strong>، <strong>«آسیب‌شناسی روانی هالجین»</strong>، <strong>«روان‌شناسی بالینی فیرس»</strong> و <strong>«ارزیابی روان‌شناختی مارنات»</strong>، کتب و مراجع معرفی‌شده توسط طراحان در چارچوب این دروس هستند و مانند سایر کتاب‌های منبع در برنامه موضوعی درس مربوطه تحلیل و بررسی می‌شوند.
                    </p>
                  </div>
                </div>
              </div>

              {/* References Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-100/70 dark:bg-slate-800/80 font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                  شناسنامه مراجع اصلی در تطابق با دفترچه‌های آزمون سراسری
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5">عنوان درس مصوب</th>
                        <th className="p-2.5">کتاب مرجع معرفی‌شده</th>
                        <th className="p-2.5">نویسنده / مترجم معتبر</th>
                        <th className="p-2.5">جایگاه در آزمون‌ها</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">روان‌شناسی مرضی (آسیب‌شناسی)</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">دستنامه روان‌پزشکی کاپلان و سادوک</td>
                        <td className="p-2.5">بنجامین سادوک / دکتر فرزین رضاعی</td>
                        <td className="p-2.5">مرجع مباحث نشانه‌شناسی، اختلالات و دارودرمانی</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">روان‌شناسی مرضی (آسیب‌شناسی)</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">آسیب‌شناسی روانی بر اساس DSM-5</td>
                        <td className="p-2.5">ریچارد هالجین / مهدی گنجی</td>
                        <td className="p-2.5">مرجع اصلی تشخیصی در هر دو آزمون علوم و بهداشت</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">روان‌شناسی بالینی</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">روان‌شناسی بالینی فیرس و کرامر</td>
                        <td className="p-2.5">تیموتی فیرس / مهرداد فیروزبخت</td>
                        <td className="p-2.5">مرجع اول مفاهیم، سنجش، مداخله و اخلاق حرفه‌ای</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">روان‌شناسی بالینی</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">نظریه‌های روان‌درمانی</td>
                        <td className="p-2.5">جیمز پروچاسکا / یحیی سیدمحمدی</td>
                        <td className="p-2.5">مرجع مکاتب درمانگری و روان‌درمانی تحلیلی، شناختی و رفتاری</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">سنجش و آزمون‌ها (روان‌سنجی)</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">راهنمای سنجش روانی (جلد ۱ و ۲)</td>
                        <td className="p-2.5">گری گراث-مارنات / دکتر حسن پاشاشریفی</td>
                        <td className="p-2.5">آزمون‌های هوش، وکسلر، MMPI، رورشاخ و میلون</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">روان‌شناسی رشد</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">روان‌شناسی رشد (جلد ۱ و ۲)</td>
                        <td className="p-2.5">لورا برک / یحیی سیدمحمدی</td>
                        <td className="p-2.5">مرجع بی‌رقیب رشد از لقاح تا پیری در هر دو آزمون</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">روانشناسی فیزیولوژیک</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">روان‌شناسی فیزیولوژیک و انگیزش و هیجان</td>
                        <td className="p-2.5">دکتر محمدکریم خداپناهی / دکتر پیری</td>
                        <td className="p-2.5">مرجع مباحث عصب‌شناختی، ساختار مغز و ناقل‌های عصبی</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">خدمات بهداشتی و سلامت</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">روان‌شناسی سلامت و بهداشت روان</td>
                        <td className="p-2.5">ادوارد سارافینو / دکتر سعید شاملو</td>
                        <td className="p-2.5">مرجع ارشد بالینی بهداشت (پیشگیری، سبک زندگی و استرس)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Sources Verification Links */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">درگاه‌های رسمی استعلام سرفصل و ضرایب</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    جهت دریافت آخرین اطلاعیه‌ها، دفترچه راهنما و تغییرات احتمالی ضرایب به درگاه‌های زیر مراجعه کنید.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://sanjesh.org"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <span>سازمان سنجش (وزارت علوم)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://sanjeshp.ir"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold hover:bg-teal-100 transition-colors"
                  >
                    <span>مرکز سنجش آموزش پزشکی</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            داده‌ها بر اساس تحلیل دفترچه‌های رسمی سازمان سنجش و مرکز سنجش آموزش پزشکی به‌روز شده است.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            متوجه شدم، بازگشت به فصول
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

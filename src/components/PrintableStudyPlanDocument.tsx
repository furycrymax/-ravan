import React from 'react';
import { AIStudyPlan } from '../types';
import { toPersianDigits } from '../utils/persianCalendar';
import { Brain, CheckSquare, Printer, Award, BookOpen, Clock, Target, Calendar } from 'lucide-react';

interface PrintableStudyPlanDocumentProps {
  activePlan: AIStudyPlan;
  selectedStats: {
    chapters: number;
    hours: number;
    count: number;
  };
  isInteractivePreview?: boolean;
  onDirectPrint?: () => void;
}

export const PrintableStudyPlanDocument: React.FC<PrintableStudyPlanDocumentProps> = ({
  activePlan,
  selectedStats,
  isInteractivePreview = false,
  onDirectPrint,
}) => {
  // Format current date in Persian
  const todayPersian = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const totalWeeklyHours = activePlan.weeklySchedule.reduce((sum, d) => sum + d.totalHours, 0);

  const getTargetExamTitle = (exam: string) => {
    switch (exam) {
      case 'health':
        return 'وزارت بهداشت (سنجش آموزش پزشکی)';
      case 'science':
        return 'وزارت علوم، تحقیقات و فناوری';
      default:
        return 'دو کنکور همزمان (وزارت بهداشت + وزارت علوم)';
    }
  };

  const getStudentLevelTitle = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'شروع از صفر (پایه‌ریزی مفهومی)';
      case 'advanced':
        return 'پیشرفته (تست‌زنی سرعتی و جمع‌بندی)';
      default:
        return 'متوسط (مرور و تسلط تحلیلی)';
    }
  };

  const getStudyTypeBadge = (type: string) => {
    switch (type) {
      case 'concept_reading':
        return 'یادگیری عمیق مفهومی';
      case 'question_practice':
        return 'تست‌زنی آموزشی و تحلیلی';
      case 'summary_notes':
        return 'خلاصه‌نویسی و نمودار درختی';
      case 'spaced_repetition':
        return 'مرور فاصله‌دار (تثبیت)';
      case 'self_test':
        return 'شبیه‌سازی و خودسنجی';
      default:
        return 'مطالعه استاندارد';
    }
  };

  return (
    <div
      id="ai-study-plan-print-document"
      className={`w-full max-w-4xl mx-auto bg-white text-slate-900 font-sans text-right dir-rtl ${
        isInteractivePreview
          ? 'p-3 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 dark:bg-white dark:text-slate-900 min-w-0'
          : 'p-4 print:p-0'
      }`}
    >
      {/* Top Banner when in Interactive Preview Mode */}
      {isInteractivePreview && (
        <div className="no-print mb-6 p-3 sm:p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5 text-indigo-900 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold truncate">پیش‌نمایش سند رسمی چاپی / فایل PDF</div>
              <div className="text-[11px] sm:text-xs text-indigo-700">
                این سند دقیقاً منطبق با ابعاد استاندارد برگه A4 و بدون عناصر گرافیکی وب تنظیم شده است.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDirectPrint || (() => window.print())}
            className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ یا ذخیره نهایی به عنوان فایل PDF</span>
          </button>
        </div>
      )}

      {/* DOCUMENT HEADER */}
      <header className="border-b-2 border-slate-900 pb-4 mb-5 print-avoid-break">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span className="text-xs font-bold text-slate-600 tracking-wider">
                سامانه جامع ارشد روان‌شناسی بالینی ۱۴۰۵
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              سند رسمی برنامه مطالعاتی پیشنهادی کنکور ارشد روان‌شناسی بالینی ۱۴۰۵
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              طراحی اختصاصی بر اساس قانون ۲ درس در روز، توازن شناختی، تلفیق اهمیت و جذابیت، و منطق آماری دفترچه‌های کنکور ۱۴۰۰ تا ۱۴۰۴
            </p>
          </div>

          <div className="text-left shrink-0 text-[11px] text-slate-600 space-y-0.5 border-r border-slate-200 pr-3 mr-1">
            <div><strong className="text-slate-800">تاریخ صدور:</strong> {todayPersian}</div>
            <div><strong className="text-slate-800">افق آزمون:</strong> اردیبهشت / تیر ۱۴۰۵</div>
            <div><strong className="text-slate-800">نسخه سند:</strong> ۱.۰ (مدل علمی)</div>
            <div><strong className="text-slate-800">وضعیت اعتبار:</strong> تأییدشده</div>
          </div>
        </div>

        {/* CANDIDATE SPECIFICATIONS BAR */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/80">
            <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ساعت مطالعه روزانه</div>
            <div className="font-bold text-slate-900">
              {toPersianDigits(activePlan.dailyHours)} ساعت{' '}
              <span className="text-[10px] font-normal text-slate-600">
                (هفتگی: {toPersianDigits(totalWeeklyHours)} ساعت)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/80">
            <div className="text-[10px] text-slate-500 font-semibold mb-0.5">کنکور هدف داوطلب</div>
            <div className="font-bold text-slate-900 truncate" title={getTargetExamTitle(activePlan.targetExam)}>
              {activePlan.targetExam === 'health'
                ? 'وزارت بهداشت'
                : activePlan.targetExam === 'science'
                ? 'وزارت علوم'
                : 'وزارت بهداشت + علوم'}
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/80">
            <div className="text-[10px] text-slate-500 font-semibold mb-0.5">سطح علمی و آمادگی</div>
            <div className="font-bold text-slate-900">
              {getStudentLevelTitle(activePlan.studentLevel)}
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/80">
            <div className="text-[10px] text-slate-500 font-semibold mb-0.5">منابع و کتب انتخابی</div>
            <div className="font-bold text-slate-900">
              {toPersianDigits(selectedStats.count)} عنوان کتاب{' '}
              <span className="text-[10px] font-normal text-slate-600">
                ({toPersianDigits(selectedStats.chapters)} فصل)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 1: SCIENTIFIC RATIONALE & RECENT EXAMS LOGIC */}
      <section className="mb-6 print-avoid-break">
        <h2 className="text-sm font-extrabold text-slate-900 border-r-4 border-slate-900 pr-2 mb-2 flex items-center gap-1.5">
          <span>۱. مبانی علمی، روان‌شناختی و منطق بودجه‌بندی کنکورهای اخیر</span>
        </h2>
        
        <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50/50 space-y-2 text-xs leading-relaxed text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-white border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">قانون طلایی ۲ درس در روز:</strong>
              مطابق نظریه بار شناختی سوئلر (Sweller)، مطالعه بیش از دو درس در روز منجر به اشباع حافظه فعال و پدیده تداخل پس‌گستر و پیش‌گستر می‌گردد. تمرکز بر دو درس، عمق پردازش مفهومی را به بیشینه می‌رساند.
            </div>
            <div className="p-2 rounded bg-white border border-slate-200">
              <strong className="text-slate-900 block mb-0.5">تلفیق اهمیت و جذابیت:</strong>
              در هر روز مطالعه، یک درس تحلیلی سنگین و پرضریب (روانشناسی بالینی فیرس یا آسیب‌شناسی روانی کاپلان) در نوبت صبح، با یک درس مهارتی/جذاب‌تر (رشد لورا برک، آمار دلاور یا ریدینگ زبان) در نوبت دوم هماهنگ شده است.
            </div>
          </div>

          {activePlan.examLogicInsights && (
            <div className="text-[11px] pt-1 border-t border-slate-200">
              <strong className="text-slate-900">تحلیل آماری دفترچه‌های ۱۴۰۰ تا ۱۴۰۴:</strong>{' '}
              {activePlan.examLogicInsights}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: WEEKLY SCHEDULE TABLE */}
      <section className="mb-6 print-avoid-break">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-extrabold text-slate-900 border-r-4 border-slate-900 pr-2 flex items-center gap-1.5">
            <span>۲. جدول رسمی و تفکیکی برنامه مطالعاتی هفتگی (شنبه تا جمعه)</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            مجموع ساعت هفتگی: {toPersianDigits(totalWeeklyHours)} ساعت
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-400 rounded-lg">
          <table className="w-full text-right border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-800 text-white font-bold border-b border-slate-800">
                <th className="p-2 text-center w-14 border-l border-slate-700">روز</th>
                <th className="p-2 border-l border-slate-700">نوبت اول: درس اصلی / سنگین</th>
                <th className="p-2 border-l border-slate-700">نوبت دوم: درس مکمل / جذاب</th>
                <th className="p-2 text-center w-14 border-l border-slate-700">ساعت</th>
                <th className="p-2 border-l border-slate-700">راهبرد و نکته تمرکزی روز</th>
                <th className="p-2 text-center w-14">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activePlan.weeklySchedule.map((day) => {
                const isThursday = day.dayName.includes('پنج');
                const isFriday = day.dayName.includes('جمعه');

                return (
                  <tr
                    key={day.dayNumber}
                    className={`${
                      isThursday
                        ? 'bg-amber-50/60 font-medium'
                        : isFriday
                        ? 'bg-emerald-50/60 font-medium'
                        : 'odd:bg-white even:bg-slate-50/60'
                    }`}
                  >
                    {/* Day Name */}
                    <td className="p-2 text-center font-bold border-l border-slate-300">
                      <div>{day.dayName}</div>
                      {isThursday && (
                        <span className="text-[9px] text-amber-700 block mt-0.5">مرور</span>
                      )}
                      {isFriday && (
                        <span className="text-[9px] text-emerald-700 block mt-0.5">آزمون</span>
                      )}
                    </td>

                    {/* Primary Task */}
                    <td className="p-2 border-l border-slate-300 align-top">
                      <div className="font-bold text-slate-900">
                        {day.primaryTask.subjectName}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {day.primaryTask.bookTitle}
                      </div>
                      <div className="text-[10px] text-indigo-900 mt-0.5">
                        فصل: {day.primaryTask.suggestedChapters}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-semibold">
                        سهم زمان: {toPersianDigits(day.primaryTask.allocatedHours)} ساعت ({getStudyTypeBadge(day.primaryTask.studyType)})
                      </div>
                    </td>

                    {/* Secondary Task */}
                    <td className="p-2 border-l border-slate-300 align-top">
                      <div className="font-bold text-slate-900">
                        {day.secondaryTask.subjectName}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {day.secondaryTask.bookTitle}
                      </div>
                      <div className="text-[10px] text-violet-900 mt-0.5">
                        فصل: {day.secondaryTask.suggestedChapters}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-semibold">
                        سهم زمان: {toPersianDigits(day.secondaryTask.allocatedHours)} ساعت ({getStudyTypeBadge(day.secondaryTask.studyType)})
                      </div>
                    </td>

                    {/* Total Hours */}
                    <td className="p-2 text-center font-bold text-slate-900 border-l border-slate-300">
                      {toPersianDigits(day.totalHours)}
                    </td>

                    {/* Focus Tip & Strategy */}
                    <td className="p-2 border-l border-slate-300 text-[10px] text-slate-700 leading-snug">
                      <div className="font-semibold text-slate-800">{day.dailyAdvice}</div>
                      <div className="text-slate-500 mt-0.5">
                        {day.primaryTask.focusTip}
                      </div>
                    </td>

                    {/* Checkbox for Physical Print Tracking */}
                    <td className="p-2 text-center align-middle">
                      <div className="w-5 h-5 mx-auto border-2 border-slate-400 rounded flex items-center justify-center">
                        <span className="text-[8px] text-slate-300">✓</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                <td colSpan={3} className="p-2 text-left border-l border-slate-300">
                  جمع کل ساعات مطالعه برنامه‌ریزی‌شده در هفته:
                </td>
                <td className="p-2 text-center border-l border-slate-300">
                  {toPersianDigits(totalWeeklyHours)} ساعت
                </td>
                <td colSpan={2} className="p-2 text-[10px] text-slate-600">
                  شامل تثبیت فاصله‌دار پنج‌شنبه‌ها و آزمون خودسنجی جمعه‌ها
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* SECTION 3: ROADMAP MACRO PHASES (PRINT-PAGE-BREAK AVOID) */}
      <section className="mb-6 print-avoid-break">
        <h2 className="text-sm font-extrabold text-slate-900 border-r-4 border-slate-900 pr-2 mb-2 flex items-center gap-1.5">
          <span>۳. نقشه راه فازهای ۴گانه تا روز آزمون سراسری</span>
        </h2>

        <div className="overflow-x-auto border border-slate-400 rounded-lg">
          <table className="w-full text-right border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-800 text-white font-bold border-b border-slate-800">
                <th className="p-2 w-28 border-l border-slate-700">فاز و افق زمانی</th>
                <th className="p-2 border-l border-slate-700">عنوان و هدف کلیدی فاز</th>
                <th className="p-2 text-center w-20 border-l border-slate-700">ساعت در هفته</th>
                <th className="p-2 border-l border-slate-700">دستاوردهای الزامی و ملموس</th>
                <th className="p-2">استراتژی تست‌زنی و سنجش</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activePlan.roadmapPhases.map((phase, idx) => (
                <tr key={phase.phaseId} className="odd:bg-white even:bg-slate-50/60">
                  <td className="p-2 font-bold border-l border-slate-300 align-top">
                    <div className="text-slate-900">{phase.durationLabel}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      {phase.targetTimeline}
                    </div>
                  </td>

                  <td className="p-2 border-l border-slate-300 align-top">
                    <div className="font-bold text-slate-900">{phase.phaseTitle}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                      {phase.methodology}
                    </div>
                  </td>

                  <td className="p-2 text-center font-bold text-slate-900 border-l border-slate-300 align-middle">
                    {toPersianDigits(phase.weeklyHoursRecommended)}
                  </td>

                  <td className="p-2 border-l border-slate-300 align-top text-[10px] text-slate-700">
                    <ul className="list-disc list-inside space-y-0.5">
                      {phase.keyDeliverables.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-2 align-top text-[10px] text-slate-700 leading-relaxed">
                    {phase.testStrategy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: MONTHLY MILESTONES (8 MONTHS) */}
      <section className="mb-6 print-avoid-break">
        <h2 className="text-sm font-extrabold text-slate-900 border-r-4 border-slate-900 pr-2 mb-2 flex items-center gap-1.5">
          <span>۴. جدول ایستگاه‌های ارزیابی و اهداف ماهانه (۸ ماه تا کنکور)</span>
        </h2>

        <div className="overflow-x-auto border border-slate-400 rounded-lg">
          <table className="w-full text-right border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-800 text-white font-bold border-b border-slate-800">
                <th className="p-2 w-16 text-center border-l border-slate-700">ماه</th>
                <th className="p-2 w-48 border-l border-slate-700">نام و ماموریت ماه</th>
                <th className="p-2 text-center w-24 border-l border-slate-700">ساعت هدف</th>
                <th className="p-2 text-center w-20 border-l border-slate-700">تعداد فصل</th>
                <th className="p-2 border-l border-slate-700">اهداف عینی ماهانه</th>
                <th className="p-2">چک‌پوینت ارزیابی و تسلط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {activePlan.monthlyMilestones.map((m) => (
                <tr key={m.monthNumber} className="odd:bg-white even:bg-slate-50/60">
                  <td className="p-2 text-center font-bold text-slate-900 border-l border-slate-300">
                    ماه {toPersianDigits(m.monthNumber)}
                  </td>
                  <td className="p-2 font-bold text-slate-900 border-l border-slate-300">
                    {m.monthName}
                  </td>
                  <td className="p-2 text-center font-semibold text-slate-800 border-l border-slate-300">
                    {toPersianDigits(m.totalStudyHours)} ساعت
                  </td>
                  <td className="p-2 text-center font-semibold text-slate-800 border-l border-slate-300">
                    {toPersianDigits(m.targetChaptersCount)} فصل
                  </td>
                  <td className="p-2 border-l border-slate-300 text-[10px] text-slate-700">
                    {m.keyGoals.join(' • ')}
                  </td>
                  <td className="p-2 text-[10px] text-slate-700">
                    {m.reviewCheckpoint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: CANDIDATE TRACKING & SIGNATURE BOX */}
      <footer className="border-t-2 border-slate-900 pt-4 print-avoid-break">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
          <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">کادر ثبت و گزارش هفتگی داوطلب:</div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>میزان ساعت مطالعه محقق‌شده این هفته: .................... ساعت</div>
              <div>تعداد تست‌های آموزشی و زمان‌دار زده‌شده: .................... تست</div>
              <div>درصد میانگین آزمون خودسنجی جمعه: .................... ٪</div>
              <div>مباحث دارای نقطه ضعف برای مرور پنج‌شنبه آینده: ............................................</div>
            </div>
          </div>

          <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-900 mb-1">تعهدنامه فردی داوطلب:</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                اینجانب متعهد می‌گردم بر اساس اصول علمی این برنامه، قانون ۲ درس در روز و نظم هفتگی را با پشتکار رعایت کرده و فرایند خودارزیابی جمعه‌ها را پیوسته اجرا نمایم.
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-700 pt-2 border-t border-slate-200 mt-2">
              <span>امضای داوطلب: ............................</span>
              <span>تاریخ تایید: ............................</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
          <span>
            مراجع رسمی تحت پوشش: دستنامه کاپلان و سادوک، بالینی فیرس و کرامر، نظریه‌های روان‌درمانی پروچاسکا، رشد لورا برک، آمار و روش تحقیق دلاور و زبان تخصصی.
          </span>
          <span>چاپ‌شده از سامانه جامع ارشد روانشناسی بالینی ۱۴۰۵</span>
        </div>
      </footer>
    </div>
  );
};

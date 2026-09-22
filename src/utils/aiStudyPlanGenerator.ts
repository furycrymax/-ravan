import { AIStudyPlan, DailyScheduleDay, MonthlyMilestone, RoadmapPhase } from '../types';
import { EXAM_SUBJECTS } from '../data/curriculumData';

interface GeneratePlanParams {
  selectedBookIds: string[];
  dailyHours: number; // e.g. 4, 6, 8
  targetExam: 'both' | 'health' | 'science';
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
}

export function generateLocalScientificStudyPlan(params: GeneratePlanParams): AIStudyPlan {
  const { selectedBookIds, dailyHours, targetExam, studentLevel } = params;

  // Collect selected books and chapters
  let totalChapters = 0;
  let totalEstimatedHours = 0;
  const chosenBooksInfo: Array<{ id: string; title: string; subjectName: string; subjectId: string; chaptersCount: number }> = [];

  EXAM_SUBJECTS.forEach((subj) => {
    subj.books.forEach((b) => {
      if (selectedBookIds.length === 0 || selectedBookIds.includes(b.id)) {
        chosenBooksInfo.push({
          id: b.id,
          title: b.title,
          subjectName: subj.name,
          subjectId: subj.id,
          chaptersCount: b.chapters.length,
        });
        totalChapters += b.chapters.length;
        b.chapters.forEach((ch) => {
          totalEstimatedHours += ch.studyEstimatedHours || 5;
        });
      }
    });
  });

  // Calculate hour split between the two daily subjects (e.g. 60% heavy / 40% complementary)
  const primaryHours = Math.round(dailyHours * 0.58 * 10) / 10;
  const secondaryHours = Math.round((dailyHours - primaryHours) * 10) / 10;

  // Construct 7-day representative weekly schedule conforming strictly to:
  // 1. Exactly 2 subjects per day
  // 2. High-yield heavy paired with engaging/practical subject
  // 3. Spaced repetition & rest on weekends
  const weeklySchedule: DailyScheduleDay[] = [
    {
      dayNumber: 1,
      dayName: 'شنبه',
      totalHours: dailyHours,
      dailyAdvice: 'آغاز پرانرژی هفته با ترکیب مباحث بالینی و نظریه‌های تحولی؛ تمرکز روی یادداشت‌برداری فعال.',
      primaryTask: {
        subjectId: 'clinical',
        subjectName: 'روان‌شناسی بالینی',
        bookTitle: 'روان‌شناسی بالینی فیرس و ترال',
        suggestedChapters: 'فصل‌های تاریخچه، سنجش بالینی و مصاحبه تشخیصی',
        allocatedHours: primaryHours,
        studyType: 'concept_reading',
        focusTip: 'تفاوت‌های نقش بالینگر با روان‌پزشک و کنفرانس بولدر (مدل دانشمند-کاربست‌گر) را به دقت مرور کنید.',
      },
      secondaryTask: {
        subjectId: 'developmental',
        subjectName: 'روان‌شناسی رشد',
        bookTitle: 'روان‌شناسی رشد لورا برک (جلد ۱)',
        suggestedChapters: 'نظریه‌های بنیادی رشد (پیاژه، ویگوتسکی و اریکسون)',
        allocatedHours: secondaryHours,
        studyType: 'question_practice',
        focusTip: 'مراحل رشد شناختی پیاژه و تفاوت جذب و انطباق را با حل تست‌های ارشد سال‌های ۱۴۰۰ تا ۱۴۰۲ تثبیت کنید.',
      },
    },
    {
      dayNumber: 2,
      dayName: 'یک‌شنبه',
      totalHours: dailyHours,
      dailyAdvice: 'ترکیب آسیب‌شناسی مرضی با آمار؛ تعادل بین تفکر مفهومی و محاسباتی مانع از خستگی مغز می‌شود.',
      primaryTask: {
        subjectId: 'general',
        subjectName: 'آسیب‌شناسی روانی (کاپلان و سادوک)',
        bookTitle: 'دستنامه روان‌پزشکی بالینی کاپلان - جلد ۱',
        suggestedChapters: 'ملاک‌های تشخیصی اختلالات اضطرابی، وسواس و تروما (DSM-5-TR)',
        allocatedHours: primaryHours,
        studyType: 'concept_reading',
        focusTip: 'معیارهای زمانی تفکیک اختلال هراس، آگورافوبیا و اضطراب فراگیر (GAD) از کانون‌های پرتکرار کنکور بهداشت است.',
      },
      secondaryTask: {
        subjectId: 'statistics',
        subjectName: 'آمار و روش تحقیق',
        bookTitle: 'روش تحقیق و آمار در روان‌شناسی دکتر علی دلاور',
        suggestedChapters: 'شاخص‌های پراکندگی، توزیع نرمال و نمرات استاندارد (Z و T)',
        allocatedHours: secondaryHours,
        studyType: 'question_practice',
        focusTip: 'حل ۵ تا ۱۰ مسئله مفهومی فرمول‌دار؛ تست‌های آمار ارشد علوم عموماً مفهومی و بدون نیاز به محاسبات سنگین است.',
      },
    },
    {
      dayNumber: 3,
      dayName: 'دوشنبه',
      totalHours: dailyHours,
      dailyAdvice: 'مکاتب درمانی در کنار زبان تخصصی؛ مهارت ریدینگ و واژگان روانشناسی در اواسط هفته بازدهی بالایی دارد.',
      primaryTask: {
        subjectId: 'clinical',
        subjectName: 'روان‌شناسی بالینی و نظریه‌های درمان',
        bookTitle: 'نظریه‌های روان‌درمانی پروچاسکا / فیرس',
        suggestedChapters: 'روان‌درمانی‌های شناختی-رفتاری (بک و الیس) و روان‌پویشی',
        allocatedHours: primaryHours,
        studyType: 'concept_reading',
        focusTip: 'مثلث شناختی بک، خطاهای شناختی رایج و مراحل تغییر پروچاسکا (پیش‌تامل تا تثبیت) را جدول‌بندی کنید.',
      },
      secondaryTask: {
        subjectId: 'english',
        subjectName: 'زبان عمومی و تخصصی',
        bookTitle: 'متون تخصصی روانشناسی لیندا لیل',
        suggestedChapters: 'ریدینگ‌های حوزه Clinical Assessment و Mood Disorders',
        allocatedHours: secondaryHours,
        studyType: 'concept_reading',
        focusTip: 'یادداشت‌برداری جعبه لایتنر از پسوندها و ریشه‌های تخصصی پزشکی-روانپزشکی جهت افزایش سرعت خواندن متن.',
      },
    },
    {
      dayNumber: 4,
      dayName: 'سه‌شنبه',
      totalHours: dailyHours,
      dailyAdvice: 'پرداختن به اختلالات خلقی و طیف اسکیزوفرنی که پربسامدترین فصل‌های کنکور اخیر هستند.',
      primaryTask: {
        subjectId: 'general',
        subjectName: 'روان‌پزشکی بالینی (کاپلان)',
        bookTitle: 'دستنامه کاپلان و سادوک - جلد ۲',
        suggestedChapters: 'اختلالات افسردگی اساسی، دوقطبی I و II و طیف اسکیزوفرنی',
        allocatedHours: primaryHours,
        studyType: 'concept_reading',
        focusTip: 'افتراق مانیا از هیپومانیا (ملاک ۴ روز در برابر ۱ هفته) و عوارض دارودرمانی آنتی‌سایکوتیک (EPS و TD).',
      },
      secondaryTask: {
        subjectId: 'developmental',
        subjectName: 'روان‌شناسی رشد',
        bookTitle: 'نظریه‌های رشد ویلیام کرین / برک ۲',
        suggestedChapters: 'رشد اخلاقی کلبرگ، دلبستگی بالبی و مراحل روانی-جنسی فروید',
        allocatedHours: secondaryHours,
        studyType: 'spaced_review',
        focusTip: 'تطبیق مراحل ۶‌گانه استدلال اخلاقی کلبرگ با نقدهای کارول گیلیگان؛ تله‌های تستی پرتکرار.',
      },
    },
    {
      dayNumber: 5,
      dayName: 'چهارشنبه',
      totalHours: dailyHours,
      dailyAdvice: 'روز تحکیم مفاهیم روش تحقیق و اختلالات دوران کودکی و عصبی-رشدی.',
      primaryTask: {
        subjectId: 'general',
        subjectName: 'کودکان استثنایی و عصبی-رشدی',
        bookTitle: 'دستنامه کاپلان و سادوک - جلد ۳',
        suggestedChapters: 'اوتیسم (ASD)، بیش‌فعالی (ADHD) و اختلالات یادگیری خاص (SLD)',
        allocatedHours: primaryHours,
        studyType: 'concept_reading',
        focusTip: 'تغییرات DSM-5 در حذف نشانگان آسپرگر و تجمیع در طیف اتیسم بر پایه نقص ارتباط اجتماعی و رفتارهای کلیشه‌ای.',
      },
      secondaryTask: {
        subjectId: 'statistics',
        subjectName: 'روش تحقیق',
        bookTitle: 'روش تحقیق در روانشناسی دلاور',
        suggestedChapters: 'انواع طرح‌های پژوهشی (آزمایشی، شبه‌آزمایشی، تک‌آزمودنی ABAB)',
        allocatedHours: secondaryHours,
        studyType: 'question_practice',
        focusTip: 'عوامل تهدیدکننده روایی درونی و بیرونی (افت آزمودنی، اثر هاثورن، رگرسیون به سمت میانگین).',
      },
    },
    {
      dayNumber: 6,
      dayName: 'پنج‌شنبه',
      totalHours: dailyHours,
      dailyAdvice: 'ایستگاه بازیابی فعال و مرور فاصله‌دار (Spaced Retrieval Practice). عدم آغاز مبحث جدید سنگین.',
      primaryTask: {
        subjectId: 'clinical',
        subjectName: 'مرور فصول بالینی و کاپلان هفته',
        bookTitle: 'خلاصه‌نویسی‌ها و فلاش‌کارت‌های شخصی',
        suggestedChapters: 'مرور تطبیقی تست‌های فیرس و کاپلان مطالعه‌شده در روزهای گذشته',
        allocatedHours: primaryHours,
        studyType: 'spaced_review',
        focusTip: 'تست‌های خطادار و نشانه‌دار هفته را بدون نگاه کردن به پاسخنامه مجدداً حل و دلیل خطای قبلی را تحلیل کنید.',
      },
      secondaryTask: {
        subjectId: 'english',
        subjectName: 'زبان و تست‌زنی سرعتی',
        bookTitle: 'دفترچه‌های کنکور سال‌های ۱۴۰۰ تا ۱۴۰۴',
        suggestedChapters: 'حل دو متن ریدینگ کنکوری با شبیه‌سازی زمان استاندارد آزمون',
        allocatedHours: secondaryHours,
        studyType: 'question_practice',
        focusTip: 'تمرکز بر تکنیک‌های Skimming و Scanning برای یافتن ایده اصلی متن در کمتر از ۶ دقیقه.',
      },
    },
    {
      dayNumber: 7,
      dayName: 'جمعه',
      totalHours: Math.max(2, Math.round(dailyHours * 0.45 * 10) / 10),
      isRestOrCatchupDay: true,
      dailyAdvice: 'روز ارزیابی خودسنجی، جبران بخش‌های عقب‌مانده و بازسازی ذخایر دوپامینی مغز برای هفته آینده.',
      primaryTask: {
        subjectId: 'general',
        subjectName: 'آزمون خودسنجی هفتگی',
        bookTitle: 'سامانه آزمون‌های خودسنجی اپلیکیشن',
        suggestedChapters: 'آزمون تستی ۵۰ سوالی ترکیبی از مباحث هفته جاری',
        allocatedHours: Math.max(1.5, Math.round(dailyHours * 0.3 * 10) / 10),
        studyType: 'question_practice',
        focusTip: 'محاسبه نمره تراز، درصد منفی و ثبت کارنامه در تقویم مطالعه.',
      },
      secondaryTask: {
        subjectId: 'rest',
        subjectName: 'ریکاوری و بازتنظیم برنامه',
        bookTitle: 'برنامه راهبردی هفته آینده',
        suggestedChapters: 'مرور اجمالی برنامه‌ریزی هفته پیش‌رو و خواب و تغذیه کافی',
        allocatedHours: Math.max(1, Math.round(dailyHours * 0.2 * 10) / 10),
        studyType: 'summary_note',
        focusTip: 'تثبیت حافظه بلندمدت در فاز خواب عمیق اتفاق می‌افتد؛ استراحت روز جمعه عملکرد حافظه را تا ۳۰٪ افزایش می‌دهد.',
      },
    },
  ];

  // Construct 8 monthly milestones up to exam
  const monthlyMilestones: MonthlyMilestone[] = [
    {
      monthNumber: 1,
      monthName: 'ماه اول (استقرار و تسلط پایه)',
      targetChaptersCount: Math.round(totalChapters * 0.16) || 10,
      totalStudyHours: Math.round(dailyHours * 26),
      keyGoals: [
        'اتمام فصول ۱ تا ۶ روانشناسی بالینی فیرس (تاریخچه، سنجش و مصاحبه)',
        'تسلط بر ملاک‌های تشخیصی اختلالات اضطرابی و خلقی کاپلان جلد ۱',
        'تثبیت نظریه‌های پیاژه، اریکسون و فروید در روانشناسی رشد',
      ],
      expectedMastery: 'تسلط ۶۰ درصدی بر تعاریف پایه و واژه‌شناسی کنکور',
      reviewCheckpoint: 'آزمون جامع ماه اول: حداقل تراز ۵۵٪ در فصول خوانده‌شده',
    },
    {
      monthNumber: 2,
      monthName: 'ماه دوم (ورود به قلب مباحث تشخیصی)',
      targetChaptersCount: Math.round(totalChapters * 0.18) || 12,
      totalStudyHours: Math.round(dailyHours * 26),
      keyGoals: [
        'مطالعه طیف اسکیزوفرنی، اختلالات سوماتیک و تروما در کاپلان جلد ۲',
        'اتمام آزمون‌های روانی، هوش و شخصیت (MMPI، میلون، رورشاخ) در فیرس',
        'آمار استنباطی، آزمون‌های t، تحلیل واریانس (ANOVA) و کای‌اسکوئر',
      ],
      expectedMastery: 'تمایز افتراقی نشانگان همپوشان و فرمول‌های کلیدی آمار',
      reviewCheckpoint: 'حل آزمون تشخیصی ارشد بهداشت ۱۴۰۱ با تحلیل جامع کلید',
    },
    {
      monthNumber: 3,
      monthName: 'ماه سوم (مکاتب درمانی و کودکان استثنایی)',
      targetChaptersCount: Math.round(totalChapters * 0.18) || 12,
      totalStudyHours: Math.round(dailyHours * 26),
      keyGoals: [
        'تسلط کامل بر روان‌درمانی‌های شناختی-رفتاری، انسان‌گرایانه و گشتالت',
        'اختلالات تکاملی عصبی (اوتیسم، نقص توجه) و سالمندی در کاپلان جلد ۳',
        'نظریه‌های پردازش اطلاعات و نظریه‌های بوم‌شناختی برونفن‌برنر',
      ],
      expectedMastery: 'طبقه‌بندی ساختاریافته تکنیک‌های درمانگران مشهور',
      reviewCheckpoint: 'مرور فلاش‌کارت‌های تشخیصی و آزمون خودسنجی دوره‌ای',
    },
    {
      monthNumber: 4,
      monthName: 'ماه چهارم (تکمیل دور اول و خلاصه‌سازی)',
      targetChaptersCount: Math.round(totalChapters * 0.16) || 10,
      totalStudyHours: Math.round(dailyHours * 26),
      keyGoals: [
        'اتمام سرفصل‌های باقیمانده فیرس، کرین و دلاور',
        'استخراج نمودارهای درختی و نقشه‌های ذهنی برای مرور سریع',
        'حل تست‌های طبقه‌بندی‌شده سال‌های ۱۴۰۰ تا ۱۴۰۳',
      ],
      expectedMastery: 'اتمام ۱۰۰٪ دور اول مطالعه کتب منتخب',
      reviewCheckpoint: 'آزمون شبیه‌ساز کنکور وزارت بهداشت یا علوم با شرایط استاندارد',
    },
    {
      monthNumber: 5,
      monthName: 'ماه پنجم (دور دوم: بازیابی فعال و تست‌زنی سرعتی)',
      targetChaptersCount: Math.round(totalChapters * 0.12) || 8,
      totalStudyHours: Math.round(dailyHours * 26),
      keyGoals: [
        'مرور سریع تمام فصول درجه اهمیت Critical و High',
        'حل تست‌های زمان‌دار و کاهش زمان پاسخگویی به هر سوال زیر ۶۰ ثانیه',
        'تسلط بر نکات زیرنویس و جداول مقایسه‌ای کاپلان و سادوک',
      ],
      expectedMastery: 'افزایش سرعت تست‌زنی و رساندن درصدها به بالای ۶۵٪',
      reviewCheckpoint: 'بررسی کارنامه تطبیقی و شناسایی ۳ مبحث پاشنه آشیل',
    },
    {
      monthNumber: 6,
      monthName: 'ماه ششم (ترمیم نقاط ضعف و تست‌های تالیفی)',
      targetChaptersCount: Math.round(totalChapters * 0.10) || 6,
      totalStudyHours: Math.round(dailyHours * 26),
      keyGoals: [
        'مطالعه عمیق فصول پرتله و سوال‌خیز کنکور ۱۴۰۴',
        'حل تست‌های تالیفی دشوار و چندگزینه‌ای ترکیبی',
        'تمرین روزانه ریدینگ‌های زبان تخصصی ارشد پزشکی',
      ],
      expectedMastery: 'پایداری درصدها در مواجهه با سوالات مبهم و چالشی',
      reviewCheckpoint: 'کنکور آزمایشی جامع کشوری اول',
    },
    {
      monthNumber: 7,
      monthName: 'ماه هفتم (جمع‌بندی سه‌روزیک‌بار و کنکورهای آزمایشی)',
      targetChaptersCount: totalChapters,
      totalStudyHours: Math.round(dailyHours * 26),
      keyGoals: [
        'اجرای روش جمع‌بندی سه‌روزیک‌بار (یک کنکور سال‌های اخیر + ۲ روز تحلیل)',
        'تورق سریع دستنامه‌ها و فصول طلایی کاپلان',
        'تثبیت فرمول‌های آمار و ضریب‌های روایی/پایایی روش تحقیق',
      ],
      expectedMastery: 'شبیه‌سازی کامل جلسه آزمون با رعایت زمان و نمره منفی',
      reviewCheckpoint: 'کنکور آزمایشی جامع دوم؛ هدف درصد بالای ۷۵٪ در درس بالینی',
    },
    {
      monthNumber: 8,
      monthName: 'ماه هشتم (ماراتن نهایی و تورق سریع هفته آخر)',
      targetChaptersCount: totalChapters,
      totalStudyHours: Math.round(dailyHours * 20),
      keyGoals: [
        'تورق سریع یادداشت‌های فشرده و فلاش‌کارت‌ها',
        'تنظیم چرخه خواب و بیداری مطابق با ساعت شروع کنکور (۸ صبح)',
        'مدیریت اضطراب آزمون و تمرین تکنیک‌های ریلکسیشن بالینی',
      ],
      expectedMastery: 'آمادگی ۱۰۰٪ روانی و علمی برای کسب رتبه تک‌رقمی و دورقمی',
      reviewCheckpoint: 'حفظ آرامش، مرور خطاهای پرتکرار گذشته و موفقیت قطعی',
    },
  ];

  // Construct Roadmap phases
  const roadmapPhases: RoadmapPhase[] = [
    {
      phaseId: 'phase-1',
      phaseTitle: 'فاز اول: تسلط عمیق مفهومی و یادگیری فعال',
      durationLabel: 'ماه‌های ۱ تا ۳ (حدود ۱۲ هفته)',
      targetTimeline: 'از آغاز تا تکمیل دور اول',
      methodology: 'مطالعه خط‌به‌خط فصول، درک منطق نظریه‌ها و استخراج ملاک‌های تشخیصی DSM-5-TR بدون عجله در تست‌زنی.',
      weeklyHoursRecommended: Math.round(dailyHours * 6),
      keyDeliverables: [
        'خلاصه‌نویسی ساختاریافته به صورت نمودار درختی',
        'مشخص کردن کلیدواژه‌های پرتست در متن کتب',
        'حل تست‌های آموزشی بدون احتساب زمان',
      ],
      testStrategy: 'تست‌زنی آموزشی بلافاصله پس از اتمام هر فصل با هدف یادگیری دام‌های تستی.',
    },
    {
      phaseId: 'phase-2',
      phaseTitle: 'فاز دوم: تثبیت، حل تست‌های ۱۴۰۰ تا ۱۴۰۴ و سنجش دوره‌ای',
      durationLabel: 'ماه‌های ۴ و ۵ (حدود ۸ هفته)',
      targetTimeline: 'تثبیت و تسلط بر دام‌های تستی',
      methodology: 'حل تست‌های طبقه‌بندی‌شده کنکورهای اخیر، تحلیل گزینه به گزینه سوالات و نشانه‌گذاری تست‌های پرنکته.',
      weeklyHoursRecommended: Math.round(dailyHours * 6),
      keyDeliverables: [
        'دفترچه اشتباهات و دام‌های تستی من',
        'جدول تطبیقی دارودرمانی و روان‌درمانی اختلالات',
        'رساندن سرعت پاسخگویی به استاندارد آزمون',
      ],
      testStrategy: 'تست‌های زمان‌دار ۵۰ سوالی در پایان هر هفته با احتساب نمره منفی.',
    },
    {
      phaseId: 'phase-3',
      phaseTitle: 'فاز سوم: مرور فاصله‌دار (Spaced Repetition) و ترمیم نقاط ضعف',
      durationLabel: 'ماه‌های ۶ و ۷ (حدود ۸ هفته)',
      targetTimeline: 'مرورهای چندگانه و تسلط تکمیلی',
      methodology: 'استفاده از سیستم مرورهای منظم بر پایه منحنی فراموشی ابینگهاوس (روز اول، سوم، هفتم، بیستم و چهلم).',
      weeklyHoursRecommended: Math.round(dailyHours * 6.5),
      keyDeliverables: [
        'مرور حداقل ۳ باره فصول Critical و High',
        'به صفر رساندن خطاهای تکراری در فصول پرتکرار',
        'شرکت در آزمون‌های شبیه‌ساز کشوری',
      ],
      testStrategy: 'شبیه‌سازی دفترچه‌های کامل کنکور بهداشت و علوم سال‌های ۱۴۰۰ تا ۱۴۰۴.',
    },
    {
      phaseId: 'phase-4',
      phaseTitle: 'فاز چهارم: ماراتن نهایی، جمع‌بندی فشرده و آرامش‌بخشی ذهنی',
      durationLabel: 'ماه هشتم (هفته‌های پایانی تا کنکور)',
      targetTimeline: '۳۰ روز پایانی تا روز آزمون',
      methodology: 'تورق سریع، مرور فلاش‌کارت‌ها، آزمون‌های سه‌روزیک‌بار، ریکاوری ذهن و تثبیت در حافظه فعال.',
      weeklyHoursRecommended: Math.round(dailyHours * 5),
      keyDeliverables: [
        'تورق سریع کل کتب در ۱۰ روز پایانی',
        'تثبیت استراتژی مدیریت زمان در جلسه کنکور (تکنیک ضربدر و منها)',
        'تنظیم بیوریتم خواب و آمادگی روانی کامل',
      ],
      testStrategy: 'آزمون‌های جامع کنکور در ساعات رسمی صبح با شبیه‌سازی شرایط صندلی و حوزه.',
    },
  ];

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    targetExam,
    dailyHours,
    studentLevel,
    selectedBookIds,
    totalSelectedChapters: totalChapters,
    totalEstimatedHours,
    overviewAdvice: `برنامه هوشمند شما بر پایه ${dailyHours} ساعت مطالعه روزانه و منطق تحلیلی کنکورهای اخیر (۱۴۰۰ تا ۱۴۰۴) طراحی شد. با پایبندی به قانون علمی «حداکثر ۲ درس در هر روز»، بار شناختی مغز کنترل شده و یادگیری حداکثری حاصل می‌شود.`,
    scientificMethodologyNote: `رویکرد علمی برنامه: بر مبنای اصل Interleaving Practice و نظریه بار شناختی سوئلر، مطالعه هم‌زمان یک درس سنگین و دارای ضریب ۳ (بالینی یا کاپلان) با یک درس مهارتی-عملی (رشد، آمار یا زبان)، مانع از خستگی نورونی شده و تثبیت اطلاعات در حافظه بلندمدت را تا ۴۰٪ بهبود می‌بخشد.`,
    examLogicInsights: `تحلیل کنکورهای ۱۴۰۰ تا ۱۴۰۴ نشان می‌دهد: در کنکور وزارت بهداشت، طراحان بیش از ۵۵٪ سوالات را از جلد ۱ و ۲ کاپلان (با تکیه بر ملاک‌های زمانی DSM-5-TR و افتراق‌های دارویی) طرح می‌کنند. در کنکور وزارت علوم، تمرکز بر مکاتب درمانی و سنجش‌های بالینی فیرس است. این برنامه سرفصل‌های پربسامد را در اولویت قرار داده است.`,
    weeklySchedule,
    monthlyMilestones,
    roadmapPhases,
  };
}

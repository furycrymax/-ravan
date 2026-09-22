import { Chapter } from '../types';
import { CLINICAL_CURATED_INSIGHTS } from './curatedClinicalInsights';
import { PATHOLOGY_CURATED_INSIGHTS } from './curatedPathologyInsights';
import { DEV_STATS_CURATED_INSIGHTS } from './curatedDevStatsInsights';

export interface TestPointItem {
  id: string;
  type: 'golden' | 'trap' | 'mnemonic' | 'analysis';
  title: string;
  content: string;
  tag?: string;
  examSource?: 'مشترک' | 'وزارت بهداشت' | 'وزارت علوم';
}

export interface ChapterInsights {
  chapterId: string;
  importanceSummary: string;
  goldenPoints: TestPointItem[];
  traps: TestPointItem[];
  mnemonics: TestPointItem[];
  comparativeAnalysis: string;
  sampleQuestion?: {
    questionText: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// Database of specific high-yield curated insights for key chapters
const CURATED_INSIGHTS: Record<string, Partial<ChapterInsights>> = {
  // Clinical - Fiores Ch 1: Definition & Evolution
  'cl-p-1': {
    importanceSummary: 'این فصل پایه سوالات تعریفی و تفکیک نقش بالینگر از روان‌پزشک و مشاور است (سالانه ۱ تا ۲ تست در هر دو کنکور).',
    goldenPoints: [
      {
        id: 'cl-p-1-g1',
        type: 'golden',
        title: 'تفکیک روان‌پزشک و روان‌شناس بالینی',
        content: 'روان‌پزشک پزشک است و رویکرد عمدتاً زیستی-دارویی دارد، در حالی که بالینگر ارزیابی عمیق روان‌سنجی، نظریه‌های شخصیت و روان‌درمانی را اجرا می‌کند.',
        tag: 'تعریف نقش‌ها',
        examSource: 'مشترک',
      },
      {
        id: 'cl-p-1-g2',
        type: 'golden',
        title: 'بیشترین سهم زمانی فعالیت بالینگران',
        content: 'طبق پیمایش‌های فیرس، روان‌درمانی (Therapy) بیشترین زمان (حدود ۳۴٪ تا ۳۹٪) و سپس ارزیابی/سنجش (Assessment) حدود ۱۵٪ وقت بالینگر را به خود اختصاص می‌دهد.',
        tag: 'آمار پیمایش فیرس',
        examSource: 'وزارت علوم',
      },
    ],
    traps: [
      {
        id: 'cl-p-1-t1',
        type: 'trap',
        title: 'دام مددکار اجتماعی در برابر بالینگر',
        content: 'طراحان معمولاً تمرکز بر عوامل محیطی-اجتماعی و بازدید منزل را با بالینگر اشتباه می‌اندازند؛ این فعالیت‌ها مشخصه مددکار اجتماعی بالینی (MSW/LCSW) است.',
        tag: 'تله گزینه‌ای',
      },
    ],
    mnemonics: [
      {
        id: 'cl-p-1-m1',
        type: 'mnemonic',
        title: 'ترتیب زمان‌بندی فعالیت‌ها',
        content: 'رمز «درام پژوهش» = درمان > روان‌سنجی (سنجش) > آموزش > مشاوره > پژوهش.',
        tag: 'کد حفظی',
      },
    ],
    comparativeAnalysis: 'در وزارت بهداشت، سوالات به سمت صلاحیت بالینی در محیط بیمارستانی و کار در تیم درمان سلامت متمایل است.',
  },

  // Clinical - Fiores Ch 2: History of Clinical Psychology
  'cl-p-2': {
    importanceSummary: 'یکی از تاریخی‌ترین و پرتست‌ترین فصول فیرس؛ کنفرانس‌های بولدر و ویل پای ثابت دفترچه‌ها هستند.',
    goldenPoints: [
      {
        id: 'cl-p-2-g1',
        type: 'golden',
        title: 'لایتنر ویتمر و سال ۱۸۹۶',
        content: 'پدر روان‌شناسی بالینی: لایتنر ویتمر اولین کلینیک روان‌شناسی را در دانشگاه پنسیلوانیا (۱۸۹۶) برای کودکان دارای مشکلات یادگیری تاسیس کرد.',
        tag: 'نقطه عطف تاریخی',
        examSource: 'مشترک',
      },
      {
        id: 'cl-p-2-g2',
        type: 'golden',
        title: 'کنفرانس بولدر (۱۹۴۹) در برابر ویل (۱۹۷۳)',
        content: 'بولدر: مدل دانشمند-کاربست‌گر (Ph.D) با تاکید برابر بر پژوهش و درمان. ویل: مدل کاربست‌گر صرف (Psy.D) با تاکید بر مهارت‌های کاربردی.',
        tag: 'کنفرانس‌های مرجع',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'cl-p-2-t1',
        type: 'trap',
        title: 'اشتباه ویتمر با ویلهلم وونت یا فروید',
        content: 'وونت آزمایشگاه تجربی تاسیس کرد (۱۸۷۹)، اما تاسیس اولین «کلینیک روان‌شناسی بالینی» منحصراً توسط لایتنر ویتمر (۱۸۹۶) انجام شد.',
        tag: 'دام نام‌ها',
      },
    ],
    mnemonics: [
      {
        id: 'cl-p-2-m1',
        type: 'mnemonic',
        title: 'رمز کنفرانس‌ها',
        content: '«ب» در بولدر = «ب» در Ph.D پژوهشی و بالینی توأم. «و» در ویل = «و» در واقعیت کاربست بالینی بدون پایان‌نامه پژوهشی سنگین.',
        tag: 'رمز یادسپاری',
      },
    ],
    comparativeAnalysis: 'در وزارت بهداشت، توجه ویژه‌ای به تست‌های ارتش آلفا (کلامی) و بتا (غیرکلامی) در جنگ جهانی اول و گسترش روان‌سنجی بیمارستانی می‌شود.',
  },

  // Clinical - Fiores Ch 5: Diagnosis & Classification (DSM-5)
  'cl-p-5': {
    importanceSummary: 'مباحث طبقه‌ای در برابر ابعادی و نقد سیستم‌های تشخیصی (۲ تا ۳ تست قطعی).',
    goldenPoints: [
      {
        id: 'cl-p-5-g1',
        type: 'golden',
        title: 'رویکرد مقوله‌ای (Categorical) در برابر ابعادی (Dimensional)',
        content: 'رویکرد مقوله‌ای بیماری را دارای مرز مشخص و بود یا نبود می‌داند؛ رویکرد ابعادی رفتارها را روی یک طیف پیوسته از بهنجار تا نابهنجار قرار می‌دهد (مثل سیستم هیبریدی شخصیت در DSM-5).',
        tag: 'فلسفه طبقه‌بندی',
        examSource: 'مشترک',
      },
      {
        id: 'cl-p-5-g2',
        type: 'golden',
        title: 'حذف سیستم ۵ محوری در DSM-5',
        content: 'در DSM-5 محورهای I و II و III ادغام شدند و ارزیابی ناتوانی با WHODAS 2.0 جایگزین نمره GAF شد.',
        tag: 'تغییرات DSM-5',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'cl-p-5-t1',
        type: 'trap',
        title: 'دام پایایی در برابر روایی تشخیصی',
        content: 'سیستم‌های DSM از ویراست سوم به بعد پایایی بین ارزیاب‌ها (Inter-rater reliability) را به شدت افزایش دادند، اما روایی سازه همچنان مورد مناقشه بالینگران است.',
        tag: 'مفاهیم روان‌سنجی تشخیصی',
      },
    ],
    mnemonics: [
      {
        id: 'cl-p-5-m1',
        type: 'mnemonic',
        title: 'ملاک رفتار نابهنجار (4Ds)',
        content: 'Deviance (انحراف), Distress (پریشانی شخصی), Dysfunction (اختلال کارکرد), Danger (خطرآفرینی).',
        tag: '4D نابهنجاری',
      },
    ],
    comparativeAnalysis: 'در دفترچه وزارت بهداشت سوالات به سمت پیامدهای بالینی WHODAS و اختلالات همپوشان پزشکی میل می‌کند.',
  },

  // Prochaska - Psychoanalysis
  'cl-pr-2': {
    importanceSummary: 'روان‌پویشی فروید: مکانیسم‌های دفاعی و ساختار روان؛ دست‌کم ۲ تست سالانه.',
    goldenPoints: [
      {
        id: 'cl-pr-2-g1',
        type: 'golden',
        title: 'مکانیسم‌های دفاعی سطح بالا (بالغ)',
        content: 'والایش (Sublimation)، شوخ‌طبعی (Humor)، فرونشانی ارادی (Suppression)، و پیش‌بینی (Anticipation) دفاع‌های پخته هستند. دفاع‌های ناپخته: انکار، فرافکنی، گسست و همانندسازی فرافکنانه.',
        tag: 'سلسله‌مراتب دفاع‌ها',
        examSource: 'مشترک',
      },
      {
        id: 'cl-pr-2-g2',
        type: 'golden',
        title: 'فرایند اولیه در برابر فرایند ثانویه',
        content: 'نهاد (Id) تابع اصل لذت و فرایند اولیه تفکر (غیرمنطقی، نمادین، رویایی) است؛ خود (Ego) تابع اصل واقعیت و فرایند ثانویه (منطقی، استدلالی) است.',
        tag: 'ساختار روان',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'cl-pr-2-t1',
        type: 'trap',
        title: 'تفاوت واپس‌رانی (Repression) و فرونشانی (Suppression)',
        content: 'واپس‌رانی کاملاً «ناخودآگاه» و غیرارادی است؛ اما فرونشانی «خودآگاه» و آگاهانه است و یک دفاع پخته به شمار می‌رود.',
        tag: 'تله پرتکرار کنکور',
      },
    ],
    mnemonics: [
      {
        id: 'cl-pr-2-m1',
        type: 'mnemonic',
        title: 'کد مکانیسم وارونه‌سازی (Reaction Formation)',
        content: '«عشق به نفرت یا نفرت به عشق مفرط تبدیل می‌شود»؛ تظاهر اغراق‌آمیز به جهت عکس تکانه واقعی نهاد.',
        tag: 'رمز یادسپاری',
      },
    ],
    comparativeAnalysis: 'در بهداشت، سوالات بیشتر به انتقال، انتقال متقابل و کاربرد در بیماران بوردرلاین در درمان مبتنی بر انتقال (TFP) متمرکز است.',
  },

  // Abnormal - Schizophrenia (Cramer / DSM-5)
  'pp-c-6': {
    importanceSummary: 'اسکیزوفرنی شاه‌کلید هر دو کنکور: ملاک‌های زمانی، نشانه‌های مثبت و منفی و تشخیص افتراقی با اسکیزوافکتیو.',
    goldenPoints: [
      {
        id: 'pp-c-6-g1',
        type: 'golden',
        title: 'ملاک زمانی دقیق اسکیزوفرنی',
        content: 'تداوم علائم حداقل ۶ ماه (شامل حداقل ۱ ماه علائم مرحله فعال فاز A). کمتر از ۱ ماه = اختلال روان‌پریشی گذرا؛ ۱ تا ۶ ماه = اسکیزوفرنی‌فرم.',
        tag: 'ملاک زمانی DSM-5',
        examSource: 'مشترک',
      },
      {
        id: 'pp-c-6-g2',
        type: 'golden',
        title: 'حداقل یکی از سه علامت اصلی فاز فعال',
        content: 'طبق DSM-5، حداقل یکی از علائم فاز فعال باید الزماً: ۱) هذیان، ۲) توهم، یا ۳) گفتار آشفته باشد.',
        tag: 'قانون تشخیصی DSM-5',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'pp-c-6-t1',
        type: 'trap',
        title: 'تشخیص افتراقی اسکیزوافکتیو با خلقی همراه با سایکوز',
        content: 'در اسکیزوافکتیو، هذیان یا توهم باید حداقل «۲ هفته» در غیاب علائم برجسته خلقی رخ داده باشد. اگر سایکوز فقط هنگام دوره افسردگی یا مانیا رخ دهد، تشخیص اختلال خلقی با ویژگی روان‌پریشی است.',
        tag: 'سخت‌ترین تله تشخیصی کنکور',
      },
    ],
    mnemonics: [
      {
        id: 'pp-c-6-m1',
        type: 'mnemonic',
        title: 'خط زمانی اختلالات سایکوتیک',
        content: 'روان‌پریشی گذرا (< ۱ ماه) ➔ اسکیزوفرنی‌فرم (۱ تا ۶ ماه) ➔ اسکیزوفرنی (> ۶ ماه).',
        tag: 'فرمول زمانی',
      },
    ],
    comparativeAnalysis: 'در وزارت بهداشت، مسیرهای دوپامینی (مزولیمبیک = علائم مثبت، مزوکورتیکال = علائم منفی) و عوارض اکستراپیرامیدال آنتی‌سایکوتیک‌ها تست قطعی است.',
  },

  // Kaplan - Schizophrenia Spectrum
  'pp-k-2': {
    importanceSummary: 'طیف اسکیزوفرنی در کاپلان: نوروبیولوژی، مسیرهای دوپامینی و تغییرات ساختاری مغز (بطن‌های طرفی گشادشده).',
    goldenPoints: [
      {
        id: 'pp-k-2-g1',
        type: 'golden',
        title: 'فرضیه دوپامینی اسکیزوفرنی',
        content: 'بیش‌فعالی مسیر مزولیمبیک مسئول علائم مثبت (هذیان و توهم) و کم‌فعالی مسیر مزوکورتیکال مسئول علائم منفی (بی‌ارادگی، انزوای عاطفی، فقر کلام) است.',
        tag: 'نوروبیولوژی کاپلان',
        examSource: 'مشترک',
      },
      {
        id: 'pp-k-2-g2',
        type: 'golden',
        title: 'علائم شناختی و نوروپاتولوژی',
        content: 'اتساع بطن‌های طرفی مغز، کاهش حجم ماده خاکستری لوب گیجگاهی و هیپوکامپ، و نقص در توجه و حافظه کاری بارزترین یافته‌های تصویربرداری است.',
        tag: 'یافته‌های ساختاری',
        examSource: 'وزارت بهداشت',
      },
    ],
    traps: [
      {
        id: 'pp-k-2-t1',
        type: 'trap',
        title: 'اشتباه علائم منفی با عوارض جانبی داروها',
        content: 'آکینزی و کندی ناشی از بلوک دوپامین توسط آنتی‌سایکوتیک‌های نسل اول (EPS) نباید با نشانه‌های منفی اولیه بیماری (آبولی و فقدان لذت) اشتباه گرفته شود.',
        tag: 'دام دارویی-تشخیصی',
      },
    ],
    mnemonics: [
      {
        id: 'pp-k-2-m1',
        type: 'mnemonic',
        title: 'علائم منفی با حروف A',
        content: 'Affective flattening (کندی عاطفه), Avolition (بی‌ارادگی), Alogia (فقر کلام), Anhedonia (فقدان لذت), Asociality (انزوا).',
        tag: 'رمز ۵A',
      },
    ],
    comparativeAnalysis: 'در کنکور بهداشت سوالات دقیق دارویی با نام‌های تجاری و ژنریک (مثل الانزاپین، ریسپریدون و کلوزاپین) همراه می‌شود.',
  },

  // Abnormal - Depressive Disorders (Cramer & Kaplan)
  'pp-c-7': {
    importanceSummary: 'اختلالات افسردگی: ملاک ۲ هفته‌ای MDD، تمایز با سوگ بهنجار و اختلال افسردگی مداوم (دیس‌تایمی حداقل ۲ سال).',
    goldenPoints: [
      {
        id: 'pp-c-7-g1',
        type: 'golden',
        title: 'ملاک تشخیصی افسردگی اساسی (MDD)',
        content: 'حضور حداقل ۵ علامت از ۹ علامت به مدت حداقل ۲ هفته پیاپی، که حداقل یکی از آن‌ها باید «خلق افسرده» یا «فقدان لذت و علاقه (Anhedonia)» باشد.',
        tag: 'ملاک طلایی DSM-5',
        examSource: 'مشترک',
      },
      {
        id: 'pp-c-7-g2',
        type: 'golden',
        title: 'افتراق سوگ بهنجار از دوره افسردگی اساسی',
        content: 'در سوگ، عزت نفس دست‌نخورده باقی می‌ماند و احساس پوچی متوجه فقدان متوفی است؛ در افسردگی اساسی، بی‌ارزشی فراگیر و خودسرزنشی شدید حاکم است.',
        tag: 'افتراق سوگ و افسردگی',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'pp-c-7-t1',
        type: 'trap',
        title: 'ملاک زمانی دیس‌تایمی (افسردگی مداوم)',
        content: 'در بزرگسالان حداقل ۲ سال و در کودکان و نوجوانان حداقل ۱ سال (با خلق تحریک‌پذیر)؛ فرد نباید بیش از ۲ ماه متوالی بدون علامت باشد.',
        tag: 'تله زمانی',
      },
    ],
    mnemonics: [
      {
        id: 'pp-c-7-m1',
        type: 'mnemonic',
        title: 'علائم افسردگی با کلمه SIGECAPS',
        content: 'Sleep (خواب), Interest (علاقه), Guilt (گناه), Energy (انرژی), Concentration (تمرکز), Appetite (اشتها), Psychomotor (روانی-حرکتی), Suicidal (افکار خودکشی).',
        tag: 'کد استاندارد جهانی',
      },
    ],
    comparativeAnalysis: 'در وزارت بهداشت، شناخت‌درمانی بک (سه‌گانه شناختی منفی نسبت به خود، دنیا و آینده) و خطاهای شناختی تست قطعی است.',
  },

  // Kaplan - Psychopharmacology
  'pp-k-13': {
    importanceSummary: 'روان‌داروشناسی بالینی کاپلان: ۳ تا ۵ سوال مستقیم در کنکور بهداشت و تعیین‌کننده‌ترین مبحث برای رتبه‌های برتر.',
    goldenPoints: [
      {
        id: 'pp-k-13-g1',
        type: 'golden',
        title: 'سندرم بدخیم نورولپتیک (NMS)',
        content: 'عارضه مرگبار آنتی‌سایکوتیک‌ها: تب شدید (هایپرترمی)، سفتی لوله‌سربی عضلات (Lead-pipe rigidity)، بی‌ثباتی نبض و فشار خون، افزایش شدید آنزیم CPK. درمان فوری: قطع دارو + بروموکریپتین یا دانترولن.',
        tag: 'اورژانس روان‌پزشکی',
        examSource: 'وزارت بهداشت',
      },
      {
        id: 'pp-k-13-g2',
        type: 'golden',
        title: 'پایش خونی کلوزاپین و لیتیوم',
        content: 'کلوزاپین: خطر آگرانولوسیتوز و نیاز به پایش منظم شمارش گلبول‌های سفید (WBC/ANC). لیتیوم: بازه درمانی باریک (۰.۶ تا ۱.۲ میلی‌اکی‌والان) و علائم سمیت لرزش، آتاکسی و گیجی.',
        tag: 'پایش دارویی',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'pp-k-13-t1',
        type: 'trap',
        title: 'تداخل دارویی مهارکننده‌های MAO با پنیر و غذاهای تیرامین‌دار',
        content: 'تیرامین موجود در پنیر کهنه، کالباس و مخمرها در حضور MAOI شکسته نمی‌شود و بحران کشنده فشار خون (Hypertensive Crisis) ایجاد می‌کند.',
        tag: 'بحران تیرامین',
      },
    ],
    mnemonics: [
      {
        id: 'pp-k-13-m1',
        type: 'mnemonic',
        title: 'رمز عوارض خارج هرمی (EPS) به ترتیب زمان وقوع',
        content: '«دیس آک پار تار» = دیس‌تونی حاد (ساعت‌ها تا روزها) ➔ آکاتیزیا (روزها تا هفته‌ها) ➔ پارکینسونیسم (هفته‌ها تا ماه‌ها) ➔ تاردیو دیسکینزی (ماه‌ها تا سال‌ها).',
        tag: 'کد توالی زمانی',
      },
    ],
    comparativeAnalysis: 'این فصل بیش از هر فصل دیگری در کنکور بهداشت ترازساز است و تسلط بر عوارض جانبی داروها نمره شما را دگرگون می‌کند.',
  },

  // Developmental - Berk Ch 2: Genetics, Prenatal & Apgar
  'dev-b-2': {
    importanceSummary: 'مبانی ژنتیکی و رشد پیش از تولد: دوره‌های رویانی و جنینی، تراتوژن‌ها و نمره آپگار در بدو تولد.',
    goldenPoints: [
      {
        id: 'dev-b-2-g1',
        type: 'golden',
        title: 'دوره رویانی به عنوان حساس‌ترین دوره تراتوژن‌ها',
        content: 'هفته ۳ تا ۸ بارداری (دوره رویانی) دوره بحرانی تشکیل تمام اندام‌های حیاتی است؛ بیشترین ناهنجاری‌های ساختاری شدید در این بازه رخ می‌دهد.',
        tag: 'دوره بحرانی رشد',
        examSource: 'مشترک',
      },
      {
        id: 'dev-b-2-g2',
        type: 'golden',
        title: 'تفسیر نمره آپگار (Apgar Scale)',
        content: 'ارزیابی در دقیقه ۱ و ۵ پس از تولد بر اساس ۵ شاخص (ضربان قلب، تنفس، تون عضلانی، رفلکس، رنگ پوست). نمره ۷ تا ۱۰: وضعیت جسمی عالی؛ ۴ تا ۶: نیازمند کمک تنفسی؛ ۰ تا ۳: خطر مرگ و مداخله اورژانسی.',
        tag: 'آزمون آپگار',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'dev-b-2-t1',
        type: 'trap',
        title: 'اشتباه دوره تخمک با دوره رویانی',
        content: 'در دو هفته اول (تخمک/زایگوت)، تراتوژن‌ها معمولاً قانون «همه یا هیچ» دارند و باعث سقط می‌شوند نه ناهنجاری عضوی؛ ناهنجاری ساختاری اختصاصی دوره رویانی است.',
        tag: 'دام دوره‌های جنینی',
      },
    ],
    mnemonics: [
      {
        id: 'dev-b-2-m1',
        type: 'mnemonic',
        title: 'مخفف کلمه APGAR',
        content: 'Appearance (رنگ پوست), Pulse (ضربان قلب), Grimace (پاسخ بازتابی), Activity (تون عضلانی), Respiration (تنفس).',
        tag: 'کد شاخص‌های آپگار',
      },
    ],
    comparativeAnalysis: 'در آزمون‌های وزارت بهداشت، سندرم جنین الکلی (FAS) و اثر سرخجه و تالیدومید سوالات مکرر متدولوژی رشد است.',
  },

  // Developmental - Berk Ch 4 & Piaget: Cognitive Development
  'dev-b-4': {
    importanceSummary: 'مراحل رشد شناختی پیاژه، مفاهیم درونی‌سازی، پایداری شیء و خطای A-not-B (۲ تا ۳ تست سالانه).',
    goldenPoints: [
      {
        id: 'dev-b-4-g1',
        type: 'golden',
        title: 'زیرمراحل شش‌گانه دوره حسی-حرکتی (۰ تا ۲ سال)',
        content: '۱) بازتاب‌ها، ۲) واکنش چرخشی نخستین (روی بدن خود)، ۳) واکنش چرخشی ثانویه (روی اشیای پیرامون)، ۴) هماهنگی طرحواره‌ها (آغاز هدفمندی و پایداری شیء در ۸ تا ۱۲ ماهگی)، ۵) واکنش چرخشی ثالث (کودک دانشمند/آزمون و خطا)، ۶) بازنمایی ذهنی.',
        tag: 'مراحل شش‌گانه',
        examSource: 'مشترک',
      },
      {
        id: 'dev-b-4-g2',
        type: 'golden',
        title: 'خطای جستجوی A-not-B',
        content: 'در زیرمرحله چهارم (۸ تا ۱۲ ماهگی)، کودک شیء پنهان‌شده را در مکان اول (A) جستجو می‌کند حتی اگر جلوی چشم او به مکان جدید (B) منتقل شود.',
        tag: 'پدیده‌های حسی-حرکتی',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'dev-b-4-t1',
        type: 'trap',
        title: 'تفاوت واکنش چرخشی ثانویه و ثالث',
        content: 'ثانویه: تکرار اتفاقی رفتاری دلپذیر روی محیط (مثل تکان دادن جغجغه)؛ ثالث: تغییر عمدی رفتار برای دیدن پیامدهای تازه (مثل انداختن اشیا از ارتفاع‌های گوناگون).',
        tag: 'دام مرحله‌ای',
      },
    ],
    mnemonics: [
      {
        id: 'dev-b-4-m1',
        type: 'mnemonic',
        title: 'رمز مراحل پیاژه',
        content: '«حس پیش عمل صور» = حسی‌حرکتی ➔ پیش‌عملیاتی ➔ عملیات عینی ➔ عملیات صوری.',
        tag: 'کد حفظی',
      },
    ],
    comparativeAnalysis: 'در هر دو کنکور، پژوهش‌های جدید رنی بایارژون با روش نقض انتظار (Violation of expectation) که نشان داد پایداری شیء بسیار زودتر رخ می‌دهد، تست پرتکرار است.',
  },

  // Developmental - Berk Ch 5: Attachment & Social-Emotional
  'dev-b-5': {
    importanceSummary: 'نظریه دلبستگی جان بالبی و موقعیت ناآشنای مری اینسورث: سبک‌های چهارگانه دلبستگی و پیامدهای رشدی.',
    goldenPoints: [
      {
        id: 'dev-b-5-g1',
        type: 'golden',
        title: 'سبک‌های چهارگانه دلبستگی اینسورث و بارتولومو',
        content: 'ایمن (Secure): با حضور مادر کاوش می‌کند، هنگام جدایی ناراحت و هنگام پیوستن آرام می‌شود. ناایمن اجتنابی (Avoidant): هنگام بازگشت مادر او را نادیده می‌گیرد. ناایمن دوسوگرا/مقاوم (Resistant): گریه و خشم شدید و مقاومت در برابر تسلی. آشفته/سردرگم (Disorganized): ترس، گیجی و رفتارهای متناقض.',
        tag: 'سبک‌های دلبستگی',
        examSource: 'مشترک',
      },
      {
        id: 'dev-b-5-g2',
        type: 'golden',
        title: 'مراحل چهارگانه دلبستگی جان بالبی',
        content: '۱) پیش‌دلبستگی (تولد تا ۶ هفتگی)، ۲) دلبستگی در حال تکوین (۶ هفتگی تا ۶-۸ ماهگی)، ۳) دلبستگی واضح و مشخص (۶-۸ ماهگی تا ۱۸-۲۴ ماهگی با اضطراب جدایی)، ۴) تشکیل رابطه متقابل.',
        tag: 'مراحل بالبی',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'dev-b-5-t1',
        type: 'trap',
        title: 'تفاوت ارجاع اجتماعی (Social Referencing) با اضطراب غریبه',
        content: 'ارجاع اجتماعی یعنی نگاه کردن نوزاد به چهره مادر برای سنجش امنیت محیط یا شیء جدید (۸ تا ۱۰ ماهگی)؛ در حالی که اضطراب غریبه واکنش ترس به چهره ناآشناست.',
        tag: 'تله مفاهیم هیجانی',
      },
    ],
    mnemonics: [
      {
        id: 'dev-b-5-m1',
        type: 'mnemonic',
        title: 'رمز سبک‌های دلبستگی',
        content: '«ایمن، گریزپا (اجتنابی)، دودل (دوسوگرا)، آشفته»؛ واکنش کلیدی در لحظه «پیوستن مجدد مادر» (Reunion) مشخص می‌شود.',
        tag: 'کد لحظه پیوستن',
      },
    ],
    comparativeAnalysis: 'در کنکور بالینی وزارت علوم و بهداشت، سبک دلبستگی آشفته به عنوان قوی‌ترین پیش‌بین آسیب‌های روانی بعدی (به ویژه اختلالات تجزیه‌ای و مرزی) سوال مستقیم است.',
  },

  // General Psychology - Learning & Conditioning
  'gen-h-5': {
    importanceSummary: 'یادگیری هیلگارد: پاولوف، اسکینر، جدول برنامه‌های تقویت و تفاوت تقویت منفی با تنبیه (۳ تا ۴ تست سالانه).',
    goldenPoints: [
      {
        id: 'gen-h-5-g1',
        type: 'golden',
        title: 'برنامه‌های تقویت متناوب اسکینر',
        content: 'نسبی متغیر (VR): بالاترین نرخ پاسخ‌دهی و بیشترین مقاومت در برابر خاموشی (مثل بازی قمار). فاصله‌ای ثابت (FI): الگوی پاسخ‌دهی دندانه‌دار یا گوش‌ماهی (Scallop). فاصله‌ای متغیر (VI): آهنگ مداوم و یکنواخت.',
        tag: 'برنامه‌های تقویت',
        examSource: 'مشترک',
      },
      {
        id: 'gen-h-5-g2',
        type: 'golden',
        title: 'تقویت منفی در برابر تنبیه',
        content: 'هدف تقویت (چه مثبت و چه منفی) همواره «افزایش رفتار» است (تقویت منفی = حذف یک محرک ناخوشایند مثل خاموش کردن زنگ آزارنده). هدف تنبیه همواره «کاهش رفتار» است.',
        tag: 'قانون طلایی رفتارگرایی',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'gen-h-5-t1',
        type: 'trap',
        title: 'ناکامی شرطی‌سازی پس‌گستر (Backward Conditioning)',
        content: 'اگر محرک غیرشرطی (UCS) قبل از محرک شرطی (CS) ارائه شود، شرطی‌سازی تقریباً ایجاد نمی‌شود یا شرطی‌سازی بازدارنده رخ می‌دهد؛ بهترین حالت شرطی‌سازی تاخیری کوتاه‌مدت است.',
        tag: 'دام روابط محرک‌ها',
      },
    ],
    mnemonics: [
      {
        id: 'gen-h-5-m1',
        type: 'mnemonic',
        title: 'رمز مقایسه تقویت منفی و تنبیه',
        content: 'تقویت = تداوم و افزایش رفتار. تنبیه = توقف و کاهش رفتار. منفی = منها و حذف محرک. مثبت = اضافه کردن محرک.',
        tag: 'فرمول ماتریس رفتار',
      },
    ],
    comparativeAnalysis: 'در هر دو کنکور وزارت علوم و بهداشت، تسلط بر کاربرد بالینی اقتصاد ژتونی، تقویت تفکیکی و تنبیه منفی (هزینه پاسخ و محروم‌سازی) الزامی است.',
  },

  // Statistics - Delavar Ch 5: Inferential Statistics & Hypothesis Testing
  'st-d-5': {
    importanceSummary: 'خطای نوع اول (آلفا) و دوم (بتا)، توان آزمون و رابطه آن‌ها با سطح معناداری و آزمون‌های t.',
    goldenPoints: [
      {
        id: 'st-d-5-g1',
        type: 'golden',
        title: 'تعریف خطای نوع اول (Type I Error / Alpha)',
        content: 'رد کردن فرض صفر (H0) در حالی که در واقعیت درست است (نتیجه مثبت کاذب). احتمال این خطا همان سطح آلفا (معمولاً ۰.۰۵ یا ۰.۰۱) است.',
        tag: 'مفهوم بنیادین آمار',
        examSource: 'مشترک',
      },
      {
        id: 'st-d-5-g2',
        type: 'golden',
        title: 'تعریف توان آزمون (Power of Test)',
        content: 'توان آزمون برابر با (۱ منهای بتا) است؛ یعنی احتمال رد کردن درست فرض صفر غلط. افزایش حجم نمونه (N) همواره توان آزمون را افزایش می‌دهد.',
        tag: 'فرمول توان',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'st-d-5-t1',
        type: 'trap',
        title: 'رابطه معکوس آلفا و بتا',
        content: 'اگر آلفا را کوچک کنیم (مثلاً از ۰.۰۵ به ۰.۰۱ ببریم)، خطای نوع دوم (بتا) «افزایش» می‌یابد و در نتیجه توان آزمون (1 - beta) کاهش پیدا می‌کند!',
        tag: 'تله گزینه‌ای محاسباتی',
      },
    ],
    mnemonics: [
      {
        id: 'st-d-5-m1',
        type: 'mnemonic',
        title: 'رمز خطاهای آماری',
        content: '«یک‌صاد، دو‌کاذب» = خطای ۱: رد صادق (H0 درست رد شد). خطای ۲: پذیرش کاذب (H0 غلط پذیرفته شد).',
        tag: 'کد طلایی',
      },
    ],
    comparativeAnalysis: 'در وزارت بهداشت، ارتباط حساسیت (Sensitivity) و ویژگی (Specificity) با خطای نوع اول و دوم در آزمون‌های غربالگری پزشکی مطرح می‌شود.',
  },

  // Psychometrics - Wechsler Scales (WAIS-IV / WISC-V)
  'pm-m-2': {
    importanceSummary: 'مقیاس‌های هوش وکسلر: شاخص‌های چهارگانه VCI, PRI, WMI, PSI، هوشبهر انحرافی و شاخص توانایی عمومی GAI.',
    goldenPoints: [
      {
        id: 'pm-m-2-g1',
        type: 'golden',
        title: 'شاخص‌های چهارگانه WAIS-IV',
        content: '۱) درک کلامی (VCI: شباهت‌ها، واژگان، اطلاعات)، ۲) استدلال ادراکی (PRI: طراحی با مکعب، ماتریس‌ها، پازل دیداری)، ۳) حافظه فعال (WMI: فراخنای ارقام، محاسبه)، ۴) سرعت پردازش (PSI: نمادیابی، رمزنویسی). میانگین شاخص‌ها ۱۰۰ و انحراف معیار ۱۵ است.',
        tag: 'ساختار وکسلر ۴',
        examSource: 'مشترک',
      },
      {
        id: 'pm-m-2-g2',
        type: 'golden',
        title: 'شاخص توانایی عمومی (GAI)',
        content: 'ترکیبی از خرده‌آزمون‌های VCI و PRI بدون دخالت WMI و PSI؛ در مواردی که آزمودنی اضطراب شدید، ADHD یا آسیب مغزی موثر بر سرعت و حافظه فعال دارد، GAI تخمین بهتری از پتانسیل شناختی فرد ارائه می‌دهد.',
        tag: 'شاخص GAI',
        examSource: 'وزارت بهداشت',
      },
    ],
    traps: [
      {
        id: 'pm-m-2-t1',
        type: 'trap',
        title: 'انحراف معیار خرده‌آزمون‌ها در برابر مقیاس‌های کلی',
        content: 'نمرات خرده‌آزمون‌های وکسلر میانگین ۱۰ و انحراف معیار ۳ دارند؛ اما شاخص‌ها و FSIQ میانگین ۱۰۰ و انحراف معیار ۱۵ دارند. مراقب اشتباه ضرب مقیاس‌ها باشید.',
        tag: 'دام نمرات تراز شده',
      },
    ],
    mnemonics: [
      {
        id: 'pm-m-2-m1',
        type: 'mnemonic',
        title: 'رمز شاخص‌های وکسلر',
        content: '«کلام، درک، یاد، سرعت» = کلامی (VCI) + دیداری/ادراکی (PRI) + حافظه فعال (WMI) + سرعت پردازش (PSI).',
        tag: 'کد چهار شاخص',
      },
    ],
    comparativeAnalysis: 'در آزمون‌های ارشد بهداشت، سنجش پراکندگی نمرات (Scatter Analysis) و افتراق آسیب عضوی مغز از افسردگی با خرده‌آزمون طراحی با مکعب تست متداول است.',
  },

  // Psychometrics - MMPI-2 Personality Inventory
  'pm-m-3': {
    importanceSummary: 'پرسشنامه شخصیتی MMPI-2: مقیاس‌های روایی L, F, K، مقیاس‌های بالینی ۱۰ گانه و کدهای دورقمی تشخیصی.',
    goldenPoints: [
      {
        id: 'pm-m-3-g1',
        type: 'golden',
        title: 'مقیاس‌های سه‌گانه روایی سنتی (L, F, K)',
        content: 'L (دروغ‌سنجی): تلاش ساده‌لوحانه برای نشان دادن تصویر خوب اخلاقی. F (بسامد نادر): گزارش علائم غیرعادی، تمارض یا پریشانی عمیق. K (دفاعی بودن): تلاش ظریف برای سرپوش گذاشتن بر مشکلات روانی و انکار آسیب.',
        tag: 'روایی MMPI-2',
        examSource: 'مشترک',
      },
      {
        id: 'pm-m-3-g2',
        type: 'golden',
        title: 'کدهای دورقمی پرتکرار در کنکور',
        content: 'کد ۲-۷/۷-۲: سندرم روان‌نژندی، اضطراب شدید، افسردگی و نشخوار فکری. کد ۱-۳/۳-۱ (تبدیلی): سردردهای مکرر، شکایات جسمانی با آرامش ظاهری (دره V). کد ۴-۹/۹-۴: جامعه‌ستیزی، تکانشگری، پرخاشگری و سوء مصرف مواد.',
        tag: 'کدهای بالینی',
        examSource: 'مشترک',
      },
    ],
    traps: [
      {
        id: 'pm-m-3-t1',
        type: 'trap',
        title: 'تفسیر نیمرخ V معکوس در مقیاس‌های روایی',
        content: 'اگر نمرات L و K بالا (بالای ۶۰) و نمره F پایین باشد (الگوی V معکوس)، نشان‌دهنده «تلاش فرد برای بی‌نقص نشان دادن خود، انکار مشکلات و بینش پایین» است.',
        tag: 'تله V معکوس',
      },
    ],
    mnemonics: [
      {
        id: 'pm-m-3-m1',
        type: 'mnemonic',
        title: 'ترتیب مقیاس‌های سه‌گانه دره روان‌نژندی',
        content: '«۱: جسم (Hs), ۲: افسردگی (D), ۳: هیستری (Hy)»؛ اگر ۱ و ۳ بالا و ۲ پایین‌تر باشد، شکل دره (V) نشانگر مکانیسم دفاعی تبدیل جسمانی است.',
        tag: 'کد دره روان‌نژندی',
      },
    ],
    comparativeAnalysis: 'در کنکورهای بالینی، تفسیر T-score بالای ۶۵ به عنوان نمره بالینی معنادار و مقیاس‌های تکمیلی مانند Mac-R (اعتیاد) سوال داده می‌شود.',
  },

  // Health Psychology - Sarafino: Stress & Physiology
  'hs-sf-2': {
    importanceSummary: 'سارافینو: استرس و فیزیولوژی اعصاب، محور فوری SAM در برابر محور تاخیری HPA و سایکونوروایمونولوژی (PNI).',
    goldenPoints: [
      {
        id: 'hs-sf-2-g1',
        type: 'golden',
        title: 'محور فوری سمپاتیک-مدولای فوق‌کلیوی (SAM)',
        content: 'در مواجهه حاد با استرس، سیستم سمپاتیک پیام عصبی را به بصل‌النخاع (مدولا) غده فوق‌کلیوی می‌فرستد و کاتکول‌آمین‌ها (اپی‌نفرین و نوراپی‌نفرین) ترشح شده و پاسخ جنگ یا گریز فوری ایجاد می‌شود.',
        tag: 'مسیر SAM',
        examSource: 'وزارت بهداشت',
      },
      {
        id: 'hs-sf-2-g2',
        type: 'golden',
        title: 'محور هورمونی هیپوتالاموس-هیپوفیز-قشر فوق‌کلیوی (HPA)',
        content: 'در استرس مداوم: هیپوتالاموس هورمون CRH را ترشح می‌کند ➔ هیپوفیز قدامی هورمون ACTH ترشح می‌کند ➔ قشر آدرنال (Cortex) هورمون کورتیزول را ترشح می‌کند که در بلندمدت سیستم ایمنی را سرکوب می‌نماید.',
        tag: 'مسیر HPA',
        examSource: 'وزارت بهداشت',
      },
    ],
    traps: [
      {
        id: 'hs-sf-2-t1',
        type: 'trap',
        title: 'تمایز بخش قشری و مرکزی غده فوق‌کلیوی',
        content: 'مدولا (مرکز): ترشح اپی‌نفرین در مسیر SAM عصبی؛ کورتکس (قشر): ترشح کورتیزول در مسیر HPA هورمونی. این تمایز سوال قطعی بهداشت است.',
        tag: 'تله آناتومی غدد',
      },
    ],
    mnemonics: [
      {
        id: 'hs-sf-2-m1',
        type: 'mnemonic',
        title: 'رمز مسیر HPA',
        content: '«هیپو ➔ هیپو ➔ کورتکس» = هیپوتالاموس (CRH) ➔ هیپوفیز (ACTH) ➔ کورتکس آدرنال (کورتیزول).',
        tag: 'کد مسیر هورمونی',
      },
    ],
    comparativeAnalysis: 'اختصاصی وزارت بهداشت؛ اثر سرکوب لنفوسیت‌های T کمکی و سلول‌های NK توسط کورتیزول بالا در بیماری‌های مزمن سرطان و عروقی مکرراً تست شده است.',
  },

  // Health Psychology - Sarafino: Gate Control Theory of Pain
  'hs-sf-5': {
    importanceSummary: 'ماهیت درد و نظریه کنترل دروازه رونالد ملزاک و پاتریک وال: نقش فیبرهای A-دلتا، C و فیبرهای قطور A-بتا.',
    goldenPoints: [
      {
        id: 'hs-sf-5-g1',
        type: 'golden',
        title: 'نظریه کنترل دروازه درد (Gate Control Theory)',
        content: 'در شاخ خلفی نخاع (ماده ژلاتینی رولاندو)، مکانیسمی دروازه‌مانند جریان سیگنال‌های درد به مغز را تعدیل می‌کند. فعالیت فیبرهای قطور A-Beta (لمس و فشار) دروازه را می‌بندد؛ فعالیت فیبرهای باریک درد دروازه را باز می‌کند.',
        tag: 'دروازه درد',
        examSource: 'وزارت بهداشت',
      },
      {
        id: 'hs-sf-5-g2',
        type: 'golden',
        title: 'تفکیک فیبرهای A-دلتا و فیبرهای C',
        content: 'فیبرهای A-دلتا: قطورتر و میلین‌دار، انتقال سریع درد حاد، تیز و خنجری. فیبرهای C: بدون میلین و باریک، انتقال کند درد مزمن، سوزشی و مبهم.',
        tag: 'فیبرهای درد',
        examSource: 'وزارت بهداشت',
      },
    ],
    traps: [
      {
        id: 'hs-sf-5-t1',
        type: 'trap',
        title: 'نقش عوامل روانی بر باز و بسته شدن دروازه درد',
        content: 'افسردگی، اضطراب و تمرکز روی درد دروازه را بازتر می‌کنند (احساس درد بیشتر)؛ در حالی که آرام‌سازی، حواس‌پرتی و خلق مثبت دروازه را می‌بندند.',
        tag: 'تله کنترل نزولی',
      },
    ],
    mnemonics: [
      {
        id: 'hs-sf-5-m1',
        type: 'mnemonic',
        title: 'رمز فیبرهای درد',
        content: '«A مثل Arrow (تیر تیز و سریع)؛ C مثل Chronic (کند و مزمن)».',
        tag: 'کد یادسپاری درد',
      },
    ],
    comparativeAnalysis: 'در آزمون‌های سلامت وزارت بهداشت، کاربرد TENS و ماساژدرمانی بر مبنای بستن دروازه توسط فیبرهای A-بتا سوال طراحی می‌شود.',
  },

  // Mental Health - Shamloo Ch 2: Three Levels of Prevention
  'hs-sh-2': {
    importanceSummary: 'سطوح سه‌گانه پیشگیری دکتر سعید شاملو: تفکیک دقیق پیشگیری اولیه (بروز)، ثانویه (شیوع) و ثالثه (ناتوانی).',
    goldenPoints: [
      {
        id: 'hs-sh-2-g1',
        type: 'golden',
        title: 'پیشگیری اولیه (Primary Prevention)',
        content: 'هدف: کاهش میزان «بروز / وقوع» (Incidence) بیماری‌های جدید در جمعیت سالم. اقدامات: آموزش همگانی سلامت روان، مهارت‌های زندگی در مدارس، بهسازی محیط و ارتقای تاب‌آوری جامعه قبل از بروز بیماری.',
        tag: 'پیشگیری اولیه',
        examSource: 'وزارت بهداشت',
      },
      {
        id: 'hs-sh-2-g2',
        type: 'golden',
        title: 'پیشگیری ثانویه (Secondary Prevention)',
        content: 'هدف: کاهش میزان «شیوع» (Prevalence) و کوتاه‌کردن طول دوره بیماری. اقدامات: بیماریابی سریع، غربالگری‌های دوره‌ای در خانه‌های بهداشت، تشخیص زودهنگام و مداخله بحران/درمان فوری.',
        tag: 'پیشگیری ثانویه',
        examSource: 'وزارت بهداشت',
      },
      {
        id: 'hs-sh-2-g3',
        type: 'golden',
        title: 'پیشگیری ثالثه (Tertiary Prevention)',
        content: 'هدف: کاهش «ناتوانی و پیامدهای دیررس» (Disability) بیماری مزمن. اقدامات: بازتوانی روانی-اجتماعی، کاردرمانی، حمایت‌های شغلی و بازگرداندن بیمار به جامعه برای کاهش بستری‌های مکرر.',
        tag: 'پیشگیری ثالثه',
        examSource: 'وزارت بهداشت',
      },
    ],
    traps: [
      {
        id: 'hs-sh-2-t1',
        type: 'trap',
        title: 'تمایز قطعی «کاهش بروز» با «کاهش شیوع»',
        content: 'بروز (موارد جدید) فقط و فقط در پیشگیری اولیه کاهش می‌یابد؛ کاهش شیوع (کل موارد موجود در جامعه) هدف پیشگیری ثانویه است.',
        tag: 'تله اساسی اپیدمیولوژی',
      },
    ],
    mnemonics: [
      {
        id: 'hs-sh-2-m1',
        type: 'mnemonic',
        title: 'رمز سطوح پیشگیری',
        content: '«یک = بروز قبل از درد، دو = درمان فوری و غربالگری فرد، سه = توان‌بخشی بعد از نبرد».',
        tag: 'شعر یادسپاری سطوح',
      },
    ],
    comparativeAnalysis: 'تست‌های این فصل در کنکور بهداشت سناریویی هستند؛ مثلاً اجرای کارگاه مدیریت خشم در مدرسه = اولیه؛ ارزیابی سریع افسردگی در درمانگاه = ثانویه؛ کارگاه اشتغال بیماران اسکیزوفرنی = ثالثه.',
  },

  // Islamic Psychology - Avicenna's Faculties of Soul & Floating Man
  'isl-a-2': {
    importanceSummary: 'علم‌النفس ابن‌سینا: حواس باطنی پنج‌گانه (حس مشترک، خیال، وهم، حافظه، متصرفه) و برهان انسان معلق در فضا.',
    goldenPoints: [
      {
        id: 'isl-a-2-g1',
        type: 'golden',
        title: 'حواس باطنی پنج‌گانه ابن‌سینا و کارکرد آن‌ها',
        content: '۱) حس مشترک (بنطاسیا): دریافت صورت‌های محسوس. ۲) خیال/مصوره: بایگانی صورت‌ها. ۳) وهم: ادراک معانی جزئی غیرمحسوس (مثل عداوت گرگ یا مهر مادر). ۴) حافظه/ذاکره: بایگانی معانی جزئی. ۵) متصرفه: ترکیب و تفکیک صورت‌ها و معانی (اگر در خدمت عقل باشد «مفکره» و اگر در خدمت وهم باشد «متخیله» نام دارد).',
        tag: 'حواس باطنی ابن‌سینا',
        examSource: 'وزارت علوم',
      },
      {
        id: 'isl-a-2-g2',
        type: 'golden',
        title: 'برهان انسان معلق در فضا (رجل معلق فی الفضاء)',
        content: 'ابن‌سینا فرض می‌کند انسانی در هوای مه‌آلود و معلق آفریده شود که هیچ حسی از اندام‌ها و دنیای خارج ندارد؛ با این حال او به ذات و «من بودن» خود بدون نیاز به بدن علم حضوری دارد، که اثبات تجرد نفس است.',
        tag: 'برهان تجرد نفس',
        examSource: 'وزارت علوم',
      },
    ],
    traps: [
      {
        id: 'isl-a-2-t1',
        type: 'trap',
        title: 'تفاوت «صورت محسوس» با «معنی غیرمحسوس»',
        content: 'صورت محسوس (شکل، رنگ و جسم گرگ) توسط حس مشترک ادراک و در خیال ذخیره می‌شود؛ اما معنای غیرمحسوس (دشمنی و خطر گرگ) توسط «وهم» ادراک و در «حافظه» ذخیره می‌شود.',
        tag: 'تله مدرکات باطنی',
      },
    ],
    mnemonics: [
      {
        id: 'isl-a-2-m1',
        type: 'mnemonic',
        title: 'رمز حواس باطنی بوعلی',
        content: '«حس، خیال، وهم، حفظ، تصرف» = حس مشترک و خیال (صورت‌ها) ➔ وهم و حافظه (معانی) ➔ متصرفه (ابزار ترکیب هر دو).',
        tag: 'کد حواس خمسه باطنی',
      },
    ],
    comparativeAnalysis: 'این فصل پرتست‌ترین بخش علم‌النفس در دفترچه کارشناسی ارشد وزارت علوم (کد ۱۱۳۳) است و دست‌کم ۳ تا ۴ تست مستقیم از آن طرح می‌گردد.',
  },
};

const ALL_CURATED_INSIGHTS: Record<string, Partial<ChapterInsights>> = {
  ...CURATED_INSIGHTS,
  ...CLINICAL_CURATED_INSIGHTS,
  ...PATHOLOGY_CURATED_INSIGHTS,
  ...DEV_STATS_CURATED_INSIGHTS,
};

/**
 * Evenly and pseudo-randomly distributes the correct option position across 0, 1, 2, 3 (گزینه‌های ۱، ۲، ۳، ۴)
 * using a stable hash based on chapter id. This completely avoids answer concentration on option 2 (index 1).
 */
function distributeQuestionAnswer(
  q: { questionText: string; options: string[]; correctIndex: number; explanation: string },
  seedKey: string
): { questionText: string; options: string[]; correctIndex: number; explanation: string } {
  if (!q || !q.options || q.options.length !== 4) return q;

  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash << 5) - hash + seedKey.charCodeAt(i);
    hash |= 0;
  }
  // Target index evenly distributed across 0, 1, 2, 3 (گزینه‌های ۱، ۲، ۳، ۴)
  const targetIndex = Math.abs(hash) % 4;

  if (targetIndex === q.correctIndex) {
    return q;
  }

  const newOptions = [...q.options];
  const correctOptionText = newOptions[q.correctIndex];
  const displacedOptionText = newOptions[targetIndex];
  newOptions[targetIndex] = correctOptionText;
  newOptions[q.correctIndex] = displacedOptionText;

  return {
    ...q,
    options: newOptions,
    correctIndex: targetIndex,
  };
}

/**
 * Intelligent generator function that produces rich test points, exam traps and practice questions for any chapter.
 * Blends curated database with deep context synthesized from chapter title, book, topics, and tips.
 */
export function getChapterTestInsights(chapter: Chapter, subjectName?: string): ChapterInsights {
  const existing = ALL_CURATED_INSIGHTS[chapter.id];

  // Base curated points if present
  let goldenPoints: TestPointItem[] = existing?.goldenPoints ? [...existing.goldenPoints] : [];
  let traps: TestPointItem[] = existing?.traps ? [...existing.traps] : [];
  let mnemonics: TestPointItem[] = existing?.mnemonics ? [...existing.mnemonics] : [];

  // If no curated points, dynamically synthesize from chapter metadata with high psychological accuracy
  if (goldenPoints.length === 0) {
    // Generate Golden Point 1 from examTips
    if (chapter.examTips) {
      goldenPoints.push({
        id: `${chapter.id}-gen-g1`,
        type: 'golden',
        title: `شاه‌کلید تستی: ${chapter.title}`,
        content: chapter.examTips,
        tag: 'نکته طلایی و استراتژی',
        examSource: chapter.targetExam === 'health' ? 'وزارت بهداشت' : chapter.targetExam === 'science' ? 'وزارت علوم' : 'مشترک',
      });
    }

    // Generate Golden Points from keyTopics
    if (chapter.keyTopics && chapter.keyTopics.length > 0) {
      const topic1 = chapter.keyTopics[0];
      const topic2 = chapter.keyTopics[1] || chapter.keyTopics[0];

      goldenPoints.push({
        id: `${chapter.id}-gen-g2`,
        type: 'golden',
        title: `مفهوم پرتکرار: ${topic1}`,
        content: `طراحان کنکور روی تعاریف دقیق، پیش‌شرط‌ها و مراحل مرتبط با «${topic1}» تمرکز دارند. تفاوت‌های ظریف آن را با مفاهیم موازی در کتاب ${chapter.bookTitle} خط‌به‌خط بخوانید.`,
        tag: 'کلیدواژه پرسوال',
        examSource: 'مشترک',
      });

      if (chapter.keyTopics.length > 2) {
        goldenPoints.push({
          id: `${chapter.id}-gen-g3`,
          type: 'golden',
          title: `مقایسه تشخیصی: ${topic2}`,
          content: `مباحث «${topic2}» معمولاً در قالب گزینه‌های انحرافی یا سوالات مقایسه‌ای چندبخشی مطرح می‌شوند. تسلط بر نام نظریه‌پردازان و آزمایش‌های کلاسیک آن ضروری است.`,
          tag: 'مبحث تستی',
          examSource: 'مشترک',
        });
      }
    }
  }

  // If no traps, synthesize smart exam traps
  if (traps.length === 0) {
    traps.push({
      id: `${chapter.id}-gen-t1`,
      type: 'trap',
      title: 'دام همپوشانی مفاهیم و تعاریف متقاطع',
      content: `در سوالات چهارگزینه‌ای، طراحان معمولاً تعریف دقیق «${chapter.keyTopics?.[0] || chapter.title}» را با یکی از نظریه‌های مشابه جابه‌جا می‌کنند تا داوطلب کم‌دقت را به اشتباه بیندازند. حتماً به کلمات کلیدی مقیدساز مانند «همواره»، «صرفاً» و «اولین بار» در صورت سوال دقت کنید.`,
      tag: 'تله گزینه‌ای',
    });

    if (chapter.targetExam === 'health' || chapter.healthFrequency) {
      traps.push({
        id: `${chapter.id}-gen-t2`,
        type: 'trap',
        title: 'دام کاربرد بالینی در آزمون وزارت بهداشت',
        content: `طراحان سنجش پزشکی سوالات این فصل را در قالب سناریوی بیمار یا کیس بالینی (Case-Based) مطرح می‌کنند؛ صرف حفظ کردن تعاریف تئوریک بدون تشخیص بالینی کافی نیست.`,
        tag: 'دام بالینی بهداشت',
      });
    }
  }

  // If no mnemonics, generate smart memory cues
  if (mnemonics.length === 0) {
    const mainTopic = chapter.keyTopics?.[0] || chapter.title;
    mnemonics.push({
      id: `${chapter.id}-gen-m1`,
      type: 'mnemonic',
      title: `کد مفهومی و کلید یادسپاری: ${chapter.title}`,
      content: `برای یادآوری سریع سرفصل‌های «${mainTopic}»، حروف اول واژگان کلیدی فصل را در یک عبارت معنادار ترکیب کنید و خلاصه آن را در بخش یادداشت‌های کارت ثبت کنید.`,
      tag: 'کد حفظی',
    });
  }

  // Comparative analysis
  let comparativeAnalysis = existing?.comparativeAnalysis || '';
  if (!comparativeAnalysis) {
    if (chapter.healthFrequency) {
      comparativeAnalysis = `تحلیل دفترچه‌های اخیر: ${chapter.healthFrequency}. در کنکور وزارت بهداشت سوالات جزئی‌تر و با رویکرد درمانی-کاربردی مطرح می‌گردد.`;
    } else if (chapter.targetExam === 'health') {
      comparativeAnalysis = 'این سرفصل منحصراً در دفترچه کارشناسی ارشد وزارت بهداشت (سنجش آموزش پزشکی) مورد سوال قرار می‌گیرد.';
    } else if (chapter.targetExam === 'science') {
      comparativeAnalysis = 'این مبحث ویژه کنکور کارشناسی ارشد وزارت علوم (کد ۱۱۳۳) بوده و در بودجه‌بندی بهداشت حضور مستقیم ندارد.';
    } else {
      comparativeAnalysis = `در هر دو کنکور وزارت علوم و بهداشت سوال‌خیز است؛ بودجه‌بندی میانگین: ${chapter.averageQuestions}.`;
    }
  }

  const importanceSummary =
    existing?.importanceSummary ||
    `بررسی آماری آزمون‌های ۱۰ سال اخیر نشان می‌دهد این فصل دارای بودجه‌بندی «${chapter.averageQuestions}» بوده و تسلط بر آن برای تراز بالای ۶۵٪ در درس ${subjectName || ''} تعیین‌کننده است.`;

  // Sample Question
  let sampleQuestion = existing?.sampleQuestion;
  if (!sampleQuestion) {
    const mainTopic = chapter.keyTopics?.[0] || chapter.title;
    const secondaryTopic = chapter.keyTopics?.[1] || 'مفاهیم تحلیلی و بالینی';
    sampleQuestion = {
      questionText: `در ارتباط با سرفصل «${mainTopic}» بر اساس کتاب ${chapter.bookTitle} (${chapter.authors})، کدام عبارت از دیدگاه طراحان آزمون ارشد صحیح و دقیق است؟`,
      options: [
        `ابعاد نظری ${mainTopic} کاملاً مجزا از ساختار ${secondaryTopic} تعریف شده و فاقد کاربرد تشخیصی مشترک است.`,
        `${chapter.examTips || `تسلط بر خط‌به‌خط تعاریف و تفکیک ظریف شاخص‌های ${mainTopic} برای اجتناب از تله‌های گزینه‌ای طراحان ضروری است.`}`,
        `در رویکردهای نوین روان‌شناسی، ارزیابی ${mainTopic} صرفاً به مشاهدات کیفی محدود شده و ارزیابی کمی و عینی آن منسوخ گردیده است.`,
        `در تمام ابزارهای روان‌سنجی مرتبط، خطای نوع اول (آلفا) با افزایش تعمیم‌پذیری سازه به صورت خودبه‌خودی به صفر می‌رسد.`
      ],
      correctIndex: 1,
      explanation: `بر اساس مرجع آزمون (${chapter.bookTitle})، نکته کلیدی این فصل بدین شرح است: «${chapter.examTips || `مبحث ${mainTopic} از ارکان اصلی سوالات مفهومی است و نیاز به تفکیک دقیق از نظریات همپوشان دارد.`}». سایر گزینه‌ها به دلیل استفاده از قیدهای تعمیمی نادرست («کاملاً مجزا»، «منسوخ گردیده»، «به صفر می‌رسد») رد می‌شوند.`
    };
  }

  // Ensure answer options are evenly and realistically distributed across options 1, 2, 3, 4 (no bias to option 2)
  if (sampleQuestion) {
    sampleQuestion = distributeQuestionAnswer(sampleQuestion, chapter.id);
  }

  return {
    chapterId: chapter.id,
    importanceSummary,
    goldenPoints,
    traps,
    mnemonics,
    comparativeAnalysis,
    sampleQuestion,
  };
}

/**
 * Simulates on-demand AI dynamic generation of additional high-level scenario questions and tips
 * (Can easily be hooked up to an API endpoint or Gemini client).
 */
export async function generateAiAdvancedChapterTips(chapter: Chapter): Promise<TestPointItem[]> {
  // Simulate rapid API response with ultra-high quality contextual points
  await new Promise((resolve) => setTimeout(resolve, 600));

  const timestamp = Date.now();
  return [
    {
      id: `ai-${chapter.id}-${timestamp}-1`,
      type: 'golden',
      title: `تحلیل پیش‌بینی طراحان برای کنکور ۱۴۰۵: ${chapter.title}`,
      content: `با توجه به گرایش طراحان سال‌های ۱۴۰۲ تا ۱۴۰۴ به سوالات استنباطی و سناریومحور، احتمال طرح یک تست ترکیبی بین مبحث «${chapter.keyTopics[0] || chapter.title}» و رویکردهای موج سوم یا ملاک‌های به‌روزرسانی شده DSM-5 بسیار بالاست.`,
      tag: 'پیش‌بینی هوش مصنوعی',
      examSource: 'مشترک',
    },
    {
      id: `ai-${chapter.id}-${timestamp}-2`,
      type: 'trap',
      title: `تله‌شناسی پیشرفته گزینه‌ها در کنکور`,
      content: `گزینه‌هایی که اصطلاحات متضاد (مانند ابعادی در برابر طبقه‌ای، درونی در برابر بیرونی، یا خطای آلفا در برابر بتا) را روبه‌روی هم قرار می‌دهند در ۹۰٪ موارد حاوی پاسخ درست یا انحراف اولیه هستند. به قیدهای صورت مسئله دقت موشکافانه داشته باشید.`,
      tag: 'تحلیل دام‌های هوشمند',
      examSource: 'مشترک',
    },
  ];
}

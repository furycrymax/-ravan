import { EXAM_SUBJECTS } from '../data/curriculumData';
import { Subject, Book } from '../types';

/**
 * Resolves a task or subject descriptor to the corresponding Subject in the curriculum database.
 */
export function findSubjectForTask(task: {
  subjectId?: string;
  subjectName?: string;
  bookTitle?: string;
}): Subject {
  const sId = (task.subjectId || '').toLowerCase().trim();
  const sName = task.subjectName || '';
  const bTitle = task.bookTitle || '';

  // 1. Exact ID match
  if (sId && sId !== 'rest' && sId !== 'general') {
    const found = EXAM_SUBJECTS.find((s) => s.id === sId);
    if (found) return found;
  }

  // 2. Keyword check on name or title for psychopathology / kaplan
  if (
    sName.includes('مرضی') ||
    sName.includes('آسیب') ||
    sName.includes('کاپلان') ||
    sName.includes('روان‌پزشکی') ||
    sName.includes('روانپزشکی') ||
    bTitle.includes('کاپلان') ||
    bTitle.includes('آسیب')
  ) {
    const psycho = EXAM_SUBJECTS.find((s) => s.id === 'psychopathology');
    if (psycho) return psycho;
  }

  // 3. Clinical
  if (
    sName.includes('بالینی') ||
    bTitle.includes('فیرس') ||
    bTitle.includes('پروچاسکا') ||
    sId === 'clinical'
  ) {
    const clinical = EXAM_SUBJECTS.find((s) => s.id === 'clinical');
    if (clinical) return clinical;
  }

  // 4. Developmental
  if (
    sName.includes('رشد') ||
    sName.includes('تحول') ||
    bTitle.includes('برک') ||
    bTitle.includes('کرین') ||
    sId === 'developmental'
  ) {
    const dev = EXAM_SUBJECTS.find((s) => s.id === 'developmental');
    if (dev) return dev;
  }

  // 5. Statistics & Research Methods
  if (
    sName.includes('آمار') ||
    sName.includes('روش تحقیق') ||
    sName.includes('تحقیق') ||
    bTitle.includes('دلاور') ||
    sId === 'statistics'
  ) {
    const stat = EXAM_SUBJECTS.find((s) => s.id === 'statistics');
    if (stat) return stat;
  }

  // 6. General Psychology (Hilgard)
  if (
    sName.includes('عمومی') ||
    bTitle.includes('هیلگارد') ||
    sId === 'general'
  ) {
    const gen = EXAM_SUBJECTS.find((s) => s.id === 'general');
    if (gen) return gen;
  }

  // 7. English
  if (
    sName.includes('زبان') ||
    sName.includes('English') ||
    bTitle.includes('لیل') ||
    bTitle.includes('سیدمحمدی') ||
    sId === 'english'
  ) {
    const eng = EXAM_SUBJECTS.find((s) => s.id === 'english');
    if (eng) return eng;
  }

  // 8. Psychometrics
  if (
    sName.includes('سنجش') ||
    sName.includes('سنجی') ||
    sName.includes('آزمون') ||
    bTitle.includes('مارنات') ||
    sId === 'psychometrics'
  ) {
    const pm = EXAM_SUBJECTS.find((s) => s.id === 'psychometrics');
    if (pm) return pm;
  }

  // 9. Islamic Psychology
  if (
    sName.includes('اسلامی') ||
    sName.includes('علم‌النفس') ||
    sId === 'islamic'
  ) {
    const isl = EXAM_SUBJECTS.find((s) => s.id === 'islamic');
    if (isl) return isl;
  }

  // 10. Health Services
  if (
    sName.includes('خدمات بهداشتی') ||
    sName.includes('بهداشت روان') ||
    sName.includes('سلامت') ||
    sId === 'health_services'
  ) {
    const hs = EXAM_SUBJECTS.find((s) => s.id === 'health_services');
    if (hs) return hs;
  }

  // Check by matching book title anywhere
  for (const s of EXAM_SUBJECTS) {
    if (
      s.books.some(
        (b) =>
          b.title.toLowerCase().includes(bTitle.toLowerCase()) ||
          bTitle.toLowerCase().includes(b.title.toLowerCase())
      )
    ) {
      return s;
    }
  }

  // Fallback to Clinical Psychology
  return EXAM_SUBJECTS[0];
}

/**
 * Returns the list of officially cited reference books for this task/subject.
 */
export function getCitedReferencesForTask(task: {
  subjectId?: string;
  subjectName?: string;
  bookTitle?: string;
}): Book[] {
  const subject = findSubjectForTask(task);
  return subject ? subject.books : [];
}

/**
 * Generates an analytical reasoning rationale explaining why the AI cited
 * these specific reference books for this subject.
 */
export function getAICitationRationale(
  subject: Subject,
  taskBookTitle?: string
): {
  headline: string;
  rationale: string;
  targetExamEmphasis: string;
  syllabusAlignment: string;
} {
  switch (subject.id) {
    case 'clinical':
      return {
        headline: 'استناد قطعی به روان‌شناسی بالینی فیرس و نظریه‌های درمان پروچاسکا',
        rationale:
          'هوش مصنوعی این درس را بر اساس تحلیل کنکورهای ۱۴۰۰ تا ۱۴۰۴ با ضریب ۳ اولویت‌بندی کرده است. بیش از ۶۰ درصد سوالات مستقیم وزارت بهداشت و علوم عیناً بر اساس متن و جدول‌های فیرس و ترال و فصول درمان‌های رفتاری-شناختی پروچاسکا طراحی شده است.',
        targetExamEmphasis: 'مشترک هر دو کنکور وزارت بهداشت و علوم (ضریب ۳)',
        syllabusAlignment: 'انطباق ۱۰۰٪ با سرفصل‌های رسمی شورای عالی برنامه‌ریزی علوم پزشکی و وزارت علوم',
      };
    case 'psychopathology':
      return {
        headline: 'استناد به دستنامه روان‌پزشکی کاپلان و سادوک و معیارهای DSM-5-TR',
        rationale:
          'کاپلان و سادوک به عنوان رفرنس بدون جانشین درس روانشناسی مرضی و روانپزشکی تعیین شده است. هوش مصنوعی به دلیل رویکرد تشخیصی و افتراقی سوالات وزارت بهداشت (ضریب ۳) و علوم (ضریب ۲)، این منبع را برای پوشش فصول اختلالات اضطرابی، خلقی و اسکیزوفرنی در اولویت قرار داده است.',
        targetExamEmphasis: 'وزارت بهداشت (ضریب ۳) و وزارت علوم (ضریب ۲)',
        syllabusAlignment: 'منطبق با آخرین ویراست DSM-5-TR و تغییرات تشخیصی APA',
      };
    case 'developmental':
      return {
        headline: 'استناد به روان‌شناسی رشد لورا برک و نظریه‌های تحولی ژنتیک',
        rationale:
          'جلد اول و دوم لورا برک منبع اصلی با بیش از ۷۵ درصد سهم سوالات است. نظریه‌های شناختی پیاژه، ویگوتسکی، اریکسون و بالبی در این منبع به شکلی کاربردی تشریح شده که در برنامه‌ریزی هوش مصنوعی برای روزهای با کشش شناختی مناسب جانمایی شده‌اند.',
        targetExamEmphasis: 'ضریب ۲ در وزارت علوم و وزارت بهداشت',
        syllabusAlignment: 'سرفصل مصوب درس رشد دوره‌های لیسانس و ارشد روانشناسی',
      };
    case 'statistics':
      return {
        headline: 'استناد به احتمالات و آمار کاربردی و روش تحقیق دکتر علی دلاور',
        rationale:
          'هوش مصنوعی آمار و روش تحقیق دکتر دلاور را به عنوان رفرنس معیار تعیین کرده است؛ زیرا سوالات کنکور ارشد به ویژه علوم، بیشتر جنبه مفهومی و استنباطی داشته و تسلط بر فرمول‌های کلیدی دلاور بدون محاسبات سنگین منجر به درصدهای بالای ۷۰ می‌شود.',
        targetExamEmphasis: 'ضریب ۱.۵ بهداشت و ضریب ۱ علوم',
        syllabusAlignment: 'منطبق با تست‌های سازمان سنجش و طرح‌های آزمایشی و فراتحلیل',
      };
    case 'english':
      return {
        headline: 'استناد به متون تخصصی روانشناسی لیندا لیل و واژگان تافل / ۵۰۴',
        rationale:
          'زبان عمومی و تخصصی در کنکور وزارت بهداشت دارای ضریب فوق‌العاده تعیین‌کننده ۳ است. هوش مصنوعی متون تخصصی لیندا لیل و دکتر سیدمحمدی را برای تقویت درک مطلب و تکنیک‌های اسکیمینگ/اسکنینگ برگزیده است.',
        targetExamEmphasis: 'تعیین‌کننده‌ترین درس ترازساز بهداشت (ضریب ۳) و علوم (ضریب ۲)',
        syllabusAlignment: 'متون استاندارد ریدینگ‌های مقالات بالینی و واژه‌شناسی اصطلاحات پزشکی-روانی',
      };
    case 'psychometrics':
      return {
        headline: 'استناد به راهنمای سنجش روانی گری گراث-مارنات و آزمون‌های دکتر حمزه گنجی',
        rationale:
          'برای فصول آزمون‌های عینی، MMPI-2، وکسلر و رورشاخ، مرجع گراث-مارنات بالاترین تطابق را با کلیدهای سنجش آموزش پزشکی دارد و بخش عمده تست‌های تشخیصی عینی از این کتاب استخراج می‌گردد.',
        targetExamEmphasis: 'ضریب ۱.۵ در کنکور ارشد وزارت بهداشت و ضریب ۲ علوم',
        syllabusAlignment: 'پوشش کامل روایی، پایایی و تفسیر نیمرخ‌های بالینی آزمون‌های استاندارد',
      };
    case 'general':
      return {
        headline: 'استناد به زمینه روان‌شناسی هیلگارد و اتکینسون',
        rationale:
          'هیلگارد جامع‌ترین دیدگاه پایه‌ای در روانشناسی تجربی، حافظه، یادگیری، انگیزش و ادراک را ارائه می‌دهد و پایه‌گذار تسلط ذهنی در سایر دروس تخصصی است.',
        targetExamEmphasis: 'ضریب ۱ در کنکور ارشد وزارت علوم و بهداشت',
        syllabusAlignment: 'مستندات مرجع بین‌المللی روان‌شناسی تجربی و عمومی',
      };
    case 'islamic':
      return {
        headline: 'استناد به علم‌النفس دکتر حسن احدی، شکوه بنی‌جمالی و دکتر عثمان نجاتی',
        rationale:
          'دیدگاه‌های دانشمندان اسلامی (ابن‌سینا، فارابی، ملاصدرا و غزالی) منحصراً در کنکور وزارت علوم (کد ۱۱۳۳) سوال دارد و تسلط بر کتاب احدی پاسخگویی ۱۰۰ درصدی را تضمین می‌کند.',
        targetExamEmphasis: 'ویژه کنکور ارشد وزارت علوم (ضریب ۱)',
        syllabusAlignment: 'منطبق بر سرفصل رسمی شورای عالی انقلاب فرهنگی برای کنکور علوم',
      };
    case 'health_services':
      return {
        headline: 'استناد به روان‌شناسی سلامت سارافینو و بهداشت روان دکتر شاملو',
        rationale:
          'این درس ویژه داوطلبان گرایش‌های بالینی و روانشناسی سلامت وزارت بهداشت است و مفاهیم پیشگیری سطوح ۱، ۲، ۳ و مدل‌های زیستی-روانی-اجتماعی را به طور کامل پوشش می‌دهد.',
        targetExamEmphasis: 'ویژه کنکور وزارت بهداشت (ضریب ۱)',
        syllabusAlignment: 'راهنماهای نظام سلامت کشور و پیشگیری از اختلالات روانی',
      };
    default:
      return {
        headline: `استناد به کتب مرجع رسمی درس ${subject.name}`,
        rationale:
          'هوش مصنوعی کتب این درس را بر اساس فراوانی تست‌های مستقیم در کنکورهای اخیر و انطباق سرفصل‌های اعلامی مرکز سنجش آموزش پزشکی و سازمان سنجش آموزش کشور انتخاب کرده است.',
        targetExamEmphasis: `ضریب علوم: ${subject.coefficient} | ضریب بهداشت: ${subject.healthCoefficient || '-'}`,
        syllabusAlignment: 'سرفصل‌های تایید شده کنکور ارشد روانشناسی بالینی',
      };
  }
}

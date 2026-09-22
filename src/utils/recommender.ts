import { Subject, Book, Chapter, UserProgressMap, ExamTarget, StudyStatus } from '../types';

export interface RecommendationItem {
  chapter: Chapter;
  book: Book;
  subject: Subject;
  score: number;
  priorityLabel: 'بسیار فوری' | 'اولویت طلایی' | 'تکمیل تسلط' | 'مرور دوره‌ای';
  reasons: string[];
  userStatus: StudyStatus;
  completedStepsCount: number; // 0 to 3
  progressPercent: number; // 0 to 100%
  effectiveCoefficient: number;
  urgencyType: 'finish_started' | 'high_yield_untouched' | 'needs_testing' | 'spaced_review';
  examBudgetingScore: number;
  masteryLevelLabel: 'شروع‌نشده' | 'تسلط مقدماتی' | 'تسلط متوسط' | 'مسلط و تکمیل‌شده';
  budgetingSummary: string;
}

/**
 * Calculates a quantitative recommendation score based on:
 * 1. Previous exam budgeting & question yield (Coefficients, Importance, Average questions)
 * 2. User's mastery deficit (Not started, in progress, tests missing)
 * 3. Exam target relevance (Ministry of Health vs Science)
 */
export function getRecommendedChapters(
  subjects: Subject[],
  userProgress: UserProgressMap,
  examTarget: ExamTarget = 'both',
  currentSubjectId?: string,
  limit: number = 3
): RecommendationItem[] {
  const candidates: RecommendationItem[] = [];

  subjects.forEach((subject) => {
    // Determine effective coefficient based on target exam
    let effectiveCoeff = subject.coefficient;
    if (examTarget === 'health') {
      effectiveCoeff = subject.healthCoefficient ?? subject.coefficient;
    } else if (examTarget === 'both') {
      effectiveCoeff = Math.max(subject.coefficient, subject.healthCoefficient ?? subject.coefficient);
    }

    subject.books.forEach((book) => {
      book.chapters.forEach((chapter) => {
        const userData = userProgress[chapter.id] || {
          status: 'not_started',
          notes: '',
          readBookText: false,
          doneTrainingTests: false,
          doneReviewTests: false,
        };

        // Calculate completed checklist steps (out of 3)
        let steps = 0;
        if (userData.readBookText) steps++;
        if (userData.doneTrainingTests) steps++;
        if (userData.doneReviewTests) steps++;
        const progressPercent = Math.round((steps / 3) * 100);

        const isMastered = userData.status === 'mastered';

        let score = 0;
        let examBudgetingScore = 0;
        const reasons: string[] = [];

        // 1. Exam Budgeting & Weight Factors (بودجه‌بندی آزمون‌های قبلی)
        // Coefficient weight (Higher coefficient subjects like Clinical / Psychopathology get top priority)
        const coeffPoints = effectiveCoeff * 25;
        examBudgetingScore += coeffPoints;
        reasons.push(`درس «${subject.name}» با ضریب ${effectiveCoeff} در کنکور ارشد`);

        // Chapter Importance
        if (chapter.importance === 'critical') {
          examBudgetingScore += 50;
          reasons.push(`فصل طلایی (⭐⭐⭐) با بالاترین فراوانی سوال در آزمون‌های ادوار گذشته`);
        } else if (chapter.importance === 'high') {
          examBudgetingScore += 30;
          reasons.push(`فصل پرتکرار و سوال‌خیز (⭐⭐) در دفترچه‌های سراسری`);
        } else {
          examBudgetingScore += 14;
        }

        // Questions frequency bonus from actual question budgeting
        if (chapter.averageQuestions.includes('۳') || chapter.averageQuestions.includes('۴')) {
          examBudgetingScore += 25;
          reasons.push(`بودجه‌بندی تست مستقیم: ${chapter.averageQuestions}`);
        } else if (chapter.averageQuestions.includes('۲')) {
          examBudgetingScore += 16;
          reasons.push(`تعداد تست سالانه در کنکور: ${chapter.averageQuestions}`);
        } else {
          examBudgetingScore += 8;
        }

        // Ministry of Health specific bonus
        if (examTarget === 'health' || examTarget === 'both') {
          if (chapter.targetExam === 'health' || (chapter.healthFrequency && chapter.healthFrequency.length > 5)) {
            examBudgetingScore += 20;
            reasons.push(`تأکید ویژه در بودجه‌بندی وزارت بهداشت: ${chapter.healthFrequency || 'منبع اصلی سنجش پزشکی'}`);
          }
        }

        // Book priority
        if (book.priority === 'اصلی و ضروری') {
          examBudgetingScore += 15;
        }

        score = examBudgetingScore;

        // 2. User Mastery Status & Deficit (وضعیت تسلط کاربر - فصولی که تسلط پایین‌تری دارند)
        let urgencyType: RecommendationItem['urgencyType'] = 'high_yield_untouched';
        let priorityLabel: RecommendationItem['priorityLabel'] = 'اولویت طلایی';
        let masteryLevelLabel: RecommendationItem['masteryLevelLabel'] = 'شروع‌نشده';

        if (isMastered) {
          // Mastered chapter: drop priority so low-mastery chapters take precedence
          score -= 200;
          urgencyType = 'spaced_review';
          priorityLabel = 'مرور دوره‌ای';
          masteryLevelLabel = 'مسلط و تکمیل‌شده';
        } else if (userData.status === 'in_progress') {
          // In progress: high momentum, low-to-medium mastery needing completion
          score += 65;
          urgencyType = 'finish_started';
          priorityLabel = 'بسیار فوری';
          masteryLevelLabel = progressPercent >= 60 ? 'تسلط متوسط' : 'تسلط مقدماتی';
          reasons.push(`وضعیت تسلط: نیمه‌تمام (${progressPercent}٪) - بستن این فصل جهش فوری در تراز ایجاد می‌کند`);
        } else if (userData.status === 'summarized') {
          // Summarized: medium mastery, test deficit
          score += 45;
          urgencyType = 'needs_testing';
          priorityLabel = 'تکمیل تسلط';
          masteryLevelLabel = 'تسلط متوسط';
          reasons.push(`خلاصه‌نویسی انجام شده؛ جهت تسلط کامل نیاز به تست‌های آموزشی و سنجشی است`);
        } else {
          // not_started: lowest mastery, huge opportunity gap on high-yield chapters
          score += 55;
          urgencyType = 'high_yield_untouched';
          priorityLabel = chapter.importance === 'critical' ? 'اولویت طلایی' : 'تکمیل تسلط';
          masteryLevelLabel = 'شروع‌نشده';
          reasons.push(`سطح تسلط: هنوز شروع نشده است (پتانسیل دست‌نخورده برای افزایش درصد با ${chapter.studyEstimatedHours} ساعت مطالعه)`);
        }

        // Checklist gaps (deficit rewards)
        if (!userData.readBookText && !isMastered) {
          score += 10;
        }
        if (!userData.doneTrainingTests && !isMastered) {
          score += 15;
        }
        if (!userData.doneReviewTests && !isMastered) {
          score += 12;
        }

        // Contextual boost if candidate is currently browsing this subject
        if (currentSubjectId && currentSubjectId === subject.id) {
          score += 15;
        }

        const budgetingSummary = `ضریب ${effectiveCoeff} | ${chapter.averageQuestions}`;

        candidates.push({
          chapter,
          book,
          subject,
          score,
          priorityLabel,
          reasons,
          userStatus: userData.status,
          completedStepsCount: steps,
          progressPercent,
          effectiveCoefficient: effectiveCoeff,
          urgencyType,
          examBudgetingScore,
          masteryLevelLabel,
          budgetingSummary,
        });
      });
    });
  });

  // Sort descending by calculated score
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit);
}

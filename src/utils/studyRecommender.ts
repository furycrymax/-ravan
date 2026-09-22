import { Subject, Book, Chapter, UserProgressMap, ExamTarget, ChapterUserData } from '../types';

export interface RecommendedChapterItem {
  chapter: Chapter;
  book: Book;
  subject: Subject;
  score: number;
  urgency: 'critical' | 'high' | 'medium';
  actionType: 'start' | 'resume' | 'test' | 'review';
  actionLabel: string;
  reason: string;
  focusTip: string;
  questionWeight: string;
  effectiveCoefficient: number;
  completionRate: number; // 0 to 100 based on checkboxes + status
}

export interface DailyRecommendationResult {
  primary: RecommendedChapterItem | null;
  alternatives: RecommendedChapterItem[];
  stats: {
    totalTargetChapters: number;
    unmasteredCriticalCount: number;
    inProgressCount: number;
    masteredCount: number;
  };
}

/**
 * Calculates how complete a chapter is for the user (0 to 100%)
 */
export function calculateChapterMastery(userData?: ChapterUserData): number {
  if (!userData) return 0;
  if (userData.status === 'mastered') return 100;

  let score = 0;
  if (userData.status === 'in_progress') score += 25;
  if (userData.status === 'summarized') score += 50;

  if (userData.readBookText) score += 20;
  if (userData.doneTrainingTests) score += 15;
  if (userData.doneReviewTests) score += 15;

  return Math.min(score, 90); // Cap non-mastered at 90%
}

/**
 * Parses question frequency text to extract an estimated numerical question weight
 */
function extractQuestionWeight(chapter: Chapter, isHealthExam: boolean): number {
  const avgQ = chapter.averageQuestions || '';
  const healthFreq = chapter.healthFrequency || '';
  let weight = 2; // default fallback

  if (avgQ.includes('۳ تا ۴') || avgQ.includes('۳ الی ۴') || avgQ.includes('۴ سوال') || avgQ.includes('۳ سوال مستقیم')) {
    weight = 4;
  } else if (avgQ.includes('۲ تا ۳') || avgQ.includes('۲ الی ۳') || avgQ.includes('۲ سوال')) {
    weight = 3;
  } else if (avgQ.includes('۱ تا ۲') || avgQ.includes('۱ سوال')) {
    weight = 1.5;
  }

  if (isHealthExam && healthFreq.includes('قطعی')) {
    weight += 1.5;
  }

  return weight;
}

/**
 * Smart study recommendation engine:
 * Evaluates past exam question budgeting, subject coefficients, book priorities,
 * and user study status to determine the optimal next chapter to study today.
 */
export function getDailyStudyRecommendation(
  subjects: Subject[],
  userProgress: UserProgressMap,
  examTarget: ExamTarget = 'both',
  currentSubjectFilter?: string
): DailyRecommendationResult {
  const isHealth = examTarget === 'health';
  const isScience = examTarget === 'science';

  const scoredItems: RecommendedChapterItem[] = [];
  let unmasteredCriticalCount = 0;
  let inProgressCount = 0;
  let masteredCount = 0;
  let totalTargetChapters = 0;

  for (const subject of subjects) {
    // Check if subject is relevant to the candidate's target
    if (examTarget !== 'all' && examTarget !== 'both') {
      if (subject.targetExam !== 'both' && subject.targetExam !== examTarget) {
        continue;
      }
    }

    // Effective coefficient based on exam target
    const effectiveCoefficient = isHealth
      ? (subject.healthCoefficient ?? subject.coefficient)
      : subject.coefficient;

    for (const book of subject.books) {
      if (examTarget !== 'all' && examTarget !== 'both') {
        if (book.targetExam && book.targetExam !== 'both' && book.targetExam !== examTarget) {
          continue;
        }
      }

      const bookPriorityMultiplier = book.priority === 'اصلی و ضروری' ? 1.35 : 1.0;

      for (const chapter of book.chapters) {
        if (examTarget !== 'all' && examTarget !== 'both') {
          if (chapter.targetExam && chapter.targetExam !== 'both' && chapter.targetExam !== examTarget) {
            continue;
          }
        }

        totalTargetChapters++;
        const userData = userProgress[chapter.id];
        const status = userData?.status || 'not_started';
        const masteryPercentage = calculateChapterMastery(userData);

        if (status === 'mastered') {
          masteredCount++;
        } else {
          if (chapter.importance === 'critical') unmasteredCriticalCount++;
          if (status === 'in_progress') inProgressCount++;
        }

        // 1. BASE EXAM BUDGETING SCORE (بودجه‌بندی آزمون‌های قبلی و ضرایب)
        const qWeight = extractQuestionWeight(chapter, isHealth);
        let budgetingScore = effectiveCoefficient * 25 + qWeight * 20;

        if (chapter.importance === 'critical') budgetingScore += 50;
        else if (chapter.importance === 'high') budgetingScore += 30;
        else budgetingScore += 12;

        budgetingScore *= bookPriorityMultiplier;

        // 2. USER MASTERY AND STATUS MULTIPLIER (وضعیت تسلط و نیاز به مطالعه)
        let studyNeedMultiplier = 1.0;
        let actionType: 'start' | 'resume' | 'test' | 'review' = 'start';
        let actionLabel = 'شروع مطالعه این فصل';
        let reason = '';

        if (status === 'mastered') {
          // Already mastered: severely deprioritize unless user has mastered everything
          studyNeedMultiplier = 0.05;
          actionType = 'review';
          actionLabel = 'مرور دوره‌ای تسلط';
          reason = `تسلط بر این فصل قبلاً کسب شده است. جهت تثبیت در حافظه بلندمدت توصیه می‌شود.`;
        } else if (status === 'in_progress') {
          // High momentum: finish what you started!
          studyNeedMultiplier = 1.55;
          actionType = 'resume';
          actionLabel = 'ادامه و تکمیل فصل';
          reason = `شما مطالعه این فصل پرتست را آغاز کرده‌اید (${masteryPercentage}٪ پیشرفت). اتمام این فصل با ضریب ${effectiveCoefficient} بیشترین بازدهی را دارد.`;
        } else if (status === 'summarized') {
          studyNeedMultiplier = 1.35;
          actionType = 'test';
          actionLabel = 'شروع تست‌زنی تشخیصی';
          reason = `خلاصه‌نویسی این فصل انجام شده است. اکنون زمان تثبیت با تست‌های آموزشی و کنکورهای اخیر است.`;
        } else {
          // not_started
          studyNeedMultiplier = chapter.importance === 'critical' ? 1.45 : 1.2;
          actionType = 'start';
          actionLabel = 'شروع مطالعه پربازده';
          reason = `این فصل از مهم‌ترین فصول پرتکرار کنکور با بودجه‌بندی میانگین ${chapter.averageQuestions} است و هنوز شروع نشده است.`;
        }

        // Test deficit bonus
        if (userData && !userData.doneTrainingTests && status !== 'mastered') {
          budgetingScore += 15;
        }

        // Subject filter priority bias if user currently has that tab open
        if (currentSubjectFilter && currentSubjectFilter !== 'all' && subject.id === currentSubjectFilter) {
          budgetingScore += 10;
        }

        const finalScore = Math.round(budgetingScore * studyNeedMultiplier);

        const focusTip = chapter.examTips
          ? chapter.examTips
          : chapter.keyTopics?.length
          ? `نکات کلیدی: ${chapter.keyTopics.slice(0, 2).join('، ')}`
          : `کتاب مرجع: ${book.title}`;

        scoredItems.push({
          chapter,
          book,
          subject,
          score: finalScore,
          urgency: chapter.importance,
          actionType,
          actionLabel,
          reason,
          focusTip,
          questionWeight: chapter.averageQuestions || '۱ تا ۲ تست مستقیم',
          effectiveCoefficient,
          completionRate: masteryPercentage,
        });
      }
    }
  }

  // Sort descending by score
  scoredItems.sort((a, b) => b.score - a.score);

  const primary = scoredItems[0] || null;

  // Find up to 2 high-scoring alternatives from distinct subjects or books for diversity
  const alternatives: RecommendedChapterItem[] = [];
  if (primary) {
    for (let i = 1; i < scoredItems.length && alternatives.length < 2; i++) {
      const candidate = scoredItems[i];
      // Prefer different subject or different book to offer study variety
      const alreadyHasSubject = candidate.subject.id === primary.subject.id && candidate.book.id === primary.book.id;
      if (!alreadyHasSubject || alternatives.length === 1) {
        alternatives.push(candidate);
      }
    }
    // Fallback if not found distinct
    if (alternatives.length < 2 && scoredItems.length > 2) {
      for (const item of scoredItems.slice(1, 4)) {
        if (item.chapter.id !== primary.chapter.id && !alternatives.some((a) => a.chapter.id === item.chapter.id)) {
          alternatives.push(item);
          if (alternatives.length >= 2) break;
        }
      }
    }
  }

  return {
    primary,
    alternatives,
    stats: {
      totalTargetChapters,
      unmasteredCriticalCount,
      inProgressCount,
      masteredCount,
    },
  };
}

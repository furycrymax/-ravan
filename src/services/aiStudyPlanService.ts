import { AIStudyPlan } from '../types';
import { generateLocalScientificStudyPlan } from '../utils/aiStudyPlanGenerator';

export interface GenerateAIStudyPlanParams {
  selectedBookIds: string[];
  dailyHours: number;
  targetExam: 'both' | 'health' | 'science';
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  selectedBookTitles?: string[];
}

export async function requestAIStudyPlan(params: GenerateAIStudyPlanParams): Promise<AIStudyPlan> {
  // If user is currently offline, generate immediately via local scientific engine
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log('[AI Study Plan] Offline mode detected, using local scientific engine.');
    return generateLocalScientificStudyPlan(params);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // 40-second timeout for thorough AI generation

    const response = await fetch('/api/ai-study-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Study Plan API] Responded with status ${response.status}, falling back to local engine.`);
      return generateLocalScientificStudyPlan(params);
    }

    const data = await response.json();
    if (data && data.weeklySchedule && Array.isArray(data.weeklySchedule)) {
      return data as AIStudyPlan;
    }

    return generateLocalScientificStudyPlan(params);
  } catch (err) {
    console.warn('[AI Study Plan] Network or timeout error, utilizing local scientific generator:', err);
    return generateLocalScientificStudyPlan(params);
  }
}

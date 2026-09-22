export interface SearchGroundingSource {
  title: string;
  uri: string;
}

export interface SearchGroundingResult {
  text: string;
  sources: SearchGroundingSource[];
  searchQueries?: string[];
  mode?: 'live_ai' | 'curated_fallback';
}

export async function queryGoogleSearchGrounding(params: {
  query: string;
  topic?: string;
  chapterTitle?: string;
}): Promise<SearchGroundingResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error(
      "دستگاه شما در حالت آفلاین قرار دارد. استعلام زنده و تحلیل هوش مصنوعی نیازمند اتصال فعال به شبکه اینترنت است."
    );
  }

  let response: Response;
  try {
    response = await fetch("/api/search-grounding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
  } catch {
    throw new Error(
      "عدم برقراری ارتباط با سرویس هوش مصنوعی. لطفاً اتصال اینترنت خود را بررسی نمایید."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = errorData.error;
    if (typeof msg === 'string' && msg.startsWith('{')) {
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        }
      } catch {
        // keep msg
      }
    }
    throw new Error(
      msg || `خطا در ارتباط با سرور هوش مصنوعی (کد ${response.status})`
    );
  }

  const data = await response.json();
  return {
    text: data.text || "",
    sources: data.sources || [],
    searchQueries: data.searchQueries || [],
    mode: data.mode,
  };
}

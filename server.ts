import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { generateLocalScientificStudyPlan } from "./src/utils/aiStudyPlanGenerator";

dotenv.config();

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "کلید دسترسی هوش مصنوعی (GEMINI_API_KEY) در سرور یافت نشد. لطفاً در پنل تنظیمات برنامه (Settings > Secrets) کلید خود را اضافه کنید."
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback generator when quota 429 or network restrictions occur
function generateClinicalFallbackResponse(
  query: string,
  topic?: string,
  chapterTitle?: string
): { text: string; sources: Array<{ title: string; uri: string }>; searchQueries: string[] } {
  const cleanedTopic = topic || chapterTitle || "مباحث تخصصی روانشناسی بالینی";
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " کنکور ارشد روانشناسی بالینی کاپلان DSM-5")}`;
  
  const text = `### 📚 تحلیل تخصصی و مستند بر اساس دستنامه کاپلان-سادوک و DSM-5-TR:

**موضوع مورد بررسی:** ${cleanedTopic}
**پرسش داوطلب:** «${query}»

---

#### ۱. جایگاه و اهمیت در آزمون‌های ارشد بالینی (بهداشت و علوم):
- مبحث فوق یکی از کانون‌های پربسامد و پرتکرار در سوالات روانشناسی بالینی و روانشناسی مرضی است.
- در **کنکور وزارت بهداشت (سنجش پزشکی)**، طراحان آزمون روی تفکیک اختلالات همپوشان، معیارهای قطعی ملاک‌های تشخیصی (A, B, C...) و دارودرمانی خط اول تکیه دارند.
- در **کنکور وزارت علوم (کد ۱۱۳۳)**، تمرکز سوالات عمدتاً بر تبیین‌های نظری (روان‌پویشی، شناختی-رفتاری، انسان‌گرایانه) و تمایز رویکردهای درمانی است.

#### ۲. ملاک‌های تشخیصی و تغییرات کلیدی در DSM-5-TR:
- تاکید بر تمایزهای افتراقی (Differential Diagnosis) و ملاک‌های زمانی (Duration criteria).
- توجه به شاخص‌های شدت (Severity Specifiers) و حذف سیستم پنج‌محوری به نفع طبقه‌بندی بدون محور با مقیاس‌های ابعادی.
- در اختلالات خلقی و اضطرابی، تفکیک حملات پانیک به عنوان ویژگی مشترک و ملاک‌های مربوط به سوگ طولانی‌مدت (Prolonged Grief Disorder) در آخرین به‌روزرسانی DSM-5-TR اضافه شده است.

#### ۳. دام‌های تستی طراحان (Exam Traps):
- **تله گزینه‌های تعمیمی:** گزینه‌های حاوی کلمات «همواره»، «تنها علت»، یا «بدون استثنا» معمولاً گمراه‌کننده‌اند.
- **تله پایایی و روایی:** مصاحبه‌های ساختاریافته پایایی را بالا می‌برند اما انعطاف تشخیصی مصاحبه بدون ساختار را ندارند.
- **تله نشانگان همپوشان:** تشخیص افتراقی بین نشانگان اسکیزوافکتیو و اختلال دوقطبی دارای ویژگی‌های سایکوتیک مستلزم بررسی وجود علائم روان‌پریشی در غیاب اختلال خلق به مدت حداقل ۲ هفته است.

---
💡 *توجه: با توجه به ترافیک بالای لحظه‌ای سرویس هوش مصنوعی و محدودیت سهمیه Google API، این پاسخ تحلیلی از پایگاه دانش جامع و مستندات استاندارد کنکوری بارگذاری گردید. می‌توانید برای مشاهده نتایج زنده وب، از پیوندهای زیر نیز استفاده فرمایید.*`;

  return {
    text,
    sources: [
      {
        title: `جستجوی زنده در گوگل: «${query}»`,
        uri: searchUrl,
      },
      {
        title: "انجمن روانپزشکی آمریکا (APA) - مستندات DSM-5-TR",
        uri: "https://www.psychiatry.org/psychiatrists/practice/dsm",
      },
      {
        title: "مرکز سنجش آموزش پزشکی وزارت بهداشت (منابع و کلید آزمون‌ها)",
        uri: "https://sanjeshp.ir",
      },
      {
        title: "سازمان سنجش آموزش کشور (کنکور کارشناسی ارشد علوم)",
        uri: "https://sanjesh.org",
      },
    ],
    searchQueries: [
      `${query} کاپلان و سادوک`,
      `${query} ملاک‌های DSM-5-TR`,
      `تست‌های کنکور ارشد روانشناسی بالینی ${query}`,
    ],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Google Search Grounding with gemini-3.8-flash
  app.post("/api/search-grounding", async (req: Request, res: Response) => {
    try {
      const { query, topic, chapterTitle } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Search query is required." });
      }

      let contextPrompt = `پرسش داوطلب کنکور ارشد روانشناسی بالینی: "${query}"\n`;
      if (chapterTitle) {
        contextPrompt += `موضوع/فصل مرتبط: "${chapterTitle}"\n`;
      }
      if (topic) {
        contextPrompt += `سرفصل تخصصی: "${topic}"\n`;
      }
      contextPrompt += `\nلطفاً با استفاده از داده‌های به‌روز و جستجوی آنلاین، دقیق‌ترین و مستندترین پاسخ را در چارچوب آخرین ویراست کاپلان و سادوک و DSM-5-TR و تغییرات کنکوری اخیر ارائه دهید. پاسخ باید ساختاریافته، شفاف و شامل نکات تستی و بالینی باشد.`;

      try {
        const ai = getGenAI();

        // 8-second timeout for the live API call to keep UI fast and prevent long hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API call timed out")), 8000)
        );

        const callSearchModel = async () => {
          try {
            return await ai.models.generateContent({
              model: "gemini-3.8-flash",
              contents: contextPrompt,
              config: {
                systemInstruction:
                  "شما استاد و مشاور علمی ارشد روانشناسی بالینی هستید. برای پاسخ از اطلاعات به‌روز وب با استفاده از ابزار جستجوی گوگل استفاده کنید. پاسخ‌هایتان موثق، تحلیلی، متمرکز بر نکات تست‌خیز کنکورهای وزارت بهداشت و علوم، و کاملاً به زبان فارسی باشد.",
                tools: [{ googleSearch: {} }],
              },
            });
          } catch (err: any) {
            const errStr = String(err?.message || err);
            if (errStr.includes("503") || errStr.includes("high demand") || errStr.includes("UNAVAILABLE") || errStr.includes("429")) {
              console.warn("Search Grounding primary model 503, retrying with gemini-3.1-flash-lite...");
              return await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: contextPrompt,
                config: {
                  systemInstruction:
                    "شما استاد و مشاور علمی ارشد روانشناسی بالینی هستید. برای پاسخ از اطلاعات به‌روز وب با استفاده از ابزار جستجوی گوگل استفاده کنید. پاسخ‌هایتان موثق، تحلیلی، متمرکز بر نکات تست‌خیز کنکورهای وزارت بهداشت و علوم، و کاملاً به زبان فارسی باشد.",
                  tools: [{ googleSearch: {} }],
                },
              });
            }
            throw err;
          }
        };

        // Race between live API and timeout
        const response: any = await Promise.race([callSearchModel(), timeoutPromise]);
        const text = response.text || "پاسخی از مدل دریافت نشد.";

        // Extract search grounding sources
        const rawChunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        interface GroundingSource {
          title: string;
          uri: string;
        }

        const sources: GroundingSource[] = [];
        for (const chunk of rawChunks as Array<{ web?: { title?: string; uri?: string } }>) {
          if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || "منبع وب",
              uri: chunk.web.uri,
            });
          }
        }

        // Add a direct Google search helper link if no sources were returned
        if (sources.length === 0) {
          sources.push({
            title: `جستجوی زنده در گوگل برای «${query}»`,
            uri: `https://www.google.com/search?q=${encodeURIComponent(query + " کنکور ارشد روانشناسی بالینی")}`,
          });
        }

        const searchQueries =
          response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [
            `${query} کاپلان سادوک`,
            `${query} DSM-5-TR`,
          ];

        return res.json({
          text,
          sources,
          searchQueries,
          mode: "live_ai",
        });
      } catch (geminiError: unknown) {
        console.warn(
          "Gemini Search Grounding call completed with fallback (quota or timeout):",
          geminiError instanceof Error ? geminiError.message : geminiError
        );
        
        // Curated, robust fallback response ensures the user is never left with a broken screen
        const fallback = generateClinicalFallbackResponse(query, topic, chapterTitle);
        return res.json({
          text: fallback.text,
          sources: fallback.sources,
          searchQueries: fallback.searchQueries,
          mode: "curated_fallback",
        });
      }
    } catch (err: unknown) {
      console.error("Gemini Search Grounding Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "خطا در پردازش هوش مصنوعی با جستجوی وب";
      return res.status(500).json({ error: errorMessage });
    }
  });

  // AI Study Plan Generator with Gemini 3.8 Flash
  app.post("/api/ai-study-plan", async (req: Request, res: Response) => {
    try {
      const { selectedBookIds, dailyHours, targetExam, studentLevel, selectedBookTitles } = req.body;
      const safeHours = Number(dailyHours) || 6;
      const safeExam: 'both' | 'health' | 'science' = targetExam || "both";
      const safeLevel: 'beginner' | 'intermediate' | 'advanced' = studentLevel || "intermediate";
      const bookNames = Array.isArray(selectedBookTitles) && selectedBookTitles.length > 0
        ? selectedBookTitles.join("، ")
        : "کتب برگزیده کنکور ارشد روانشناسی بالینی (کاپلان، فیرس، برک، دلاور و زبان)";

      const prompt = `شما مشاور ارشد و استاد تخصصی برنامه‌ریزی کنکور ارشد روانشناسی بالینی (وزارت بهداشت و علوم ۱۴۰۵) هستید.
لطفاً بر اساس ورودی‌های زیر یک برنامه مطالعاتی علمی و مدون تولید کنید:
- کتب و منابع هدف: ${bookNames}
- ساعت مطالعه مجاز در روز: ${safeHours} ساعت
- آزمون هدف: ${safeExam === 'health' ? 'صرفاً وزارت بهداشت' : safeExam === 'science' ? 'صرفاً وزارت علوم' : 'هر دو آزمون'}
- سطح علمی داوطلب: ${safeLevel === 'beginner' ? 'شروع از صفر' : safeLevel === 'intermediate' ? 'متوسط و مرور' : 'پیشرفته و جمع‌بندی'}

قوانین الزامی و علمی در تولید برنامه:
۱. در هر روز دقیقاً ۲ درس تعبیه شود (قانون ۲ درس در روز جهت جلوگیری از اشباع ذهنی و بار شناختی).
۲. تلفیق هوشمندانه اهمیت و جذابیت: در هر روز، یک درس پرضریب/سنگین (مانند روانشناسی بالینی فیرس یا کاپلان) با یک درس مهارتی/جذاب‌تر (مانند رشد لورا برک، آمار دلاور یا ریدینگ زبان) جفت شود.
۳. انطباق با منطق کنکورهای ۱۴۰۰ تا ۱۴۰۴: اولویت فصول Critical و پرسوال (اسکیزوفرنی، اختلالات خلقی و اضطرابی، مکاتب درمانی شناختی و سنجش‌های بالینی).
۴. پنج‌شنبه‌ها مرور فاصله‌دار و جمعه‌ها آزمون‌های خودسنجی دوره‌ای و بازیابی انرژی.

پاسخ را دقیقاً در قالب فرمت JSON بازگردانید:
{
  "id": "plan-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "targetExam": "${safeExam}",
  "dailyHours": ${safeHours},
  "studentLevel": "${safeLevel}",
  "selectedBookIds": ${JSON.stringify(selectedBookIds || [])},
  "totalSelectedChapters": 75,
  "totalEstimatedHours": 320,
  "overviewAdvice": "توضیح تحلیلی و راهبردی برنامه...",
  "scientificMethodologyNote": "دلایل علمی رعایت قانون ۲ درس در روز و تعادل شناختی...",
  "examLogicInsights": "تحلیل روند سوالات کنکورهای ۱۴۰۰ تا ۱۴۰۴...",
  "weeklySchedule": [
    {
      "dayNumber": 1,
      "dayName": "شنبه",
      "totalHours": ${safeHours},
      "dailyAdvice": "...",
      "primaryTask": {
        "subjectId": "clinical",
        "subjectName": "روان‌شناسی بالینی",
        "bookTitle": "...",
        "suggestedChapters": "...",
        "allocatedHours": ${Math.round(safeHours * 0.58 * 10) / 10},
        "studyType": "concept_reading",
        "focusTip": "..."
      },
      "secondaryTask": {
        "subjectId": "developmental",
        "subjectName": "روان‌شناسی رشد",
        "bookTitle": "...",
        "suggestedChapters": "...",
        "allocatedHours": ${Math.round(safeHours * 0.42 * 10) / 10},
        "studyType": "question_practice",
        "focusTip": "..."
      }
    }
  ],
  "monthlyMilestones": [
    {
      "monthNumber": 1,
      "monthName": "ماه اول (استقرار و تسلط پایه)",
      "targetChaptersCount": 10,
      "totalStudyHours": ${Math.round(safeHours * 26)},
      "keyGoals": ["هدف ۱", "هدف ۲"],
      "expectedMastery": "...",
      "reviewCheckpoint": "..."
    }
  ],
  "roadmapPhases": [
    {
      "phaseId": "phase-1",
      "phaseTitle": "فاز اول: تسلط مفهومی و یادگیری فعال",
      "durationLabel": "ماه‌های ۱ تا ۳",
      "targetTimeline": "...",
      "methodology": "...",
      "weeklyHoursRecommended": ${Math.round(safeHours * 6)},
      "keyDeliverables": ["مورد ۱", "مورد ۲"],
      "testStrategy": "..."
    }
  ]
}`;

      try {
        const ai = getGenAI();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini AI study plan call timed out")), 35000)
        );

        // Try primary model first, fallback to gemini-3.1-flash-lite if 503 high demand or quota
        const callModelWithFallback = async () => {
          try {
            return await ai.models.generateContent({
              model: "gemini-3.8-flash",
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                temperature: 0.3,
                systemInstruction:
                  "شما مشاور ارشد و استاد روانشناسی یادگیری کنکور ارشد روانشناسی بالینی هستید. خروجی فقط و فقط شامل آبجکت JSON معتبر و بدون هیچ متن اضافی خارج از ساختار باشد.",
              },
            });
          } catch (firstErr: any) {
            const errStr = String(firstErr?.message || firstErr);
            if (errStr.includes("503") || errStr.includes("high demand") || errStr.includes("UNAVAILABLE") || errStr.includes("429")) {
              console.warn("Primary model high demand (503), retrying with gemini-3.1-flash-lite...");
              return await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
                config: {
                  responseMimeType: "application/json",
                  temperature: 0.3,
                  systemInstruction:
                    "شما مشاور ارشد و استاد روانشناسی یادگیری کنکور ارشد روانشناسی بالینی هستید. خروجی فقط و فقط شامل آبجکت JSON معتبر و بدون هیچ متن اضافی خارج از ساختار باشد.",
                },
              });
            }
            throw firstErr;
          }
        };

        const response: any = await Promise.race([callModelWithFallback(), timeoutPromise]);
        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && parsed.weeklySchedule && parsed.weeklySchedule.length > 0) {
            return res.json(parsed);
          }
        }
      } catch (geminiError: any) {
        console.warn(
          "Gemini Study Plan call fallback triggered (using local scientific generator):",
          geminiError?.message || geminiError
        );
      }

      // High-craft local scientific fallback
      const fallbackPlan = generateLocalScientificStudyPlan({
        selectedBookIds: selectedBookIds || [],
        dailyHours: safeHours,
        targetExam: safeExam,
        studentLevel: safeLevel,
      });
      return res.json(fallbackPlan);
    } catch (err: unknown) {
      console.error("AI Study Plan Endpoint Error:", err);
      const fallbackPlan = generateLocalScientificStudyPlan({
        selectedBookIds: req.body?.selectedBookIds || [],
        dailyHours: Number(req.body?.dailyHours) || 6,
        targetExam: req.body?.targetExam || "both",
        studentLevel: req.body?.studentLevel || "intermediate",
      });
      return res.json(fallbackPlan);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("FATAL: Failed to start server:", err);
  process.exit(1);
});

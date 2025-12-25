import { getTradingAnalysisPrompt } from "../constants";
import { AnalysisResponse } from "../types";
import { Language } from "../i18n";

export const analyzeChart = async (
  file: File,
  lang: Language
): Promise<AnalysisResponse> => {
  // 1️⃣ Convert file → base64 (sans metadata)
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });

  const mimeType = file.type || "image/png";

  // 2️⃣ Time context (important for TradeVision)
  const now = new Date();
  const currentTimeStr = now
    .toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");

  // 3️⃣ Build Gemini-compatible payload (generateContent)
  const payload = {
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: getTradingAnalysisPrompt(lang, currentTimeStr) },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  };

  try {
    // 4️⃣ Call proxy (NO API KEY HERE)
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 5️⃣ Safe JSON handling (évite crash frontend)
    const rawText = await res.text();
    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Invalid JSON response from Gemini proxy.");
    }

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Proxy error (HTTP ${res.status})`);
    }

    const text: string | undefined = data.text;
    if (!text) {
      throw new Error("Empty analysis text from Gemini proxy.");
    }

    // 6️⃣ Clean Markdown fences if Gemini wrapped JSON
    const cleanText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // 7️⃣ Parse final analysis JSON
    try {
      return JSON.parse(cleanText) as AnalysisResponse;
    } catch (parseError) {
      console.error("Analysis JSON parse error. Raw output:", cleanText);
      throw new Error("Failed to parse analysis results.");
    }

  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    throw error;
  }
};

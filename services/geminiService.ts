import { getTradingAnalysisPrompt } from '../constants';
import { AnalysisResponse } from '../types';
import { Language } from '../i18n';

export const analyzeChart = async (file: File, lang: Language): Promise<AnalysisResponse> => {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });

  const mimeType = file.type || 'image/png';

  const now = new Date();
  const currentTimeStr = now.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            { text: getTradingAnalysisPrompt(lang, currentTimeStr) },
            { inlineData: { mimeType, data: base64Data } }
          ]
        },
        config: {
          temperature: 0.1
        }
      })
    }).then((r) => r.json());

    let text: string = response?.text;
    if (!text) throw new Error("No response text from proxy.");

    const cleanText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      return JSON.parse(cleanText) as AnalysisResponse;
    } catch (parseError) {
      console.error("JSON Parsing Error. Raw text:", cleanText);
      throw new Error("Failed to parse analysis results.");
    }

  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    throw error;
  }
};

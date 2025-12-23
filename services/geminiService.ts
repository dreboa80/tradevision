
import { GoogleGenAI } from "@google/genai";
import { getTradingAnalysisPrompt } from '../constants';
import { AnalysisResponse } from '../types';
import { Language } from '../i18n';

export const analyzeChart = async (file: File, lang: Language): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });

  const mimeType = file.type;
  
  // Capturer l'heure exacte de l'appareil de l'utilisateur
  const now = new Date();
  const currentTimeStr = now.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
            {
                text: getTradingAnalysisPrompt(lang, currentTimeStr)
            },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            }
        ]
      },
      config: {
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text;
    
    if (!text) {
        throw new Error("No response text from Gemini.");
    }

    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    try {
        const jsonResponse = JSON.parse(cleanText) as AnalysisResponse;
        return jsonResponse;
    } catch (parseError) {
        console.error("Failed to parse JSON:", cleanText);
        throw new Error("Failed to parse analysis results.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

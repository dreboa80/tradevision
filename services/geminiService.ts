import { GoogleGenAI } from "@google/genai";
import { getTradingAnalysisPrompt } from '../constants';
import { AnalysisResponse } from '../types';
import { Language } from '../i18n';

export const analyzeChart = async (file: File, lang: Language): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API key manquante. Configure GEMINI_API_KEY (Vercel) / GEMINI_API_KEY (local) puis rebuild.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim();

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });

  const mimeType = file.type;

  try {
    // Default model can be overridden via GEMINI_MODEL
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
            {
                text: getTradingAnalysisPrompt(lang)
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
        temperature: 0.2, // Low temperature for more deterministic/analytical output
      }
    });

    const text = response.text;
    
    if (!text) {
        throw new Error("No response text from Gemini.");
    }

    // Clean up potential markdown formatting
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Sometimes the model might add extra text before or after the JSON, try to find the JSON block
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
        throw new Error("Failed to parse analysis results. The AI might have returned an invalid format.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && (error.message.includes('404') || error.message.includes('NOT_FOUND'))) {
        throw new Error("Model not found (404). The 'gemini-2.0-flash-exp' model might not be available in your region or project yet.");
    }
    throw error;
  }
};


import { GoogleGenAI } from "@google/genai";
import { AnalysisResponse } from '../types';
import { Language } from '../i18n';
import { getTradingAnalysisPrompt } from '../constants';

export const analyzeChart = async (file: File, lang: Language): Promise<AnalysisResponse> => {
  // 1. Conversion de l'image en Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

  // 2. Préparation de l'heure locale
  const now = new Date();
  const currentTimeStr = now.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).replace(',', '');

  try {
    // 3. Initialisation directe du SDK Gemini (utilise la clé injectée process.env.API_KEY)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Utilisation de gemini-3-flash-preview : ultra-rapide et économique
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: getTradingAnalysisPrompt(lang, currentTimeStr) },
          { inlineData: { mimeType: file.type, data: base64Data } }
        ]
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        // Désactivation du thinking pour une réponse éclair
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Le moteur n'a retourné aucune donnée.");

    // Nettoyage du JSON au cas où des backticks markdown subsistent
    let cleanJson = text.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*|```$/g, '').trim();
    }

    return JSON.parse(cleanJson) as AnalysisResponse;

  } catch (error: any) {
    console.error("Gemini Engine Error:", error);
    if (error.message?.includes('API_KEY')) {
      throw new Error("Erreur de configuration : Clé API manquante ou invalide.");
    }
    throw new Error(error.message || "Le moteur de vision est indisponible pour le moment.");
  }
};

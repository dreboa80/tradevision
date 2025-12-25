
import { GoogleGenAI } from "@google/genai";
import { AnalysisResponse } from '../types';
import { Language } from '../i18n';
import { getTradingAnalysisPrompt } from '../constants';

/**
 * Compresse l'image pour optimiser la vitesse de transfert et l'analyse.
 */
const compressImage = async (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1280;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Canvas context error"));
        
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve({
          base64: compressedDataUrl.split(',')[1],
          mimeType: 'image/jpeg'
        });
      };
      img.onerror = () => reject(new Error("Image load error"));
    };
    reader.onerror = () => reject(new Error("File read error"));
  });
};

export const analyzeChart = async (file: File, lang: Language): Promise<AnalysisResponse> => {
  console.log("🚀 Initialisation de l'analyse directe...");
  
  try {
    // 1. Compression de l'image
    const { base64, mimeType } = await compressImage(file);
    console.log("✅ Image optimisée.");

    // 2. Préparation du prompt
    const now = new Date();
    const currentTimeStr = now.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(',', '');
    const prompt = getTradingAnalysisPrompt(lang, currentTimeStr);

    // 3. Appel direct au SDK Gemini (bypass le proxy qui causait la boucle)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    console.log("🧠 Analyse en cours via Gemini 3 Flash...");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } }
        ]
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } // Réponse instantanée
      }
    });

    const text = response.text;
    if (!text) throw new Error("Le moteur n'a retourné aucune donnée.");

    // 4. Parsing sécurisé
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    const data = JSON.parse(cleanJson);
    
    console.log("✨ Analyse terminée avec succès.");
    return data as AnalysisResponse;

  } catch (error: any) {
    console.error("❌ Erreur critique d'analyse:", error);
    
    if (error.message?.includes("API_KEY")) {
      throw new Error("Clé API manquante ou invalide. Vérifiez votre configuration.");
    }
    
    throw new Error(error.message || "Le moteur d'analyse ne répond pas. Veuillez réessayer.");
  }
};

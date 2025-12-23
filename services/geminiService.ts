// src/services/geminiService.ts
// ⚠️ Ce fichier doit être exécuté UNIQUEMENT côté serveur (Vercel Serverless / API Route).
// Ne l'importe jamais dans ton frontend Vite/React, sinon tu risques d'exposer ta logique build.

import { GoogleGenAI } from "@google/genai";
import { getTradingAnalysisPrompt } from "../constants";
import { AnalysisResponse } from "../types";
import { Language } from "../i18n";

// ✅ Secret: stocké uniquement côté serveur (Vercel Environment Variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in server environment variables.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const formatYYYYMMDDHHmm = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const extractJsonObject = (raw: string) => {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Model output does not contain a valid JSON object.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

type AnalyzeChartInput = {
  imageBase64: string; // base64 PUR (sans "data:image/...;base64,")
  mimeType: string; // ex: "image/png"
  lang: Language;
  currentTime?: string; // optionnel; si absent, on prend l'heure serveur (format strict)
  model?: string; // optionnel
};

export const analyzeChartServer = async ({
  imageBase64,
  mimeType,
  lang,
  currentTime,
  model = "gemini-3-pro-preview",
}: AnalyzeChartInput): Promise<AnalysisResponse> => {
  if (!imageBase64) throw new Error("Missing imageBase64.");
  if (!mimeType) throw new Error("Missing mimeType.");

  // Format requis: "YYYY-MM-DD HH:mm"
  const currentTimeStr = currentTime?.trim() || formatYYYYMMDDHHmm(new Date());

  const prompt = getTradingAnalysisPrompt(lang, currentTimeStr);

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      temperature: 0.1,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response text from Gemini.");

  const jsonStr = extractJsonObject(text);

  try {
    return JSON.parse(jsonStr) as AnalysisResponse;
  } catch (e) {
    // Log minimal côté serveur (sans fuite de clé)
    console.error("Failed to parse JSON from Gemini:", jsonStr);
    throw new Error("Failed to parse analysis results.");
  }
};

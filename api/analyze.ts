
import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60, // Note: Limité à 10s sur Vercel Free malgré cette config
};

export default async function handler(req: any, res: any) {
  // Sécurité méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vérification de la configuration
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: "API_KEY non configurée sur le serveur." });
  }

  const { imageBase64, mimeType, lang, currentTime } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Données image absentes de la requête.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // On utilise Gemini 3 Flash pour sa rapidité (crucial pour le timeout de 10s)
    const prompt = `
# SYSTEM: MARKET VISION ENGINE (SMC/ICT)
Langue: ${lang === 'fr' ? 'Français' : 'English'}
Heure Actuelle: ${currentTime}

Analyse ce graphique et génère un JSON STRICT sans texte additionnel:
{
  "asset_class": "string",
  "market_bias": { "direction": "BUY|SELL|NEUTRAL", "confidence": 0-100 },
  "liquidity_zones": [{ "type": "BUYSIDE|SELLSIDE", "price_approx": "string", "strength": "low|medium|high", "reason": "string" }],
  "institutional_reading": { "market_intent": "string", "retail_traps": "string", "liquidity_objective": "string" },
  "setups": {
    "setup_A": { "type": "pullback", "risk_profile": "aggressive", "entry": "string", "stop_loss": "string", "tp1": "string", "tp2": "string", "tp3": "string", "reliability": 0-100, "risk_reward": "string", "expiry": "string", "logic": "string" },
    "setup_B": { "type": "confirmation", "risk_profile": "conservative", "entry": "string", "stop_loss": "string", "tp1": "string", "tp2": "string", "tp3": "string", "reliability": 0-100, "risk_reward": "string", "expiry": "string", "logic": "string" }
  },
  "invalidation_rules": { "bias_invalidation": "string", "setup_invalidation": "string" },
  "limitations": ["string"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: imageBase64 } }
        ]
      },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } // Désactivé pour réduire la latence
      }
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide");

    // Nettoyage pour garantir un JSON valide même si l'IA ajoute des balises
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    const analysis = JSON.parse(cleanJson);
    return res.status(200).json(analysis);

  } catch (error: any) {
    console.error("API Analyze Error:", error);
    
    // Retourne l'erreur au format JSON pour que le frontend puisse l'afficher
    return res.status(error.status || 500).json({ 
      error: "Analyse échouée", 
      details: error.message || "Erreur de traitement côté IA"
    });
  }
}

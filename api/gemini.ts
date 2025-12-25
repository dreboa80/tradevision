import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS / preflight safety (même si same-origin, ça évite surprises)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { model, contents, generationConfig } = body ?? {};

    if (!contents) {
      return res.status(400).json({ ok: false, error: "Missing 'contents' in body" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const gm = genAI.getGenerativeModel({ model: model || "gemini-2.5-flash" });

    const result = await gm.generateContent({
      contents,
      generationConfig,
    });

    const text = result.response.text();
    return res.status(200).json({ ok: true, text });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: "Gemini proxy error",
      details: e?.message || String(e),
    });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed", method: req.method });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Missing GEMINI_API_KEY env var" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { model, contents, generationConfig } = body ?? {};

    if (!Array.isArray(contents)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid payload: 'contents' must be an array",
        receivedType: typeof contents,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const gm = genAI.getGenerativeModel({ model: model || "gemini-2.5-flash" });

    const result = await gm.generateContent({ contents, generationConfig });

    return res.status(200).json({ ok: true, text: result.response.text() });
  } catch (e: any) {
    // IMPORTANT: on renvoie toujours un JSON même si ça crash
    return res.status(500).json({
      ok: false,
      error: "Gemini proxy crashed",
      details: e?.message || String(e),
    });
  }
}

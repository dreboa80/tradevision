import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function: POST /api/gemini
// Body: { model: string, contents: { parts: any[] }, config?: object }
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      return res.end(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: "MISSING_GEMINI_API_KEY" }));
    }

    // Vercel may give req.body as object (when JSON) or as string.
    let body: any = req.body;
    if (!body) {
      // Fallback: read raw body
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => resolve());
        req.on("error", (e: any) => reject(e));
      });
      const raw = Buffer.concat(chunks).toString("utf-8");
      body = raw ? JSON.parse(raw) : {};
    } else if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { model, contents, config } = body || {};
    if (!model || !contents?.parts || !Array.isArray(contents.parts)) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "INVALID_BODY", expected: "{model, contents:{parts:[...]}, config?}" }));
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model,
      contents,
      config
    });

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    // Keep response minimal: return only text to avoid leaking extra metadata.
    return res.end(JSON.stringify({ text: (result as any).text ?? "" }));
  } catch (err: any) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "GEMINI_PROXY_ERROR", message: err?.message ?? String(err) }));
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const systemPrompt = process.env.SYSTEM_PROMPT || "";
  const model =
    (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim()) ||
    "gemini-3-flash-preview";

  if (!apiKey) {
    return res.status(500).json({ error: "missing_GEMINI_API_KEY" });
  }

  const userText = (req.body?.text || "").toString().trim();
  if (!userText) {
    return res.status(400).json({ error: "missing_text" });
  }

  const composed = systemPrompt
    ? `${systemPrompt}\n\nUSER:\n${userText}`
    : userText;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: composed }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024
        }
      })
    });

    const data = await resp.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "Erro sem detalhe";

    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({
      error: "request_failed",
      detail: String(error)
    });
  }
}

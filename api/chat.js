export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const systemPrompt = process.env.SYSTEM_PROMPT || "";

  if (!apiKey) {
    res.status(500).json({ error: "missing_GEMINI_API_KEY" });
    return;
  }

  const body = req.body || {};
  const userText = (body.text || "").toString().trim();
  if (!userText) {
    res.status(400).json({ error: "missing_text" });
    return;
  }

  // Prompt + pergunta (tudo no servidor, não vai pro navegador)
  const composed = systemPrompt ? `${systemPrompt}\n\nUSER:\n${userText}` : userText;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: composed }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        })
      }
    );

    const data = await resp.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "Erro sem detalhe";

    res.status(200).json({ answer });
  } catch (e) {
    res.status(500).json({ error: "request_failed", detail: String(e) });
  }
}

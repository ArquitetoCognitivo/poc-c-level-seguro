export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const b64 = process.env.SYSTEM_PROMPT_B64;

  if (!apiKey) return res.status(500).json({ error: "missing_api_key" });
  if (!b64) return res.status(500).json({ error: "missing_system_prompt" });

  const systemPrompt = Buffer.from(b64, "base64").toString("utf8").trim();
  const userText = (req.body?.text || "").trim();

  if (!userText) return res.status(400).json({ error: "missing_text" });

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userText }]
        }
      ]
    })
  });

  const data = await response.json();

  const answer =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.error?.message ||
    "sem_resposta";

  return res.status(200).json({ answer });
}

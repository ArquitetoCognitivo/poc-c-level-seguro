function fromB64(b64) {
  return Buffer.from(b64, "base64").toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const b64 = process.env.SYSTEM_PROMPT_B64;

  if (!apiKey) {
    return res.status(500).json({ error: "missing_GEMINI_API_KEY" });
  }

  if (!b64) {
    return res.status(500).json({ error: "missing_SYSTEM_PROMPT_B64" });
  }

  const systemPrompt = fromB64(b64).trim();

  const userText = (req.body?.text || "").toString().trim();

  if (!userText) {
    return res.status(400).json({ error: "missing_text" });
  }

  const model = "gemini-3-flash-preview";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const composed = `${systemPrompt}\n\nUSER:\n${userText}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: composed }] }]
      })
    });

    const data = await response.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "no_response";

    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({
      error: "request_failed",
      detail: String(err)
    });
  }
}

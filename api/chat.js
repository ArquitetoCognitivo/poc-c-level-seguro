

/*
BACKUP (código antigo) — cole aqui dentro o conteúdo antigo do chat.js
---------------------------------------------------------------
1) Primeiro: cole o seu chat.js antigo aqui dentro (pra ficar salvo).
2) Depois: salve o arquivo.
3) O código ativo de teste está abaixo do comentário.
---------------------------------------------------------------
*/
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

  // ✅ Camada automática de elevação (genérica, serve para qualquer pergunta)
  const enhancedUserText = `
Você está operando como um Executive Strategic Advisor de alto nível.

Regras de resposta:
- Estruture sempre em blocos claros
- Traga contexto de mercado global quando aplicável
- Traga referência comparativa executiva quando aplicável
- Traga implicação financeira aproximada quando fizer sentido
- Priorize aplicabilidade prática
- Evite retórica excessiva
- Seja direto e denso

Pergunta do usuário:
${userText}
`;

const url = "https://api.groq.com;

const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: enhancedUserText }
    ],
    temperature: 0.2
  }),
});

  const data = await response.json();

  const answer =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.error?.message ||
    "sem_resposta";

  return res.status(200).json({ answer });
}




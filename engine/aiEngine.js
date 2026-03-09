const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1"   // Oficial xAI – confirmado marzo 2026
});

async function detectIntent(message) {
  if (!message || typeof message !== "string" || message.trim() === "") {
    throw new Error("Mensaje inválido");
  }

  const prompt = `Eres un clasificador de intenciones para soporte técnico de ISP en español. 
Responde SOLO con una de estas palabras exactas, sin nada más:

- no_internet
- slow_internet
- billing
- support

Mensaje del usuario: "${message.trim()}"

Respuesta (una sola palabra):`;

  const completion = await client.chat.completions.create({
    model: "grok-4-1-fast-non-reasoning",   // Modelo más barato y rápido para clasificación (0,20/0,50 USD por millón tokens)
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: 10
  });

  return completion.choices[0].message.content.trim().toLowerCase();
}

module.exports = { detectIntent };
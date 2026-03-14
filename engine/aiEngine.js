const OpenAI = require("openai");
require("dotenv").config();

// OpenAI gpt-4o-mini para clasificación de intenciones (económico y rápido)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    model: "gpt-4o-mini",   // OpenAI: económico y rápido para clasificación de intenciones
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: 10
  });

  return completion.choices[0].message.content.trim().toLowerCase();
}

module.exports = { detectIntent };
import "dotenv/config";
import express from "express";
import { Bot } from "grammy";
import fetch from "node-fetch";

// ============ ENV ============
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const XAI_API_KEY = process.env.XAI_API_KEY;
const PORT = Number(process.env.PORT || 3000);

if (!BOT_TOKEN || !XAI_API_KEY) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN or XAI_API_KEY");
}

// ============ TELEGRAM BOT ============
const bot = new Bot(BOT_TOKEN);

// BEAR personality (ENGLISH ONLY)
const SYSTEM_PROMPT = `
You are BEAR 🐻, a smart and friendly AI assistant.

Rules:
- Reply in English only.
- Be clear, helpful, and respectful.
`;

// Ask Grok (xAI)
async function askGrok(userMessage: string): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${XAI_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "grok-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ]
    })
  });

  const data: any = await res.json();
  return data.choices[0].message.content;
}

// Handle messages
bot.on("message:text", async (ctx) => {
  try {
    await ctx.reply("BEAR 🐻 is thinking...");
    const reply = await askGrok(ctx.message.text);
    await ctx.reply(reply);
  } catch (e) {
    await ctx.reply("Error occurred. Please try again.");
  }
});

// ============ EXPRESS (Railway) ============
const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (_req, res) => {
  res.send("BEAR 🐻 is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

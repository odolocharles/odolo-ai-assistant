import { Router } from "express";
import { processMessage } from "../brain";

export const telegramRouter = Router();

const TOKEN    = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM = `https://api.telegram.org/bot${TOKEN}`;

// Webhook receiver
telegramRouter.post("/", async (req, res) => {
  res.sendStatus(200); // ack immediately

  const update = req.body;
  const msg    = update.message || update.edited_message;
  if (!msg?.text) return;

  const result = await processMessage({
    platform:   "telegram",
    senderId:   String(msg.from.id),
    senderName: msg.from.first_name || "User",
    text:       msg.text,
    chatId:     String(msg.chat.id),
  });

  if (result.reply) await sendMessage(msg.chat.id, result.reply);
});

export async function sendMessage(chatId: number | string, text: string) {
  await fetch(`${TELEGRAM}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function setupTelegramWebhook(webhookUrl: string) {
  const res  = await fetch(`${TELEGRAM}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: `${webhookUrl}/webhook/telegram` }),
  });
  const data = await res.json() as any;
  console.log("[Telegram] Webhook:", data.description);
}

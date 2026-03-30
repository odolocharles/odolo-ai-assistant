import { IncomingMessage } from "../brain";
import { sendMessage } from "../platforms/telegram";

// Sends you a notification when a message needs your personal attention
export async function sendOwnerAlert(msg: IncomingMessage, reason: string | null) {
  const ownerChatId = process.env.OWNER_TELEGRAM_CHAT_ID;
  if (!ownerChatId) {
    console.warn("[Alert] OWNER_TELEGRAM_CHAT_ID not set — cannot send alert");
    return;
  }

  const text = [
    `<b>Alert from ODOLO</b>`,
    ``,
    `Platform: ${msg.platform}`,
    `From: ${msg.senderName}`,
    `Message: "${msg.text}"`,
    ``,
    reason ? `Reason flagged: ${reason}` : "",
    ``,
    `Reply directly on ${msg.platform} — ODOLO has sent a holding reply.`,
  ].filter(Boolean).join("\n");

  await sendMessage(ownerChatId, text);
  console.log(`[Alert] Notified owner about urgent message from ${msg.senderName}`);
}

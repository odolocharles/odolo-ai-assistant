import { Router } from "express";
import { processMessage } from "../brain";

export const tiktokRouter = Router();

// TikTok DM API (requires approved developer access)
// Apply at: developers.tiktok.com
tiktokRouter.get("/", (req, res) => {
  // TikTok webhook verification
  res.send(req.query.challenge || "ok");
});

tiktokRouter.post("/", async (req, res) => {
  res.sendStatus(200);
  const event = req.body;

  // TikTok DM event
  if (event.event_type === "direct_message") {
    const msg    = event.data;
    const result = await processMessage({
      platform:   "tiktok",
      senderId:   msg.from_user_id,
      senderName: msg.from_display_name || "TikTok User",
      text:       msg.content?.text || "",
      chatId:     msg.conversation_id,
    });

    if (result.reply) await sendTikTokMessage(msg.conversation_id, result.reply);
  }
});

async function sendTikTokMessage(conversationId: string, text: string) {
  // Requires TikTok DM API access token
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) { console.warn("[TikTok] No access token configured"); return; }

  await fetch("https://open.tiktokapis.com/v2/dm/conversation/message/send/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      conversation_id: conversationId,
      message_type:    "text",
      content:         { text },
    }),
  });
}

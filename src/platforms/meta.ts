import { Router } from "express";
import { processMessage } from "../brain";

export const metaRouter = Router();

const TOKEN = process.env.META_ACCESS_TOKEN     || "";
const VERIFY = process.env.META_VERIFY_TOKEN    || "";
const WA_ID  = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const META   = "https://graph.facebook.com/v19.0";

// Webhook verification (GET)
metaRouter.get("/", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY) {
    console.log("[Meta] Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook receiver (POST)
metaRouter.post("/", async (req, res) => {
  res.sendStatus(200);
  const body = req.body;
  if (body.object !== "whatsapp_business_account" &&
      body.object !== "page" &&
      body.object !== "instagram") return;

  for (const entry of body.entry || []) {
    // WhatsApp
    for (const change of entry.changes || []) {
      const val = change.value;
      for (const msg of val?.messages || []) {
        if (msg.type !== "text") continue;
        const contact = val.contacts?.find((c: any) => c.wa_id === msg.from);
        const result  = await processMessage({
          platform:   "whatsapp",
          senderId:   msg.from,
          senderName: contact?.profile?.name || msg.from,
          text:       msg.text.body,
          chatId:     msg.from,
        });
        if (result.reply) await sendWhatsApp(msg.from, result.reply);
      }
    }

    // Facebook / Instagram Messenger
    for (const messaging of entry.messaging || []) {
      const text = messaging.message?.text;
      if (!text) continue;
      const platform = body.object === "instagram" ? "instagram" : "facebook";
      const result   = await processMessage({
        platform,
        senderId:   messaging.sender.id,
        senderName: "User",
        text,
        chatId:     messaging.sender.id,
      });
      if (result.reply) await sendMessenger(messaging.sender.id, result.reply);
    }
  }
});

async function sendWhatsApp(to: string, text: string) {
  await fetch(`${META}/${WA_ID}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
  });
}

async function sendMessenger(recipientId: string, text: string) {
  await fetch(`${META}/me/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message:   { text },
      access_token: TOKEN,
    }),
  });
}

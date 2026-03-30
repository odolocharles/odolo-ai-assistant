import Anthropic from "@anthropic-ai/sdk";
import { getHistory, saveMessage } from "../memory/store";
import { runAutomation }           from "../handlers/automation";
import { sendOwnerAlert }          from "../handlers/alert";

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface IncomingMessage {
  platform:   "telegram" | "whatsapp" | "facebook" | "instagram" | "tiktok";
  senderId:   string;
  senderName: string;
  text:       string;
  chatId:     string;
}

export interface BotResponse {
  reply:    string | null;
  action:   "reply" | "automate" | "alert" | "ignore";
}

export async function processMessage(msg: IncomingMessage): Promise<BotResponse> {
  await saveMessage(msg.chatId, { role: "user", content: msg.text, sender: msg.senderName });

  const history = await getHistory(msg.chatId, 10);

  // Step 1 - classify the message
  const classification = await classifyMessage(msg, history);

  if (classification.intent === "automation") {
    const result = await runAutomation(classification.command, msg);
    return { reply: result, action: "automate" };
  }

  if (classification.isUrgent) {
    await sendOwnerAlert(msg, classification.urgentReason);
    const reply = await generateReply(msg, history, "Let them know you will get back to them soon");
    return { reply, action: "alert" };
  }

  // Default: smart reply as the owner
  const reply = await generateReply(msg, history);
  if (reply) await saveMessage(msg.chatId, { role: "assistant", content: reply, sender: "ODOLO" });
  return { reply, action: "reply" };
}

async function classifyMessage(msg: IncomingMessage, history: any[]) {
  const res = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Classify this message. Reply JSON only.

Message from ${msg.senderName} on ${msg.platform}: "${msg.text}"

JSON format:
{
  "intent": "chat" | "automation",
  "command": "extracted command if automation, else null",
  "isUrgent": boolean,
  "urgentReason": "reason if urgent, else null"
}

Automation examples: send email, play music, check weather, set reminder, scan network.
Urgent: medical emergency, serious distress, words like URGENT/ASAP/emergency.`
    }]
  });

  try {
    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { intent: "chat", command: null, isUrgent: false, urgentReason: null };
  }
}

async function generateReply(msg: IncomingMessage, history: any[], hint?: string): Promise<string> {
  const ownerName  = process.env.OWNER_NAME  || "the owner";
  const ownerStyle = process.env.OWNER_STYLE || "friendly, casual, concise";

  const messages = [
    ...history.slice(-8).map((h: any) => ({ role: h.role, content: h.content })),
    { role: "user" as const, content: msg.text }
  ];

  const res = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: `You are ODOLO AI, replying on behalf of ${ownerName} on ${msg.platform}.
Style: ${ownerStyle}.
${hint ? "Hint: " + hint : ""}
Rules:
- Sound human, not robotic
- Keep it short unless detail is needed
- Never reveal you are an AI unless directly asked
- Match the energy of the conversation`,
    messages
  });

  return res.content[0].type === "text" ? res.content[0].text : "";
}

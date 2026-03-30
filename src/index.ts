import express from "express";
import { telegramRouter } from "./platforms/telegram";
import { metaRouter }     from "./platforms/meta";
import { tiktokRouter }   from "./platforms/tiktok";
import { initMemory }     from "./memory/store";

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/", (_, res) => res.json({ status: "ODOLO bot running" }));

// Platform webhooks
app.use("/webhook/telegram",  telegramRouter);
app.use("/webhook/meta",      metaRouter);    // WhatsApp + Facebook + Instagram
app.use("/webhook/tiktok",    tiktokRouter);

async function start() {
  await initMemory();
  app.listen(PORT, () => console.log(`ODOLO bot live on port ${PORT}`));
}

start();

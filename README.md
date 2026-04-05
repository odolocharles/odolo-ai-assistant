# ODOLO Bot

> Personal AI automation bot — replies as you, runs automations, alerts you when it matters.

Powered by Claude AI. Runs on Telegram, WhatsApp, Facebook, Instagram, and TikTok from a single deployment.

---

## What it does

- **Replies as you** — Claude reads your conversation history and responds in your tone and style
- **Handles messages across platforms** — one bot, five platforms, unified logic
- **Away mode** — auto-handles incoming messages when you're busy or offline
- **Automations** — routes commands to skills: email, calendar, weather, news, music, smart home
- **Alerts** — sends you urgent notifications when something needs your attention
- **Memory** — stores conversation history in PostgreSQL with Redis caching and in-memory fallback

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| AI brain | Anthropic Claude (`@anthropic-ai/sdk`) |
| Server | Express |
| Platforms | Telegram Bot API, Meta Graph API, TikTok API |
| Memory | PostgreSQL + Redis + in-memory fallback |
| Email | Nodemailer + IMAP + Mailparser |
| Calendar | Google Calendar API |
| Deploy | Railway (primary), Docker, PM2 |

---

## Project structure

\`\`\`
src/
├── index.ts              Express server — mounts all platform routes
├── brain.ts              Claude AI intent parser and reply engine
├── memory/
│   └── store.ts          Conversation history (PostgreSQL + Redis + fallback)
├── platforms/
│   ├── telegram.ts       Telegram Bot API
│   ├── meta.ts           WhatsApp + Facebook + Instagram (unified)
│   └── tiktok.ts         TikTok DM API
├── handlers/
│   ├── automation.ts     Routes commands to skills
│   └── alert.ts          Urgent message alerts to owner
└── utils/
    └── setup.ts          Webhook registration utility
\`\`\`

---

## Quick start

\`\`\`bash
git clone https://github.com/odolocharles/odolo-personal-bot
cd odolo-personal-bot
npm install
cp .env.example .env
npm run dev
\`\`\`

---

*Personal project — not affiliated with Sorabbyngo.*

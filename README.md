# ODOLO Bot

> Personal AI automation bot — replies as you, runs automations, alerts you when it matters.

Powered by Claude AI. Runs on Telegram, WhatsApp, Facebook, Instagram, and TikTok from a single deployment.

---

## What it does

- **Replies as you** — Claude reads your conversation history and responds in your tone and style
- **Handles messages across platforms** — one bot, five platforms, unified logic
- **Away mode** — auto-handles incoming messages when you are busy or offline
- **Automations** — routes commands to skills: email, calendar, weather, news, music, smart home
- **Alerts** — sends you urgent notifications when something needs your attention
- **Memory** — stores conversation history in PostgreSQL with Redis caching and in-memory fallback

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| AI brain | Anthropic Claude |
| Server | Express |
| Platforms | Telegram Bot API, Meta Graph API, TikTok API |
| Memory | PostgreSQL + Redis + in-memory fallback |
| Email | Nodemailer + IMAP + Mailparser |
| Calendar | Google Calendar API |
| Deploy | Railway (primary), Docker, PM2 |

---

## Project structure

    src/
    index.ts              Express server
    brain.ts              Claude AI intent parser and reply engine
    memory/store.ts       Conversation history
    platforms/telegram.ts Telegram Bot API
    platforms/meta.ts     WhatsApp + Facebook + Instagram
    platforms/tiktok.ts   TikTok DM API
    handlers/automation.ts Routes commands to skills
    handlers/alert.ts     Urgent message alerts to owner
    utils/setup.ts        Webhook registration utility

---

## Quick start

    git clone https://github.com/odolocharles/odolo-personal-bot
    cd odolo-personal-bot
    npm install
    cp .env.example .env
    npm run dev

Register webhooks after deploying:

    npm run setup

---

## Environment variables

    ANTHROPIC_API_KEY=
    TELEGRAM_BOT_TOKEN=
    META_APP_ID=
    META_APP_SECRET=
    META_VERIFY_TOKEN=
    META_PAGE_ACCESS_TOKEN=
    TIKTOK_CLIENT_KEY=
    TIKTOK_CLIENT_SECRET=
    DATABASE_URL=postgresql://user:password@host:5432/odolo
    REDIS_URL=redis://localhost:6379
    PORT=3000
    PUBLIC_URL=https://your-deployment-url.railway.app
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_REFRESH_TOKEN=
    EMAIL_USER=
    EMAIL_PASSWORD=
    IMAP_HOST=
    SMTP_HOST=

---

## Deployment

### Railway
1. Push to GitHub
2. Connect repo at railway.app
3. Add environment variables
4. Auto-deploys on every push

### Docker

    docker build -t odolo-bot .
    docker run -p 3000:3000 --env-file .env odolo-bot

### Self-host on Linux

    npm install && npm run build
    npm install -g pm2
    pm2 start dist/index.js --name odolo-bot
    pm2 save
    cloudflared tunnel --url http://localhost:3000

---

## Scripts

| Command | Description |
|---------|-------------|
| npm run dev | Development server with hot reload |
| npm run build | Compile TypeScript to dist/ |
| npm start | Run compiled production build |
| npm run setup | Register webhooks with all platforms |

---

## Platform setup

| Platform | API | Notes |
|----------|-----|-------|
| Telegram | Telegram Bot API | Free, instant via @BotFather |
| WhatsApp | WhatsApp Business API | Requires Meta developer account |
| Facebook | Meta Messenger API | Same Meta app as WhatsApp |
| Instagram | Meta Graph API | Same Meta app as WhatsApp |
| TikTok | TikTok for Developers | Limited DM access — apply for access |

---

*Personal project — not affiliated with Sorabbyngo.*
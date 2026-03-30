# ODOLO Bot

Personal AI automation bot. Runs on Telegram, WhatsApp, Facebook, Instagram and TikTok. Replies as you, runs automations, and alerts you when something needs your attention.

## Quick start

```bash
git clone https://github.com/odolocharles/odolo-ai-assistant
cd odolo-ai-assistant
npm install
cp .env.example .env
# Fill in your keys, then:
npm run dev
```

## Deploy to Railway

1. Push to GitHub
2. Go to railway.app, connect your repo
3. Add environment variables from .env.example
4. Railway auto-deploys on every push

## Deploy with Docker

```bash
docker build -t odolo-bot .
docker run -p 3000:3000 --env-file .env odolo-bot
```

## Self-host on Linux (free)

```bash
# Install dependencies
npm install && npm run build

# Run with PM2 (keeps it alive)
npm install -g pm2
pm2 start dist/index.js --name odolo-bot
pm2 save

# Expose with Cloudflare Tunnel (no port forwarding needed)
cloudflared tunnel --url http://localhost:3000
```

## Webhook setup

After deploying, set your public URL in .env as PUBLIC_URL, then run:

```bash
npm run setup
```

This registers the webhook with Telegram automatically. For WhatsApp/Facebook/Instagram, paste your Railway URL into the Meta developer console.

## Project structure

```
src/
  index.ts          - Express server, mounts all routes
  brain.ts          - Claude AI intent parser and reply engine
  memory/store.ts   - Conversation history (PostgreSQL + Redis + fallback)
  platforms/
    telegram.ts     - Telegram Bot API
    meta.ts         - WhatsApp + Facebook + Instagram (unified)
    tiktok.ts       - TikTok DM API
  handlers/
    automation.ts   - Routes commands to skills
    alert.ts        - Sends urgent message alerts to owner
  skills/
    email.ts        - Send and read emails (Gmail, Yahoo, Outlook...)
    calendar.ts     - Google Calendar reminders
    weather.ts      - OpenWeatherMap
    news.ts         - NewsAPI headlines
    music.ts        - Boomplay / media key control via ADB
    smarthome.ts    - Home Assistant device control
    security.ts     - Network scanner, SSL checker (own systems only)
```

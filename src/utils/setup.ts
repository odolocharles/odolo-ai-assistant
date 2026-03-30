// Run with: npm run setup
// Registers webhooks on all platforms automatically

async function setup() {
  const url = process.env.PUBLIC_URL;
  if (!url) {
    console.error("Set PUBLIC_URL in .env first (your Railway or tunnel URL)");
    process.exit(1);
  }

  console.log(`Setting up webhooks for: ${url}\n`);

  // Telegram
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  if (tgToken) {
    const res  = await fetch(`https://api.telegram.org/bot${tgToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${url}/webhook/telegram` }),
    });
    const data = await res.json() as any;
    console.log(`Telegram: ${data.ok ? "registered" : "failed - " + data.description}`);
  } else {
    console.log("Telegram: skipped (no token)");
  }

  // Meta - manual step
  const metaToken = process.env.META_ACCESS_TOKEN;
  if (metaToken) {
    console.log(`\nWhatsApp / Facebook / Instagram:`);
    console.log(`  Paste this URL in Meta developer console:`);
    console.log(`  ${url}/webhook/meta`);
    console.log(`  Verify token: ${process.env.META_VERIFY_TOKEN || "(not set)"}`);
  } else {
    console.log("Meta: skipped (no token)");
  }

  // TikTok - manual step
  if (process.env.TIKTOK_ACCESS_TOKEN) {
    console.log(`\nTikTok:`);
    console.log(`  Webhook URL: ${url}/webhook/tiktok`);
    console.log(`  Register in TikTok developer console`);
  }

  console.log("\nSetup complete.");
}

setup().catch(console.error);

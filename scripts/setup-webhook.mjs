// Webhook'ni Telegram'ga ro'yxatdan o'tkazadi.
// Agar .env.local'da TELEGRAM_WEBHOOK_SECRET o'rnatilgan va placeholder bo'lmasa,
// secret_token bilan ro'yxatdan o'tkaziladi. Aks holda secret'siz.
//
// node scripts/setup-webhook.mjs                       # productiondagi URL'ni ishlatadi
// node scripts/setup-webhook.mjs https://abc.ngrok.io  # custom URL

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const token = env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN topilmadi");
  process.exit(1);
}

const customUrl = process.argv[2];
const baseUrl = customUrl || "https://test-ease-new.vercel.app";
const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;

const secret = env.TELEGRAM_WEBHOOK_SECRET;
const secretValid =
  secret && secret.length >= 8 && secret !== "your_webhook_secret_for_security";

const body = new URLSearchParams();
body.set("url", webhookUrl);
if (secretValid) {
  body.set("secret_token", secret);
  console.log("🔒 Secret bilan ro'yxatdan o'tkazilmoqda");
} else {
  // Pass empty secret_token to clear any previously-set secret
  body.set("secret_token", "");
  console.log("🔓 Secret'siz ro'yxatdan o'tkazilmoqda (ixtiyoriy)");
}

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: body.toString(),
});

const result = await res.json();
if (!res.ok || !result.ok) {
  console.error("❌ Xato:", result);
  process.exit(1);
}

console.log("✅ Webhook ro'yxatdan o'tkazildi:");
console.log("   URL:", webhookUrl);

// Verify
const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then(
  (r) => r.json()
);
console.log("\n📋 Hozirgi webhook holati:");
console.log("   url:", info.result?.url);
console.log("   has_custom_certificate:", info.result?.has_custom_certificate);
console.log("   pending_update_count:", info.result?.pending_update_count);
console.log(
  "   secret_token_configured:",
  info.result?.has_custom_certificate ? "—" : !!info.result?.url && secretValid
);

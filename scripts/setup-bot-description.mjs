// Bot ismi, qisqa va to'liq tavsifini Telegram serveriga yuboradi.
// node scripts/setup-bot-description.mjs

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

const NAME = "Test Ease — O'qituvchi va o'quvchilar uchun";

const SHORT_DESCRIPTION =
  "Test yarating, AI bilan savol generatsiya qiling, Rasch va adaptive baholash bilan o'quvchilarni baholang.";

const DESCRIPTION = `🎓 Test Ease — O'zbek tilidagi zamonaviy test platformasi.

O'qituvchilar uchun:
📝 Test yaratish (Sertifikat, SAT, DTM, Milliy sertifikat B2/C1)
🤖 AI bilan avtomatik savol generatsiya
📚 Savol banki
🌍 Public testlar va ulashish

O'quvchilar uchun:
✅ Test topshirish va natija
📊 Rasch va T-bahosi
🧠 Adaptive test (CAT)
🏆 Leaderboard

Buyruqlar:
/create_test, /my_tests, /my_bank, /public_tests, /cat, /my_results, /help`;

console.log(`📏 Belgilar:
   Name: ${NAME.length}/64
   Short: ${SHORT_DESCRIPTION.length}/120
   Description: ${DESCRIPTION.length}/512`);

if (NAME.length > 64) throw new Error("Name limit oshib ketdi");
if (SHORT_DESCRIPTION.length > 120) throw new Error("Short description limit oshib ketdi");
if (DESCRIPTION.length > 512) throw new Error("Description limit oshib ketdi");

async function call(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error(`❌ ${method}:`, data);
    return false;
  }
  return true;
}

console.log("\n🚀 Yuborilmoqda...");

if (await call("setMyName", { name: NAME })) {
  console.log("✅ setMyName");
}
if (await call("setMyShortDescription", { short_description: SHORT_DESCRIPTION })) {
  console.log("✅ setMyShortDescription");
}
if (await call("setMyDescription", { description: DESCRIPTION })) {
  console.log("✅ setMyDescription");
}

// Verify
console.log("\n🔍 Tasdiqlash:");
const me = await fetch(`https://api.telegram.org/bot${token}/getMe`).then((r) => r.json());
const nameRes = await fetch(`https://api.telegram.org/bot${token}/getMyName`).then((r) => r.json());
const shortRes = await fetch(`https://api.telegram.org/bot${token}/getMyShortDescription`).then(
  (r) => r.json()
);
const descRes = await fetch(`https://api.telegram.org/bot${token}/getMyDescription`).then(
  (r) => r.json()
);

console.log("   Username:", me.result?.username);
console.log("   Name:", nameRes.result?.name);
console.log("   Short:", shortRes.result?.short_description?.slice(0, 80) + "...");
console.log("   Description:", descRes.result?.description?.slice(0, 80) + "...");

console.log("\n💡 Telegram'da botingizni qayta ochib ko'ring (cache 5-10 daqiqa).");

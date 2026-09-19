// ESKI bot orqali barcha foydalanuvchilarga "yangi botga o'ting" xabarini yuboradi.
//
// Nega alohida skript: loyihadagi broadcast tizimi TELEGRAM_BOT_TOKEN bilan,
// ya'ni YANGI bot orqali yuboradi. Yangi botda esa hali bitta ham obunachi yo'q.
// 19 739 foydalanuvchiga yetib borishning yagona yo'li — eski bot.
//
// Kerak: .env.local da OLD_TELEGRAM_BOT_TOKEN
//   BotFather → /mybots → @test_ease_uz_bot → API Token
//
//   node scripts/migrate-users-to-new-bot.mjs            # quruq ishlash (hech narsa yuborilmaydi)
//   node scripts/migrate-users-to-new-bot.mjs --send     # haqiqatan yuborish
//   node scripts/migrate-users-to-new-bot.mjs --send --test 123456789   # bitta odamga sinov

import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

const OLD_TOKEN = env.OLD_TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const NEW_BOT = env.NEXT_PUBLIC_TG_BOT_NAME || "TestEaseUzBot";

if (!OLD_TOKEN) {
  console.error(`
❌ .env.local da OLD_TELEGRAM_BOT_TOKEN topilmadi.

BotFather → /mybots → @test_ease_uz_bot → API Token → tokenni oling va
.env.local ga qo'shing:

   OLD_TELEGRAM_BOT_TOKEN=...
`);
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Supabase URL yoki SERVICE_ROLE_KEY topilmadi");
  process.exit(1);
}

const SEND = process.argv.includes("--send");
const testIdx = process.argv.indexOf("--test");
const TEST_ID = testIdx !== -1 ? process.argv[testIdx + 1] : null;

// 19 739 ta xabar bir necha daqiqa oladi. Uzilib qolsa qaytadan boshlamasin.
const PROGRESS_FILE = resolve(process.cwd(), "scripts/.migration-broadcast-progress.json");

const TEXT =
  `🔄 *Test Ease yangi botga ko'chdi*\n\n` +
  `Xavfsizlik sababli eski bot almashtirildi.\n\n` +
  `✅ Barcha testlaringiz, natijalaringiz va savol bankingiz *saqlanib qoldi* — ` +
  `hech narsa yo'qolmadi.\n\n` +
  `Davom etish uchun yangi botni ishga tushiring:\n` +
  `👉 @${NEW_BOT}\n\n` +
  `Eski botga endi xabar yubormang — u ishlamaydi.`;

const KEYBOARD = {
  inline_keyboard: [
    [{ text: "🚀 Yangi botni ochish", url: `https://t.me/${NEW_BOT}` }],
  ],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadUsers() {
  if (TEST_ID) return [TEST_ID];

  const all = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bot_users?select=telegram_id&order=last_interaction_at.desc.nullslast,telegram_id.asc`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Range: `${from}-${from + pageSize - 1}`,
        },
      }
    );
    const rows = await res.json();
    if (!Array.isArray(rows)) {
      console.error("❌ bot_users o'qishda xato:", rows);
      process.exit(1);
    }
    all.push(...rows.map((r) => r.telegram_id).filter(Boolean));
    if (rows.length < pageSize) break;
  }
  // Eng faol foydalanuvchilar birinchi bo'lib oladi.
  return Array.from(new Set(all));
}

async function sendOne(chatId) {
  const res = await fetch(`https://api.telegram.org/bot${OLD_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: TEXT,
      parse_mode: "Markdown",
      reply_markup: KEYBOARD,
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json();

  if (data.ok) return "sent";

  // Telegram tezlik chegarasi — kutamiz va bir marta qayta urinamiz.
  if (data.error_code === 429) {
    const wait = (data.parameters?.retry_after ?? 1) * 1000;
    await sleep(Math.min(wait, 30_000));
    const retry = await fetch(`https://api.telegram.org/bot${OLD_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: TEXT,
        parse_mode: "Markdown",
        reply_markup: KEYBOARD,
        disable_web_page_preview: true,
      }),
    });
    return (await retry.json()).ok ? "sent" : "failed";
  }

  // Bloklagan / o'chirilgan akkountlar — kutilgan holat, xato emas.
  const d = (data.description || "").toLowerCase();
  if (d.includes("blocked") || d.includes("deactivated") || d.includes("chat not found")) {
    return "blocked";
  }
  return "failed";
}

const users = await loadUsers();

const done = existsSync(PROGRESS_FILE)
  ? new Set(JSON.parse(readFileSync(PROGRESS_FILE, "utf8")).done)
  : new Set();

const pending = users.filter((u) => !done.has(u));

console.log(`👥 Jami foydalanuvchi:   ${users.length}`);
console.log(`✅ Allaqachon yuborilgan: ${done.size}`);
console.log(`📤 Yuboriladi:            ${pending.length}`);
console.log(`🤖 Yangi bot:             @${NEW_BOT}\n`);

if (!SEND) {
  console.log("--- XABAR MATNI ---");
  console.log(TEXT.replace(/\*/g, ""));
  console.log("\n--- TUGMA ---");
  console.log(`${KEYBOARD.inline_keyboard[0][0].text} → ${KEYBOARD.inline_keyboard[0][0].url}`);
  console.log(`
🟡 Bu quruq ishlash edi — hech narsa yuborilmadi.

Avval o'zingizga sinab ko'ring:
   node scripts/migrate-users-to-new-bot.mjs --send --test <telegram_id>

Hammaga yuborish:
   node scripts/migrate-users-to-new-bot.mjs --send
`);
  process.exit(0);
}

let sent = 0, blocked = 0, failed = 0;
const t0 = Date.now();

for (let i = 0; i < pending.length; i++) {
  const id = pending[i];
  try {
    const r = await sendOne(id);
    if (r === "sent") sent++;
    else if (r === "blocked") blocked++;
    else failed++;
  } catch {
    failed++;
  }

  done.add(id);

  // Telegram sekundiga ~30 ta xabarga ruxsat beradi; 25 ga yaqin turamiz.
  await sleep(40);

  if ((i + 1) % 100 === 0 || i === pending.length - 1) {
    writeFileSync(PROGRESS_FILE, JSON.stringify({ done: [...done] }));
    const secs = Math.round((Date.now() - t0) / 1000);
    process.stdout.write(
      `\r📤 ${i + 1}/${pending.length} | yuborildi ${sent} | bloklagan ${blocked} | xato ${failed} | ${secs}s`
    );
  }
}

writeFileSync(PROGRESS_FILE, JSON.stringify({ done: [...done] }));
console.log(`\n\n✅ Tugadi — yuborildi ${sent}, bloklagan ${blocked}, xato ${failed}`);
console.log(`ℹ️  Progress: ${PROGRESS_FILE} (qayta ishga tushirsangiz qolganidan davom etadi)`);

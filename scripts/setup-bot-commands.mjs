// Telegram bot buyruqlarini Telegram menyusiga ro'yxatdan o'tkazadi.
// Foydalanuvchi `/` bossa, avto-to'ldirilgan ro'yxat chiqadi.
// node scripts/setup-bot-commands.mjs

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

const commands = [
  { command: "start", description: "Botni ishga tushirish" },
  { command: "help", description: "Yordam" },
  { command: "create_test", description: "Yangi test yaratish (o'qituvchi)" },
  { command: "my_tests", description: "Mening testlarim (o'qituvchi)" },
  { command: "my_bank", description: "Savol bankim (o'qituvchi)" },
  { command: "my_results", description: "Mening natijalarim" },
  { command: "public_tests", description: "Ochiq testlar katalogi" },
  { command: "cat", description: "Adaptive test (CAT)" },
  { command: "connect_with_admin", description: "Admin bilan bog'lanish" },
];

const res = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ commands }),
});

const result = await res.json();
if (!res.ok || !result.ok) {
  console.error("❌ Xato:", result);
  process.exit(1);
}

console.log("✅ Bot buyruqlari ro'yxatdan o'tkazildi:");
commands.forEach((c) => console.log(`   /${c.command} — ${c.description}`));
console.log("\nTelegram'da botingizni qayta ochib (yoki yangidan boshlasangiz), `/` bosib menyuni ko'ring.");

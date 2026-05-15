import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const pat = env.SUPABASE_ACCESS_TOKEN;

if (!url) {
  console.error("NEXT_PUBLIC_SUPABASE_URL topilmadi");
  process.exit(1);
}
if (!pat) {
  console.error("SUPABASE_ACCESS_TOKEN topilmadi (.env.local'ga qo'shing)");
  process.exit(1);
}

const refMatch = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
if (!refMatch) {
  console.error("Project ref URL'dan ajratib bo'lmadi:", url);
  process.exit(1);
}
const projectRef = refMatch[1];
console.log(`📦 Project: ${projectRef}`);

const sql = `
alter table public.questions
  add column if not exists media_url text,
  add column if not exists media_type text check (media_type in ('image', 'audio'));
`.trim();

console.log("🛠  Ishga tushirilayotgan SQL:");
console.log(sql);
console.log();

const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
);

const result = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error(`❌ Xato (${response.status}):`, result);
  process.exit(1);
}

console.log("✅ Migratsiya muvaffaqiyatli bajarildi");
console.log("Natija:", JSON.stringify(result, null, 2));

console.log("\n🔍 Tekshirish: ustunlar mavjudligini tasdiqlash...");
const verifyResponse = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `select column_name, data_type from information_schema.columns
              where table_schema = 'public' and table_name = 'questions'
              and column_name in ('media_url', 'media_type');`,
    }),
  }
);
const verifyResult = await verifyResponse.json();
console.log("Yangi ustunlar:", JSON.stringify(verifyResult, null, 2));

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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const pat = env.SUPABASE_ACCESS_TOKEN;
if (!url || !pat) {
  console.error("PAT yoki URL topilmadi");
  process.exit(1);
}

const projectRef = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];

const sql = `
-- INSERT va DELETE policy'larini olib tashlaymiz (server endi service role bilan ishlaydi)
-- SELECT public ko'rish uchun qoldiriladi (audio/rasm linklari brauzer'da ko'rinishi uchun)
drop policy if exists "qm_anon_insert" on storage.objects;
drop policy if exists "qm_anon_delete" on storage.objects;
`.trim();

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  }
);
const result = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Xato:", result);
  process.exit(1);
}
console.log("✅ Anon INSERT va DELETE policy'lari olib tashlandi");
console.log("ℹ️  SELECT policy qoldirildi (public read uchun)");

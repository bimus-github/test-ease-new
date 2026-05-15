// Migration: tests.is_public + index
// PAT bilan ishlatish uchun .env.local'ga SUPABASE_ACCESS_TOKEN qo'shing
// Yoki Supabase SQL Editor'ga quyidagi SQL'ni paste qiling:
//
//   alter table public.tests add column if not exists is_public boolean default false;
//   create index if not exists idx_tests_public on public.tests (is_public) where is_public = true;

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
if (!pat) {
  console.error("❌ SUPABASE_ACCESS_TOKEN topilmadi.");
  console.error("\n💡 Variantlar:");
  console.error("   1) .env.local'ga PAT'ni vaqtinchalik qo'shib, qaytadan ishga tushiring");
  console.error("   2) Yoki Supabase Dashboard → SQL Editor'da quyidagini ishga tushiring:\n");
  console.error("   alter table public.tests add column if not exists is_public boolean default false;");
  console.error("   create index if not exists idx_tests_public on public.tests (is_public) where is_public = true;\n");
  process.exit(1);
}

const projectRef = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];
const sql = `
alter table public.tests add column if not exists is_public boolean default false;
create index if not exists idx_tests_public on public.tests (is_public) where is_public = true;
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
  console.error("❌ Xato:", result);
  process.exit(1);
}
console.log("✅ tests.is_public ustuni va index yaratildi");

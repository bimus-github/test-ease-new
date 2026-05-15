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

if (!url || !pat) {
  console.error("URL yoki SUPABASE_ACCESS_TOKEN topilmadi");
  process.exit(1);
}

const projectRef = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];
console.log(`📦 Project: ${projectRef}`);

const sql = `
-- O'chirib qayta yaratish (idempotent)
drop policy if exists "qm_public_read" on storage.objects;
drop policy if exists "qm_anon_insert" on storage.objects;
drop policy if exists "qm_anon_delete" on storage.objects;

-- Public read (public bucket bo'lsa ham, ba'zi olishlarga kerak)
create policy "qm_public_read"
on storage.objects for select
to public
using (bucket_id = 'question-media');

-- Anon va authenticated upload qilishi mumkin
create policy "qm_anon_insert"
on storage.objects for insert
to public
with check (bucket_id = 'question-media');

-- Anon va authenticated o'chirishi mumkin (MediaUpload almashtirish uchun)
create policy "qm_anon_delete"
on storage.objects for delete
to public
using (bucket_id = 'question-media');
`.trim();

console.log("🛠  Storage policy'lari:");
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
console.log("✅ Policy'lar yaratildi");

// Tekshirish
const verify = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `select policyname, cmd from pg_policies
              where schemaname = 'storage' and tablename = 'objects'
              and policyname like 'qm_%';`,
    }),
  }
);
const verifyResult = await verify.json();
console.log("\n🔍 Yaratilgan policy'lar:");
console.log(JSON.stringify(verifyResult, null, 2));

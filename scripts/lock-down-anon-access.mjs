// Anon kalitning bazaga kirishini butunlay yopadi.
//
// MUAMMO: NEXT_PUBLIC_SUPABASE_ANON_KEY brauzer bundle'iga tushadi, ya'ni ochiq.
// RLS yoqilmagani va Supabase'ning standart GRANT'lari turgani uchun o'sha kalit
// bilan butun bazani o'qish ham, o'zgartirish ham mumkin edi — jumladan
// `questions` jadvalidagi to'g'ri javoblarni.
//
// ⚠️  AVVAL YANGI KODNI DEPLOY QILING.
// Ishlab turgan prodakshn hali anon kalit bilan ishlayotgan bo'lsa, bu skript
// uni bir zumda o'ldiradi. Server `supabase` klienti service role'ga o'tgan
// build deploy bo'lganidan KEYIN ishga tushiring.
//
// node scripts/lock-down-anon-access.mjs --i-have-deployed

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

if (!process.argv.includes("--i-have-deployed")) {
  console.error(`
⚠️  To'xtang.

Bu skript anon rolining public sxemaga kirishini butunlay olib tashlaydi.
Agar prodakshnda hali eski kod (anon kalit bilan ishlaydigan) turgan bo'lsa,
bot va veb-ilova shu zahoti ishlamay qoladi.

Tartib:
  1. Yangi kodni main'ga qo'shib deploy qiling
  2. Bot va sahifalar ishlayotganini tekshiring
  3. Keyin: node scripts/lock-down-anon-access.mjs --i-have-deployed
`);
  process.exit(1);
}

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
  console.error("PAT yoki URL topilmadi (.env.local da SUPABASE_ACCESS_TOKEN kerak)");
  process.exit(1);
}

const projectRef = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];

// Bazadagi asl jadvallar (view'lar emas — ular "all tables" grantiga kiradi).
const BASE_TABLES = [
  "bot_users",
  "tests",
  "questions",
  "submissions",
  "question_bank",
  "cat_sessions",
  "broadcast_jobs",
];

const sql = `
-- 1) Anon va authenticated rollaridan public sxemadagi barcha huquqni olib tashlash.
--    service_role va postgres tegilmaydi — server shular orqali ishlaydi.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all routines  in schema public from anon, authenticated;
revoke usage on schema public from anon, authenticated;

-- 2) Kelajakda yaratiladigan obyektlar ham avtomatik ochilib qolmasin.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on routines  from anon, authenticated;

-- 3) Himoyaning ikkinchi qatlami: RLS yoqiladi. Bitta ham policy qo'shilmaydi,
--    ya'ni policy'siz rollar uchun hamma narsa yopiq. service_role RLS'ni
--    chetlab o'tadi, shuning uchun serverga ta'sir qilmaydi.
${BASE_TABLES.map((t) => `alter table public.${t} enable row level security;`).join("\n")}

-- 4) Natijani ko'rsatish.
select
  c.relname as jadval,
  c.relrowsecurity as rls_yoqilgan,
  has_table_privilege('anon', c.oid, 'SELECT') as anon_oqiy_oladi,
  has_table_privilege('anon', c.oid, 'INSERT') as anon_yoza_oladi
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','v')
order by c.relname;
`.trim();

console.log("🔒 Anon kirishi yopilmoqda...\n");

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

const rows = Array.isArray(result) ? result : result?.[0] ?? [];
if (Array.isArray(rows) && rows.length) {
  console.log("jadval/view".padEnd(22), "RLS".padEnd(7), "anon o'qiydi".padEnd(14), "anon yozadi");
  for (const r of rows) {
    console.log(
      String(r.jadval).padEnd(22),
      String(r.rls_yoqilgan).padEnd(7),
      String(r.anon_oqiy_oladi).padEnd(14),
      String(r.anon_yoza_oladi)
    );
  }
}

console.log(`
✅ Tayyor.

Tekshirish (bo'sh yoki xato qaytishi kerak, ma'lumot emas):
  source .env.local
  curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/questions?select=correct_answer&limit=1" \\
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
`);

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
  console.error("PAT yoki URL topilmadi (.env.local da SUPABASE_ACCESS_TOKEN kerak)");
  process.exit(1);
}

const projectRef = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];

const sql = `
-- Rasch natijalari haqida xabar yuborilgan vaqt.
-- Cron shu ustun orqali progressni saqlaydi: uzilib qolsa qaytadan
-- boshlamaydi va hech kimga ikki marta xabar bormaydi.
alter table public.submissions
  add column if not exists notified_at timestamptz;

-- Rasch hisoblash oxirgi marta qachon muvaffaqiyatsiz tugagani.
-- Cron shu orqali qayta urinishni sekinlashtiradi (soatiga bir marta) —
-- aks holda hisoblab bo'lmaydigan test har daqiqada xato xabari yuborardi.
alter table public.tests
  add column if not exists rasch_failed_at timestamptz;

-- Navbatdagi qatorlarni tez topish uchun (faqat yuborilmaganlar).
create index if not exists idx_submissions_notified_at
  on public.submissions (notified_at)
  where notified_at is null;

-- Test bo'yicha ro'yxat/hisoblash so'rovlari uchun.
create index if not exists idx_submissions_test_submitted
  on public.submissions (test_id, submitted_at);

-- "Natijalarim" sahifasi uchun.
create index if not exists idx_submissions_user_submitted
  on public.submissions (user_tg_id, submitted_at desc);

-- Savollarni test bo'yicha guruhlab olish uchun.
create index if not exists idx_questions_test_id
  on public.questions (test_id);

-- MUHIM: mavjud barcha urinishlarni "xabar berilgan" deb belgilaymiz.
-- Aks holda cron ishga tushishi bilan eski testlar bo'yicha minglab
-- eskirgan xabar yuborilib ketardi.
update public.submissions
  set notified_at = now()
  where notified_at is null;
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
console.log("✅ submissions.notified_at, tests.rasch_failed_at va indekslar tayyor");

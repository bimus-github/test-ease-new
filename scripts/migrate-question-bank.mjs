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
create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  teacher_id text not null,
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice', 'fill_blank', 'true_false')),
  options text[],
  correct_answer text,
  correct_options text[],
  is_multiple_answers boolean default false,
  points integer default 1,
  media_url text,
  media_type text check (media_type in ('image', 'audio')),
  tags text[] default '{}',
  subject text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_question_bank_teacher on public.question_bank (teacher_id);
create index if not exists idx_question_bank_tags on public.question_bank using gin (tags);
create index if not exists idx_question_bank_subject on public.question_bank (subject);
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
console.log("✅ question_bank jadvali yaratildi");

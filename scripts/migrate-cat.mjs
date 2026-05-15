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
create table if not exists public.cat_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  pool_subject text not null,
  pool_filter jsonb default '{}',
  theta numeric default 0,
  se numeric,
  administered_items jsonb default '[]',
  responses jsonb default '[]',
  status text default 'in_progress' check (status in ('in_progress', 'finished')),
  final_theta numeric,
  final_se numeric,
  config jsonb default '{"maxItems": 20, "minItems": 5, "seThreshold": 0.3}',
  started_at timestamptz default now(),
  finished_at timestamptz,
  updated_at timestamptz default now()
);

create index if not exists idx_cat_sessions_student on public.cat_sessions (student_id);
create index if not exists idx_cat_sessions_status on public.cat_sessions (status);
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
console.log("✅ cat_sessions jadvali yaratildi");

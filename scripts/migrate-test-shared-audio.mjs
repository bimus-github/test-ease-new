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
alter table public.tests
  add column if not exists shared_audio_url text;
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
console.log("✅ tests.shared_audio_url ustuni qo'shildi");

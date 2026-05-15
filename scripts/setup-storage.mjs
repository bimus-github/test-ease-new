import { createClient } from "@supabase/supabase-js";
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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY topilmadi");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "question-media";

const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("Bucket'larni olishda xato:", listErr.message);
  process.exit(1);
}

const exists = buckets?.some((b) => b.name === BUCKET);
if (exists) {
  console.log(`✅ Bucket "${BUCKET}" allaqachon mavjud`);
} else {
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 26214400,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
      "audio/mp4",
      "audio/x-m4a",
    ],
  });

  if (createErr) {
    console.error("Bucket yaratishda xato:", createErr.message);
    process.exit(1);
  }
  console.log(`✅ Bucket "${BUCKET}" yaratildi (public, 25MB limit)`);
}

console.log("\n📋 Keyingi qadam: SQL migratsiya");
console.log("Supabase SQL Editor'da quyidagi SQL'ni ishga tushiring:\n");
console.log(`alter table public.questions`);
console.log(`  add column if not exists media_url text,`);
console.log(`  add column if not exists media_type text check (media_type in ('image', 'audio'));`);

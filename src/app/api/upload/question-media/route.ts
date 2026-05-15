import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const BUCKET = "question-media";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_AUDIO = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",
];
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_AUDIO = 25 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const teacherId = String(form.get("teacher_id") || "anon");
  const type = String(form.get("type") || "");

  if (!file) return NextResponse.json({ error: "Fayl yo'q" }, { status: 400 });
  if (type !== "image" && type !== "audio") {
    return NextResponse.json({ error: "Noto'g'ri tur" }, { status: 400 });
  }

  const allowed = type === "image" ? ALLOWED_IMAGE : ALLOWED_AUDIO;
  const maxSize = type === "image" ? MAX_IMAGE : MAX_AUDIO;

  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: type === "image" ? "Faqat rasm (JPG/PNG/WEBP/GIF)" : "Faqat audio (MP3/WAV/OGG/M4A)" },
      { status: 400 }
    );
  }
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `Fayl hajmi ${type === "image" ? "5MB" : "25MB"}'dan oshmasligi kerak` },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${teacherId}/${type}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}

export async function DELETE(req: Request) {
  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL yo'q" }, { status: 400 });
  }
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return NextResponse.json({ ok: true });
  const path = url.slice(idx + marker.length);
  await supabaseAdmin.storage.from(BUCKET).remove([path]);
  return NextResponse.json({ ok: true });
}

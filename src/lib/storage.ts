import { supabase } from "./supabase";
import type { MediaType } from "@/types/question";

const BUCKET = "question-media";

const MIME_BY_TYPE: Record<MediaType, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/x-m4a"],
};

const MAX_SIZE_BY_TYPE: Record<MediaType, number> = {
  image: 5 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
};

export const inferMediaType = (mime: string): MediaType | null => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  return null;
};

export const validateMediaFile = (file: File, type: MediaType): string | null => {
  if (!MIME_BY_TYPE[type].includes(file.type)) {
    return type === "image"
      ? "Faqat rasm fayllari (JPG, PNG, WEBP, GIF)"
      : "Faqat audio fayllari (MP3, WAV, OGG, M4A)";
  }
  if (file.size > MAX_SIZE_BY_TYPE[type]) {
    const limit = type === "image" ? "5MB" : "25MB";
    return `Fayl hajmi ${limit} dan oshmasligi kerak`;
  }
  return null;
};

export const uploadQuestionMedia = async (
  file: File,
  type: MediaType,
  teacherId: string
): Promise<{ url: string; error: null } | { url: null; error: string }> => {
  const validationError = validateMediaFile(file, type);
  if (validationError) return { url: null, error: validationError };

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${teacherId}/${type}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
};

export const deleteQuestionMedia = async (publicUrl: string): Promise<void> => {
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
};

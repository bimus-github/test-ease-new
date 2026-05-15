import type { MediaType } from "@/types/question";

export const inferMediaType = (mime: string): MediaType | null => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  return null;
};

export const uploadQuestionMedia = async (
  file: File,
  type: MediaType,
  teacherId: string
): Promise<{ url: string; error: null } | { url: null; error: string }> => {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  form.append("teacher_id", teacherId);

  // Pass Telegram WebApp initData if available — server uses it to verify identity
  const initData =
    typeof window !== "undefined" ? window.Telegram?.WebApp?.initData : undefined;
  if (initData) form.append("init_data", initData);

  const res = await fetch("/api/upload/question-media", {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) return { url: null, error: data.error || "Yuklashda xato" };
  return { url: data.url, error: null };
};

export const deleteQuestionMedia = async (publicUrl: string): Promise<void> => {
  await fetch("/api/upload/question-media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: publicUrl }),
  });
};

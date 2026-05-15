"use client";

import { useRef, useState } from "react";
import {
  uploadQuestionMedia,
  inferMediaType,
  deleteQuestionMedia,
} from "@/lib/storage";
import { QuestionMedia } from "./QuestionMedia";
import type { MediaType } from "@/types/question";

interface MediaUploadProps {
  teacherId: string;
  url?: string;
  type?: MediaType;
  onChange: (url: string | undefined, type: MediaType | undefined) => void;
  accept?: "all" | "image" | "audio";
}

export function MediaUpload({ teacherId, url, type, onChange, accept = "all" }: MediaUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const mediaType = inferMediaType(file.type);
    if (!mediaType) {
      setError("Fayl turi qo'llab-quvvatlanmaydi");
      return;
    }

    setUploading(true);
    if (url) await deleteQuestionMedia(url);

    const result = await uploadQuestionMedia(file, mediaType, teacherId);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onChange(result.url || undefined, mediaType);
  };

  const handleRemove = async () => {
    if (url) await deleteQuestionMedia(url);
    onChange(undefined, undefined);
    setError(null);
  };

  return (
    <div className="mt-3 grid gap-2">
      {url && type ? (
        <div className="grid gap-2">
          <QuestionMedia url={url} type={type} />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="self-start rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            Mediani o'chirish
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {(accept === "all" || accept === "image") && (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              🖼 Rasm qo'shish
            </button>
          )}
          {(accept === "all" || accept === "audio") && (
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              🎵 Audio qo'shish
            </button>
          )}
          {uploading && (
            <span className="text-xs text-neutral-500">Yuklanmoqda...</span>
          )}
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <div className="text-xs text-red-600 dark:text-red-400">{error}</div>}
    </div>
  );
}

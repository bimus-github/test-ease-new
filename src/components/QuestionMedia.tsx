"use client";

import Image from "next/image";
import type { MediaType } from "@/types/question";

interface QuestionMediaProps {
  url?: string;
  type?: MediaType;
  className?: string;
}

export function QuestionMedia({ url, type, className = "" }: QuestionMediaProps) {
  if (!url || !type) return null;

  if (type === "image") {
    return (
      <div className={`relative my-3 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 ${className}`}>
        <Image
          src={url}
          alt="Savol rasmi"
          width={800}
          height={600}
          unoptimized
          className="h-auto w-full object-contain"
        />
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className={`my-3 ${className}`}>
        <audio
          controls
          preload="metadata"
          src={url}
          className="w-full"
        >
          Brauzeringiz audio'ni qo'llab-quvvatlamaydi
        </audio>
      </div>
    );
  }

  return null;
}

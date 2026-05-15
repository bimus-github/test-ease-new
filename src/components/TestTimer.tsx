"use client";

import { useEffect, useState } from "react";

interface Props {
  startedAt?: string;
  endDate?: string;
  onTimeUp?: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TestTimer({ startedAt, endDate, onTimeUp }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!startedAt) return null;

  const startMs = new Date(startedAt).getTime();
  const elapsed = Math.max(0, Math.floor((now - startMs) / 1000));

  const endMs = endDate ? new Date(endDate).getTime() : 0;
  const remaining = endMs ? Math.max(0, Math.floor((endMs - now) / 1000)) : null;

  // Trigger callback once when time is up
  useEffect(() => {
    if (remaining === 0 && onTimeUp) onTimeUp();
  }, [remaining === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  let urgency: "normal" | "warning" | "critical" = "normal";
  if (remaining != null) {
    if (remaining <= 60) urgency = "critical";
    else if (remaining <= 300) urgency = "warning";
  }

  const baseClasses =
    "sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 border-b px-4 py-2 text-xs font-medium backdrop-blur sm:-mx-6 sm:px-6";
  const colorClasses =
    urgency === "critical"
      ? "border-red-300 bg-red-50/90 text-red-700 dark:border-red-700 dark:bg-red-950/80 dark:text-red-300"
      : urgency === "warning"
      ? "border-amber-300 bg-amber-50/90 text-amber-700 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-300"
      : "border-neutral-200 bg-neutral-50/90 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300";

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <div className="flex items-center gap-2">
        <span>⏱️ O'tgan:</span>
        <span className="font-mono font-bold tabular-nums">{formatDuration(elapsed)}</span>
      </div>
      {remaining != null && (
        <div className="flex items-center gap-2">
          <span>{urgency === "critical" ? "🚨" : "⏳"} Qolgan:</span>
          <span className="font-mono font-bold tabular-nums">
            {formatDuration(remaining)}
          </span>
        </div>
      )}
    </div>
  );
}

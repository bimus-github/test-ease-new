"use client";

import { useEffect, useState, useTransition } from "react";
import { createBroadcastJob } from "../actions";

type JobStatus = {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  total_users: number | null;
  last_page: number;
  sent: number;
  failed: number;
  blocked: number;
  error: string | null;
  created_at: string;
  completed_at: string | null;
};

export function BroadcastForm() {
  const [message, setMessage] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch(`/api/broadcast/jobs/${jobId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as JobStatus;
        if (!cancelled) setJob(data);
      } catch {
        // ignore transient fetch errors, next tick will retry
      }
    };

    tick();
    const interval = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jobId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createBroadcastJob(null, fd);
      if (result.ok) {
        setJobId(result.jobId);
        setJob(null);
      } else {
        setFormError(result.error);
      }
    });
  };

  const startNew = () => {
    setJobId(null);
    setJob(null);
    setMessage("");
    setFormError(null);
  };

  const isActive =
    job && (job.status === "pending" || job.status === "running");
  const isDone =
    job && (job.status === "completed" || job.status === "failed");

  const processed = job ? job.sent + job.failed + job.blocked : 0;
  const progressPct =
    job && job.total_users && job.total_users > 0
      ? Math.min(100, (processed / job.total_users) * 100)
      : null;

  return (
    <div className="space-y-4">
      {!jobId && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm text-gray-300">
              Xabar matni
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Barcha foydalanuvchilarga yuboriladigan xabar..."
              className="w-full resize-y rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Yuborish fon rejimida davom etadi. Tabni yopsangiz ham
              to&apos;xtamaydi. Har daqiqada 150 ta foydalanuvchiga yuboriladi.
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Yaratilmoqda..." : "Yuborishni boshlash"}
          </button>
          {formError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {formError}
            </div>
          )}
        </form>
      )}

      {jobId && (
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Holat</span>
              <span className="font-semibold">
                {!job && "Yuklanmoqda..."}
                {job?.status === "pending" && "Navbatda..."}
                {job?.status === "running" && "Yuborilmoqda..."}
                {job?.status === "completed" && "✅ Yakunlandi"}
                {job?.status === "failed" && "❌ Xatolik"}
              </span>
            </div>
            {job && (
              <>
                <Row label="Jami" value={job.total_users ?? "—"} />
                <Row label="Yuborildi" value={job.sent} />
                <Row label="Bloklangan" value={job.blocked} />
                <Row label="Xato" value={job.failed} />
                {progressPct != null && (
                  <div className="mt-3">
                    <div className="h-2 rounded bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {processed} / {job.total_users}
                    </p>
                  </div>
                )}
                {job.error && (
                  <p className="text-red-300 text-xs mt-2">{job.error}</p>
                )}
              </>
            )}
          </div>

          {isActive && (
            <p className="text-xs text-gray-500 text-center">
              Tabni yopsangiz ham yuborish fon rejimda davom etadi.
            </p>
          )}

          {isDone && (
            <button
              type="button"
              onClick={startNew}
              className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white font-semibold transition hover:bg-gray-600"
            >
              Yangi xabar yuborish
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAllUsers } from "@/dbs/bot-servers";
import { sendTelegramMessage } from "@/telegram/bot";

// Allow up to 60s per cron tick (Vercel Pro).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const BATCH_SIZE = 150;
const MAX_RATE_LIMIT_WAIT_MS = 8_000;

type BroadcastJob = {
  id: string;
  message: string;
  status: "pending" | "running" | "completed" | "failed";
  total_users: number | null;
  last_page: number;
  sent: number;
  failed: number;
  blocked: number;
};

const getErrorText = (error: unknown): string => {
  if (error && typeof error === "object") {
    const d = (error as { description?: unknown }).description;
    if (typeof d === "string") return d;
  }
  if (error instanceof Error) return error.message;
  return String(error ?? "");
};

const isBlockedError = (error: unknown): boolean => {
  if ((error as { isBlocked?: boolean })?.isBlocked === true) return true;
  const text = getErrorText(error).toLowerCase();
  return (
    text.includes("blocked") ||
    text.includes("deactivated") ||
    text.includes("chat not found")
  );
};

const getRateLimitRetryMs = (error: unknown): number | null => {
  const err = error as { isRateLimit?: boolean; retryAfter?: number };
  if (!err?.isRateLimit) return null;
  const secs = typeof err.retryAfter === "number" ? err.retryAfter : 1;
  return Math.min(secs * 1000, MAX_RATE_LIMIT_WAIT_MS);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function sendOnce(chatId: number | string, text: string) {
  try {
    await sendTelegramMessage(chatId, text);
    return "sent" as const;
  } catch (error) {
    const waitMs = getRateLimitRetryMs(error);
    if (waitMs != null) {
      await sleep(waitMs);
      try {
        await sendTelegramMessage(chatId, text);
        return "sent" as const;
      } catch (retryError) {
        if (isBlockedError(retryError)) return "blocked" as const;
        return "failed" as const;
      }
    }
    if (isBlockedError(error)) return "blocked" as const;
    return "failed" as const;
  }
}

async function processOne() {
  const { data: job, error: pickErr } = await supabaseAdmin
    .from("broadcast_jobs")
    .select("id, message, status, total_users, last_page, sent, failed, blocked")
    .in("status", ["pending", "running"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<BroadcastJob>();

  if (pickErr) throw pickErr;
  if (!job) return { idle: true as const };

  await supabaseAdmin
    .from("broadcast_jobs")
    .update({ status: "running", updated_at: new Date().toISOString() })
    .eq("id", job.id);

  const users = await getAllUsers(job.last_page, BATCH_SIZE);

  if (users.length === 0) {
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("broadcast_jobs")
      .update({ status: "completed", completed_at: now, updated_at: now })
      .eq("id", job.id);
    return { jobId: job.id, completed: true, processed: 0 };
  }

  let sent = 0;
  let failed = 0;
  let blocked = 0;

  for (const u of users) {
    const result = await sendOnce(u.telegram_id, job.message);
    if (result === "sent") sent += 1;
    else if (result === "blocked") blocked += 1;
    else failed += 1;
  }

  const done = users.length < BATCH_SIZE;
  const now = new Date().toISOString();

  await supabaseAdmin
    .from("broadcast_jobs")
    .update({
      sent: job.sent + sent,
      failed: job.failed + failed,
      blocked: job.blocked + blocked,
      last_page: job.last_page + 1,
      status: done ? "completed" : "running",
      completed_at: done ? now : null,
      updated_at: now,
    })
    .eq("id", job.id);

  return {
    jobId: job.id,
    completed: done,
    processed: users.length,
    sent,
    failed,
    blocked,
  };
}

export async function GET() {
  try {
    const result = await processOne();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/broadcast] failed", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

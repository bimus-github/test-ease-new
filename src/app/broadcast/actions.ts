"use server";

/*
 * ============================================================================
 *  ONE-TIME SETUP — run this SQL in the Supabase SQL editor once:
 * ============================================================================
 *
 *  create table if not exists public.broadcast_jobs (
 *    id           uuid primary key default gen_random_uuid(),
 *    message      text not null,
 *    status       text not null default 'pending'
 *                   check (status in ('pending','running','completed','failed')),
 *    total_users  integer,
 *    last_page    integer not null default 0,
 *    sent         integer not null default 0,
 *    failed       integer not null default 0,
 *    blocked      integer not null default 0,
 *    error        text,
 *    created_at   timestamptz not null default now(),
 *    updated_at   timestamptz not null default now(),
 *    completed_at timestamptz
 *  );
 *
 *  create index if not exists broadcast_jobs_status_created_at_idx
 *    on public.broadcast_jobs (status, created_at);
 *
 * ============================================================================
 */

import { supabaseAdmin } from "@/lib/supabase";

export type CreateBroadcastJobResult =
  | { ok: true; jobId: string }
  | { ok: false; error: string };

export async function createBroadcastJob(
  _prev: CreateBroadcastJobResult | null,
  formData: FormData
): Promise<CreateBroadcastJobResult> {
  const raw = formData.get("message");
  const message = typeof raw === "string" ? raw.trim() : "";

  if (!message) {
    return { ok: false, error: "Xabar matni bo'sh." };
  }

  // Best-effort total for progress UI — nullable if the count fails.
  const { count } = await supabaseAdmin
    .from("bot_users")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabaseAdmin
    .from("broadcast_jobs")
    .insert({
      message,
      status: "pending",
      total_users: count ?? null,
      last_page: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Job yaratilmadi.",
    };
  }

  return { ok: true, jobId: data.id };
}

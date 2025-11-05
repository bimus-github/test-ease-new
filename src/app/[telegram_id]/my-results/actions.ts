"use server";

import { getFullSubmissionsByUserId } from "@/dbs/submission-servers";
import type { FullSubmission } from "@/types/submission";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getMyResultsAction(params: {
  telegramId: string;
}): Promise<
  { ok: true; submissions: FullSubmission[] } | { ok: false; error: string }
> {
  const { telegramId } = params || ({} as any);
  if (!isNonEmptyString(telegramId)) {
    return { ok: false, error: "telegramId is required" };
  }
  try {
    const submissions = await getFullSubmissionsByUserId(telegramId);
    return { ok: true, submissions };
  } catch (err) {
    console.error("getMyResultsAction error", err);
    return { ok: false, error: "Server error while fetching results" };
  }
}

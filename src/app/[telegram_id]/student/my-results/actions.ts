"use server";

import { getSubmissionListByUser } from "@/dbs/submission-servers";
import type { SubmissionListItem } from "@/types/submission";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getMyResultsAction(params: {
  telegramId: string;
}): Promise<
  { ok: true; submissions: SubmissionListItem[] } | { ok: false; error: string }
> {
  const { telegramId } = params || ({} as any);
  if (!isNonEmptyString(telegramId)) {
    return { ok: false, error: "telegramId is required" };
  }
  try {
    const submissions = await getSubmissionListByUser(telegramId);
    return { ok: true, submissions };
  } catch (err) {
    console.error("getMyResultsAction error", err);
    return { ok: false, error: "Natijalarni yuklashda xatolik yuz berdi" };
  }
}

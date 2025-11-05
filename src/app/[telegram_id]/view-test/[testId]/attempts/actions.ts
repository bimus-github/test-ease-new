"use server";

import { getFullSubmissions } from "@/dbs/submission-servers";
import { calculateRaschForTest } from "@/dbs/rasch-servers";
import type { FullSubmission } from "@/types/submission";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getFullSubmissionsAction(params: {
  testId: string;
}): Promise<
  { ok: true; submissions: FullSubmission[] } | { ok: false; error: string }
> {
  const { testId } = params || ({} as any);
  if (!isNonEmptyString(testId)) {
    return { ok: false, error: "testId is required" };
  }
  try {
    const submissions = await getFullSubmissions(testId);
    return { ok: true, submissions };
  } catch (err) {
    console.error("getFullSubmissionsAction error", err);
    return { ok: false, error: "Server error while fetching submissions" };
  }
}

// Placeholder: wire to server-side Rasch calculation later
export async function calculateRaschAction(params: {
  testId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { testId } = params || ({} as any);
  if (!isNonEmptyString(testId))
    return { ok: false, error: "testId is required" };
  try {
    await calculateRaschForTest(testId);
    return { ok: true };
  } catch (err) {
    console.error("calculateRaschAction error", err);
    return { ok: false, error: "Server error while calculating Rasch" };
  }
}

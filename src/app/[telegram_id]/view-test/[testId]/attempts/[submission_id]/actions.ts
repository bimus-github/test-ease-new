"use server";

import { getFullSubmission } from "@/dbs/submission-servers";
import type { FullSubmission } from "@/types/submission";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getAttemptFullSubmissionAction(params: {
  submissionId: string;
}): Promise<
  { ok: true; submission: FullSubmission } | { ok: false; error: string }
> {
  const { submissionId } = params || ({} as any);
  if (!isNonEmptyString(submissionId)) {
    return { ok: false, error: "submissionId is required" };
  }
  try {
    const submission = await getFullSubmission(submissionId);
    if (!submission) return { ok: false, error: "Submission not found" };
    return { ok: true, submission };
  } catch (err) {
    console.error("getAttemptFullSubmissionAction error", err);
    return { ok: false, error: "Server error while fetching submission" };
  }
}

"use server";

import {
  startSubmission,
  submitSubmission,
  checkSubmissionStatus,
  checkSubmissionStatusByUserAndTest,
  getFullSubmission,
} from "@/dbs/submission-servers";
import type { Submission, Answer, FullSubmission } from "@/types/submission";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function startSubmissionAction(params: {
  telegramId: string;
  testId: string;
}): Promise<
  { ok: true; submission: Submission } | { ok: false; error: string }
> {
  const { telegramId, testId } = params || ({} as any);

  if (!isNonEmptyString(telegramId)) {
    return { ok: false, error: "telegramId is required" };
  }
  if (!isNonEmptyString(testId)) {
    return { ok: false, error: "testId is required" };
  }

  try {
    const submission = await startSubmission(telegramId, testId);
    if (!submission) return { ok: false, error: "Failed to start submission" };
    return { ok: true, submission };
  } catch (err) {
    console.error("startSubmissionAction error", err);
    return { ok: false, error: "Server error while starting submission" };
  }
}

export async function submitSubmissionAction(params: {
  submissionId: string;
  answers: Answer[];
}): Promise<
  { ok: true; submission: Submission } | { ok: false; error: string }
> {
  const { submissionId, answers } = params || ({} as any);

  if (!isNonEmptyString(submissionId)) {
    return { ok: false, error: "submissionId is required" };
  }
  if (!Array.isArray(answers)) {
    return { ok: false, error: "answers must be an array" };
  }

  try {
    const submission = await submitSubmission(submissionId, answers);
    if (!submission) return { ok: false, error: "Failed to submit submission" };
    return { ok: true, submission };
  } catch (err) {
    console.error("submitSubmissionAction error", err);
    return { ok: false, error: "Server error while submitting" };
  }
}

export async function checkSubmissionStatusAction(params: {
  submissionId: string;
}): Promise<{ ok: true; isSubmitted: boolean } | { ok: false; error: string }> {
  const { submissionId } = params || ({} as any);

  if (!isNonEmptyString(submissionId)) {
    return { ok: false, error: "submissionId is required" };
  }

  try {
    const isSubmitted = await checkSubmissionStatus(submissionId);
    return { ok: true, isSubmitted };
  } catch (err) {
    console.error("checkSubmissionStatusAction error", err);
    return { ok: false, error: "Server error while checking status" };
  }
}

export async function checkSubmissionStatusByUserAndTestAction(params: {
  telegramId: string;
  testId: string;
}): Promise<
  | {
      ok: true;
      status: { id: string; is_submitted: boolean; started_at: string };
    }
  | { ok: false; error: string }
> {
  const { telegramId, testId } = params || ({} as any);

  if (!isNonEmptyString(telegramId)) {
    return { ok: false, error: "telegramId is required" };
  }
  if (!isNonEmptyString(testId)) {
    return { ok: false, error: "testId is required" };
  }

  try {
    const status = await checkSubmissionStatusByUserAndTest(telegramId, testId);
    return {
      ok: true,
      status: {
        id: status.id,
        is_submitted: status.is_submitted,
        started_at: status.started_at,
      },
    };
  } catch (err) {
    console.error("checkSubmissionStatusByUserAndTestAction error", err);
    return { ok: false, error: "Server error while checking status" };
  }
}

export async function getFullSubmissionAction(params: {
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
    if (!submission)
      return { ok: false, error: "Failed to get full submission" };
    return { ok: true, submission };
  } catch (err) {
    console.error("getFullSubmissionAction error", err);
    return { ok: false, error: "Server error while getting full submission" };
  }
}

"use server";

import { getFullSubmission } from "@/dbs/submission-servers";
import type { FullSubmission } from "@/types/submission";
import { sendTelegramDocument } from "@/telegram/bot";
import { generateIndividualExcel } from "@/app/[telegram_id]/teacher/tests/[testId]/attempts/components/submissions/utils/generateIndividualExcel";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function getFullSubmissionByIdAction(params: {
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
    console.error("getFullSubmissionByIdAction error", err);
    return { ok: false, error: "Server error while fetching submission" };
  }
}

export async function sendMyResultExcelAction(params: {
  submissionId: string;
  telegramId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { submissionId, telegramId } = params || ({} as any);
  if (!isNonEmptyString(submissionId)) {
    return { ok: false, error: "submissionId is required" };
  }
  if (!isNonEmptyString(telegramId)) {
    return { ok: false, error: "telegramId is required" };
  }

  try {
    const submission = await getFullSubmission(submissionId);
    if (!submission) {
      return { ok: false, error: "Submission not found" };
    }

    const testTitle = submission.test.title || "Test";
    const buffer = await generateIndividualExcel(submission, submission.test);
    const filename = `${testTitle.replace(/[^a-z0-9]/gi, "_")}_natijam.xlsx`;

    await sendTelegramDocument(
      telegramId,
      buffer,
      filename,
      `📊 ${testTitle} - Sizning natijalaringiz\n\nTest kodi: ${submission.test.code}`
    );

    return { ok: true };
  } catch (err) {
    console.error("sendMyResultExcelAction error", err);
    return {
      ok: false,
      error: "Server error while sending Excel file via Telegram",
    };
  }
}

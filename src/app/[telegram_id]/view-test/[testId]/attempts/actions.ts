"use server";

import { getFullSubmissions } from "@/dbs/submission-servers";
import { calculateRaschForTest } from "@/dbs/rasch-servers";
import type { FullSubmission } from "@/types/submission";
import { sendTelegramDocument } from "@/telegram/bot";
import { generateExcelContent } from "./utils/exportToExcelServer";

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

export async function sendExcelViaTelegramAction(params: {
  testId: string;
  telegramId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { testId, telegramId } = params || ({} as any);
  if (!isNonEmptyString(testId))
    return { ok: false, error: "testId is required" };
  if (!isNonEmptyString(telegramId))
    return { ok: false, error: "telegramId is required" };

  try {
    const submissions = await getFullSubmissions(testId);
    if (!submissions || submissions.length === 0) {
      return { ok: false, error: "No submissions found" };
    }

    const testMeta = submissions[0]?.test;
    const showRasch = Boolean(testMeta?.isRaschCalculated);
    const testTitle = testMeta?.title || "Test";

    // Generate Excel buffer (now returns Buffer directly)
    const buffer = await generateExcelContent(submissions, showRasch);
    const filename = `${testTitle.replace(/[^a-z0-9]/gi, "_")}_urinishlar.xlsx`;

    // Send via Telegram
    await sendTelegramDocument(
      telegramId,
      buffer,
      filename,
      `📊 ${testTitle} - Urinishlar ro'yxati\n\nJami: ${submissions.length} ta urinish`
    );

    return { ok: true };
  } catch (err) {
    console.error("sendExcelViaTelegramAction error", err);
    return {
      ok: false,
      error: "Server error while sending Excel file via Telegram",
    };
  }
}

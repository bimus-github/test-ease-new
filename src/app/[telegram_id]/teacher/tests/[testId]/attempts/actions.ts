"use server";

import { getFullSubmissions } from "@/dbs/submission-servers";
import { calculateRaschForTest } from "@/dbs/rasch-servers";
import { getTestWithQuestions } from "@/dbs/test-servers";
import type { FullSubmission } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { sendTelegramDocument, sendTelegramMessage } from "@/telegram/bot";
import { generateExcelContent } from "./components/submissions/utils/generateExcelContent";
import { generateIndividualExcel } from "./components/submissions/utils/generateIndividualExcel";
import { gradeFromT, percentageFromT, calculateSatScore, calculatePoints } from "@/lib/helpers";
import { formatLocalDate } from "@/lib/utils";
import { TEST_RESULT_ROUTE } from "@/constants/routes";

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

    const test = await getTestWithQuestions(testId);
    if (!test) {
      return { ok: false, error: "Test not found" };
    }

    const testTitle = test.title || "Test";

    // Generate Excel buffer using the new function
    const buffer = await generateExcelContent(submissions, test);
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

export async function sendResultsToUsersAction(params: {
  testId: string;
}): Promise<{ ok: true; sent: number; failed: number } | { ok: false; error: string }> {
  const { testId } = params || ({} as any);
  if (!isNonEmptyString(testId)) {
    return { ok: false, error: "testId is required" };
  }

  try {
    const submissions = await getFullSubmissions(testId);
    if (!submissions || submissions.length === 0) {
      return { ok: false, error: "No submissions found" };
    }

    const test = await getTestWithQuestions(testId);
    if (!test) {
      return { ok: false, error: "Test not found" };
    }

    const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
    const isRaschCalculated = test.isRaschCalculated ?? false;
    const showRasch = isRaschTest && isRaschCalculated;
    const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
    const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;
    const isSimpleTest = test.scoring_type === ScoringType.SIMPLE_SCORING;

    let sent = 0;
    let failed = 0;

    // Process each submission
    for (const submission of submissions) {
      try {
        const userTelegramId = submission.user.telegram_id;
        if (!userTelegramId) {
          failed++;
          continue;
        }

        // Generate individual Excel file
        const buffer = await generateIndividualExcel(submission, test);
        const testTitle = test.title || "Test";
        const filename = `${testTitle.replace(/[^a-z0-9]/gi, "_")}_natijam.xlsx`;

        // Build summary message
        let summaryText = `📊 *Sizning natijalaringiz*\n\n`;
        summaryText += `📝 *Test:* ${test.title}\n`;
        summaryText += `🔑 *Test kodi:* \`${test.code}\`\n\n`;
        summaryText += `*Natijalar:*\n`;
        summaryText += `📊 To'g'ri javoblar: ${submission.row_score ?? 0}/${submission.questions?.length || 0}\n`;

        if (showRasch && submission.rasch_score != null) {
          const t = submission.rasch_score;
          summaryText += `📊 Rasch T-bahosi: ${t.toFixed(2)}\n`;
          summaryText += `⭐ Bahosi: ${gradeFromT(t)}\n`;
          summaryText += `📈 Foizi: ${percentageFromT(t)}\n`;
        }

        if (isSatTest) {
          const satScore = calculateSatScore(submission);
          summaryText += `📊 SAT bali: ${satScore ?? "—"}\n`;
        }

        if (isUzDtmTest) {
          const uzDtmPoints = calculatePoints(submission);
          summaryText += `📊 UZ DTM bali: ${uzDtmPoints != null ? uzDtmPoints.toFixed(1) : "—"}\n`;
        }

        if (isSimpleTest) {
          const simplePoints = calculatePoints(submission);
          const maxPoints = submission.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
          summaryText += `📊 Ballar: ${simplePoints != null ? `${simplePoints.toFixed(1)} / ${maxPoints.toFixed(1)}` : "—"}\n`;
        }

        summaryText += `\n📎 Batafsil ma'lumot Excel faylida.`;

        // Build keyboard for detailed view
        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "📊 Batafsil ko'rish",
                web_app: {
                  url: TEST_RESULT_ROUTE(submission.id, userTelegramId),
                },
              },
            ],
          ],
        };

        // Send Excel file with caption and button
        await sendTelegramDocument(
          userTelegramId,
          buffer,
          filename,
          summaryText
        );

        // Send follow-up message with button (Telegram doesn't support buttons in document captions)
        await sendTelegramMessage(userTelegramId, "Natijalaringizni batafsil ko'rish uchun quyidagi tugmani bosing:", {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });

        sent++;
      } catch (error) {
        console.error(
          `Error sending results to user ${submission.user.telegram_id}:`,
          error
        );
        failed++;
        // Continue with next user instead of failing entire operation
      }
    }

    return { ok: true, sent, failed };
  } catch (err) {
    console.error("sendResultsToUsersAction error", err);
    return {
      ok: false,
      error: "Server error while sending results to users",
    };
  }
}

export async function sendingMessageToUsersAction(params:{ids:string[], message:string}): Promise<{ ok: true; sent: number; failed: number } | { ok: false; error: string; sent: number; failed: number }> {
  const { ids, message } = params || ({} as any);
  let sent = 0;
  let failed = 0;
  
  if (!ids || ids.length === 0) {
    return { ok: false, error: "ids is required", sent: 0, failed: 0 };
  }
  if (!isNonEmptyString(message)) { 
    return { ok: false, error: "message is required", sent: 0, failed: 0 };
  }
  try {
    for (const id of ids) {
      try {
        await sendTelegramMessage(id, message, {
          parse_mode: "Markdown", // Optional: add if you want Markdown support
        });
        sent++;
      } catch (err) {
        console.error("sendingMessageToUsersAction error", err); // Fixed typo
        failed++;
      }
    }
    return { ok: true, sent, failed };
  } catch (err) {
    console.error("sendingMessageToUsersAction error", err); // Fixed typo
    return { ok: false, error: "Server error while sending message to users", sent, failed };
  }
}
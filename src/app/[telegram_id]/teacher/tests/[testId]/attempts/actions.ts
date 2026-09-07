"use server";

import {
  getSubmissionListByTest,
  getFullSubmission,
  countSubmittedByTest,
} from "@/dbs/submission-servers";
import { calculateRaschForTest } from "@/dbs/rasch-servers";
import { getTestWithQuestions } from "@/dbs/test-servers";
import type { SubmissionListItem } from "@/types/submission";
import { ScoringType } from "@/types/test";
import { sendTelegramDocument, sendTelegramMessage } from "@/telegram/bot";
import { generateExcelContent } from "./components/submissions/utils/generateExcelContent";
import { generateIndividualExcel } from "./components/submissions/utils/generateIndividualExcel";
import { gradeFromT, percentageFromT } from "@/lib/helpers";
import { TEST_RESULT_ROUTE } from "@/constants/routes";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Bitta chaqiruvda nechta o'quvchiga natija yuboriladi.
 *
 * Telegram sekundiga ~30 xabar qabul qiladi va Vercel funksiyasi 60 soniyada
 * uziladi. Shu sababli yuborish bo'laklarga bo'linadi — mijoz `offset` bilan
 * navbatdagi bo'lakni so'rab, jarayonni oxirigacha olib boradi.
 */
const SEND_CHUNK_SIZE = 40;

export async function getSubmissionsListAction(params: {
  testId: string;
}): Promise<
  { ok: true; submissions: SubmissionListItem[] } | { ok: false; error: string }
> {
  const { testId } = params || ({} as any);
  if (!isNonEmptyString(testId)) {
    return { ok: false, error: "testId is required" };
  }
  try {
    const submissions = await getSubmissionListByTest(testId);
    return { ok: true, submissions };
  } catch (err) {
    console.error("getSubmissionsListAction error", err);
    return { ok: false, error: "Urinishlarni yuklashda xatolik yuz berdi" };
  }
}

/**
 * Rasch hisoblashni ishga tushiradi.
 * Xatolik bo'lsa sababi qaytariladi — avval u yutilar va UI muvaffaqiyat
 * ko'rsatar, natijalar esa hech qachon paydo bo'lmasdi.
 */
export async function calculateRaschAction(params: {
  testId: string;
}): Promise<
  | { ok: true; updatedQuestions: number; updatedSubmissions: number }
  | { ok: false; error: string }
> {
  const { testId } = params || ({} as any);
  if (!isNonEmptyString(testId))
    return { ok: false, error: "testId is required" };

  try {
    const result = await calculateRaschForTest(testId);
    if (!result.ok) return result;

    return {
      ok: true,
      updatedQuestions: result.updatedQuestions,
      updatedSubmissions: result.updatedSubmissions,
    };
  } catch (err) {
    console.error("calculateRaschAction error", err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Rasch hisoblashda xatolik yuz berdi",
    };
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
    const submissions = await getSubmissionListByTest(testId);
    if (submissions.length === 0) {
      return { ok: false, error: "Urinishlar topilmadi" };
    }

    const test = await getTestWithQuestions(testId);
    if (!test) {
      return { ok: false, error: "Test topilmadi" };
    }

    const testTitle = test.title || "Test";

    const buffer = await generateExcelContent(submissions, test);
    const filename = `${testTitle.replace(/[^a-z0-9]/gi, "_")}_urinishlar.xlsx`;

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
      error: "Excel faylni Telegram orqali yuborishda xatolik yuz berdi",
    };
  }
}

/**
 * Natijalarni o'quvchilarga BO'LAKLAB yuboradi.
 *
 * `offset` — nechanchi urinishdan boshlash. Javobdagi `nextOffset` `null`
 * bo'lsa, yuborish tugagan. Mijoz shu qiymat bilan qayta chaqiradi.
 */
export async function sendResultsToUsersAction(params: {
  testId: string;
  offset?: number;
}): Promise<
  | {
      ok: true;
      sent: number;
      failed: number;
      processed: number;
      total: number;
      nextOffset: number | null;
    }
  | { ok: false; error: string }
> {
  const { testId, offset = 0 } = params || ({} as any);
  if (!isNonEmptyString(testId)) {
    return { ok: false, error: "testId is required" };
  }

  try {
    const total = await countSubmittedByTest(testId);
    if (total === 0) {
      return { ok: false, error: "Urinishlar topilmadi" };
    }

    const start = Math.max(0, Math.floor(offset));

    // Butun ro'yxat emas, faqat shu bo'lak yuklanadi.
    const chunk = await getSubmissionListByTest(testId, {
      offset: start,
      limit: SEND_CHUNK_SIZE,
    });

    const test = await getTestWithQuestions(testId);
    if (!test) {
      return { ok: false, error: "Test topilmadi" };
    }

    const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
    const isRaschCalculated = test.isRaschCalculated ?? false;
    const showRasch = isRaschTest && isRaschCalculated;
    const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
    const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;
    const isSimpleTest = test.scoring_type === ScoringType.SIMPLE_SCORING;

    let sent = 0;
    let failed = 0;

    for (const submission of chunk) {
      try {
        const userTelegramId = submission.user?.telegram_id;
        if (!userTelegramId) {
          failed++;
          continue;
        }

        // Individual Excel savollar matnini talab qiladi — u faqat shu
        // o'quvchi uchun, bittalab yuklanadi.
        const fullSubmission = await getFullSubmission(submission.id);
        if (!fullSubmission) {
          failed++;
          continue;
        }

        const buffer = await generateIndividualExcel(fullSubmission, test);
        const testTitle = test.title || "Test";
        const filename = `${testTitle.replace(/[^a-z0-9]/gi, "_")}_natijam.xlsx`;

        let summaryText = `📊 *Sizning natijalaringiz*\n\n`;
        summaryText += `📝 *Test:* ${test.title}\n`;
        summaryText += `🔑 *Test kodi:* \`${test.code}\`\n\n`;
        summaryText += `*Natijalar:*\n`;
        summaryText += `📊 To'g'ri javoblar: ${submission.row_score}/${submission.total_questions}\n`;

        if (showRasch && submission.rasch_score != null) {
          const t = submission.rasch_score;
          summaryText += `📊 Rasch T-bahosi: ${t.toFixed(2)}\n`;
          summaryText += `⭐ Bahosi: ${gradeFromT(t)}\n`;
          summaryText += `📈 Foizi: ${percentageFromT(t)}\n`;
        }

        if (isSatTest) {
          summaryText += `📊 SAT bali: ${submission.sat_score}\n`;
        }

        if (isUzDtmTest) {
          summaryText += `📊 UZ DTM bali: ${submission.points.toFixed(1)}\n`;
        }

        if (isSimpleTest) {
          summaryText += `📊 Ballar: ${submission.points.toFixed(
            1
          )} / ${submission.max_points.toFixed(1)}\n`;
        }

        summaryText += `\n📎 Batafsil ma'lumot Excel faylida.`;

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

        await sendTelegramDocument(
          userTelegramId,
          buffer,
          filename,
          summaryText
        );

        // Telegram hujjat izohida tugmani qo'llab-quvvatlamaydi — alohida xabar.
        await sendTelegramMessage(
          userTelegramId,
          "Natijalaringizni batafsil ko'rish uchun quyidagi tugmani bosing:",
          {
            parse_mode: "Markdown",
            reply_markup: keyboard,
          }
        );

        sent++;
      } catch (error) {
        console.error(
          `Error sending results to user ${submission.user?.telegram_id}:`,
          error
        );
        failed++;
        // Bitta o'quvchi xatosi butun jarayonni to'xtatmasin.
      }
    }

    const nextOffset =
      chunk.length > 0 && start + chunk.length < total
        ? start + chunk.length
        : null;

    return {
      ok: true,
      sent,
      failed,
      processed: chunk.length,
      total,
      nextOffset,
    };
  } catch (err) {
    console.error("sendResultsToUsersAction error", err);
    return {
      ok: false,
      error: "Natijalarni yuborishda xatolik yuz berdi",
    };
  }
}

export async function sendingMessageToUsersAction(params: {
  ids: string[];
  message: string;
  offset?: number;
}): Promise<
  | {
      ok: true;
      sent: number;
      failed: number;
      processed: number;
      total: number;
      nextOffset: number | null;
    }
  | { ok: false; error: string }
> {
  const { ids, message, offset = 0 } = params || ({} as any);

  if (!ids || ids.length === 0) {
    return { ok: false, error: "Talabalar ro'yxati bo'sh" };
  }
  if (!isNonEmptyString(message)) {
    return { ok: false, error: "Xabar matni kiritilmagan" };
  }

  const start = Math.max(0, Math.floor(offset));
  const chunk = ids.slice(start, start + SEND_CHUNK_SIZE);

  let sent = 0;
  let failed = 0;

  for (const id of chunk) {
    try {
      await sendTelegramMessage(id, message, { parse_mode: "Markdown" });
      sent++;
    } catch (err) {
      console.error("sendingMessageToUsersAction error", err);
      failed++;
    }
  }

  const nextOffset = start + chunk.length < ids.length ? start + chunk.length : null;

  return {
    ok: true,
    sent,
    failed,
    processed: chunk.length,
    total: ids.length,
    nextOffset,
  };
}

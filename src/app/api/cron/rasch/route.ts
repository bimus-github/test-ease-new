import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateRaschForTest } from "@/dbs/rasch-servers";
import { getSubmissionListByIds } from "@/dbs/submission-servers";
import { sendRaschResultsNotification } from "@/telegram/notifications/sendRaschResultsNotification";
import { sendTelegramMessage } from "@/telegram/bot";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { ScoringType } from "@/types/test";
import { TEST_ATTEMPTS_ROUTE } from "@/constants/routes";

// Vercel Pro'da bitta cron tiki uchun 60 soniya.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Bitta tikda nechta test hisoblanadi (JML og'ir — bittadan) */
const TESTS_PER_TICK = 1;

/** Bitta tikda nechta o'quvchiga xabar yuboriladi */
const NOTIFY_BATCH = 60;

/**
 * Hisoblash muvaffaqiyatsiz tugagan testni qayta urinishdan oldingi kutish.
 * Bu bo'lmasa, hisoblab bo'lmaydigan test har daqiqada xato xabari yuborardi.
 */
const RETRY_AFTER_MS = 60 * 60 * 1000;

/**
 * Juda eski, allaqachon hisoblangan testlar uchun xabar yuborilmasin.
 * (Migratsiya mavjud qatorlarni `notified_at` bilan belgilaydi; bu qo'shimcha himoya.)
 */
const NOTIFY_WINDOW_DAYS = 14;

type CalculatedTest = {
  id: string;
  title: string | null;
  teacher_id: string | null;
  /** Migratsiyadan keyin paydo bo'ladi; bo'lmasa backoff'siz ishlaydi */
  rasch_failed_at?: string | null;
};

/**
 * `submissions.notified_at` ustuni hali qo'shilmaganini aniqlaydi.
 * (`scripts/migrate-rasch-notifications.mjs` ishga tushirilmagan holat.)
 */
function isMissingNotifiedColumn(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  return e?.code === "42703" || Boolean(e?.message?.includes("notified_at"));
}

/**
 * Muddati tugagan, lekin hali hisoblanmagan Rasch testlarini hisoblaydi.
 *
 * Avval bu faqat o'qituvchi tugmani bosganda ishga tushardi — tugma bosilmasa
 * natijalar hech qachon paydo bo'lmasdi.
 */
async function calculatePendingTests() {
  const nowIso = new Date().toISOString();

  // `select("*")`: `rasch_failed_at` hali qo'shilmagan bo'lsa ham so'rov
  // yiqilmasin — ustun shunchaki obyektda bo'lmaydi.
  const { data, error } = await supabaseAdmin
    .from("tests")
    .select("*")
    .eq("scoring_type", ScoringType.RASCH_SCORING)
    .not("end_date", "is", null)
    .lt("end_date", nowIso)
    .or("isRaschCalculated.is.null,isRaschCalculated.eq.false")
    .order("end_date", { ascending: true })
    .limit(TESTS_PER_TICK * 10);

  if (error) throw error;

  const retryBefore = Date.now() - RETRY_AFTER_MS;
  const tests = ((data || []) as CalculatedTest[])
    // Yaqinda muvaffaqiyatsiz bo'lganlarini o'tkazib yuboramiz.
    .filter(
      (t) =>
        !t.rasch_failed_at || new Date(t.rasch_failed_at).getTime() < retryBefore
    )
    .slice(0, TESTS_PER_TICK);

  const results: { testId: string; ok: boolean; detail: string }[] = [];

  for (const test of tests) {
    const result = await calculateRaschForTest(test.id);

    if (!result.ok) {
      results.push({ testId: test.id, ok: false, detail: result.error });
      sendProductionErrors(
        result.error,
        `cron/rasch - calculate failed, testId: ${test.id}`
      );

      // Belgilab qo'yamiz: aks holda hisoblab bo'lmaydigan test har daqiqada
      // qayta urinilib, xato xabarlari bilan to'ldirib yuborardi.
      const { error: markErr } = await supabaseAdmin
        .from("tests")
        .update({ rasch_failed_at: new Date().toISOString() })
        .eq("id", test.id);
      if (markErr) {
        console.warn("[cron/rasch] rasch_failed_at yozilmadi", markErr.message);
      }

      continue;
    }

    results.push({
      testId: test.id,
      ok: true,
      detail: `${result.updatedSubmissions} ta natija, ${result.updatedQuestions} ta savol`,
    });

    // O'qituvchiga bitta xabar — o'quvchilarga xabarlar keyingi bosqichda.
    if (test.teacher_id) {
      try {
        await sendTelegramMessage(
          test.teacher_id,
          `✅ *Rasch hisoblandi*\n\n📝 *Test:* ${test.title || "Test"}\n` +
            `📊 Yangilangan natijalar: ${result.updatedSubmissions}\n` +
            `📊 Yangilangan savollar: ${result.updatedQuestions}`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📊 Urinishlarni ko'rish",
                    web_app: {
                      url: TEST_ATTEMPTS_ROUTE({
                        telegramId: test.teacher_id,
                        testId: test.id,
                      }),
                    },
                  },
                ],
              ],
            },
          }
        );
      } catch (err) {
        console.error("[cron/rasch] teacher notify failed", err);
      }
    }
  }

  return results;
}

/**
 * Hisoblangan testlar bo'yicha o'quvchilarga natija xabarini bo'laklab yuboradi.
 *
 * `submissions.notified_at` progressni saqlaydi: cron uzilib qolsa ham
 * qaytadan boshlamaydi va hech kimga ikki marta xabar bormaydi.
 */
async function notifyPending() {
  const since = new Date(
    Date.now() - NOTIFY_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select("id, tests!inner(isRaschCalculated, rasch_calculated_at, scoring_type)")
    .is("notified_at", null)
    .not("submitted_at", "is", null)
    .eq("tests.isRaschCalculated", true)
    .eq("tests.scoring_type", ScoringType.RASCH_SCORING)
    .gte("tests.rasch_calculated_at", since)
    .order("id", { ascending: true })
    .limit(NOTIFY_BATCH);

  if (error) {
    if (isMissingNotifiedColumn(error)) {
      // Migratsiya hali ishga tushirilmagan — hisoblash to'xtamasin.
      return { notified: 0, skipped: 0, pendingMigration: true };
    }
    throw error;
  }

  const ids = (data || []).map((row: { id: string }) => row.id);
  if (ids.length === 0) return { notified: 0, skipped: 0 };

  const submissions = await getSubmissionListByIds(ids);

  let notified = 0;
  for (const submission of submissions) {
    try {
      await sendRaschResultsNotification(submission);
      notified++;
    } catch (err) {
      // Bitta o'quvchi xatosi butun navbatni to'xtatmasin.
      console.error("[cron/rasch] notify failed", submission.id, err);
    }
  }

  // Yuborilgani ham, yuborilmagani ham belgilanadi — aks holda nosoz
  // chat ID'lar navbatni abadiy band qilib turadi.
  const { error: markErr } = await supabaseAdmin
    .from("submissions")
    .update({ notified_at: new Date().toISOString() })
    .in("id", ids);

  if (markErr) throw markErr;

  return { notified, skipped: ids.length - notified };
}

export async function GET(request: NextRequest) {
  // CRON_SECRET o'rnatilgan bo'lsa, faqat Vercel cron chaqira oladi.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const calculated = await calculatePendingTests();
    const notifications = await notifyPending();

    return NextResponse.json({ ok: true, calculated, notifications });
  } catch (error) {
    console.error("[cron/rasch] failed", error);
    sendProductionErrors(error, "cron/rasch");
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

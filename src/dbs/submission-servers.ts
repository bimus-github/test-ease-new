import { supabase } from "@/lib/supabase";
import {
  Submission,
  FullSubmission,
  SubmissionListItem,
  SubmissionAnswers,
  Answer,
  SubmissionStats,
} from "@/types/submission";
import { ScoringQuestion } from "@/types/question";
import { calculateRowScore, scoreAnswers, maxPointsOf } from "@/lib/helpers";
import { getScoringQuestionsByTests } from "@/dbs/question-servers";
import { sendSubmissionNotification } from "@/telegram/notifications/sendSubmissionNotification";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";

/**
 * Supabase query builder turi. Filtrlar zanjirida builder turi o'zgarib
 * turgani uchun aniq tur berish amaliy emas.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListQuery = any;

/** PostgREST bitta so'rovda qaytaradigan maksimal qator soni */
const PAGE_SIZE = 1000;

/**
 * Ro'yxat uchun kerakli ustunlar. `questions` ATAYLAB olinmaydi —
 * u har bir qatorda ~31 KB joy egallaydi va 1000 urinishli testda
 * javobni 38 MB ga olib chiqadi (Vercel chegarasi 4.5 MB).
 */
const LIST_COLUMNS =
  "id, started_at, submitted_at, rasch_score, rasch_ability, created_at, updated_at, answers, user, test";

function logDbError(context: string, error: unknown) {
  console.error(`[DB] ${context}:`, error);
  sendProductionErrors(error, `submission-servers - ${context}`);
}

/** Auto-submit'ni faqat kerakli qatorlarga cheklash uchun doira */
export type AutoSubmitScope = {
  testId?: string;
  userTgId?: string;
  submissionId?: string;
};

/**
 * Muddati tugagan testlarning yakunlanmagan submission'larini avtomatik yopadi.
 *
 * Muhim: o'quvchi testni tugatmasdan chiqib ketsa ham, test muddati tugamaguncha
 * uning submission'i avtomatik yakunlanmaydi — auto-complete faqat test tugagach.
 *
 * `scope` berilishi shart: har bir sahifa yuklanishida butun bazani skanerlash
 * (avvalgi xatti-harakat) katta bazada sekin va keraksiz. Chaqiruvchi doim
 * o'zi ko'rmoqchi bo'lgan test/foydalanuvchi doirasini beradi.
 */
export async function autoSubmitExpiredSubmissions(
  scope: AutoSubmitScope
): Promise<number> {
  if (!scope?.testId && !scope?.userTgId && !scope?.submissionId) {
    // Doirasiz global skanerlashga yo'l qo'ymaymiz.
    return 0;
  }

  try {
    const nowIso = new Date().toISOString();
    let closed = 0;

    // Bir chaqiruvda cheksiz aylanib qolmaslik uchun sahifalar soni chegaralangan.
    for (let page = 0; page < 20; page++) {
      let query = supabase
        .from("submissions")
        .select("id, tests!inner(end_date)")
        .is("submitted_at", null)
        .not("tests.end_date", "is", null)
        .lt("tests.end_date", nowIso)
        .order("id", { ascending: true })
        .limit(PAGE_SIZE);

      if (scope.submissionId) query = query.eq("id", scope.submissionId);
      if (scope.testId) query = query.eq("test_id", scope.testId);
      if (scope.userTgId) query = query.eq("user_tg_id", scope.userTgId);

      const { data, error } = await query;

      if (error) {
        logDbError("autoSubmitExpiredSubmissions:select", error);
        return closed;
      }

      const ids = (data || []).map((row: { id: string }) => row.id);
      if (ids.length === 0) return closed;

      const { error: updError } = await supabase
        .from("submissions")
        .update({ submitted_at: nowIso })
        .in("id", ids);

      if (updError) {
        logDbError("autoSubmitExpiredSubmissions:update", updError);
        return closed;
      }

      closed += ids.length;

      // Yangilangan qatorlar endi filtrga tushmaydi, shuning uchun keyingi
      // aylanish qolganlarini oladi. To'liq sahifa kelmagan bo'lsa — tugadi.
      if (ids.length < PAGE_SIZE) return closed;
    }

    return closed;
  } catch (error) {
    logDbError("autoSubmitExpiredSubmissions", error);
    return 0;
  }
}

/**
 * Start a new submission (track start time)
 * @param userTgId - User's Telegram ID
 * @param testId - Test UUID
 * @returns Submission object or null if failed
 */
export async function startSubmission(
  userTgId: string,
  testId: string
): Promise<Submission | null> {
  try {
    // check if submission already exists
    const { is_submitted } = await checkSubmissionStatusByUserAndTest(
      userTgId,
      testId
    );

    if (is_submitted) {
      logDbError("startSubmission", "Submission already exists");
      return null;
    }

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_tg_id: userTgId,
        test_id: testId,
        started_at: new Date().toISOString(),
        answers: [],
      })
      .select()
      .single();

    if (error) {
      logDbError("startSubmission", error);
      return null;
    }

    return data as Submission;
  } catch (error) {
    logDbError("startSubmission", error);
    return null;
  }
}

/**
 * Submit a submission with answers
 * @param submissionId - Submission UUID
 * @param answers - Array of answers
 * @returns Submission object or null if failed
 */
export async function submitSubmission(
  submissionId: string,
  answers: Answer[]
): Promise<Submission | null> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({
        answers,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select()
      .single();

    if (error) {
      logDbError("submitSubmission", error);
      return null;
    }

    // Send notification to teacher about the submission
    if (data) {
      // Get full submission data for notification
      const fullSubmission = await getFullSubmission(submissionId);
      if (fullSubmission) {
        sendSubmissionNotification(fullSubmission).catch((error) => {
          console.error("Error sending submission notification:", error);
          // Don't throw - notification failure shouldn't block submission
        });
      }
    }

    return data as Submission;
  } catch (error) {
    logDbError("submitSubmission", error);
    return null;
  }
}

/** `full_submissions` view'idagi yengil qator (questions'siz) */
type ListRow = {
  id: string;
  started_at: string;
  submitted_at?: string;
  rasch_score?: number;
  rasch_ability?: number;
  created_at: string;
  updated_at: string;
  answers: Answer[] | null;
  user: SubmissionListItem["user"];
  test: SubmissionListItem["test"];
};

/**
 * Yengil qatorlarni sahifalab oladi.
 * Tartib barqaror bo'lishi uchun oxirgi mezon doim `id` — aks holda
 * `rasch_score` bo'sh (null) bo'lganda sahifalar orasida qatorlar
 * takrorlanishi yoki tushib qolishi mumkin.
 */
async function fetchListRows(
  context: string,
  applyFilters: (q: ListQuery) => ListQuery
): Promise<ListRow[]> {
  const allRows: ListRow[] = [];
  let from = 0;

  for (;;) {
    const query = applyFilters(
      supabase.from("full_submissions").select(LIST_COLUMNS)
    ).range(from, from + PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      logDbError(context, error);
      // Xatoni yutmaymiz: bo'sh ro'yxat "urinish yo'q" degan yolg'on
      // xabarga aylanardi. Chaqiruvchi buni foydalanuvchiga ko'rsatadi.
      throw new Error("Urinishlarni yuklashda xatolik yuz berdi");
    }

    const rows = (data || []) as unknown as ListRow[];
    allRows.push(...rows);

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows;
}

/**
 * Yengil qatorlarni `SubmissionListItem`ga aylantiradi: barcha hosilaviy
 * ballar shu yerda — serverda — hisoblanadi, mijozga faqat sonlar boradi.
 */
function toListItems(
  rows: ListRow[],
  questionsByTest: Map<string, ScoringQuestion[]>
): SubmissionListItem[] {
  // Bir test uchun maksimal ball bir marta hisoblanadi.
  const maxPointsByTest = new Map<string, number>();

  return rows.map((row) => {
    const testId = row.test?.id || "";
    const questions = questionsByTest.get(testId) || [];

    let maxPoints = maxPointsByTest.get(testId);
    if (maxPoints === undefined) {
      maxPoints = maxPointsOf(questions);
      maxPointsByTest.set(testId, maxPoints);
    }

    const { rowScore, points, satScore } = scoreAnswers(row.answers, questions);

    return {
      id: row.id,
      started_at: row.started_at,
      submitted_at: row.submitted_at,
      rasch_score: row.rasch_score,
      rasch_ability: row.rasch_ability,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: row.user,
      test: row.test,
      row_score: rowScore,
      points,
      sat_score: satScore,
      total_questions: questions.length,
      max_points: maxPoints,
    };
  });
}

/**
 * Bitta test bo'yicha topshirilgan urinishlar ro'yxati (o'qituvchi sahifasi).
 *
 * `questions` qatorlar bilan birga tortilmaydi — savollar test uchun bir marta
 * yuklanadi va ballar serverda hisoblanadi.
 *
 * @param testId - Test UUID
 * @param page - Ixtiyoriy `{ offset, limit }`: bo'laklab yuborishda faqat
 *               kerakli qismni olish uchun. Tartib barqaror bo'lgani sababli
 *               chaqiruvlar orasida qatorlar joyini o'zgartirmaydi.
 * @returns SubmissionListItem massivi
 */
export async function getSubmissionListByTest(
  testId: string,
  page?: { offset: number; limit: number }
): Promise<SubmissionListItem[]> {
  try {
    // Faqat shu testning muddati o'tgan urinishlarini yopamiz.
    await autoSubmitExpiredSubmissions({ testId });

    const applyFilters = (q: ListQuery) =>
      q
        .eq("test_id", testId)
        .not("submitted_at", "is", null)
        .order("rasch_score", { ascending: false, nullsFirst: false })
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: true });

    let rows: ListRow[];

    if (page) {
      const { data, error } = await applyFilters(
        supabase.from("full_submissions").select(LIST_COLUMNS)
      ).range(page.offset, page.offset + page.limit - 1);

      if (error) {
        logDbError("getSubmissionListByTest", error);
        throw new Error("Urinishlarni yuklashda xatolik yuz berdi");
      }
      rows = (data || []) as unknown as ListRow[];
    } else {
      rows = await fetchListRows("getSubmissionListByTest", applyFilters);
    }

    if (rows.length === 0) return [];

    const questionsByTest = await getScoringQuestionsByTests([testId]);
    return toListItems(rows, questionsByTest);
  } catch (error) {
    logDbError("getSubmissionListByTest", error);
    throw error;
  }
}

/**
 * Berilgan ID'lar bo'yicha yengil submission yozuvlarini oladi.
 * Cron xabarnomalarida bo'lak-bo'lak ishlash uchun ishlatiladi.
 *
 * @param ids - Submission UUID'lari (maksimal bir bo'lak)
 */
export async function getSubmissionListByIds(
  ids: string[]
): Promise<SubmissionListItem[]> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from("full_submissions")
      .select(LIST_COLUMNS)
      .in("id", unique)
      .order("id", { ascending: true });

    if (error) {
      logDbError("getSubmissionListByIds", error);
      throw new Error("Urinishlarni yuklashda xatolik yuz berdi");
    }

    const rows = (data || []) as unknown as ListRow[];
    if (rows.length === 0) return [];

    const testIds = rows.map((r) => r.test?.id).filter(Boolean) as string[];
    const questionsByTest = await getScoringQuestionsByTests(testIds);

    return toListItems(rows, questionsByTest);
  } catch (error) {
    logDbError("getSubmissionListByIds", error);
    throw error;
  }
}

/**
 * Test bo'yicha topshirilgan urinishlar sonini qaytaradi (qatorlarni yuklamasdan).
 * @param testId - Test UUID
 */
export async function countSubmittedByTest(testId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("test_id", testId)
      .not("submitted_at", "is", null);

    if (error) {
      logDbError("countSubmittedByTest", error);
      throw new Error("Urinishlar sonini olishda xatolik yuz berdi");
    }

    return count || 0;
  } catch (error) {
    logDbError("countSubmittedByTest", error);
    throw error;
  }
}

/**
 * Rasch hisoblash uchun minimal ma'lumot: faqat submission id va javoblar.
 * @param testId - Test UUID
 */
export async function getSubmissionAnswersByTest(
  testId: string
): Promise<SubmissionAnswers[]> {
  try {
    await autoSubmitExpiredSubmissions({ testId });

    const all: SubmissionAnswers[] = [];
    let from = 0;

    for (;;) {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, answers")
        .eq("test_id", testId)
        .not("submitted_at", "is", null)
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        logDbError("getSubmissionAnswersByTest", error);
        throw new Error("Javoblarni yuklashda xatolik yuz berdi");
      }

      const rows = (data || []) as { id: string; answers: Answer[] | null }[];
      all.push(...rows.map((r) => ({ id: r.id, answers: r.answers || [] })));

      if (rows.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return all;
  } catch (error) {
    logDbError("getSubmissionAnswersByTest", error);
    throw error;
  }
}

/**
 * Check if a submission has been submitted
 * @param submissionId - Submission UUID
 * @returns boolean indicating if submission is submitted
 */
export async function checkSubmissionStatus(
  submissionId: string
): Promise<boolean> {
  try {
    // Faqat shu urinishni tekshiramiz.
    await autoSubmitExpiredSubmissions({ submissionId });

    const { data, error } = await supabase
      .from("submissions")
      .select("submitted_at")
      .eq("id", submissionId)
      .single();

    if (error) {
      logDbError("checkSubmissionStatus", error);
      return false;
    }

    // Check if submitted_at exists and is not an empty string
    return data && data.submitted_at != null && data.submitted_at !== "";
  } catch (error) {
    logDbError("checkSubmissionStatus", error);
    return false;
  }
}

export async function checkSubmissionStatusByUserAndTest(
  userId: string,
  testId: string
): Promise<{
  id: string;
  is_submitted: boolean;
  started_at: string;
}> {
  try {
    // Faqat shu foydalanuvchi + test juftligini yopamiz.
    await autoSubmitExpiredSubmissions({ userTgId: userId, testId });

    const { data, error } = await supabase
      .from("submissions")
      .select("id, submitted_at, started_at, created_at")
      .eq("user_tg_id", userId)
      .eq("test_id", testId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logDbError("checkSubmissionStatusByUserAndTest", error);
      return { id: "", is_submitted: false, started_at: "" };
    }

    return {
      id: data?.id || "",
      is_submitted: !!data && !!data.submitted_at,
      started_at: data?.started_at || "",
    };
  } catch (error) {
    logDbError("checkSubmissionStatusByUserAndTest", error);
    return { id: "", is_submitted: false, started_at: "" };
  }
}

/**
 * O'quvchining barcha natijalari ro'yxati ("Natijalarim").
 *
 * Har bir qator boshqa testga tegishli bo'lgani uchun savollar test'lar
 * bo'yicha guruhlab, bitta so'rovda yuklanadi.
 *
 * @param userTgId - Foydalanuvchining Telegram ID'si
 * @returns SubmissionListItem massivi
 */
export async function getSubmissionListByUser(
  userTgId: string
): Promise<SubmissionListItem[]> {
  try {
    // Faqat shu foydalanuvchining muddati o'tgan urinishlarini yopamiz.
    await autoSubmitExpiredSubmissions({ userTgId });

    const rows = await fetchListRows("getSubmissionListByUser", (q) =>
      q
        .eq("user_tg_id", userTgId)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: true })
    );

    if (rows.length === 0) return [];

    const testIds = rows.map((r) => r.test?.id).filter(Boolean) as string[];
    const questionsByTest = await getScoringQuestionsByTests(testIds);

    return toListItems(rows, questionsByTest);
  } catch (error) {
    logDbError("getSubmissionListByUser", error);
    throw error;
  }
}

/**
 * Get a single full submission by submission ID using the full_submissions view
 * @param submissionId - Submission UUID
 * @returns FullSubmission object with calculated row_score or null if not found
 */
export async function getFullSubmission(
  submissionId: string
): Promise<FullSubmission | null> {
  try {
    // Faqat shu urinishni yopamiz.
    await autoSubmitExpiredSubmissions({ submissionId });

    const { data, error } = await supabase
      .from("full_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (error) {
      logDbError("getFullSubmission", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Map result and calculate row_score
    const fullSubmission: FullSubmission = {
      id: data.id,
      started_at: data.started_at,
      submitted_at: data.submitted_at,
      rasch_score: data.rasch_score,
      rasch_ability: data.rasch_ability,
      created_at: data.created_at,
      updated_at: data.updated_at,
      answers: data.answers,
      test: data.test,
      user: data.user,
      questions: data.questions || [],
      row_score: calculateRowScore(data),
    };

    return fullSubmission;
  } catch (error) {
    logDbError("getFullSubmission", error);
    return null;
  }
}


export async function getSubmissionStats(): Promise<SubmissionStats | null> {
  try {
    const { data, error } = await supabase
      .from("submission_stats")
      .select("*")
      .single();

    if (error) {
      sendProductionErrors(error, "getSubmissionStats");
      console.error("Error fetching submission stats:", error);
      return null;
    }
    
    return data as SubmissionStats || null;
  } catch (error) {
    sendProductionErrors(error, "getSubmissionStats");
    console.error("Database error:", error);
    return null;
  }
}
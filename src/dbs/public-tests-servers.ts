"use server";
import { supabase } from "@/lib/supabase";
import type { Test } from "@/types/test";

export interface PublicTestSummary extends Test {
  question_count: number;
  submission_count: number;
}

export async function listPublicTests(opts?: {
  search?: string;
  scoringType?: string;
  limit?: number;
}): Promise<PublicTestSummary[]> {
  let query = supabase
    .from("tests")
    .select("*, questions(count), submissions(count)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (opts?.search) {
    query = query.ilike("title", `%${opts.search}%`);
  }
  if (opts?.scoringType) {
    query = query.eq("scoring_type", opts.scoringType);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listPublicTests:", error);
    return [];
  }
  return (data || []).map((row: any) => ({
    ...row,
    question_count: row.questions?.[0]?.count ?? 0,
    submission_count: row.submissions?.[0]?.count ?? 0,
  })) as PublicTestSummary[];
}

export interface LeaderboardEntry {
  submission_id: string;
  student_name: string | null;
  row_score: number | null;
  rasch_score: number | null;
  submitted_at: string;
}

export async function getTestLeaderboard(
  testId: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("full_submissions")
    .select("id, rasch_score, submitted_at, answers, questions, user, test")
    .eq("test_id", testId)
    .not("submitted_at", "is", null)
    .order("rasch_score", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("getTestLeaderboard:", error);
    return [];
  }

  return (data || []).map((row: any) => {
    const user = row.user;
    const fullName = user
      ? [user.telegram_first_name, user.telegram_last_name]
          .filter(Boolean)
          .join(" ") ||
        user.telegram_username ||
        "Anonim"
      : "Anonim";

    // Compute row_score client-side from answers (full_submissions doesn't have it)
    let rowScore: number | null = null;
    if (Array.isArray(row.answers) && Array.isArray(row.questions)) {
      rowScore = 0;
      for (const q of row.questions) {
        const a = row.answers.find((x: any) => x.question_id === q.id);
        if (!a) continue;
        if (q.question_type === "fill_blank") {
          if (a.answer?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()) {
            rowScore++;
          }
        } else if (q.is_multiple_answers) {
          const correct = (q.correct_options || []).slice().sort();
          const got = (a.answer_options || []).slice().sort();
          if (correct.length === got.length && correct.every((c: string, i: number) => c === got[i])) {
            rowScore++;
          }
        } else {
          if (a.answer === q.correct_answer) rowScore++;
        }
      }
    }

    return {
      submission_id: row.id,
      student_name: fullName,
      row_score: rowScore,
      rasch_score: row.rasch_score,
      submitted_at: row.submitted_at,
    };
  });
}

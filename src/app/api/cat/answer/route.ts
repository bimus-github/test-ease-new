import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  selectNextItem,
  updateTheta,
  shouldStop,
  DEFAULT_CAT_CONFIG,
} from "@/lib/cat";

export const dynamic = "force-dynamic";

interface AnswerPayload {
  sessionId: string;
  questionId: string;
  answer?: string;
  answerOptions?: string[];
}

function checkCorrect(
  question: {
    question_type: string;
    correct_answer?: string | null;
    correct_options?: string[] | null;
    is_multiple_answers?: boolean | null;
  },
  given: { answer?: string; answerOptions?: string[] }
): boolean {
  if (question.question_type === "multiple_choice" && question.is_multiple_answers) {
    const correct = (question.correct_options || []).slice().sort();
    const got = (given.answerOptions || []).slice().sort();
    if (correct.length !== got.length) return false;
    return correct.every((c, i) => c === got[i]);
  }
  // Single-answer MC or fill_blank
  if (!question.correct_answer || !given.answer) return false;
  return question.correct_answer.trim().toLowerCase() === given.answer.trim().toLowerCase();
}

export async function POST(req: Request) {
  const { sessionId, questionId, answer, answerOptions } =
    (await req.json()) as AnswerPayload;

  const { data: session, error } = await supabaseAdmin
    .from("cat_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (error || !session) return NextResponse.json({ error: "Session topilmadi" }, { status: 404 });
  if (session.status !== "in_progress") {
    return NextResponse.json({ error: "Session yakunlangan" }, { status: 400 });
  }

  const { data: q } = await supabaseAdmin
    .from("questions")
    .select(
      "id, rasch_difficulty, question_type, correct_answer, correct_options, is_multiple_answers"
    )
    .eq("id", questionId)
    .single();
  if (!q) return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });
  if (q.rasch_difficulty == null) {
    return NextResponse.json({ error: "Savol kalibrlanmagan" }, { status: 400 });
  }

  const isCorrect = checkCorrect(q, { answer, answerOptions });

  const responses: Array<{ beta: number; correct: 0 | 1 }> = [
    ...(session.responses as Array<{ beta: number; correct: 0 | 1 }>),
    { beta: q.rasch_difficulty, correct: isCorrect ? 1 : 0 },
  ];
  const administered = new Set([...(session.administered_items as string[]), questionId]);
  const { theta, se } = updateTheta(responses);

  const { data: pool } = await supabaseAdmin
    .from("questions")
    .select("id, rasch_difficulty, question_text, question_type, options")
    .not("rasch_difficulty", "is", null)
    .limit(500);

  const calibratedPool = (pool || []).map((p) => ({ id: p.id, beta: p.rasch_difficulty }));
  const config = (session.config || DEFAULT_CAT_CONFIG) as typeof DEFAULT_CAT_CONFIG;
  const stop = shouldStop(administered.size, calibratedPool.length, se, config);

  if (stop) {
    await supabaseAdmin
      .from("cat_sessions")
      .update({
        theta,
        se,
        administered_items: Array.from(administered),
        responses,
        status: "finished",
        final_theta: theta,
        final_se: se,
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    const tScore = Math.max(0, Math.min(100, 50 + 10 * theta));
    return NextResponse.json({
      done: true,
      correct: isCorrect,
      theta,
      se,
      tScore,
      administered: administered.size,
    });
  }

  const next = selectNextItem(calibratedPool, administered, theta);
  if (!next) {
    return NextResponse.json({ error: "Keyingi savol topilmadi" }, { status: 500 });
  }

  await supabaseAdmin
    .from("cat_sessions")
    .update({
      theta,
      se,
      administered_items: Array.from(administered),
      responses,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  const fullQuestion = (pool || []).find((p) => p.id === next.id);
  return NextResponse.json({
    done: false,
    correct: isCorrect,
    theta,
    se,
    administered: administered.size,
    question: fullQuestion,
  });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  selectNextItem,
  updateTheta,
  shouldStop,
  DEFAULT_CAT_CONFIG,
} from "@/lib/cat";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { sessionId, questionId, correct } = await req.json();

  // Load session
  const { data: session, error } = await supabaseAdmin
    .from("cat_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (error || !session) return NextResponse.json({ error: "Session topilmadi" }, { status: 404 });
  if (session.status !== "in_progress") {
    return NextResponse.json({ error: "Session yakunlangan" }, { status: 400 });
  }

  // Load that question's beta
  const { data: q } = await supabaseAdmin
    .from("questions")
    .select("rasch_difficulty")
    .eq("id", questionId)
    .single();
  if (!q?.rasch_difficulty && q?.rasch_difficulty !== 0) {
    return NextResponse.json({ error: "Savol kalibrlanmagan" }, { status: 400 });
  }

  // Update responses + theta
  const responses: Array<{ beta: number; correct: 0 | 1 }> = [
    ...(session.responses as Array<{ beta: number; correct: 0 | 1 }>),
    { beta: q.rasch_difficulty, correct: correct ? 1 : 0 },
  ];
  const administered = new Set([...(session.administered_items as string[]), questionId]);
  const { theta, se } = updateTheta(responses);

  // Load pool again to choose next
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

    return NextResponse.json({ done: true, theta, se });
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
  return NextResponse.json({ done: false, theta, se, question: fullQuestion });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { selectNextItem, DEFAULT_CAT_CONFIG } from "@/lib/cat";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { studentId, subject } = await req.json();
  if (!studentId || !subject) {
    return NextResponse.json({ error: "studentId va subject majburiy" }, { status: 400 });
  }

  // Build pool from calibrated questions on this subject
  const { data: pool, error: poolErr } = await supabaseAdmin
    .from("questions")
    .select("id, rasch_difficulty, question_text, question_type, options")
    .not("rasch_difficulty", "is", null)
    .limit(500);

  if (poolErr) return NextResponse.json({ error: poolErr.message }, { status: 500 });
  if (!pool || pool.length < DEFAULT_CAT_CONFIG.minItems) {
    return NextResponse.json(
      { error: "Yetarli kalibrlangan savol yo'q. Avval Rasch hisoblangan testlar bo'lishi kerak." },
      { status: 400 }
    );
  }

  const calibratedPool = pool.map((q) => ({ id: q.id, beta: q.rasch_difficulty }));
  const firstItem = selectNextItem(calibratedPool, new Set(), 0);
  if (!firstItem) return NextResponse.json({ error: "Savol tanlab bo'lmadi" }, { status: 500 });

  // Save session
  const { data: session, error: sessErr } = await supabaseAdmin
    .from("cat_sessions")
    .insert({
      student_id: studentId,
      pool_subject: subject,
      theta: 0,
      administered_items: [],
      responses: [],
      config: DEFAULT_CAT_CONFIG,
    })
    .select()
    .single();

  if (sessErr) return NextResponse.json({ error: sessErr.message }, { status: 500 });

  const fullQuestion = pool.find((q) => q.id === firstItem.id);
  return NextResponse.json({
    sessionId: session.id,
    question: fullQuestion,
    theta: 0,
  });
}

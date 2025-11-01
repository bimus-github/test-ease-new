"use client";

import { TestWithQuestions } from "@/types/test";
import { AnswerForm } from "@/types/answer";

export default function PreviewAnswers({
  test,
  answers,
}: {
  test: TestWithQuestions;
  answers: AnswerForm[];
}) {
  const byQ = new Map(answers.map((a) => [a.question_id, a]));
  const answeredCount = test.questions.filter((q) => byQ.has(q.id)).length;

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span>Javob berilgan: {answeredCount}</span>
        <span>•</span>
        <span>Javobsiz: {test.questions.length - answeredCount}</span>
      </div>

      <div className="grid gap-2">
        {test.questions.map((q) => {
          const a = byQ.get(q.id);
          return (
            <div key={q.id} className="rounded border p-3 text-sm">
              <div className="mb-1 font-medium">
                {q.question_label}. {q.question_text}
              </div>
              <div className="text-neutral-700">{renderAnswerValue(a)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderAnswerValue(a?: AnswerForm) {
  if (!a) return <span className="text-neutral-400">—</span>;
  if (a.answer_text !== undefined) return <span>{a.answer_text || "—"}</span>;
  const arr = a.selected_options as string[] | undefined;
  if (!arr || arr.length === 0)
    return <span className="text-neutral-400">—</span>;
  return <span>{arr.join(", ")}</span>;
}

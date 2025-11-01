"use client";

import { AnswerForm } from "@/types/answer";
import { TestWithQuestions } from "@/types/test";

export default function ConfirmPage({
  test,
  answers,
}: {
  test: TestWithQuestions;
  answers: AnswerForm[];
}) {
  const byQ = new Map(answers.map((a) => [a.question_id, a]));
  const answeredCount = test.questions.filter((q) => !!byQ.get(q.id)).length;

  return (
    <div className="grid gap-4">
      <div className="rounded border border-neutral-200 p-4 text-sm dark:border-neutral-800">
        <div className="mb-2 text-base font-semibold">
          Yuborishni tasdiqlash
        </div>
        <div className="text-neutral-700 dark:text-neutral-300">
          <div className="flex flex-wrap gap-4">
            <div>
              <span className="text-neutral-500">Savollar:</span>{" "}
              {test.questions.length}
            </div>
            <div>
              <span className="text-neutral-500">Javob berilgan:</span>{" "}
              {answeredCount}
            </div>
            <div>
              <span className="text-neutral-500">Javobsiz:</span>{" "}
              {test.questions.length - answeredCount}
            </div>
          </div>
          {test.end_date && (
            <div className="mt-2">
              <span className="text-neutral-500">Tugaydi:</span>{" "}
              {new Date(test.end_date).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        Yuborgandan so‘ng javoblarni o‘zgartira olmaysiz.
      </div>
    </div>
  );
}

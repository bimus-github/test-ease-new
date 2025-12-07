"use client";

import { LatexRenderer } from "@/components/math-live/LatexRenderer";
import { useAppSelector } from "@/store/hooks";
import { QuestionForm } from "@/types/question";
import { SATSection, ScoringType, TestForm } from "@/types/test";
import { formatLocalDate } from "@/lib/utils";

interface Props {
  onBack: () => void;
  onConfirm: () => void;
}

export function Preview({
  onBack,
  onConfirm,
}: Props) {
  const { questions, test: form, isSubmitting } = useAppSelector(state => state.test);
  const mcCount = questions.filter(
    (q) => q.question_type === "multiple_choice"
  ).length;
  const fillCount = questions.filter(
    (q) => q.question_type === "fill_blank"
  ).length;
  const answered = questions.filter(
    (q) => !!q.correct_answer?.length || !!q.correct_options?.length
  ).length;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4 grid gap-2">
        <h2 className="text-lg font-semibold">Ko‘rib chiqing va tasdiqlang</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Saqlashdan oldin tafsilotlar va javoblar to‘g‘ri ekanini tekshiring.
        </p>
      </div>

      <section className="mb-6 grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold">Asosiy ma’lumotlar</h3>
          <span className="text-xs text-neutral-500">{form.code}</span>
        </div>
        <div className="grid gap-1 text-sm">
          <div>
            <span className="text-neutral-500">Sarlavha:</span> {form.title}
          </div>
          {form.description && (
            <div>
              <span className="text-neutral-500">Tavsif:</span>{" "}
              {form.description}
            </div>
          )}
          {form.instructions && (
            <div>
              <span className="text-neutral-500">Ko‘rsatmalar:</span>{" "}
              {form.instructions}
            </div>
          )}
          {form.scoring_type === ScoringType.RASCH_SCORING && (
            <div>
              <span className="text-neutral-500">Baholash turi:</span>{" "}
              RASCH
            </div>
          )}
          {form.scoring_type === ScoringType.SAT_SCORING && (
            <div>
              <span className="text-neutral-500">Test turi:</span>{" "}
              SAT
            </div>
          )}
          {form.end_date && (
            <div>
              <span className="text-neutral-500">Tugash vaqti:</span>{" "}
              {formatLocalDate(form.end_date)}
            </div>
          )}
        </div>
      </section>

      <section className="mb-6 grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold">Savollar</h3>
          <span className="text-xs text-neutral-500">
            Jami {questions.length} • {answered} javob berilgan
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900">
            <div className="text-xs text-neutral-500">Variantli</div>
            <div className="text-lg font-semibold">{mcCount}</div>
          </div>
          <div className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900">
            <div className="text-xs text-neutral-500">
              Bo‘sh joyni to‘ldiring
            </div>
            <div className="text-lg font-semibold">{fillCount}</div>
          </div>
          {form.scoring_type === ScoringType.SAT_SCORING && <div className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900">
            <div className="text-xs text-neutral-500">
              Max SAT bali
            </div>
            <div className="text-lg font-semibold">800</div>
          </div>}
          {form.scoring_type === ScoringType.SAT_SCORING && <div className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900">
            <div className="text-xs text-neutral-500">
              SAT bo'limi
            </div>
            <div className="font-semibold">{form.sat_section === SATSection.MATH ? "Math" : "Reading and Writing"}</div>
          </div>}
        </div>
      </section>

      <section className="mb-6 grid gap-2">
        <h4 className="text-sm font-bold">Javoblar ko‘rinishi</h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {questions.map((q) => (
            <div
              key={q.question_label}
              className="rounded-md border border-neutral-200 p-2 text-center text-xs dark:border-neutral-800"
              title={q.question_label}
            >
              <div className="truncate font-medium flex items-center justify-center gap-2">
                <span className="truncate font-bold">{q.question_label}</span>
                {q.sat_score && (
                  <span className="text-xs text-neutral-500">
                    SAT: {q.sat_score}
                  </span>
                )}
                <span>
                  {q.question_type}
                </span>
              </div>
              {q.question_type === "fill_blank" ? (
                <LatexRenderer
                  latex={q.correct_answer || ""}
                  displayMode={true}
                  className="text-black"
                />
              ) : (
                <div className="truncate text-neutral-600 dark:text-neutral-400">
                  {q.correct_answer ||
                    (q.correct_options?.length
                      ? q.correct_options.join(", ")
                      : "—")}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-3 border-t border-neutral-200 bg-background p-4 dark:border-neutral-800 sm:-mx-6 sm:-mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 active:opacity-90 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          Orqaga
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 dark:bg-white dark:text-black"
        >
          {isSubmitting ? "Yaratilmoqda..." : "Tasdiqlash"}
        </button>
      </div>
    </div>
  );
}

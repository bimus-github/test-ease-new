"use client";

export default function ConfirmBar({
  step,
  canContinue,
  isSubmitting,
  isEnded,
  hasDraftAttempt,
  onBack,
  onNext,
  onConfirm,
}: {
  step: "info" | "answer" | "preview" | "confirm";
  canContinue: boolean;
  isSubmitting: boolean;
  isEnded?: boolean;
  hasDraftAttempt?: boolean;
  onBack: () => void;
  onNext: () => void;
  onConfirm: () => void | undefined;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-6 border-t border-neutral-200 bg-background p-4 dark:border-neutral-800 sm:-mx-6">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded border px-4 py-2 text-sm"
        >
          Orqaga
        </button>

        {step === "confirm" && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="inline-flex items-center rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        )}

        {step === "info" && (
          <button
            type="button"
            disabled={isSubmitting || (isEnded && !hasDraftAttempt)}
            onClick={onNext}
            className="inline-flex items-center rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            Testni boshlash
          </button>
        )}

        {step === "answer" && (
          <button
            type="button"
            disabled={isSubmitting || !canContinue}
            onClick={onNext}
            className="inline-flex items-center rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            Oldindan ko‘rish
          </button>
        )}

        {step === "preview" && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onNext}
            className="inline-flex items-center rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            Tasdiqlashga o‘tish
          </button>
        )}
      </div>
    </div>
  );
}

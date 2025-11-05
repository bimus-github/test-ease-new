"use client";

export function ConfirmStart({
  questionCount,
  endDate,
  isStarting,
  onStart,
}: {
  questionCount: number;
  endDate?: string;
  isStarting: boolean;
  onStart: () => Promise<void>;
}) {
  return (
    <section className="grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="text-base font-medium">Testni boshlaysizmi?</h3>
      <div className="text-sm text-neutral-700 dark:text-neutral-300">
        Savollar soni: <span className="font-medium">{questionCount}</span>
      </div>
      {endDate && (
        <div className="text-sm text-neutral-700 dark:text-neutral-300">
          Tugash vaqti: {new Date(endDate).toLocaleString()}
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={isStarting}
          className="inline-flex items-center rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-70 dark:bg-white dark:text-black"
        >
          {isStarting ? "Boshlanmoqda…" : "Boshlash"}
        </button>
        <span className="text-xs text-neutral-500">
          Boshlagach, vaqt ishlay boshlaydi.
        </span>
      </div>
    </section>
  );
}



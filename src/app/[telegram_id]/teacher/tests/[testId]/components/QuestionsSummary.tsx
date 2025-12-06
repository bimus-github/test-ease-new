"use client";

export function QuestionsSummary({
  total,
  stats,
}: {
  total: number;
  stats: Array<{ title: string; value: number }>;
}) {
  return (
    <section className="mb-6 grid gap-3 rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold">Savollar</h3>
        <span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
          Jami {total}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.title}
            className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900"
          >
            <div className="text-xs text-neutral-500">{s.title}</div>
            <div className="text-lg font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

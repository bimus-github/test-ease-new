"use client";

interface AttemptsInfoCardProps {
  code?: string;
  description?: string;
  endDate?: string;
  testType: string;
  stats: Array<{ label: string; value: string | number }>;
}

export function AttemptsInfoCard(props: AttemptsInfoCardProps) {
  const { code, description, endDate, testType, stats } = props;

  return (
    <section className="mb-4 grid gap-3 rounded-md border border-neutral-200 p-4 text-sm shadow-sm dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-medium">Ma’lumot</h3>
        {code ? (
          <span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            Kod: <span className="ml-1 font-mono">{code}</span>
          </span>
        ) : null}
      </div>
      <div className="text-xs text-neutral-500">
        Test turi: {testType}
      </div>
      {description && (
        <div className="text-neutral-700 dark:text-neutral-300">
         Tavsif: {description}
        </div>
      )}
      {endDate && (
        <div className="text-xs text-neutral-500">
          Tugash: {new Date(endDate).toLocaleString()}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900"
          >
            <div className="text-xs text-neutral-500">{s.label}</div>
            <div className="text-lg font-semibold">{s.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

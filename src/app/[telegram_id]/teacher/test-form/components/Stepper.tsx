"use client";

interface StepperProps {
  steps: { id: string; label: string }[];
  current: string;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex w-full items-center justify-between gap-2 overflow-x-auto rounded-md bg-background p-2 sm:gap-4">
      {steps.map((s, idx) => {
        const active = s.id === current;
        const done = steps.findIndex((x) => x.id === current) > idx;
        return (
          <li key={s.id} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium " +
                (active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : done
                  ? "bg-green-600 text-white"
                  : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300")
              }
            >
              {idx + 1}
            </span>
            <span className="truncate text-sm sm:text-base">{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

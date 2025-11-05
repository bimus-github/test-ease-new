"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LatexRenderer } from "@/components/math-live/LatexRenderer";
import Link from "next/link";
import { MY_TESTS_ROUTE, TEST_ATTEMPTS_ROUTE } from "@/constants/routes";
import { getTestWithQuestionsAction } from "./actions";

export default function ViewTestClient() {
  const { telegram_id: telegramId, testId } = useParams<{
    telegram_id: string;
    testId: string;
  }>();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["view-test", telegramId, testId],
    queryFn: () => getTestWithQuestionsAction(testId),
    enabled: Boolean(testId),
  });

  if (!testId) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="rounded border p-6">
          <h1 className="text-lg font-semibold">Test ID topilmadi</h1>
          <p className="mt-2 text-sm text-neutral-600">Test ID majburiy.</p>
          <Link
            href={MY_TESTS_ROUTE(telegramId)}
            className="mt-4 inline-block rounded border px-3 py-2 text-sm"
          >
            Testlarimga qaytish
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <Header
          isFetching={true}
          title="Yuklanmoqda…"
          telegramId={telegramId}
        />
        <div className="rounded border p-6">Yuklanmoqda…</div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <Header
          isFetching={isFetching}
          title="Test topilmadi"
          telegramId={telegramId}
        />
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Testni yuklashda xatolik.
          <button
            onClick={() => refetch()}
            className="ml-3 inline-flex rounded border border-red-300 bg-white px-3 py-1 text-xs text-red-700"
          >
            Qayta urinish
          </button>
        </div>
      </main>
    );
  }

  const test = data;
  const mcCount = test.questions.filter(
    (q) => q.question_type === "multiple_choice"
  ).length;
  const fillCount = test.questions.filter(
    (q) => q.question_type === "fill_blank"
  ).length;

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <Header
        isFetching={isFetching}
        title={test.title}
        telegramId={telegramId}
      />

      <section className="mb-6 grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-medium">Asosiy ma’lumotlar</h3>
          <span className="text-xs text-neutral-500">{test.code}</span>
        </div>
        <div className="grid gap-1 text-sm">
          {test.description && (
            <div>
              <span className="text-neutral-500">Tavsif:</span>{" "}
              {test.description}
            </div>
          )}
          {test.instructions && (
            <div>
              <span className="text-neutral-500">Ko‘rsatmalar:</span>{" "}
              {test.instructions}
            </div>
          )}
          {test.end_date && (
            <div>
              <span className="text-neutral-500">Tugash vaqti:</span>{" "}
              {new Date(test.end_date).toLocaleString()}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/${telegramId}/test/edit/${testId}`}
              className="inline-flex items-center rounded border px-3 py-1 text-sm"
            >
              Testni tahrirlash
            </Link>
            <Link
              href={TEST_ATTEMPTS_ROUTE(testId, telegramId)}
              className="inline-flex items-center rounded border px-3 py-1 text-sm"
            >
              Urinishlarni ko'rish
            </Link>
            <CopyButton label="Kod nusxalash" value={test.code} />
            <Link
              href={MY_TESTS_ROUTE(telegramId)}
              className="inline-flex items-center rounded border px-3 py-1 text-sm"
            >
              Testlarimga qaytish
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-medium">Savollar</h3>
          <span className="text-xs text-neutral-500">
            Jami {test.questions.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat title="Bir nechta javobli" value={mcCount} />
          <Stat title="Bo‘sh joyni to‘ldiring" value={fillCount} />
        </div>
      </section>

      <section className="mb-6 grid gap-2">
        <h4 className="text-sm font-medium">Javoblar ko‘rinishi</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {test.questions.map((q) => (
            <div
              key={q.question_label}
              className="rounded-md border border-neutral-200 p-2 text-center text-xs dark:border-neutral-800"
              title={q.question_label}
            >
              <div className="truncate font-medium">{q.question_label}</div>
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
    </main>
  );
}

function Header({
  isFetching,
  title,
  telegramId,
}: {
  isFetching: boolean;
  title: string;
  telegramId: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {isFetching ? "Yangilanmoqda…" : ""}
        <Link
          href={MY_TESTS_ROUTE(telegramId)}
          className="rounded border px-2.5 py-1"
        >
          Orqaga
        </Link>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-md bg-neutral-100 p-3 text-center dark:bg-neutral-900">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function CopyButton({ label, value }: { label: string; value: string }) {
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
      }}
      className="inline-flex items-center rounded border px-3 py-1 text-sm"
      aria-label={label}
    >
      {label}
    </button>
  );
}

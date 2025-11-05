"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MY_TESTS_ROUTE } from "@/constants/routes";
import { getTestWithQuestionsAction } from "./actions";
import { ViewHeader } from "./components/ViewHeader";
import { InfoCard } from "./components/InfoCard";
import { QuestionsSummary } from "./components/QuestionsSummary";
import { QuestionsGrid } from "./components/QuestionsGrid";
import { ViewSkeleton } from "./components/ViewSkeleton";

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
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <ViewHeader
          title="Yuklanmoqda…"
          telegramId={telegramId}
          isFetching={true}
        />
        <ViewSkeleton />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <ViewHeader
          title="Test topilmadi"
          telegramId={telegramId}
          isFetching={isFetching}
        />
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
          Testni yuklashda xatolik.
          <button
            onClick={() => refetch()}
            className="ml-3 inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:hover:bg-red-900/20"
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
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <ViewHeader
        title={test.title}
        subtitle="Test tafsilotlari va savollar"
        telegramId={telegramId}
        isFetching={isFetching}
        onRefetch={() => refetch()}
      />

      <InfoCard
        test={test}
        telegramId={telegramId}
        testId={testId}
        onCopy={async (val) => {
          await navigator.clipboard.writeText(val);
        }}
      />

      <QuestionsSummary
        total={test.questions.length}
        stats={[
          { title: "Bir nechta javobli", value: mcCount },
          { title: "Bo‘sh joyni to‘ldiring", value: fillCount },
        ]}
      />

      <QuestionsGrid questions={test.questions as any} />
    </main>
  );
}

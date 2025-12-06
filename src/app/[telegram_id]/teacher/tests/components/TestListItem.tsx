"use client";
import { Test, TestStatus } from "@/types/test";
import { formatLocalDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { VIEW_TEST_ROUTE } from "@/constants/routes";
import toast from "react-hot-toast";

export default function TestListItem({
  test,
}: {
  test: Test;
}) {
  const onCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success("Kod nusxalandi");
  };
  const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();
  const router = useRouter();

  return (
    <li className="rounded-md border border-neutral-200 p-4 shadow-sm transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">{test.title}</h2>
          <div className="mt-1 text-xs text-neutral-500">
            <span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              Kod: <span className="ml-1 font-mono">{test.code}</span>
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-neutral-500">
            <div>Yaratilgan: {formatLocalDate(test.created_at)}</div>
            <div>Tugash: {formatLocalDate(test.end_date!)}</div>
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
            test.status === TestStatus.ACTIVE
              ? "bg-green-100 text-green-700"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          }`}
        >
          {test.status === TestStatus.ACTIVE ? "Faol" : "Tugatilgan"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          aria-label={`Testni ko‘rish ${test.title}`}
          className="min-h-[40px] inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          onClick={() => router.push(VIEW_TEST_ROUTE({ testId: test.id, telegramId }))}
        >
          Ko‘rish
        </button>
        <button
          aria-label={`${test.title} uchun kodni nusxalash`}
          onClick={() => onCopyCode(test.code)}
          className="min-h-[40px] inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Kodni nusxalash
        </button>
      </div>
    </li>
  );
}

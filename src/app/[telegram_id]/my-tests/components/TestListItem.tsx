"use client";

import { Test, TestStatus } from "@/types/test";
import { formatLocalDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { VIEW_TEST_ROUTE } from "@/constants/routes";

export default function TestListItem({
  test,
  onCopyCode,
}: {
  test: Test;
  onCopyCode: (code: string) => Promise<void>;
}) {
  const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();
  const router = useRouter();

  return (
    <li className="rounded border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">{test.title}</h2>
          <div className="mt-1 text-sm text-gray-600">
            Kod: <code className="font-mono">{test.code}</code>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Yaratilgan: {formatLocalDate(test.created_at)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Tugash vaqti: {formatLocalDate(test.end_date)}
          </div>
        </div>

        <span
          className={`text-xs rounded px-2 py-1 ${
            test.status === TestStatus.ACTIVE
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {test.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          aria-label={`Testni ko‘rish ${test.title}`}
          className="min-h-[44px] rounded border px-3 py-1 text-sm"
          onClick={() => router.push(VIEW_TEST_ROUTE(test.id, telegramId))}
        >
          Ko‘rish
        </button>
        <button
          aria-label={`${test.title} uchun kodni nusxalash`}
          onClick={() => onCopyCode(test.code)}
          className="min-h-[44px] rounded border px-3 py-1 text-sm"
        >
          Kodni nusxalash
        </button>
      </div>
    </li>
  );
}

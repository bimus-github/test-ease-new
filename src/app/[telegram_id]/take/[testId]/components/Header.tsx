"use client";

import Link from "next/link";
import { MY_RESULTS_ROUTE, MY_TESTS_ROUTE } from "@/constants/routes";

export function Header({
  title,
  telegramId,
  isFetching,
}: {
  title: string;
  telegramId: string;
  isFetching: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {isFetching ? "Yangilanmoqda…" : ""}
        <Link
          href={MY_RESULTS_ROUTE(telegramId)}
          className="rounded border px-2.5 py-1"
        >
          JAVOBLARIM
        </Link>
      </div>
    </div>
  );
}

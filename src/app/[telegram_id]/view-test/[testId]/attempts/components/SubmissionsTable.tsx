"use client";

import type { FullSubmission } from "@/types/submission";
import Link from "next/link";

export default function SubmissionsTable({
  submissions,
  showRasch,
  renderResultLink,
}: {
  submissions: FullSubmission[];
  showRasch: boolean;
  renderResultLink: (submissionId: string) => string;
}) {
  if (!submissions?.length) {
    return (
      <div className="rounded border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800">
        Hozircha urinishlar yo‘q.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {/* Desktop Table */}
      <div className="hidden w-full overflow-x-auto rounded border border-neutral-200 dark:border-neutral-800 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Foydalanuvchi</th>
              <th className="px-3 py-2">Boshlangan</th>
              <th className="px-3 py-2">Yuborilgan</th>
              <th className="px-3 py-2">Tog‘ri javoblar</th>
              {showRasch && <th className="px-3 py-2">Rasch</th>}
              <th className="px-3 py-2">Amal</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => (
              <tr
                key={s.id}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">
                  {s.user.telegram_first_name} {s.user.telegram_last_name}{" "}
                  <br />
                  <Link
                    target="_blank"
                    href={`https://t.me/${s.user.telegram_username}`}
                    className="text-xs text-blue-500"
                  >
                    @{s.user.telegram_username}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {new Date(s.started_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {new Date(s.submitted_at ?? "").toLocaleString()}
                </td>
                <td className="px-3 py-2">{s.row_score ?? "—"}</td>
                {showRasch && (
                  <td className="px-3 py-2">
                    {s.rasch_score != null ? s.rasch_score : "—"}
                  </td>
                )}
                <td className="px-3 py-2">
                  <a
                    href={renderResultLink(s.id)}
                    className="inline-flex items-center rounded border px-2 py-1"
                  >
                    Ko‘rish
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {submissions.map((s, i) => (
          <div
            key={s.id}
            className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800"
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="font-medium">#{i + 1}</div>
              <a
                href={renderResultLink(s.id)}
                className="rounded border px-2 py-1 text-xs"
              >
                Ko‘rish
              </a>
            </div>
            <div className="text-neutral-700 dark:text-neutral-300">
              {s.user.telegram_first_name} {s.user.telegram_last_name} <br />
              <Link
                target="_blank"
                href={`https://t.me/${s.user.telegram_username}`}
                className="text-xs text-blue-500"
              >
                @{s.user.telegram_username}
              </Link>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-neutral-500">
              <div>Boshlangan: {new Date(s.started_at).toLocaleString()}</div>
              <div>
                Yuborilgan: {new Date(s.submitted_at ?? "").toLocaleString()}
              </div>
              <div>Tog‘ri javoblar: {s.row_score ?? "—"}</div>
              {showRasch && (
                <div>Rasch: {s.rasch_score != null ? s.rasch_score : "—"}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

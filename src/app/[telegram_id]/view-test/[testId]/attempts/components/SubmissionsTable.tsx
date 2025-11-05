"use client";

import type { FullSubmission } from "@/types/submission";
import Link from "next/link";
import { gradeFromT, percentageFromT } from "@/lib/helpers";

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
      <div className="rounded-md border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800">
        Hozircha urinishlar yo‘q.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Desktop Table */}
      <div className="hidden w-full overflow-x-auto rounded-md border border-neutral-200 shadow-sm dark:border-neutral-800 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2 font-medium text-neutral-600">#</th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                Foydalanuvchi
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                Boshlangan
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                Yuborilgan
              </th>
              <th className="px-3 py-2 font-medium text-neutral-600">
                To‘g‘ri javoblar
              </th>
              {showRasch && (
                <>
                  <th className="px-3 py-2 font-medium text-neutral-600">
                    Rasch T
                  </th>
                  <th className="px-3 py-2 font-medium text-neutral-600">
                    Bahosi
                  </th>
                  <th className="px-3 py-2 font-medium text-neutral-600">
                    Foizi
                  </th>
                </>
              )}
              <th className="px-3 py-2 font-medium text-neutral-600">Amal</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => {
              const t = s.rasch_score;
              return (
                <tr
                  key={s.id}
                  className="border-t border-neutral-200 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">
                      {s.user.telegram_first_name} {s.user.telegram_last_name}
                    </div>
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
                    <>
                      <td className="px-3 py-2">{t != null ? t : "—"}</td>
                      <td className="px-3 py-2">
                        {t != null ? gradeFromT(t) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {t != null ? percentageFromT(t) : "—"}
                      </td>
                    </>
                  )}
                  <td className="px-3 py-2">
                    <a
                      href={renderResultLink(s.id)}
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      Ko‘rish
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {submissions.map((s, i) => {
          const t = s.rasch_score;
          return (
            <div
              key={s.id}
              className="rounded-md border border-neutral-200 p-3 text-sm shadow-sm dark:border-neutral-800"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="font-medium">#{i + 1}</div>
                <a
                  href={renderResultLink(s.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
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
                <div>To‘g‘ri: {s.row_score ?? "—"}</div>
                {showRasch && (
                  <>
                    <div>Rasch T: {t != null ? t : "—"}</div>
                    <div>Bahosi: {t != null ? gradeFromT(t) : "—"}</div>
                    <div>Foizi: {t != null ? percentageFromT(t) : "—"}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

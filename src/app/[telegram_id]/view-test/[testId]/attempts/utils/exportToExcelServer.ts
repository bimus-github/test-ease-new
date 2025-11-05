import type { FullSubmission } from "@/types/submission";
import { calculateRowScore, gradeFromT, percentageFromT } from "@/lib/helpers";

export function generateExcelContent(
  submissions: FullSubmission[],
  showRasch: boolean
): string {
  // Create headers
  const headers = [
    "#",
    "Foydalanuvchi",
    "Telegram ID",
    "Boshlangan",
    "Yuborilgan",
    "To'g'ri javoblar",
  ];

  if (showRasch) {
    headers.push("Rasch T", "Bahosi", "Foizi");
  }

  // Create rows
  const rows = submissions.map((submission, index) => {
    const row: (string | number)[] = [
      index + 1,
      `${submission.user.telegram_first_name || ""} ${
        submission.user.telegram_last_name || ""
      }`.trim(),
      submission.user.telegram_id,
      new Date(submission.started_at).toLocaleString(),
      submission.submitted_at
        ? new Date(submission.submitted_at).toLocaleString()
        : "—",
      calculateRowScore(submission),
    ];

    if (showRasch) {
      const t = submission.rasch_score;
      row.push(
        t != null ? t : "—",
        t != null ? gradeFromT(t) : "—",
        t != null ? percentageFromT(t) : "—"
      );
    }

    return row;
  });

  // Convert to CSV format (Excel-compatible)
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape cells containing commas, quotes, or newlines
          const cellStr = String(cell);
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    ),
  ].join("\n");

  // Add BOM for UTF-8 Excel compatibility
  const BOM = "\uFEFF";
  return BOM + csvContent;
}

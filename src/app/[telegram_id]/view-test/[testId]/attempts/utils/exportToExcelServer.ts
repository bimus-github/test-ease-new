import type { FullSubmission } from "@/types/submission";
import { gradeFromT, percentageFromT } from "@/lib/helpers";
import { formatLocalDate } from "@/lib/utils";

export function generateExcelContent(
  submissions: FullSubmission[],
  showRasch: boolean
): string {
  // Create headers
  const headers = [
    "#",
    "Foydalanuvchi",
    "Telegram ID",
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
      submission.submitted_at ? formatLocalDate(submission.submitted_at) : "—",
      submission.row_score ?? "—",
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
  const delimiter = ";";
  const csvContent = [
    headers.join(delimiter),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape cells containing delimiter, quotes, or newlines
          const cellStr = String(cell);
          if (
            cellStr.includes(delimiter) ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(delimiter)
    ),
  ].join("\r\n");

  // Add BOM for UTF-8 Excel compatibility
  const BOM = "\uFEFF";
  return BOM + csvContent;
}

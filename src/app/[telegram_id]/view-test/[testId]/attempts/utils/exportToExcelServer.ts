import type { FullSubmission } from "@/types/submission";
import { gradeFromT, percentageFromT } from "@/lib/helpers";
import { formatLocalDate } from "@/lib/utils";
import ExcelJS from "exceljs";

export async function generateExcelContent(
  submissions: FullSubmission[],
  showRasch: boolean
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Urinishlar");

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

  // Add header row with styling
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  submissions.forEach((submission, index) => {
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

    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = 15;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

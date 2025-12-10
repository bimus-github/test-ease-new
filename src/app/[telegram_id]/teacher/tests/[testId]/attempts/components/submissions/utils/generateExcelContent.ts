import type { FullSubmission } from "@/types/submission";
import { Test, ScoringType } from "@/types/test";
import { gradeFromT, percentageFromT, calculateSatScore, calculatePoints } from "@/lib/helpers";
import { formatLocalDate } from "@/lib/utils";
import ExcelJS from "exceljs";

export async function generateExcelContent(
  submissions: FullSubmission[],
  test: Test
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Urinishlar");

  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
  const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;

  // Create headers
  const headers = [
    "#",
    "Foydalanuvchi",
    "Telegram username",
    "Boshlangan",
    "Yuborilgan",
    "To'g'ri javoblar",
  ];

  if (showRasch) {
    headers.push("Rasch T", "Bahosi", "Foizi");
  }

  if (isSatTest) {
    headers.push("SAT bali");
  }

  if (isUzDtmTest) {
    headers.push("UZ DTM bali");
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
      submission.user.telegram_username || "",
      submission.started_at ? formatLocalDate(submission.started_at) : "—",
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

    if (isSatTest) {
      const satScore = calculateSatScore(submission);
      row.push(satScore ?? "—");
    }

    if (isUzDtmTest) {
      const uzDtmPoints = calculatePoints(submission);
      row.push(uzDtmPoints != null ? uzDtmPoints.toFixed(1) : "—");
    }

    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = 18;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}


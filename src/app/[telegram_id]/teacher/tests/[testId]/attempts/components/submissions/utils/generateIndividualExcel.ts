import type { FullSubmission } from "@/types/submission";
import { Test, ScoringType } from "@/types/test";
import { gradeFromT, percentageFromT, calculateSatScore, calculatePoints, checkAnswer } from "@/lib/helpers";
import { formatLocalDate } from "@/lib/utils";
import ExcelJS from "exceljs";

export async function generateIndividualExcel(
  submission: FullSubmission,
  test: Test
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
  const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;
  const isSimpleTest = test.scoring_type === ScoringType.SIMPLE_SCORING;

  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet("Natijalar");
  
  // Test Information
  summarySheet.addRow(["Test ma'lumotlari"]);
  summarySheet.addRow(["Test nomi:", test.title]);
  summarySheet.addRow(["Test kodi:", test.code]);
  if (test.description) {
    summarySheet.addRow(["Tavsif:", test.description]);
  }
  if (test.end_date) {
    summarySheet.addRow(["Tugash vaqti:", formatLocalDate(test.end_date)]);
  }
  summarySheet.addRow([]); // Empty row

  // User Information
  summarySheet.addRow(["Talaba ma'lumotlari"]);
  summarySheet.addRow([
    "Ism:",
    `${submission.user.telegram_first_name || ""} ${
      submission.user.telegram_last_name || ""
    }`.trim(),
  ]);
  summarySheet.addRow(["Telegram username:", `@${submission.user.telegram_username || ""}`]);
  summarySheet.addRow([]); // Empty row

  // Results Summary
  summarySheet.addRow(["Natijalar"]);
  summarySheet.addRow([
    "Boshlangan vaqti:",
    submission.started_at ? formatLocalDate(submission.started_at) : "—",
  ]);
  summarySheet.addRow([
    "Yuborilgan vaqti:",
    submission.submitted_at ? formatLocalDate(submission.submitted_at) : "—",
  ]);
  summarySheet.addRow([
    "To'g'ri javoblar:",
    `${submission.row_score ?? 0}/${submission.questions?.length || 0}`,
  ]);

  if (showRasch && submission.rasch_score != null) {
    summarySheet.addRow(["Rasch T-bahosi:", submission.rasch_score.toFixed(2)]);
    summarySheet.addRow(["Bahosi:", gradeFromT(submission.rasch_score)]);
    summarySheet.addRow(["Foizi:", percentageFromT(submission.rasch_score)]);
    if (submission.rasch_ability != null) {
      summarySheet.addRow(["Qobiliyat (θ):", submission.rasch_ability.toFixed(4)]);
    }
  }

  if (isSatTest) {
    const satScore = calculateSatScore(submission);
    summarySheet.addRow(["SAT bali:", satScore]);
  }

  if (isUzDtmTest) {
    const uzDtmPoints = calculatePoints(submission);
    summarySheet.addRow(["UZ DTM bali:", uzDtmPoints != null ? uzDtmPoints.toFixed(1) : "—"]);
  }

  if (isSimpleTest) {
    const simplePoints = calculatePoints(submission);
    const maxPoints = submission.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
    summarySheet.addRow(["Ballar:", simplePoints != null ? `${simplePoints.toFixed(1)} / ${maxPoints.toFixed(1)}` : "—"]);
  }

  // Style summary sheet
  summarySheet.getRow(1).font = { bold: true, size: 12 };
  summarySheet.getRow(7).font = { bold: true, size: 12 };
  summarySheet.getRow(11).font = { bold: true, size: 12 };

  // Sheet 2: Detailed Answers
  const detailsSheet = workbook.addWorksheet("Javoblar");

  const headers = [
    "Savol raqami",
    "Savol matni",
    "Sizning javobingiz",
    "To'g'ri javob",
    "Ball",
    "Holat",
  ];
  const headerRow = detailsSheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Create question map for quick lookup
  const questionMap = new Map(
    submission.questions?.map((q) => [q.id, q]) || []
  );

  // Sort answers by question order
  const sortedAnswers = [...submission.answers].sort((a, b) => {
    const qA = questionMap.get(a.question_id);
    const qB = questionMap.get(b.question_id);
    return (qA?.question_order || 0) - (qB?.question_order || 0);
  });

  sortedAnswers.forEach((answer) => {
    const question = questionMap.get(answer.question_id);
    if (!question) return;

    const isCorrect = checkAnswer(answer, question);
    const userAnswer = question.is_multiple_answers
      ? answer.answer_options?.join(", ") || "—"
      : answer.answer || "—";
    const correctAnswer = question.is_multiple_answers
      ? question.correct_options?.join(", ") || "—"
      : question.correct_answer || "—";
    const points = isCorrect ? question.points || 0 : 0;
    const status = isCorrect ? "✅ To'g'ri" : "❌ Noto'g'ri";

    const row = detailsSheet.addRow([
      question.question_label,
      question.question_text,
      userAnswer,
      correctAnswer,
      points,
      status,
    ]);

    // Color code rows
    if (isCorrect) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8F5E9" }, // Light green
      };
    } else {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFEBEE" }, // Light red
      };
    }
  });

  // Auto-fit columns
  [summarySheet, detailsSheet].forEach((sheet) => {
    sheet.columns.forEach((column) => {
      column.width = column.width ? Math.min(column.width, 50) : 20;
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// Milliy sertifikat — Til testlari (B2/C1)
// Format: 40 ta savol
// 1-15: Listening (MC, A/B/C/D) — umumiy audio bilan
// 16-30: Reading (MC, A/B/C/D)
// 31-35: Use of Language (MC, A/B/C/D)
// 36-40: Fill in the blanks
// Baholash: Rasch
import { QuestionForm } from "@/types/question";

export const generateMilliySertifikatTilQuestions = (): QuestionForm[] => {
  const questions: QuestionForm[] = [];
  for (let i = 1; i <= 40; i++) {
    const isFillBlank = i >= 36;
    questions.push({
      test_id: "",
      question_label: `${i}-savol`,
      question_text: "Savol matnini o'qituvchidan olishingiz mumkin.",
      question_type: isFillBlank ? "fill_blank" : "multiple_choice",
      question_order: i,
      points: 1,
      is_required: true,
      options: isFillBlank ? undefined : ["A", "B", "C", "D"],
      correct_answer: "",
    });
  }
  return questions;
};

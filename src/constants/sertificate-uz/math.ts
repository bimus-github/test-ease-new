// Math Sertificate Uz Blank is a test that is used to test the knowledge of the student in the field of mathematics.
// have 55 questions,
// 1-32 are multiple choice(A, B, C, D),
// 33-35 are multiple choice(A, B, C, D, E, F),
// 36-50(36.a, 36.b, 37.a, 37.b, 38.a, 38.b, 39.a, 39.b, 40.a, 40.b) are fill in the blank.
// test type is 'rasch_scoring'.

const question_labels = [
  "36.a",
  "36.b",
  "37.a",
  "37.b",
  "38.a",
  "38.b",
  "39.a",
  "39.b",
  "40.a",
  "40.b",
  "41.a",
  "41.b",
  "42.a",
  "42.b",
  "43.a",
  "43.b",
  "44.a",
  "44.b",
  "45.a",
  "45.b",
];

import { QuestionForm } from "@/types/question";

export const generateMathSertificateUzQuestions = () => {
  const questions: QuestionForm[] = [];

  for (let i = 1; i <= 55; i++) {
    if (i <= 32) {
      questions.push({
        test_id: "",
        question_label: `${i}-savol`,
        question_text: "Savol matnini o'qituvchidan olishingiz mumkin.",
        question_type: "multiple_choice",
        question_order: i,
        points: 1,
        is_required: true,
        options: ["A", "B", "C", "D"],
        correct_answer: "",
      });
      continue;
    }

    if (i <= 35) {
      questions.push({
        test_id: "",
        question_label: `${i}-savol`,
        question_text: "Savol matnini o'qituvchidan olishingiz mumkin.",
        question_type: "multiple_choice",
        question_order: i,
        points: 1,
        is_required: true,
        options: ["A", "B", "C", "D", "E", "F"],
        correct_answer: "",
      });
      continue;
    }

    const idx = i - 36;
    questions.push({
      test_id: "",
      question_label: `${question_labels[idx]}-savol`,
      question_text: "Savol matnini o'qituvchidan olishingiz mumkin.",
      question_type: "fill_blank",
      question_order: i,
      points: 1,
      is_required: true,
    });
  }

  return questions;
};

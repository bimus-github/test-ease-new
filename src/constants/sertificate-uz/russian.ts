// Russian Sertificate Uz Blank is a test that is used to test the knowledge of the student in the field of russian.
// have 49 questions,
// 1-32 are multiple choice(A, B, C, D),
// 33-35 are multiple choice(A, B, C, D, E, F),
// 36-39 are fill in the blank.
// 40-44 are fill in the blank. (40.a, 40.b, 41.a, 41.b, 42.a, 42.b, 43.a, 43.b, 44.a, 44.b)
// test type is 'rasch_scoring'.

const question_labels = [
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
];

import { QuestionForm } from "@/types/question";

export const generateRussianSertificateUzQuestions = () => {
  const questions: QuestionForm[] = [];

  for (let i = 1; i <= 49; i++) {
    if (i <= 32) {
      questions.push({
        test_id: "",
        question_label: `${i}-savol`,
        question_text: "",
        question_type: "multiple_choice",
        question_order: i,
        points: 1,
        is_required: true,
        options: ["A", "B", "C", "D"],
        correct_answer: "",
      });
      continue;
    } else if (i <= 35) {
      questions.push({
        test_id: "",
        question_label: `${i}-savol`,
        question_text: "",
        question_type: "multiple_choice",
        question_order: i,
        points: 1,
        is_required: true,
        options: ["A", "B", "C", "D", "E", "F"],
        correct_answer: "",
      });
      continue;
    } else if (i <= 39) {
      questions.push({
        test_id: "",
        question_label: `${i}-savol`,
        question_text: "",
        question_type: "fill_blank",
        question_order: i,
        points: 1,
        is_required: true,
        correct_answer: "",
      });
      continue;
    }

    const idx = i - 40;
    questions.push({
      test_id: "",
      question_label: `${question_labels[idx]}-savol`,
      question_text: "",
      question_type: "fill_blank",
      question_order: i,
      points: 1,
      is_required: true,
    });
  }
  return questions;
};

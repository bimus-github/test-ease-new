// Chemistry Sertificate Uz Blank is a test that is used to test the knowledge of the student in the field of chemistry.
// have 40 questions,
// 1-32 are multiple choice(A, B, C, D),
// 33-35 are multiple choice(A, B, C, D, E, F),
// 36-40 are fill in the blank.

import { QuestionForm } from "@/types/question";

export const generateChemistrySertificateUzQuestions = () => {
  const questions: QuestionForm[] = [];

  for (let i = 1; i <= 40; i++) {
    if (i <= 32) {
      questions.push({
        test_id: "",
        question_label: `${i}-savol`,
        question_text: "Savol matnini o'qituvchingizdan olin!",
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
        question_text: "Savol matnini o'qituvchingizdan olin!",
        question_type: "multiple_choice",
        question_order: i,
        points: 1,
        is_required: true,
        options: ["A", "B", "C", "D", "E", "F"],
        correct_answer: "",
      });
      continue;
    } else if (i <= 40) {
      questions.push({
        test_id: "",
        question_label: `${i}-savol`,
        question_text: "Savol matnini o'qituvchingizdan olin!",
        question_type: "fill_blank",
        question_order: i,
        points: 1,
        is_required: true,
        correct_answer: "",
      });
    }
  }

  return questions;
};

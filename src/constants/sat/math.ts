import { QuestionForm } from "@/types/question";



export const generateMathSATQuestions = () => {
  const questions: QuestionForm[] = [];

  for (let i = 1; i <= 44; i++){
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
      sat_score: 0,
    });
  }

  return questions;
};
import { Question } from "@/types/question";
import { SertificateType } from "@/types/sertificate";
import { ScoringType, Test, TestStatus } from "@/types/test";

export const test: Test = {
  id: "1",
  code: "test1",
  title: "Rasch Test 1",
  status: TestStatus.ACTIVE,
  scoring_type: ScoringType.RASCH_SCORING,
  teacher_id: "1",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sertificate_type: SertificateType.MATH,
  isRaschCalculated: false,
  rasch_calculated_at: undefined,
};

const generateQuestions = (length: number): Question[] => {
  const questions: Question[] = [];
  for (let i = 0; i < length; i++) {
    questions.push({
      id: `q${i + 1}`,
      test_id: "1",
      question_label: `Savol ${i + 1}`,
      question_text: `Savol ${i + 1}`,
      question_type: "multiple_choice",
      question_order: i + 1,
      points: 1,
      is_required: true,
      options: ["A", "B", "C", "D"],
      correct_answer: "A",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return questions;
};

export const Questions: Question[] = generateQuestions(20);

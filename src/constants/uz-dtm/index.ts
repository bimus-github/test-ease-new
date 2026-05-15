import { QuestionForm } from "@/types/question";
import { UZDTMSection } from "@/types/test";


export const generateUZDTMQuestions = (section: UZDTMSection) => {
  switch (section) {
    case UZDTMSection.ONE_DOT_ONE:
      return generateOneDotOneQuestions();
    case UZDTMSection.TWO_DOT_ONE:
      return generateTwoDotOneQuestions();
    case UZDTMSection.THREE_DOT_ONE:
      return generateThreeDotOneQuestions();
  }
}


export const generateOneDotOneQuestions = () => {
    const questions: QuestionForm[] = [];

    for (let i = 1; i <= 30; i++) {
        questions.push({
            test_id: "",
            question_label: `${i}-savol`,
            question_text: "",
            question_type: "multiple_choice",
            question_order: i,
            points: 1.1,
            is_required: true,
            options: ["A", "B", "C", "D"],
            correct_answer: "",
        });
    }
    return questions;
}

export const generateTwoDotOneQuestions = () => {
    const questions: QuestionForm[] = [];

    for (let i = 1; i <= 30; i++) {
        questions.push({
            test_id: "",
            question_label: `${60 + i}-savol`,
            question_text: "",
            question_type: "multiple_choice",
            question_order: i,
            points: 2.1,
            is_required: true,
            options: ["A", "B", "C", "D"],
            correct_answer: "",
        });
    }
        return questions;
}

export const generateThreeDotOneQuestions = () => {
    const questions: QuestionForm[] = [];

    for (let i = 1; i <= 30; i++) {
        questions.push({
            test_id: "",
            question_label: `${30 + i}-savol`,
            question_text: "",
            question_type: "multiple_choice",
            question_order: i,
            points: 3.1,
            is_required: true,
            options: ["A", "B", "C", "D"],
            correct_answer: "",
        });
    }
    return questions;
}
import { AnswerWithQuestion } from "@/types/answer";

export const checkAnswer = (answer: AnswerWithQuestion) => {
  const question = answer.question;
  if (!question) return false;
  if (question.is_multiple_answers) {
    return (
      answer.selected_options?.every((option) =>
        question.correct_options?.includes(option)
      ) || false
    );
  }
  return answer.answer_text === question.correct_answer;
};

export const calculateRowScore = (answers: AnswerWithQuestion[]) => {
  let score = 0;
  answers.forEach((answer) => {
    if (checkAnswer(answer)) {
      score += answer.question?.points || 0;
    }
  });
  return score;
};

export const correctAnswerText = (answers: AnswerWithQuestion) => {
  const question = answers.question;
  if (!question) {
    return "";
  }
  if (question.is_multiple_answers) {
    return question.correct_options?.join(", ") || "";
  }
  return question.correct_answer || "";
};

export const answersListText = (answers: AnswerWithQuestion[]) => {
  let text = `No. | Your Answer (Correct) | Correct Answer`;

  answers.forEach((answer, index) => {
    const isCorrect = checkAnswer(answer);

    text += `\n\n${index + 1}. | ${
      answer.question?.is_multiple_answers
        ? answer.selected_options?.join(", ")
        : answer.answer_text
    } ${isCorrect ? "✅" : "❌"}${
      !isCorrect ? ` | ${correctAnswerText(answer)}` : ""
    }`;
  });

  return text;
};

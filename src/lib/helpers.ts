import { Question } from "@/types/question";
import { Answer, FullSubmission } from "@/types/submission";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";

export const isTestCode = (text: string): boolean => {
  try {
    // 3–10 alphanumeric characters, underscore, hyphen, or ampersand
    const testCodePattern = /^[A-Za-z0-9&-]{3,10}$/;
    const isValid = testCodePattern.test(text.trim());
    return isValid;
  } catch (error) {
    console.error("Error checking test code:", error);
    sendProductionErrors(error, `isTestCode - text: ${text}`);
    return false;
  }
};

export const checkAnswer = (answer?: Answer, question?: Question): boolean => {
  if (!answer || !question) return false;
  if (question.is_multiple_answers) {
    return (
      answer.answer_options?.every((option) =>
        question.correct_options?.includes(option)
      ) || false
    );
  }
  return answer.answer === question.correct_answer;
};

export const calculateRowScore = (fullSubmission: FullSubmission): number => {
  let score = 0;
  if (!fullSubmission.test) return 0;
  if (!fullSubmission.questions) return 0;

  const questionMap = new Map(fullSubmission.questions.map((q) => [q.id, q]));

  fullSubmission.answers.forEach((answer) => {
    const question = questionMap.get(answer.question_id);
    if (question && checkAnswer(answer, question)) {
      score += question.points || 0;
    }
  });
  return score;
};

export const correctAnswerText = (
  answer: Answer,
  question: Question
): string => {
  if (!question) return "";
  if (question.is_multiple_answers) {
    return question.correct_options?.join(", ") || "";
  }
  return question.correct_answer || "";
};

export const answersListText = (fullSubmission: FullSubmission): string => {
  if (!fullSubmission.test) return "";
  if (!fullSubmission.questions) return "";

  const questionMap = new Map(
    fullSubmission.questions.map((q: Question) => [q.id, q])
  );
  let text = `No. | Your Answer (Correct) | Correct Answer`;

  fullSubmission.answers.forEach((answer, index) => {
    const question = questionMap.get(answer.question_id);
    if (!question) return;

    const isCorrect = checkAnswer(answer, question);

    text += `\n\n${index + 1}. | ${
      question.is_multiple_answers
        ? answer.answer_options?.join(", ")
        : answer.answer
    } ${isCorrect ? "✅" : "❌"}${
      !isCorrect ? ` | ${correctAnswerText(answer, question)}` : ""
    }`;
  });

  return text;
};

export const gradeFromT = (t: number): string => {
  if (t >= 70) return "A+";
  if (t >= 65) return "A";
  if (t >= 60) return "B+";
  if (t >= 55) return "B";
  if (t >= 50) return "C+";
  if (t >= 45) return "C";
  return "Ega emas";
};

export const percentageFromT = (t: number): string => {
  if (t >= 65) return "100%";
  return `${Math.round((t / 65) * 100)}%`;
};

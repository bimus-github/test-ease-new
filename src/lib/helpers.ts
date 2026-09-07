import { Question, ScoringQuestion } from "@/types/question";
import { Answer, FullSubmission } from "@/types/submission";
import { sendProductionErrors } from "@/telegram/notifications/sendProductionErrors";
import { ScoringType, Test } from "@/types/test";

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

export const checkAnswer = (
  answer?: Answer,
  question?: Question | ScoringQuestion
): boolean => {
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

/**
 * Bitta o'tishda barcha hosilaviy ballarni hisoblaydi.
 *
 * `FullSubmission` emas, oddiy javob+savol ro'yxatini oladi — shu sababli
 * serverda savollarni test bo'yicha bir marta yuklab, minglab urinishni
 * ular ustida hisoblash mumkin.
 */
export interface AnswerScores {
  /** To'g'ri javoblar soni */
  rowScore: number;
  /** Savol ballari yig'indisi (UZ DTM / oddiy baholash) */
  points: number;
  /** SAT bali (200 dan past bo'lmaydi) */
  satScore: number;
}

export const scoreAnswers = (
  answers: Answer[] | null | undefined,
  questions: (Question | ScoringQuestion)[] | null | undefined
): AnswerScores => {
  if (!answers?.length || !questions?.length) {
    return { rowScore: 0, points: 0, satScore: 200 };
  }

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let rowScore = 0;
  let points = 0;
  let satScore = 0;

  for (const answer of answers) {
    const question = questionMap.get(answer.question_id);
    if (!question || !checkAnswer(answer, question)) continue;

    rowScore += 1;
    points += question.points || 0;
    satScore += question.sat_score || 0;
  }

  return { rowScore, points, satScore: Math.max(200, satScore) };
};

/** Simple scoring uchun maksimal ball */
export const maxPointsOf = (
  questions: (Question | ScoringQuestion)[] | null | undefined
): number => (questions || []).reduce((sum, q) => sum + (q.points || 0), 0);

export const calculateRowScore = (fullSubmission: FullSubmission): number => {
  let score = 0;
  if (!fullSubmission.test) return 0;
  if (!fullSubmission.questions) return 0;

  const questionMap = new Map(fullSubmission.questions.map((q) => [q.id, q]));

  fullSubmission.answers.forEach((answer) => {
    const question = questionMap.get(answer.question_id);
    if (question && checkAnswer(answer, question)) {
      score += 1 || 0;
    }
  });
  return score;
};

export const calculatePoints = (fullSubmission: FullSubmission): number => {
  let score = 0;
  if (!fullSubmission.test) return 0;
  if (!fullSubmission.questions) return 0;
  if (fullSubmission.test.scoring_type !== ScoringType.UZ_DTM && 
      fullSubmission.test.scoring_type !== ScoringType.SIMPLE_SCORING) return 0;

  const questionMap = new Map(fullSubmission.questions.map((q) => [q.id, q]));

  fullSubmission.answers.forEach((answer) => {
    const question = questionMap.get(answer.question_id);
    if (question && checkAnswer(answer, question)) {
      score += question.points || 0;
    }
  }); 
  return score;
};

export const calculateSatScore = (fullSubmission: FullSubmission): number => {
  let score = 0;
  if (!fullSubmission.test) return 0;
  if (!fullSubmission.questions) return 0;
  if (fullSubmission.test.scoring_type !== ScoringType.SAT_SCORING) return 0;

  const questionMap = new Map(fullSubmission.questions.map((q) => [q.id, q]));

  fullSubmission.answers.forEach((answer) => {
    const question = questionMap.get(answer.question_id);
    if (question && checkAnswer(answer, question)) {
      score += question.sat_score || 0;
    }
  });

  if(score < 200) return 200;
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

export const scoringTypeText = (scoringType: ScoringType): string => {
 switch (scoringType) {
  case ScoringType.SIMPLE_SCORING:
    return "Oddiy baholash";
  case ScoringType.RASCH_SCORING:
    return "Rasch baholash";
  case ScoringType.SAT_SCORING:
    return "SAT baholash";
  case ScoringType.UZ_DTM:
    return "UZ DTM baholash";
  default:
    return "Noma'lum";
 }
};

export const testTypeText = (testType: ScoringType): string => {
  switch (testType) {
    case ScoringType.SIMPLE_SCORING:
      return "Oddiy baholash";
    case ScoringType.RASCH_SCORING:
      return "Rasch baholash";
    case ScoringType.SAT_SCORING:
      return "SAT baholash";
    case ScoringType.UZ_DTM:
      return "UZ DTM baholash";
    default:
      return "Noma'lum";
  }
};

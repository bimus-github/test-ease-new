import { Answer, Submission } from "@/types/submission";
import { Questions } from "./test";

/**
 * Calculate Rasch probability: P(correct) = exp(ability - difficulty) / (1 + exp(ability - difficulty))
 */
function raschProbability(ability: number, difficulty: number): number {
  const diff = ability - difficulty;
  // Clamp to prevent overflow
  const clampedDiff = Math.max(-10, Math.min(10, diff));
  return 1 / (1 + Math.exp(-clampedDiff));
}

/**
 * Generate a random value from a normal distribution using Box-Muller transform
 */
function normalRandom(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Assign difficulties to questions (varying from easy to hard)
 * Questions with higher order numbers will be more difficult
 */
function getQuestionDifficulty(
  questionOrder: number,
  totalQuestions: number
): number {
  // Scale from -2 (easy) to +2 (hard) based on question order
  return -2 + (4 * (questionOrder - 1)) / (totalQuestions - 1 || 1);
}

export const generateSubmissions = (length: number): Submission[] => {
  const submissions: Submission[] = [];
  const now = new Date();

  // Pre-calculate question difficulties (vary from easy to hard)
  const questionDifficulties = new Map(
    Questions.map((q) => [
      q.id,
      getQuestionDifficulty(q.question_order, Questions.length),
    ])
  );

  for (let i = 0; i < length; i++) {
    const submissionId = `sub_${i + 1}`;
    const startedAt = new Date(
      now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ); // Random time within last 7 days
    const submittedAt = new Date(
      startedAt.getTime() + (Math.random() * 60 + 30) * 60 * 1000
    ); // 30-90 minutes later
    const userId = `user_${Math.floor(Math.random() * 50) + 1}`;

    // Generate student ability from normal distribution (mean=0, stdDev=1.5)
    const studentAbility = normalRandom(0, 1.5);

    // Generate answers for all questions based on Rasch probability
    const answers: Answer[] = Questions.map((question) => {
      // Randomly decide if user answered the question (85% chance)
      const answered = Math.random() < 0.85;

      if (!answered) {
        return {
          question_id: question.id,
        };
      }

      // Get question difficulty
      const questionDifficulty = questionDifficulties.get(question.id) ?? 0;

      // Calculate probability of correct answer using Rasch model
      const probabilityCorrect = raschProbability(
        studentAbility,
        questionDifficulty
      );
      const isCorrect = Math.random() < probabilityCorrect;

      // Generate answer based on question type
      if (question.question_type === "multiple_choice") {
        const options = question.options || [];
        return {
          question_id: question.id,
          answer: isCorrect
            ? question.correct_answer
            : options[Math.floor(Math.random() * options.length)],
        };
      } else if (question.question_type === "fill_blank") {
        // Generate random text answer for fill in the blank
        if (isCorrect) {
          // Generate correct-ish answers
          const correctAnswers: Record<string, string> = {
            q3: "x²/2",
            q6: "3.14",
            q9: "28.26",
          };
          return {
            question_id: question.id,
            answer: correctAnswers[question.id] || "answer",
          };
        } else {
          return {
            question_id: question.id,
            answer: `answer_${Math.random()}`,
          };
        }
      }

      return {
        question_id: question.id,
      };
    });

    submissions.push({
      id: submissionId,
      user_tg_id: userId,
      test_id: "1",
      started_at: startedAt.toISOString(),
      submitted_at: submittedAt.toISOString(),
      created_at: startedAt.toISOString(),
      updated_at: submittedAt.toISOString(),
      answers,
    });
  }

  return submissions;
};

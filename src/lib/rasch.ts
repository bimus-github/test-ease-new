import { Question } from "@/types/question";
import { FullSubmission } from "@/types/submission";
import { checkAnswer, gradeFromT as sharedGradeFromT } from "./helpers";

// types.ts
export interface ScoredSubmission extends FullSubmission {
  rasch_ability: number;
  rasch_z_score: number;
  rasch_score: number;
  rasch_grade: string;
}

export interface RaschStatistics {
  ability: { mean: number; stdDev: number; min: number; max: number };
  difficulty: { mean: number; stdDev: number; min: number; max: number };
  gradeDistribution: Record<string, number>;
}

// math-utils.ts
export const logistic = (x: number): number => 1 / (1 + Math.exp(-x));

export const nanStats = (arr: number[]) => {
  const vals = arr.filter(Number.isFinite);
  if (vals.length === 0) return { mean: NaN, stdDev: NaN, min: NaN, max: NaN };
  
  const mean = vals.reduce((a, b) => a + b) / vals.length;
  const variance = vals.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, vals.length - 1);
  
  return {
    mean,
    stdDev: Math.sqrt(variance),
    min: Math.min(...vals),
    max: Math.max(...vals),
  };
};

// rasch-core.ts
interface RaschParams {
  maxIter?: number;
  tol?: number;
  betaRange?: { min: number; max: number };
}

const DEFAULT_PARAMS: Required<RaschParams> = {
  maxIter: 200,
  tol: 1e-4,
  betaRange: { min: -5, max: 5 }
};

export const fitRaschJML = (
  responses: (number | null)[][],
  params: RaschParams = {}
) => {
  const { maxIter, tol, betaRange } = { ...DEFAULT_PARAMS, ...params };
  const { min: betaMin, max: betaMax } = betaRange;

  const X = responses.map(row => row.map(v => v ?? NaN));
  const mask = X.map(row => row.map(Number.isFinite));

  const nPersons = X.length;
  const nItems = X[0]?.length ?? 0;

  // Initialize parameters from observed proportions
  const initializeParams = () => {
    const beta = Array.from({ length: nItems }, (_, j) => {
      const scores = X.map(r => r[j]).filter(Number.isFinite) as number[];
      const p = scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0.5;
      const logit = -Math.log(Math.max(1e-4, Math.min(1 - 1e-4, p)) / (1 - Math.max(1e-4, Math.min(1 - 1e-4, p))));
      return Math.max(betaMin, Math.min(betaMax, logit));
    });

    const theta = X.map(row => {
      const scores = row.filter(Number.isFinite) as number[];
      const p = scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0.5;
      return Math.log(Math.max(1e-4, Math.min(1 - 1e-4, p)) / (1 - Math.max(1e-4, Math.min(1 - 1e-4, p))));
    });

    return { beta, theta };
  };

  let { beta, theta } = initializeParams();

  const updateParameters = () => {
    // Update theta (person abilities)
    theta.forEach((_, i) => {
      const grad = mask[i].reduce((sum, valid, j) => 
        valid ? sum + (X[i][j] - logistic(theta[i] - beta[j])) : sum, 0
      );
      
      const hess = mask[i].reduce((sum, valid, j) =>
        valid ? sum - logistic(theta[i] - beta[j]) * (1 - logistic(theta[i] - beta[j])) : sum, 0
      );

      if (hess < 0) theta[i] -= grad / hess;
    });

    // Update beta (item difficulties)
    beta.forEach((_, j) => {
      const grad = mask.reduce((sum, row, i) =>
        row[j] ? sum - (X[i][j] - logistic(theta[i] - beta[j])) : sum, 0
      );
      
      const hess = mask.reduce((sum, row, i) =>
        row[j] ? sum - logistic(theta[i] - beta[j]) * (1 - logistic(theta[i] - beta[j])) : sum, 0
      );

      if (hess < 0) {
        beta[j] = Math.max(betaMin, Math.min(betaMax, beta[j] - grad / hess));
      }
    });

    // Center parameters for identifiability
    const betaMean = nanStats(beta).mean;
    if (Number.isFinite(betaMean)) {
      beta = beta.map(b => Math.max(betaMin, Math.min(betaMax, b - betaMean)));
      theta = theta.map(t => t - betaMean);
    }
  };

  // Iterate until convergence
  for (let iter = 0; iter < maxIter; iter++) {
    const oldTheta = [...theta];
    const oldBeta = [...beta];

    updateParameters();

    const maxDelta = Math.max(
      ...theta.map((t, i) => Math.abs(t - oldTheta[i])),
      ...beta.map((b, i) => Math.abs(b - oldBeta[i]))
    );

    if (maxDelta < tol) return { item_beta: beta, person_theta: theta, converged: true };
  }

  return { item_beta: beta, person_theta: theta, converged: false };
};

// scoring.ts
export const tScoreFromZ = (z: number): number => 50 + 10 * z;
export const gradeFromT = sharedGradeFromT;

// main.ts
export const calculateRasch = (
  submissions: FullSubmission[],
  questions: Question[],
  params: RaschParams = {}
): {
  questionDifficulties: Map<string, number>;
  statistics: RaschStatistics;
  scoredSubmissions: ScoredSubmission[];
} => {
  if (!submissions?.length || !questions?.length) {
    return {
      questionDifficulties: new Map(),
      statistics: {
        ability: { mean: 0, stdDev: 0, min: 0, max: 0 },
        difficulty: { mean: 0, stdDev: 0, min: 0, max: 0 },
        gradeDistribution: {},
      },
      scoredSubmissions: [],
    };
  }

  // Build response matrix
  const questionIds = questions.map(q => q.id);
  const questionMap = new Map(questions.map(q => [q.id, q]));

  const responseMatrix = submissions.map(submission =>
    questionIds.map(qid => {
      const answer = submission.answers.find(a => a.question_id === qid);
      if (!answer?.answer && !answer?.answer_options?.length) return null;
      
      const question = questionMap.get(qid);
      return question && checkAnswer(answer, question) ? 1 : 0;
    })
  );

  // Fit Rasch model
  const { item_beta, person_theta } = fitRaschJML(responseMatrix, params);

  // Calculate statistics
  const abilityStats = nanStats(person_theta);
  const difficultyStats = nanStats(item_beta);

  // Score submissions
  const gradeDistribution: Record<string, number> = {};
  const scoredSubmissions = submissions.map((submission, i) => {
    const zScore = abilityStats.stdDev > 0 
      ? (person_theta[i] - abilityStats.mean) / abilityStats.stdDev 
      : 0;
    
    const tScore = tScoreFromZ(zScore);
    const grade = gradeFromT(tScore);

    gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

    return {
      ...submission,
      rasch_ability: person_theta[i],
      rasch_z_score: zScore,
      rasch_score: tScore,
      rasch_grade: grade,
    };
  });

  return {
    questionDifficulties: new Map(questionIds.map((id, i) => [id, item_beta[i]])),
    statistics: {
      ability: abilityStats,
      difficulty: difficultyStats,
      gradeDistribution,
    },
    scoredSubmissions,
  };
};
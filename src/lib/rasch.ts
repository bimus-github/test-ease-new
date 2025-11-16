import { FullSubmission } from "@/types/submission";
import { Question } from "@/types/question";
import { checkAnswer } from "./helpers";

function logistic(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function nanMean(arr: number[]) {
  const vals = arr.filter((v) => Number.isFinite(v));
  if (vals.length === 0) return NaN;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function stdDev(arr: number[]) {
  const vals = arr.filter((v) => Number.isFinite(v));
  if (vals.length <= 1) return NaN;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const varSum =
    vals.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / (vals.length - 1);
  return Math.sqrt(varSum);
}

function fitRaschJML(
  Xin: (number | null)[][],
  maxIter = 200,
  tol = 1e-4,
  betaMin = -5,
  betaMax = 5
) {
  const nPersons = Xin.length;
  const nItems = Xin[0]?.length ?? 0;
  const X: number[][] = Xin.map((row) =>
    row.map((v) => (v === null ? NaN : Number(v)))
  );
  const mask: boolean[][] = X.map((r) => r.map((v) => Number.isFinite(v)));

  // init betas from item p-correct
  const pItem: number[] = Array(nItems)
    .fill(0)
    .map((_, j) => {
      const col = X.map((r) => r[j]).filter((v) =>
        Number.isFinite(v)
      ) as number[];
      const p = col.length ? col.reduce((a, b) => a + b, 0) / col.length : 0.5;
      return Math.min(1 - 1e-4, Math.max(1e-4, p));
    });
  let beta = pItem
    .map((p) => -Math.log(p / (1 - p)))
    .map((b) => Math.max(betaMin, Math.min(betaMax, b)));

  // init theta from person p-correct
  const pPerson: number[] = X.map((r) => {
    const vals = r.filter((v) => Number.isFinite(v)) as number[];
    const p = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0.5;
    return Math.min(1 - 1e-4, Math.max(1e-4, p));
  });
  let theta = pPerson.map((p) => Math.log(p / (1 - p)));

  function updateTheta() {
    for (let i = 0; i < nPersons; i++) {
      const m = mask[i];
      let g = 0,
        h = 0;
      for (let j = 0; j < nItems; j++) {
        if (!m[j]) continue;
        const xij = X[i][j];
        const z = theta[i] - beta[j];
        const p = logistic(z);
        g += xij - p;
        h += -p * (1 - p);
      }
      if (h !== 0 && Number.isFinite(h)) theta[i] -= g / h;
    }
  }

  function updateBeta() {
    for (let j = 0; j < nItems; j++) {
      let g = 0,
        h = 0;
      for (let i = 0; i < nPersons; i++) {
        if (!mask[i][j]) continue;
        const xij = X[i][j];
        const z = theta[i] - beta[j];
        const p = logistic(z);
        g += -(xij - p);
        h += -p * (1 - p);
      }
      if (h !== 0 && Number.isFinite(h)) beta[j] -= g / h;
      // Clamp beta to specified range
      beta[j] = Math.max(betaMin, Math.min(betaMax, beta[j]));
    }
    const shift = nanMean(beta);
    if (Number.isFinite(shift)) {
      beta = beta.map((b) => b - shift);
      theta = theta.map((t) => t - shift);
    }
    // Re-clamp after shifting (in case shift pushes values out of bounds)
    beta = beta.map((b) => Math.max(betaMin, Math.min(betaMax, b)));
  }

  let converged = false;
  for (let it = 1; it <= maxIter; it++) {
    const tOld = theta.slice();
    const bOld = beta.slice();

    updateTheta();
    updateBeta();

    const dT = Math.max(...theta.map((t, k) => Math.abs(t - tOld[k])));
    const dB = Math.max(...beta.map((b, k) => Math.abs(b - bOld[k])));
    const delta = Math.max(dT, dB);
    if (!Number.isFinite(delta)) break;
    if (delta < tol) {
      converged = true;
      break;
    }
  }

  return { item_beta: beta, person_theta: theta, converged };
}

function tScoreFromZ(z: number) {
  return 50 + 10 * z;
}

function gradeFromT(t: number): string {
  if (t >= 70) return "A+";
  if (t >= 65) return "A";
  if (t >= 60) return "B+";
  if (t >= 55) return "B";
  if (t >= 50) return "C+";
  if (t >= 45) return "C";
  return "C dan quyi";
}

export const calculateRasch = (
  submissions: FullSubmission[],
  questions: Question[],
  maxIter = 200,
  tol = 1e-4
) => {
  if (!submissions?.length || !questions?.length) {
    return {
      questionDifficulties: new Map<string, number>(),
      statistics: {
        ability: { mean: 0, stdDev: 0, min: 0, max: 0 },
        difficulty: { mean: 0, stdDev: 0, min: 0, max: 0 },
        gradeDistribution: {},
      },
    };
  }

  // Fix item order by provided questions
  const questionIds = questions.map((q) => q.id);
  const personIds = submissions.map((s) => s.id);

  // Build response matrix with missing as null
  const Xin: (number | null)[][] = submissions.map((s) => {
    return questionIds.map((qid) => {
      const ans = s.answers.find((a) => a.question_id === qid);
      if (!ans || (ans.answer == null && !ans.answer_options?.length)) {
        return null; // treat not-answered as missing
      }
      const q = questions.find((qq) => qq.id === qid);
      const correct = checkAnswer(
        {
          question_id: qid,
          answer: ans.answer,
          answer_options: ans.answer_options,
        },
        q as any
      );
      return correct ? 1 : 0;
    });
  });

  // Fit Rasch using JML
  const { item_beta, person_theta } = fitRaschJML(Xin, maxIter, tol);

  // Map difficulties and abilities
  const questionDifficulties = new Map<string, number>();
  questionIds.forEach((qid, j) => {
    questionDifficulties.set(qid, item_beta[j]);
  });

  // Ability stats
  const abilities = person_theta.slice();
  const abilityMean = nanMean(abilities);
  const abilityStd = stdDev(abilities);
  const abilityMin = Math.min(...abilities);
  const abilityMax = Math.max(...abilities);

  // Difficulty stats
  const difficultyMean = nanMean(item_beta);
  const difficultyStd = stdDev(item_beta);
  const difficultyMin = Math.min(...item_beta);
  const difficultyMax = Math.max(...item_beta);

  // Write back to submissions and compute grades
  const gradeDistribution: Record<string, number> = {};
  submissions.forEach((s, i) => {
    const theta = person_theta[i];
    s.rasch_ability = theta;

    const z =
      Number.isFinite(abilityStd) && abilityStd > 0
        ? (theta - abilityMean) / abilityStd
        : 0;
    const t = tScoreFromZ(z);

    s.rasch_z_score = z;
    s.rasch_score = t;
    const grade = gradeFromT(t);
    s.rasch_grade = grade;
    gradeDistribution[grade] = (gradeDistribution[grade] ?? 0) + 1;
  });

  return {
    questionDifficulties,
    statistics: {
      ability: {
        mean: abilityMean,
        stdDev: abilityStd,
        min: abilityMin,
        max: abilityMax,
      },
      difficulty: {
        mean: difficultyMean,
        stdDev: difficultyStd,
        min: difficultyMin,
        max: difficultyMax,
      },
      gradeDistribution,
    },
  };
};

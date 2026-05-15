// Computer Adaptive Testing (CAT) for Rasch model
// Item information: I(theta, beta) = P * (1 - P) where P = logistic(theta - beta)
// At each step: select item where beta ~= current theta (max info at theta)

export interface CalibratedItem {
  id: string;
  beta: number; // Rasch difficulty
}

const logistic = (x: number): number => 1 / (1 + Math.exp(-x));

export const itemInfo = (theta: number, beta: number): number => {
  const p = logistic(theta - beta);
  return p * (1 - p);
};

/**
 * Select the next item from pool that maximizes Fisher information at current theta.
 * Excludes already-administered items.
 */
export function selectNextItem(
  pool: CalibratedItem[],
  administered: Set<string>,
  theta: number
): CalibratedItem | null {
  let best: CalibratedItem | null = null;
  let bestInfo = -Infinity;
  for (const item of pool) {
    if (administered.has(item.id)) continue;
    const info = itemInfo(theta, item.beta);
    if (info > bestInfo) {
      bestInfo = info;
      best = item;
    }
  }
  return best;
}

/**
 * Newton-Raphson MLE update of theta given responses and item difficulties.
 * x[i] = 1 if correct, 0 if wrong
 */
export function updateTheta(
  responses: Array<{ beta: number; correct: 0 | 1 }>,
  thetaInit: number = 0,
  maxIter: number = 30,
  tol: number = 1e-4
): { theta: number; se: number } {
  let theta = thetaInit;
  for (let iter = 0; iter < maxIter; iter++) {
    let grad = 0;
    let hess = 0;
    for (const r of responses) {
      const p = logistic(theta - r.beta);
      grad += r.correct - p;
      hess -= p * (1 - p);
    }
    if (hess >= -1e-9) break; // no info, can't update
    const delta = -grad / hess;
    theta += delta;
    if (Math.abs(delta) < tol) break;
  }

  // Clamp to reasonable range
  theta = Math.max(-5, Math.min(5, theta));

  // Standard error = 1 / sqrt(total info)
  const totalInfo = responses.reduce((s, r) => s + itemInfo(theta, r.beta), 0);
  const se = totalInfo > 0 ? 1 / Math.sqrt(totalInfo) : Infinity;

  return { theta, se };
}

/**
 * Should we stop the CAT?
 * - Reached max items
 * - SE below threshold (precision met)
 * - No items left in pool
 */
export function shouldStop(
  administered: number,
  poolSize: number,
  se: number,
  config: { maxItems: number; minItems: number; seThreshold: number }
): boolean {
  if (administered >= poolSize) return true;
  if (administered >= config.maxItems) return true;
  if (administered >= config.minItems && se <= config.seThreshold) return true;
  return false;
}

export const DEFAULT_CAT_CONFIG = {
  maxItems: 20,
  minItems: 5,
  seThreshold: 0.3,
};

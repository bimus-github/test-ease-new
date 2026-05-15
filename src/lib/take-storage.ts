import type { Answer } from "@/types/submission";

const KEY_PREFIX = "take-test:";

interface PersistedState {
  answers: Answer[];
  step: string;
  submissionId?: string;
  startedAt?: string;
  savedAt: number;
}

const storageKey = (testId: string, telegramId: string) =>
  `${KEY_PREFIX}${telegramId}:${testId}`;

export const saveTakeState = (
  testId: string,
  telegramId: string,
  state: Omit<PersistedState, "savedAt">
) => {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedState = { ...state, savedAt: Date.now() };
    localStorage.setItem(storageKey(testId, telegramId), JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
};

export const loadTakeState = (
  testId: string,
  telegramId: string
): PersistedState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(testId, telegramId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
};

export const clearTakeState = (testId: string, telegramId: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(testId, telegramId));
  } catch {
    // ignore
  }
};

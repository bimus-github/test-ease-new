import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Answer } from "@/types/submission";

export type TakeStep = "overview" | "answering" | "preview" | "submit";

interface TakeState {
  step: TakeStep;
  answers: Answer[];
  submissionId?: string;
  testId?: string;
  telegramId?: string;
  startedAt?: string;
  isSaving: boolean;
  isSubmitting: boolean;
}

const initialState: TakeState = {
  step: "overview",
  answers: [],
  submissionId: undefined,
  testId: undefined,
  telegramId: undefined,
  startedAt: undefined,
  isSaving: false,
  isSubmitting: false,
};

function upsertAnswer(
  answers: Answer[],
  incoming: Partial<Answer> & { question_id: string }
) {
  const index = answers.findIndex(
    (a) => a.question_id === incoming.question_id
  );
  if (index === -1) {
    answers.push({
      question_id: incoming.question_id,
      answer: incoming.answer,
      answer_options: incoming.answer_options,
    } as Answer);
  } else {
    answers[index] = {
      ...answers[index],
      answer: incoming.answer,
      answer_options: incoming.answer_options,
    } as Answer;
  }
}

const takeSlice = createSlice({
  name: "take",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<TakeStep>) {
      state.step = action.payload;
    },
    setMeta(
      state,
      action: PayloadAction<{
        submissionId?: string;
        testId?: string;
        telegramId?: string;
        startedAt?: string;
      }>
    ) {
      state.submissionId = action.payload.submissionId ?? state.submissionId;
      state.testId = action.payload.testId ?? state.testId;
      state.telegramId = action.payload.telegramId ?? state.telegramId;
      state.startedAt = action.payload.startedAt ?? state.startedAt;
    },
    upsertSingle(
      state,
      action: PayloadAction<{ question_id: string; answer: string | undefined }>
    ) {
      upsertAnswer(state.answers, {
        question_id: action.payload.question_id,
        answer: action.payload.answer,
        answer_options: undefined,
      });
    },
    toggleMulti(
      state,
      action: PayloadAction<{ question_id: string; optionText: string }>
    ) {
      const idx = state.answers.findIndex(
        (a) => a.question_id === action.payload.question_id
      );
      const current = idx === -1 ? [] : state.answers[idx].answer_options || [];
      const exists = current.includes(action.payload.optionText);
      const next = exists
        ? current.filter((t) => t !== action.payload.optionText)
        : [...current, action.payload.optionText];
      upsertAnswer(state.answers, {
        question_id: action.payload.question_id,
        answer: undefined,
        answer_options: next,
      });
    },
    setFillBlank(
      state,
      action: PayloadAction<{ question_id: string; value: string }>
    ) {
      upsertAnswer(state.answers, {
        question_id: action.payload.question_id,
        answer: action.payload.value,
        answer_options: undefined,
      });
    },
    setAnswers(state, action: PayloadAction<Answer[]>) {
      state.answers = Array.isArray(action.payload) ? action.payload : [];
    },
    setIsSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

export const takeActions = takeSlice.actions;
export default takeSlice.reducer;

// Selectors (optional)
export const selectTakeStep = (state: { take: TakeState }) => state.take.step;
export const selectTakeAnswers = (state: { take: TakeState }) =>
  state.take.answers;
export const selectTakeAnswerByQuestionId =
  (qid: string) => (state: { take: TakeState }) =>
    state.take.answers.find((a) => a.question_id === qid);

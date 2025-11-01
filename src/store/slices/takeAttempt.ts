import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnswerForm } from "@/types/answer";

export type TakeStep = "info" | "answer" | "preview" | "confirm";

interface TakeAttemptState {
  step: TakeStep;
  answers: AnswerForm[];
}

const initialState: TakeAttemptState = {
  step: "info",
  answers: [],
};

function upsertByQuestion(
  answers: AnswerForm[],
  payload: Partial<AnswerForm> & { question_id: string }
) {
  const index = answers.findIndex((a) => a.question_id === payload.question_id);
  const now = new Date().toISOString();
  if (index === -1) {
    answers.push({
      attempt_id: "",
      question_id: payload.question_id,
      answer_text: payload.answer_text,
      selected_options: payload.selected_options as any,
      answered_at: now,
    });
  } else {
    answers[index] = {
      ...answers[index],
      answer_text: payload.answer_text,
      selected_options: payload.selected_options as any,
      answered_at: now,
    };
  }
}

const takeAttemptSlice = createSlice({
  name: "takeAttempt",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<TakeStep>) {
      state.step = action.payload;
    },
    setSingleChoice(
      state,
      action: PayloadAction<{ question_id: string; optionText: string }>
    ) {
      upsertByQuestion(state.answers, {
        question_id: action.payload.question_id,
        answer_text: action.payload.optionText,
        selected_options: undefined,
      });
    },
    toggleMultiChoice(
      state,
      action: PayloadAction<{ question_id: string; optionText: string }>
    ) {
      const idx = state.answers.findIndex(
        (a) => a.question_id === action.payload.question_id
      );
      const current =
        idx === -1
          ? []
          : (state.answers[idx].selected_options as any as string[]) || [];
      const exists = current.includes(action.payload.optionText);
      const next = exists
        ? current.filter((t) => t !== action.payload.optionText)
        : [...current, action.payload.optionText];
      upsertByQuestion(state.answers, {
        question_id: action.payload.question_id,
        answer_text: undefined,
        selected_options: next as any,
      });
    },
    setFillBlank(
      state,
      action: PayloadAction<{ question_id: string; value: string }>
    ) {
      upsertByQuestion(state.answers, {
        question_id: action.payload.question_id,
        answer_text: action.payload.value,
        selected_options: undefined,
      });
    },
    setAnswers(state, action: PayloadAction<AnswerForm[]>) {
      state.answers = Array.isArray(action.payload) ? action.payload : [];
    },
    reset(state) {
      state.step = "info";
      state.answers = [];
    },
  },
});

export const takeAttemptActions = takeAttemptSlice.actions;
export default takeAttemptSlice.reducer;

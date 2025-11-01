import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnswerForm } from "@/types/answer";

export type TakeStep = "info" | "answer" | "preview" | "confirm";

interface TakeState {
  step: TakeStep;
  answers: AnswerForm[];
  isSaving: boolean;
  isSubmitting: boolean;
}

const initialState: TakeState = {
  step: "info",
  answers: [],
  isSaving: false,
  isSubmitting: false,
};

const takeSlice = createSlice({
  name: "take",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<TakeStep>) {
      state.step = action.payload;
    },
    upsertAnswer(
      state,
      action: PayloadAction<{
        question_id: string;
        answer_text?: string;
        selected_options?: number[];
      }>
    ) {
      const answersArr: AnswerForm[] = Array.isArray((state as any)?.answers)
        ? ((state as any).answers as AnswerForm[])
        : [];
      (state as any).answers = answersArr;

      const i = answersArr.findIndex(
        (a: AnswerForm) => a.question_id === action.payload.question_id
      );
      if (i === -1) {
        answersArr.push({
          attempt_id: "",
          question_id: action.payload.question_id,
          answer_text: action.payload.answer_text,
          selected_options: action.payload.selected_options?.map(String) ?? [],
          answered_at: new Date().toISOString(),
        });
      } else {
        answersArr[i] = {
          ...answersArr[i],
          answer_text: action.payload.answer_text,
          selected_options: action.payload.selected_options?.map(String) ?? [],
          answered_at: new Date().toISOString(),
        };
      }
    },
    setAnswers(state, action: PayloadAction<AnswerForm[]>) {
      state.answers = Array.isArray(action.payload) ? action.payload : [];
    },
    setIsSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },
    setIsSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    resetTake(state) {
      state.step = "info";
      state.answers = [];
      state.isSaving = false;
      state.isSubmitting = false;
    },
  },
});

export const takeActions = takeSlice.actions;
export default takeSlice.reducer;

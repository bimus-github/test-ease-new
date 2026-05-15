import { MediaType, QuestionForm } from "@/types/question";
import { ScoringType, TestForm, TestStatus } from "@/types/test";
import { SertificateType } from "@/types/sertificate";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  test: TestForm;
  questions: QuestionForm[];
  step: "basic_info" | "questions" | "preview";
  isSubmitting: boolean;
}

export const initialState: InitialState = {
  test: {
    code: "",
    title: "",
    status: TestStatus.ACTIVE,
    scoring_type: ScoringType.RASCH_SCORING,
    teacher_id: "",
  },
  questions: [],
  step: "basic_info",
  isSubmitting: false,
};

export const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    setTest: (state, action: PayloadAction<TestForm>) => {
      state.test = action.payload;
    },
    setQuestions: (state, action: PayloadAction<QuestionForm[]>) => {
      state.questions = action.payload;
    },
    setQuestion: (
      state,
      action: PayloadAction<{ question_label: string; correct_answer: string}>
    ) => {
      const currentQuestion = state.questions.find(
        (q) => q.question_label === action.payload.question_label
      );
      if (currentQuestion) {
        if (currentQuestion.question_type === "multiple_choice") {
          currentQuestion.correct_answer = action.payload.correct_answer;
        } else if (currentQuestion.question_type === "fill_blank") {
          currentQuestion.correct_answer = action.payload.correct_answer;
        }
      }
    },
    setSatScore: (
      state,
      action: PayloadAction<{ question_label: string; sat_score: number }>
    ) => {
      const currentQuestion = state.questions.find(
        (q) => q.question_label === action.payload.question_label
      );
      if (currentQuestion) {
        currentQuestion.sat_score = action.payload.sat_score;
      }
    },
    setQuestionType: (
      state,
      action: PayloadAction<{ question_label: string; question_type: "multiple_choice" | "fill_blank" }>
    ) => {
      const currentQuestion = state.questions.find(
        (q) => q.question_label === action.payload.question_label
      );
      if (currentQuestion) {
        currentQuestion.question_type = action.payload.question_type;
        // Clear correct_answer when switching types
        currentQuestion.correct_answer = undefined;
      }
    },
    setStep: (
      state,
      action: PayloadAction<"basic_info" | "questions" | "preview">
    ) => {
      state.step = action.payload;
    },
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setSertificateType: (state, action: PayloadAction<SertificateType>) => {
      state.test.sertificate_type = action.payload;
    },
    setQuestionPoints: (
      state,
      action: PayloadAction<{ question_label: string; points: number }>
    ) => {
      const currentQuestion = state.questions.find(
        (q) => q.question_label === action.payload.question_label
      );
      if (currentQuestion) {
        currentQuestion.points = action.payload.points;
      }
    },
    setQuestionMedia: (
      state,
      action: PayloadAction<{
        question_label: string;
        media_url: string | undefined;
        media_type: MediaType | undefined;
      }>
    ) => {
      const currentQuestion = state.questions.find(
        (q) => q.question_label === action.payload.question_label
      );
      if (currentQuestion) {
        currentQuestion.media_url = action.payload.media_url;
        currentQuestion.media_type = action.payload.media_type;
      }
    },
    appendGeneratedQuestions: (
      state,
      action: PayloadAction<Array<{
        question_text: string;
        question_type: "multiple_choice" | "fill_blank";
        options?: string[];
        correct_answer: string;
      }>>
    ) => {
      const startOrder = state.questions.length + 1;
      const newOnes: QuestionForm[] = action.payload.map((q, i) => ({
        test_id: "",
        question_label: `${startOrder + i}-savol`,
        question_text: q.question_text,
        question_type: q.question_type,
        question_order: startOrder + i,
        points: 1,
        is_required: true,
        options: q.options,
        correct_answer: q.correct_answer,
      }));
      state.questions = [...state.questions, ...newOnes];
    },
    appendBankQuestions: (
      state,
      action: PayloadAction<QuestionForm[]>
    ) => {
      const startOrder = state.questions.length + 1;
      const newOnes: QuestionForm[] = action.payload.map((q, i) => ({
        ...q,
        test_id: "",
        question_label: `${startOrder + i}-savol`,
        question_order: startOrder + i,
      }));
      state.questions = [...state.questions, ...newOnes];
    },
    setQuestionsCount: (state, action: PayloadAction<number>) => {
      const count = action.payload;
      const currentCount = state.questions.length;
      
      if (count > currentCount) {
        // Add new questions
        const newQuestions: QuestionForm[] = [];
        for (let i = currentCount + 1; i <= count; i++) {
          newQuestions.push({
            test_id: "",
            question_label: `${i}-savol`,
            question_text: "Savol matnini o'qituvchidan olishingiz mumkin.",
            question_type: "multiple_choice",
            question_order: i,
            points: 1,
            is_required: true,
            options: ["A", "B", "C", "D"],
            correct_answer: "",
          });
        }
        state.questions = [...state.questions, ...newQuestions];
      } else if (count < currentCount) {
        // Remove questions
        state.questions = state.questions.slice(0, count);
      }
    },
    reset: (state) => {
      state.test = initialState.test;
      state.questions = initialState.questions;
      state.step = initialState.step;
      state.isSubmitting = initialState.isSubmitting;
    },
  },
});

export const testFromActions = testSlice.actions;
export default testSlice.reducer;

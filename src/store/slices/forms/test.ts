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
    setQuestionText: (
      state,
      action: PayloadAction<{ question_label: string; text: string }>
    ) => {
      const q = state.questions.find((x) => x.question_label === action.payload.question_label);
      if (q) q.question_text = action.payload.text;
    },
    setOptionText: (
      state,
      action: PayloadAction<{ question_label: string; index: number; text: string }>
    ) => {
      const q = state.questions.find((x) => x.question_label === action.payload.question_label);
      if (!q || !q.options) return;
      const oldText = q.options[action.payload.index];
      q.options[action.payload.index] = action.payload.text;
      // Update correct_answer if it pointed to the old text
      if (q.correct_answer === oldText) {
        q.correct_answer = action.payload.text;
      }
      // Update correct_options if it contained the old text
      if (q.correct_options?.includes(oldText)) {
        q.correct_options = q.correct_options.map((o) =>
          o === oldText ? action.payload.text : o
        );
      }
    },
    addOption: (state, action: PayloadAction<{ question_label: string }>) => {
      const q = state.questions.find((x) => x.question_label === action.payload.question_label);
      if (!q) return;
      const current = q.options || [];
      const nextLetter = String.fromCharCode(65 + current.length);
      q.options = [...current, nextLetter];
    },
    removeOption: (
      state,
      action: PayloadAction<{ question_label: string; index: number }>
    ) => {
      const q = state.questions.find((x) => x.question_label === action.payload.question_label);
      if (!q || !q.options) return;
      const removed = q.options[action.payload.index];
      q.options = q.options.filter((_, i) => i !== action.payload.index);
      if (q.correct_answer === removed) q.correct_answer = undefined;
      if (q.correct_options) {
        q.correct_options = q.correct_options.filter((o) => o !== removed);
      }
    },
    addQuestion: (state) => {
      const order = state.questions.length + 1;
      state.questions.push({
        test_id: "",
        question_label: `${order}-savol`,
        question_text: "",
        question_type: "multiple_choice",
        question_order: order,
        points: 1,
        is_required: true,
        options: ["A", "B", "C", "D"],
        correct_answer: "",
      });
    },
    removeQuestion: (state, action: PayloadAction<{ question_label: string }>) => {
      state.questions = state.questions.filter(
        (q) => q.question_label !== action.payload.question_label
      );
      // Re-number remaining
      state.questions = state.questions.map((q, i) => ({
        ...q,
        question_label: `${i + 1}-savol`,
        question_order: i + 1,
      }));
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
            question_text: "",
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

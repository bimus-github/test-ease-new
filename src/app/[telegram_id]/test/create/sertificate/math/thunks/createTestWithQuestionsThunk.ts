"use client";
import { AppThunk } from "@/store/store";
import { initialState, testFromActions } from "@/store/slices/forms/test";
import toast from "react-hot-toast";
import { createTestQuestionsAction } from "../actions";

export const createTestQuestionsThunk =
  (telegramId: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const { test, questions, isSubmitting } = getState().test;
      if (isSubmitting) {
        toast.error("Iltimos, test yaratilishini kuting");
        return;
      } else {
        dispatch(testFromActions.setIsSubmitting(true));
        const testWithQuestions = await createTestQuestionsAction(
          test,
          questions,
          telegramId
        );
        if (testWithQuestions) {
          dispatch(testFromActions.setTest(initialState.test));
          dispatch(testFromActions.setQuestions([]));
          dispatch(testFromActions.setStep("basic_info"));
          toast.success("Test muvaffaqiyatli yaratildi");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Savollar bilan test yaratib bo‘lmadi");
    } finally {
      dispatch(testFromActions.setIsSubmitting(false));
    }
  };

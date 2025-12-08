"use client";
import { AppThunk } from "@/store/store";
import { initialState, testFromActions } from "@/store/slices/forms/test";
import toast from "react-hot-toast";
import { updateTestWithQuestionsAction } from "../actions/updateTestWithQuestions";
import { dateTimeLocalToISO } from "@/lib/utils";

export const updateTestWithQuestionsThunk =
  (testId: string, onSuccess: () => void): AppThunk =>
  async (dispatch, getState) => {
    try {
      const { test, questions, isSubmitting } = getState().test;
      if (isSubmitting) {
        toast.error("Iltimos, test yangilanishini kuting");
        return;
      } else {
        dispatch(testFromActions.setIsSubmitting(true));
        // Convert end_date to UTC ISO on client side (browser timezone context)
        const testWithConvertedDate = {
          ...test,
          end_date: test.end_date ? dateTimeLocalToISO(test.end_date) : undefined,
        };
        const testWithQuestions = await updateTestWithQuestionsAction(
          testId,
          testWithConvertedDate,
          questions,
        );
        if (testWithQuestions) {
          onSuccess();
          // Reset state
          dispatch(testFromActions.setTest(initialState.test));
          dispatch(testFromActions.setQuestions([]));
          dispatch(testFromActions.setStep("basic_info"));
          toast.success("Test muvaffaqiyatli yangilandi");
        } else {
          toast.error("Testni yangilab bo‘lmadi");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Savollar bilan testni yangilab bo‘lmadi");
    } finally {
      dispatch(testFromActions.setIsSubmitting(false));
    }
  };

import { createTestQuestionsAction } from "@/app/[telegram_id]/test/create-sertificate/[sertificateType]/actions";
import { initialState, testFromActions } from "@/store/slices/forms/test";
import { AppThunk } from "@/store/store";
import toast from "react-hot-toast";


export const handleSaveTestThunk =
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
  }
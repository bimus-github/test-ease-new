import { AppThunk } from "@/store/store";
import toast from "react-hot-toast";
import { testFromActions } from "@/store/slices/forms/test";
import { ScoringType } from "@/types/test";


export const handleQuestionsThunk =
  (): AppThunk =>
  async (dispatch, getState) => {
    try {
      const { test, questions } = getState().test;

      const isHaveUnansweredQuestions = questions!.some(
        (question) =>
          !question.correct_answer && !question.correct_options?.length
      )
      if (isHaveUnansweredQuestions) {
        toast.error("Barcha savollar uchun javob kiritilishi kerak");
        return;
      }
      
      if(test?.scoring_type === ScoringType.SAT_SCORING) {
        const isHaveUnansweredSatScore = questions?.some(question => !question.sat_score);
        if (isHaveUnansweredSatScore) {
          toast.error("Barcha savollar uchun SAT bali kiritilishi kerak");
          return;
        }

        const totalScore = questions?.reduce((acc, question) => acc + (question?.sat_score || 0), 0);
        if (totalScore !== 800) {
          toast.error("SAT bali 800 ga teng bo‘lishi kerak, sizning balingiz: " + totalScore);
          return;
        }
      }

      dispatch(testFromActions.setStep("preview"));
    } catch (error) {
      console.error(error);
      toast.error("Savollarni texshirishda xatolik yuz berdi.");
    }
  }
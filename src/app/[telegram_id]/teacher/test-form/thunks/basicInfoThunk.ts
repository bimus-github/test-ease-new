import { AppThunk } from "@/store/store";
import { isTestCodeUnique } from "../actions/checkTestCode";
import toast from "react-hot-toast";
import { testFromActions } from "@/store/slices/forms/test";

export const basicInfoThunk =
  (testId?: string): AppThunk =>
  async (dispatch, getState) => {
    try {
        const { test } = getState().test;

        const isCodeValid = await isTestCodeUnique(test!.code, testId)
        
        if (!isCodeValid) {
            toast.error("Bunday test kodi mavjud");
            return;
          }
          if (test!.code.length < 3) {
            toast.error("Kod kamida 3 ta belgidan iborat bo‘lishi kerak");
            return;
          }
          if (test!.title.length < 3) {
            toast.error("Sarlavha kamida 3 ta belgidan iborat bo‘lishi kerak");
            return;
          }
          if (test!.description && test!.description.length < 3) {
            toast.error("Tavsif kamida 3 ta belgidan iborat bo‘lishi kerak");
            return;
          }
          if (test!.end_date && new Date(test!.end_date) < new Date()) {
            toast.error("Tugash vaqti kelajakda bo‘lishi kerak");
            return;
          }
          dispatch(testFromActions.setStep("questions"));
    } catch (error) {
        console.error(error);
        toast.error("Asosiy ma’lumotlarni texshirishda xatolik yuz berdi");
    } 
  }
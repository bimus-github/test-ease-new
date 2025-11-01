"use client";
import { ScoringType } from "@/types/test";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { Stepper } from "./components/Stepper";
import { BasicInfoForm } from "./components/BasicInfoForm";
import { QuestionsForm } from "./components/QuestionsForm";
import { Preview } from "./components/Preview";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { testFromActions } from "@/store/slices/forms/test";
import { generateMathSertificateUzQuestions } from "@/constants/sertificate-uz/math";
import { createTestQuestionsThunk } from "./thunks/createTestWithQuestionsThunk";
import { useParams } from "next/navigation";

export default function Page() {
  const { telegram_id } = useParams<{ telegram_id: string }>();
  const { step, isSubmitting, questions, test } = useAppSelector(
    (state) => state.test
  );
  const dispatch = useAppDispatch();

  const handleBasicInfoSubmit = useCallback(() => {
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
    if (test!.instructions && test!.instructions.length < 3) {
      toast.error("Ko‘rsatmalar kamida 3 ta belgidan iborat bo‘lishi kerak");
      return;
    }
    if (test!.end_date && new Date(test!.end_date) < new Date()) {
      toast.error("Tugash vaqti kelajakda bo‘lishi kerak");
      return;
    }
    if (test!.scoring_type !== ScoringType.RASCH_SCORING) {
      toast.error("Baholash turi rasch_scoring bo‘lishi kerak");
      return;
    }
    dispatch(testFromActions.setStep("questions"));
  }, [test, dispatch]);

  const handleQuestionsSubmit = useCallback(() => {
    // if there are any questions with empty answer, show error
    if (
      questions!.some(
        (question) =>
          !question.correct_answer && !question.correct_options?.length
      )
    ) {
      toast.error("Barcha savollar uchun javob kiritilishi kerak");
      return;
    }
    dispatch(testFromActions.setStep("preview"));
  }, [questions, dispatch]);

  useEffect(() => {
    if (questions.length === 0) {
      dispatch(
        testFromActions.setQuestions(generateMathSertificateUzQuestions())
      );
    }
  }, [dispatch, questions]);

  if (!telegram_id) {
    return <div>Telegram ID not found</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-background p-4 dark:border-neutral-800">
        <Stepper
          steps={[
            { id: "basic_info", label: "Asosiy ma’lumotlar" },
            { id: "questions", label: "Savollar" },
            { id: "preview", label: "Oldindan ko‘rish" },
          ]}
          current={step}
        />
      </div>

      {step === "basic_info" && (
        <BasicInfoForm onSubmit={handleBasicInfoSubmit} />
      )}
      {step === "questions" && (
        <QuestionsForm onSubmit={handleQuestionsSubmit} />
      )}
      {step === "preview" && (
        <Preview
          form={test!}
          questions={questions || []}
          isSubmitting={isSubmitting}
          onBack={() => dispatch(testFromActions.setStep("questions"))}
          onConfirm={() => dispatch(createTestQuestionsThunk(telegram_id))}
        />
      )}
    </div>
  );
}

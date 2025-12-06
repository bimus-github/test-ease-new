"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { testFromActions } from "@/store/slices/forms/test";
import { getTestWithQuestionsAction } from "./actions";
import { updateTestWithQuestionsThunk } from "./thunks/updateTestWithQuestionsThunk";
import { VIEW_TEST_ROUTE } from "@/constants/routes";
import { TestForm } from "@/types/test";
import { UpdateQuestionForm } from "@/types/question";
import toast from "react-hot-toast";
import { toDateTimeLocalValue } from "@/lib/utils";
import { isTestCode } from "@/lib/helpers";
import { Stepper } from "../../create-sertificate/[sertificateType]/components/Stepper";
import { BasicInfoForm } from "../../create-sertificate/[sertificateType]/components/BasicInfoForm";
import { QuestionsForm } from "../../create-sertificate/[sertificateType]/components/QuestionsForm";
import { Preview } from "../../create-sertificate/[sertificateType]/components/Preview";

export default function EditTestClient() {
  const { telegram_id: telegramId, testId } = useParams<{
    telegram_id: string;
    testId: string;
  }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { step, isSubmitting, questions, test } = useAppSelector(
    (state) => state.test
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["edit-test", testId],
    queryFn: () => getTestWithQuestionsAction(testId!),
    enabled: Boolean(testId),
  });

  // Populate Redux store when data loads
  useEffect(() => {
    if (data) {
      // Map TestWithQuestions to TestForm (exclude id, created_at, updated_at)
      const testForm: TestForm = {
        code: data.code,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        end_date: data.end_date
          ? toDateTimeLocalValue(data.end_date)
          : undefined,
        status: data.status,
        scoring_type: data.scoring_type,
        teacher_id: data.teacher_id,
      };

      // Map Questions to QuestionForm (exclude id, created_at, updated_at, test_id)
      const questionsForm: UpdateQuestionForm[] = data.questions.map(
        (q) =>
          ({
            id: q.id,
            test_id: data.id,
            question_label: q.question_label,
            question_text: q.question_text,
            question_type: q.question_type,
            question_order: q.question_order,
            points: q.points,
            is_required: q.is_required,
            is_multiple_answers: q.is_multiple_answers,
            options: q.options,
            correct_answer: q.correct_answer,
            correct_options: q.correct_options,
            rasch_difficulty: q.rasch_difficulty,
          } as UpdateQuestionForm)
      );

      dispatch(testFromActions.setTest(testForm));
      dispatch(testFromActions.setQuestions(questionsForm));
    }
  }, [data, dispatch]);

  const handleBasicInfoSubmit = () => {
    if (!isTestCode(test!.code)) {
      toast.error("Test kodi noto‘g‘ri");
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
    dispatch(testFromActions.setStep("questions"));
  };

  const handleQuestionsSubmit = () => {
    // if there are any questions with empty answer, show error
    if (
      questions!.some(
        (question) =>
          !question.correct_answer && !question.correct_options?.length
      )
    ) {
      toast.error("All questions must have an answer");
      return;
    }
    dispatch(testFromActions.setStep("preview"));
  };

  const handleConfirm = async () => {
    if (!testId || !telegramId) return;

    await dispatch(updateTestWithQuestionsThunk(testId));

    // Redirect after a brief delay to allow toast to show
    setTimeout(() => {
      router.push(VIEW_TEST_ROUTE({ testId, telegramId }));
    }, 1500);
  };

  if (!testId || !telegramId) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="rounded border p-6">
          <h1 className="text-lg font-semibold">
            Test ID yoki Telegram ID topilmadi
          </h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="rounded border p-6">
          <div className="text-lg font-semibold">Test yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Testni yuklab bo‘lmadi. Iltimos, qayta urinib ko‘ring.
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="rounded border p-6">
          <div className="text-lg font-semibold">Forma yuklanmoqda...</div>
        </div>
      </div>
    );
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
          form={test}
          questions={questions || []}
          isSubmitting={isSubmitting}
          onBack={() => dispatch(testFromActions.setStep("questions"))}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

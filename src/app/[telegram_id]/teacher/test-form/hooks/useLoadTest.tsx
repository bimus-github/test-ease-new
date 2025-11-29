'use client';
import { toDateTimeLocalValue } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { testFromActions } from "@/store/slices/forms/test";
import { UpdateQuestionForm } from "@/types/question";
import { TestForm } from "@/types/test";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { getTestWithQuestionsAction } from "../actions/getTestWithQuestions";


export const useLoadTest = () => {
    const dispatch = useAppDispatch();
    const { testId } = useParams<{ testId: string }>();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["test", testId],
        queryFn: () => getTestWithQuestionsAction(testId!),
        enabled: Boolean(testId),
    });

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
            sat_section: data.sat_section,
            sertificate_type: data.sertificate_type,
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
                sat_score: q.sat_score
              } as UpdateQuestionForm)
          );
    
          dispatch(testFromActions.setTest(testForm));
          dispatch(testFromActions.setQuestions(questionsForm));
        }
      }, [data, dispatch]);
}
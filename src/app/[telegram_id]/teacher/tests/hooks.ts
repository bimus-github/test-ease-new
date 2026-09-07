"use client";
import { Test, TestWithQuestions } from "@/types/test";
import { getFullSubmissionAction, getTestsByTeacherAction, getTestWithQuestionsAction } from "./actions";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TEACHER_FULL_SUBMISSION_KEY, TEACHER_FULL_SUBMISSIONS_KEY, TEACHER_TEST_WITH_QUESTIONS_KEY, TEACHER_TESTS_KEY } from "@/constants/react-query-keys";
import { getSubmissionsListAction } from "./[testId]/attempts/actions";
import { FullSubmission, SubmissionListItem } from "@/types/submission";


export const useTestsOfTeacher = () => {
    const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();

    return useQuery<Test[]>({
        queryKey: TEACHER_TESTS_KEY(telegramId),
        queryFn: () => getTestsByTeacherAction(telegramId!),
        enabled: Boolean(telegramId),
    });
};

// the hook for getting a test with questions
// it is used in the .../[testId]/... routes
/**
 * Get a test with questions
 * @param testId - the id of the test
 * @param telegramId - the id of the telegram
 * 
 * note: this hook is used in the .../[testId]/... routes
 * 
 * @returns TestWithQuestions | null
 */
export const useTestWithQuestions = () => {
    const { testId } = useParams<{ testId: string}>();

    return useQuery<TestWithQuestions | null>({
        queryKey: TEACHER_TEST_WITH_QUESTIONS_KEY(testId),
        queryFn: () => getTestWithQuestionsAction(testId!),
        enabled: Boolean(testId),
    });
}


/**
 * Test bo'yicha urinishlar ro'yxati (yengil yozuvlar).
 *
 * Savollar qatorlar bilan birga kelmaydi — barcha ballar serverda hisoblanadi,
 * shu sababli 1000+ urinishli testda ham javob bir necha MB'dan oshmaydi.
 *
 * Xatolik yuz bersa bo'sh massiv EMAS, xato tashlanadi — sahifa
 * "Xatolik yuz berdi" holatini ko'rsatishi uchun.
 *
 * note: this hook is used in the .../[testId]/attempts/page.tsx
 */
export const useSubmissionsList = () => {
    const { testId } = useParams<{ testId: string }>();
    return useQuery<SubmissionListItem[]>({
        queryKey: TEACHER_FULL_SUBMISSIONS_KEY(testId),
        queryFn: async () => {
            const res = await getSubmissionsListAction({ testId });
            if (!res.ok) throw new Error(res.error);
            return res.submissions;
        },
        enabled: Boolean(testId),
    });
}


export const useFullSubmission = () => {
    const { submissionId } = useParams<{ submissionId: string }>();

    return useQuery<FullSubmission | null>({
        queryKey: TEACHER_FULL_SUBMISSION_KEY(submissionId),
        queryFn: async () => {
            const res = await getFullSubmissionAction(submissionId!);
            if (res.ok) return res.submission;
            return null;
        },
        enabled: Boolean(submissionId),
    });
};
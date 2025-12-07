"use client";
import { Test, TestWithQuestions } from "@/types/test";
import { getFullSubmissionAction, getTestsByTeacherAction, getTestWithQuestionsAction } from "./actions";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TEACHER_FULL_SUBMISSION_KEY, TEACHER_FULL_SUBMISSIONS_KEY, TEACHER_TEST_WITH_QUESTIONS_KEY, TEACHER_TESTS_KEY } from "@/constants/react-query-keys";
import { getFullSubmissionsAction } from "./[testId]/attempts/actions";
import { FullSubmission } from "@/types/submission";


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
 * Get all submissions for a test
 * @param testId - the id of the test
 * @returns FullSubmission[] | null
 * 
 * note: this hook is used in the .../[testId]/attempts/page.tsx
 */
export const useFullSubmissions = () => {
    const { testId } = useParams<{ testId: string }>();
    return useQuery<FullSubmission[]>({
        queryKey: TEACHER_FULL_SUBMISSIONS_KEY(testId),
        queryFn: async () => {
            const res = await getFullSubmissionsAction({ testId });
            if (res.ok) return res.submissions;
            return [];
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
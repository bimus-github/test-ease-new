"use server";
import { getTestsByTeacher, getTestWithQuestions } from "@/dbs/test-servers";
import { getFullSubmission } from "@/dbs/submission-servers";
import { FullSubmission } from "@/types/submission";


export async function getTestsByTeacherAction(telegramId: string, page?: number, limit?: number) {
    const tests = await getTestsByTeacher(telegramId, page, limit);
    return tests;
}

export async function getTestWithQuestionsAction(testId: string) {
    const test = await getTestWithQuestions(testId);
    return test;
}

export async function getFullSubmissionAction(submissionId: string): Promise<{ ok: true; submission: FullSubmission } | { ok: false; error: string }> {
    const submission = await getFullSubmission(submissionId);
    if (!submission) return { ok: false, error: "Submission not found" };
    return { ok: true, submission };
}
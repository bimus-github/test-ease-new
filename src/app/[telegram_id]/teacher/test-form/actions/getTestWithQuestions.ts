"use server";
import { getTestWithQuestions } from "@/dbs/test-servers";

export async function getTestWithQuestionsAction(testId: string) {
    return await getTestWithQuestions(testId);
}     
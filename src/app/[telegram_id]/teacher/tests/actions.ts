"use server";
import { getTestsByTeacher, getTestWithQuestions } from "@/dbs/test-servers";


export async function getTestsByTeacherAction(telegramId: string, page?: number, limit?: number) {
    const tests = await getTestsByTeacher(telegramId, page, limit);
    return tests;
}

export async function getTestWithQuestionsAction(testId: string) {
    const test = await getTestWithQuestions(testId);
    return test;
  }
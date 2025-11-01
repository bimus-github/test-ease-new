"use server";
import { getTestWithQuestions } from "@/dbs/test-servers";

export async function getTestWithQuestionsAction(testId: string) {
  const test = await getTestWithQuestions(testId);
  return test;
}

"use server";
import { getTestsByTeacher } from "@/dbs/test-servers";

export async function getTestsByTeacherAction(
  telegramId: string,
  page: number = 0,
  limit: number = 50
) {
  const tests = await getTestsByTeacher(telegramId, page, limit);
  return tests;
}

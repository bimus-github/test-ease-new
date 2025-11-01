"use server";
import { getTestWithQuestions } from "@/dbs/test-servers";
import {
  createAttempt,
  getAttemptByTestAndUser,
  updateAttemptStatus,
  calculateAndUpdateScore,
  getAttemptFull,
  getAttemptStatusByAttemptId,
} from "@/dbs/attempt-servers";
import { createAnswersBulk } from "@/dbs/answer-servers";
import { AttemptStatus } from "@/types/attempt";
import { AnswerForm } from "@/types/answer";
import { dateTimeLocalToISO } from "@/lib/utils";

export async function getTestWithQuestionsAction(testId: string) {
  return getTestWithQuestions(testId);
}

export async function getExistingAttemptAction(
  testId: string,
  telegramId: string
) {
  return getAttemptByTestAndUser(testId, telegramId);
}

export async function createAttemptAction(testId: string, telegramId: string) {
  return createAttempt(testId, telegramId);
}

export async function saveAnswersBulkAction(
  attemptId: string,
  answers: AnswerForm[]
) {
  return createAnswersBulk(attemptId, answers);
}

export async function submitAttemptAction(attemptId: string) {
  const updated = await updateAttemptStatus(
    attemptId,
    AttemptStatus.SUBMITTED,
    dateTimeLocalToISO(new Date().toISOString())
  );
  if (!updated) return null;
  return calculateAndUpdateScore(attemptId);
}

export async function getAttemptFullAction(attemptId: string) {
  return getAttemptFull(attemptId);
}

export async function getAttemptStatusByAttemptIdAction(attemptId: string) {
  return getAttemptStatusByAttemptId(attemptId);
}

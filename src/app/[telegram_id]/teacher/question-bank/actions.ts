"use server";

import {
  listBankQuestions,
  createBankQuestion,
  deleteBankQuestion,
} from "@/dbs/question-bank-servers";
import type { BankQuestionInput } from "@/types/question-bank";

export async function getMyBankAction(
  teacherId: string,
  search?: string,
  subject?: string
) {
  return listBankQuestions(teacherId, { search, subject });
}

export async function saveToBankAction(input: BankQuestionInput) {
  return createBankQuestion(input);
}

export async function deleteFromBankAction(id: string, teacherId: string) {
  return deleteBankQuestion(id, teacherId);
}

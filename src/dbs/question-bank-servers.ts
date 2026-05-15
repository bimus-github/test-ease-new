"use server";
import { supabase } from "@/lib/supabase";
import type { BankQuestion, BankQuestionInput } from "@/types/question-bank";

export async function listBankQuestions(
  teacherId: string,
  opts?: { search?: string; subject?: string; limit?: number }
): Promise<BankQuestion[]> {
  let query = supabase
    .from("question_bank")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (opts?.search) {
    query = query.ilike("question_text", `%${opts.search}%`);
  }
  if (opts?.subject) {
    query = query.eq("subject", opts.subject);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listBankQuestions:", error);
    return [];
  }
  return data || [];
}

export async function createBankQuestion(
  input: BankQuestionInput
): Promise<BankQuestion | null> {
  const { data, error } = await supabase
    .from("question_bank")
    .insert(input)
    .select()
    .single();
  if (error) {
    console.error("createBankQuestion:", error);
    return null;
  }
  return data;
}

export async function deleteBankQuestion(id: string, teacherId: string): Promise<boolean> {
  const { error } = await supabase
    .from("question_bank")
    .delete()
    .eq("id", id)
    .eq("teacher_id", teacherId);
  if (error) {
    console.error("deleteBankQuestion:", error);
    return false;
  }
  return true;
}

export async function updateBankQuestion(
  id: string,
  teacherId: string,
  updates: Partial<BankQuestionInput>
): Promise<BankQuestion | null> {
  const { data, error } = await supabase
    .from("question_bank")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("teacher_id", teacherId)
    .select()
    .single();
  if (error) {
    console.error("updateBankQuestion:", error);
    return null;
  }
  return data;
}

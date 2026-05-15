import type { MediaType } from "./question";

export interface BankQuestion {
  id: string;
  teacher_id: string;
  question_text: string;
  question_type: "multiple_choice" | "fill_blank" | "true_false";
  options?: string[];
  correct_answer?: string;
  correct_options?: string[];
  is_multiple_answers?: boolean;
  points?: number;
  media_url?: string;
  media_type?: MediaType;
  tags?: string[];
  subject?: string;
  created_at: string;
  updated_at: string;
}

export interface BankQuestionInput
  extends Omit<BankQuestion, "id" | "created_at" | "updated_at"> {}

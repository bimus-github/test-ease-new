import { Question } from "./question";

export interface Answer {
  id: string;
  attempt_id: string; // TestAttempt's id
  question_id: string; // Question's id
  answer_text?: string; // Answer text for the question, default is empty string
  selected_options?: string[]; // Selected option texts for multi-answer questions
  answered_at: string; // Answered at date
  created_at: string; // Created at date
  updated_at: string; // Updated at date
}

export interface AnswerForm
  extends Omit<Answer, "id" | "created_at" | "updated_at"> {}

export interface AnswerWithQuestion extends Answer {
  question?: Question;
}

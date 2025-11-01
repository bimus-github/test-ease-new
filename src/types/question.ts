export interface Question {
  id: string;
  test_id: string; // Test's id
  question_label: string; // Question's label: 1, 2, 3, ... | A, B, C, ... | 1.1, 1.2, 1.3, ... | A.1, A.2, A.3, ...
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "fill_blank";
  question_order: number;
  points: number; // Points for the question, default is 1
  is_required: boolean; // Whether the question is required, default is true
  is_multiple_answers?: boolean; // Whether the question allows multiple answers, default is false
  options?: string[]; // Options for the question, default is empty array
  correct_answer?: string; // Correct answer for the question, default is empty string
  correct_options?: string[]; // Correct options for the question, default is empty array
  created_at: string; // Created at date
  updated_at: string; // Updated at date
}

export interface QuestionForm
  extends Omit<Question, "id" | "created_at" | "updated_at"> {}

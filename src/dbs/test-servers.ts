import { supabase } from "@/lib/supabase";
import { Test, TestForm, TestWithQuestions } from "@/types/test";
import { QuestionForm } from "@/types/question";
import { dateTimeLocalToISO } from "@/lib/utils";

/**
 * Update expired tests (sets status to inactive if end_date has passed)
 * This should be called before fetching tests to ensure status is up-to-date
 * @returns Number of updated tests
 */
export async function updateExpiredTests(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc("update_expired_tests");

    if (error) {
      console.error("Error updating expired tests:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Database error updating expired tests:", error);
    return 0;
  }
}

/**
 * Create a new test
 * @param testData - Test form data
 * @returns Test object or null if failed
 */
export async function createTest(testData: TestForm): Promise<Test | null> {
  try {
    const { data, error } = await supabase
      .from("tests")
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error("Error creating test:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Get test by ID
 * @param id - Test UUID
 * @returns Test object or null if not found
 */
export async function getTestById(id: string): Promise<Test | null> {
  try {
    // Update expired tests before fetching
    await updateExpiredTests();

    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching test by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Get test by unique code
 * @param code - Test code
 * @returns Test object or null if not found
 */
export async function getTestByCode(code: string): Promise<Test | null> {
  try {
    // Update expired tests before fetching
    await updateExpiredTests();

    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      console.error("Error fetching test by code:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Update test
 * @param id - Test UUID
 * @param updates - Partial test data to update
 * @returns Updated test object or null if failed
 */
export async function updateTest(
  id: string,
  updates: Partial<TestForm>
): Promise<Test | null> {
  try {
    const { data, error } = await supabase
      .from("tests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating test:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Delete test (cascades to questions)
 * @param id - Test UUID
 * @returns boolean indicating success
 */
export async function deleteTest(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("tests").delete().eq("id", id);

    if (error) {
      console.error("Error deleting test:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Database error:", error);
    return false;
  }
}

/**
 * Get all tests for a teacher with pagination
 * @param teacherId - Teacher's telegram_id
 * @param page - Page number (0-based)
 * @param limit - Number of tests per page
 * @returns Array of Test objects
 */
export async function getTestsByTeacher(
  teacherId: string,
  page: number = 0,
  limit: number = 50
): Promise<Test[]> {
  try {
    // Update expired tests before fetching
    await updateExpiredTests();

    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) {
      console.error("Error fetching tests by teacher:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

/**
 * Get active tests for a teacher
 * @param teacherId - Teacher's telegram_id
 * @returns Array of active Test objects
 */
export async function getActiveTestsByTeacher(
  teacherId: string
): Promise<Test[]> {
  try {
    // Update expired tests before fetching
    await updateExpiredTests();

    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active tests by teacher:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

/**
 * Get test with all questions
 * @param testId - Test UUID
 * @returns TestWithQuestions object or null if not found
 */
export async function getTestWithQuestions(
  testId: string
): Promise<TestWithQuestions | null> {
  try {
    // Update expired tests before fetching
    await updateExpiredTests();

    // First get the test
    const { data: testData, error: testError } = await supabase
      .from("tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (testError) {
      console.error("Error fetching test:", testError);
      return null;
    }

    // Then get the questions
    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("test_id", testId)
      .order("question_order", { ascending: true });

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      return null;
    }

    return {
      ...testData,
      questions: questionsData || [],
    };
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

/**
 * Create test with questions atomically
 * @param testData - Test form data
 * @param questions - Array of question form data
 * @returns TestWithQuestions object or null if failed
 */
export async function createTestWithQuestions(
  testData: TestForm,
  questions: QuestionForm[]
): Promise<TestWithQuestions | null> {
  try {
    // First create the test
    const { data: test, error: testError } = await supabase
      .from("tests")
      .insert({ ...testData, end_date: dateTimeLocalToISO(testData.end_date) })
      .select()
      .single();

    if (testError) {
      console.error("Error creating test:", testError);
      return null;
    }

    // Then create the questions
    const questionsWithTestId = questions.map((question) => ({
      ...question,
      test_id: test.id,
    }));

    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .insert(questionsWithTestId)
      .select();

    if (questionsError) {
      console.error("Error creating questions:", questionsError);
      // Clean up the test if questions failed
      await supabase.from("tests").delete().eq("id", test.id);
      return null;
    }

    return {
      ...test,
      questions: questionsData || [],
    };
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

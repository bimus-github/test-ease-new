"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAttemptAction,
  getAttemptFullAction,
  getExistingAttemptAction,
  getTestWithQuestionsAction,
  saveAnswersBulkAction,
  submitAttemptAction,
} from "./actions";
import { AnswerForm } from "@/types/answer";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { sendAttemptSubmissionNotification } from "@/telegram/notifications/sendAttemptSubmission";

export const useGetTestWithQuestions = (testId: string) => {
  return useQuery({
    queryKey: ["testWithQuestions", testId],
    queryFn: () => getTestWithQuestionsAction(testId),
    enabled: !!testId,
  });
};

export const useGetExistingAttempt = (testId: string, telegramId: string) => {
  const q = useQuery({
    queryKey: ["existingAttempt", testId, telegramId],
    queryFn: () => getExistingAttemptAction(testId, telegramId),
    enabled: !!testId && !!telegramId,
  });

  const attempt = q.data;
  const isSubmitted = attempt?.status === "submitted";
  const isStarted = attempt?.status === "started";

  return { ...q, attempt, isSubmitted, isStarted };
};

export const useStartAttempt = (testId: string, telegramId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createAttemptAction(testId, telegramId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["existingAttempt", testId, telegramId],
      });
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });
};

export const useGetAttemptFull = (attemptId: string) => {
  return useQuery({
    queryKey: ["attemptFull", attemptId],
    queryFn: () => getAttemptFullAction(attemptId),
    enabled: !!attemptId,
  });
};

export const useSaveAnswers = () => {
  return useMutation({
    mutationFn: ({
      answers,
      attemptId,
    }: {
      answers: AnswerForm[];
      attemptId: string;
    }) => saveAnswersBulkAction(attemptId, answers),
    onSuccess: () => {
      toast.success("Javoblar muvaffaqiyatli saqlandi");
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });
};

export const useSubmitAttempt = () => {
  const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ attemptId }: { attemptId: string }) => {
      const updated = await submitAttemptAction(attemptId);
      if (!updated) return null;
      await sendAttemptSubmissionNotification({ telegramId, attemptId });
      return updated;
    },
    onSuccess: (_, { attemptId }) => {
      queryClient.invalidateQueries({ queryKey: ["attemptFull", attemptId] });
      toast.success("Urinish muvaffaqiyatli yuborildi");
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });
};

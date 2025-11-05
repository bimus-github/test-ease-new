"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { Answer } from "@/types/submission";
import {
  startSubmissionAction,
  submitSubmissionAction,
  checkSubmissionStatusAction,
  checkSubmissionStatusByUserAndTestAction,
  getFullSubmissionAction,
} from "@/app/[telegram_id]/take/[testId]/actions";
import { takeActions } from "@/store/slices/take";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";

export function useStartSubmission() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (p: { telegramId: string; testId: string }) =>
      startSubmissionAction(p),
    onSuccess: (data, p) => {
      if (data.ok) {
        dispatch(
          takeActions.setMeta({
            submissionId: data.submission.id,
            testId: p.testId,
            telegramId: p.telegramId,
          })
        );
        dispatch(takeActions.setStep("answering"));
      } else {
        toast.error(data.error);
      }
    },
  });
}

export function useSubmitSubmission() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (p: { submissionId: string; answers: Answer[] }) =>
      submitSubmissionAction(p),
    onSuccess: (data, p) => {
      if (data.ok) {
        dispatch(takeActions.setStep("submit"));
      } else {
        toast.error(data.error);
      }
    },
  });
}

export function useSubmissionStatus(submissionId: string) {
  return useQuery({
    queryKey: ["submission-status", submissionId],
    queryFn: () => checkSubmissionStatusAction({ submissionId }),
    enabled: Boolean(submissionId),
    refetchInterval: 10000,
  });
}

export function useCheckSubmission() {
  const dispatch = useAppDispatch();
  const telegram_id = useAppSelector((s) => s.take.telegramId);
  return useMutation({
    mutationFn: ({
      testId,
      telegramId,
    }: {
      testId: string;
      telegramId: string;
    }) => checkSubmissionStatusByUserAndTestAction({ telegramId, testId }),
    onSuccess: (data, p) => {
      if (data.ok) {
        if (p.telegramId !== telegram_id) {
          dispatch(takeActions.reset());
        } else {
          dispatch(
            takeActions.setMeta({
              submissionId: data.status.id,
              testId: p.testId,
              telegramId: p.telegramId,
              startedAt: data.status.started_at,
            })
          );
          dispatch(
            takeActions.setStep(
              data.status.is_submitted
                ? "submit"
                : data.status.started_at
                ? "answering"
                : "overview"
            )
          );
        }
      } else {
        toast.error("Status update failed");
        toast.error(data.error);
      }
    },
  });
}

export function useGetFullSubmission() {
  const submissionId = useAppSelector((s) => s.take.submissionId ?? "");
  return useQuery({
    queryKey: ["full-submission", submissionId],
    queryFn: async () => {
      const res = await getFullSubmissionAction({ submissionId });
      if (res.ok) {
        return res.submission;
      } else {
        toast.error(res.error);
        return null;
      }
    },
    enabled: Boolean(submissionId),
  });
}

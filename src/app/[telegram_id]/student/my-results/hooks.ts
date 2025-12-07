'use client';

import { useQuery } from "@tanstack/react-query";
import { MY_RESULTS_KEY } from "@/constants/react-query-keys";
import { getMyResultsAction } from "./actions";
import type { FullSubmission } from "@/types/submission";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export const useMyResults = () => {
  const { telegram_id } = useParams<{ telegram_id: string }>();
  return useQuery<FullSubmission[]>({
    queryKey: MY_RESULTS_KEY(telegram_id),
    queryFn: async () => {
      const res = await getMyResultsAction({ telegramId: telegram_id });
      if (!res.ok) {
        toast.error(res.error);
        return [];
      }
      return res.submissions;
    },
    enabled: Boolean(telegram_id),
  });
};
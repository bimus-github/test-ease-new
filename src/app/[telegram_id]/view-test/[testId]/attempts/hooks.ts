"use client";

import { useQuery } from "@tanstack/react-query";
import type { FullSubmission } from "@/types/submission";
import { getFullSubmissionsAction } from "./actions";
import toast from "react-hot-toast";

export function useFullSubmissions(testId: string) {
  return useQuery<FullSubmission[] | null>({
    queryKey: ["full-submissions", testId],
    queryFn: async () => {
      const res = await getFullSubmissionsAction({ testId });
      if (res.ok) return res.submissions;
      toast.error(res.error);
      return [];
    },
    enabled: Boolean(testId),
  });
}

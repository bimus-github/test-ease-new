"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyResultsAction, MyResultsResponse } from "./actions";

export function useGetMyResults(
  telegramId: string,
  params: {
    status?: string;
    q?: string;
    cursor?: string | null;
    limit?: number;
  }
) {
  return useQuery<MyResultsResponse>({
    queryKey: ["myResults", telegramId, params],
    queryFn: () => getMyResultsAction(telegramId, params as any),
    enabled: !!telegramId,
  });
}

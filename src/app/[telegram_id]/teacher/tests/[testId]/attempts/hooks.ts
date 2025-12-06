'use client';

import { useMutation } from "@tanstack/react-query";
import { calculateRaschAction } from "./actions";

export const useCalculateRasch = () => {
    return useMutation({
        mutationFn: async ({ testId, onSuccess }: { testId: string, onSuccess: () => void }) => {
            const res = await calculateRaschAction({ testId });
            if (res.ok) {
                onSuccess();
            }
        },
    });
}
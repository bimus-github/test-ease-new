'use client';

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { calculateRaschAction } from "./actions";

/**
 * Rasch hisoblashni ishga tushiradi.
 *
 * Avval action doim `ok: true` qaytarardi va xatolar jimgina yo'qolardi —
 * o'qituvchi "hisoblandi" deb o'ylab, natijalarni hech qachon ko'rmasdi.
 * Endi sabab toast orqali ko'rsatiladi.
 */
export const useCalculateRasch = () => {
    return useMutation({
        mutationFn: async ({ testId }: { testId: string; onSuccess?: () => void }) => {
            const res = await calculateRaschAction({ testId });
            if (!res.ok) throw new Error(res.error);
            return res;
        },
        onSuccess: (res, variables) => {
            toast.success(
                `Rasch hisoblandi: ${res.updatedSubmissions} ta natija, ${res.updatedQuestions} ta savol yangilandi.`
            );
            variables.onSuccess?.();
        },
        onError: (error: unknown) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "Rasch hisoblashda xatolik yuz berdi";
            toast.error(message);
        },
    });
}

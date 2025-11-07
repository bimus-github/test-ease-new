"use client";

import { TestForm } from "@/types/test";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { testFromActions } from "@/store/slices/forms/test";
import { isTestCode } from "@/lib/helpers";
import { useMutation } from "@tanstack/react-query";
import { checkTestCodeAction } from "../actions";

interface Props {
  onSubmit: () => void;
}

export function BasicInfoForm({ onSubmit }: Props) {
  const dispatch = useAppDispatch();
  const { test } = useAppSelector((state) => state.test);
  const checkTestCode = useMutation({
    mutationFn: checkTestCodeAction,
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        testFromActions.setTest({
          ...test,
          [e.target.name as keyof TestForm]: e.target.value,
        })
      );

      if (e.target.name === "code" && isTestCode(e.target.value)) {
        checkTestCode.mutateAsync(e.target.value);
      }
    },
    [dispatch, test, checkTestCode, isTestCode]
  );

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4 p-4 sm:p-6">
      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Sarlavha
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={test!.title}
          onChange={handleChange}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          placeholder="Test sarlavhasini kiriting"
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="code" className="text-sm font-medium">
          Kod
        </label>
        <input
          id="code"
          name="code"
          type="text"
          value={test!.code}
          onChange={handleChange}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          placeholder="masalan: MATH-2025"
          required
        />
        {checkTestCode.isPending ? (
          <span className="text-sm text-green-500">
            Test kodi tekshirilmoqda...
          </span>
        ) : (
          <>
            {checkTestCode.data ? (
              <>
                {isTestCode(test!.code) ? (
                  <span className="text-sm text-green-500">
                    Test kodi to‘g‘ri
                  </span>
                ) : (
                  <span className="text-sm text-red-500">
                    Test kodi noto‘g‘ri
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-red-500">
                Bunday test kodi mavjud.
              </span>
            )}
          </>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Tavsif
        </label>
        <textarea
          id="description"
          name="description"
          value={test!.description}
          onChange={handleChange}
          rows={3}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          placeholder="Qisqacha izoh"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="instructions" className="text-sm font-medium">
          Ko‘rsatmalar
        </label>
        <textarea
          id="instructions"
          name="instructions"
          value={test!.instructions}
          onChange={handleChange}
          rows={3}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          placeholder="O‘quvchilar uchun ko‘rsatmalar"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="end_date" className="text-sm font-medium">
          Tugash vaqti
        </label>
        <input
          id="end_date"
          name="end_date"
          type="datetime-local"
          value={test!.end_date}
          onChange={handleChange}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
        />
      </div>

      <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-3 border-t border-neutral-200 bg--background p-4 dark:border-neutral-800 sm:-mx-6 sm:-mb-6">
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 dark:bg-white dark:text-black"
        >
          Keyingi
        </button>
      </div>
    </div>
  );
}

"use client";

import { TestForm } from "@/types/test";
import { useCallback, useEffect  } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { testFromActions } from "@/store/slices/forms/test";
import { isTestCode } from "@/lib/helpers";
import { useMutation } from "@tanstack/react-query";
import { isTestCodeUnique } from "../actions/checkTestCode";
import { MediaUpload } from "@/components/MediaUpload";

interface Props {
  onSubmit: () => void;
  testId?: string; // we will set this on edit test
}

export function BasicInfoForm({ onSubmit, testId }: Props) {
  const dispatch = useAppDispatch();
  const { test } = useAppSelector((state) => state.test);
  const {isPending: isCheckingTestCode, data: isCodeUnique, mutate: checkTestCode} = useMutation({
    mutationFn: (code: string) => isTestCodeUnique(code, testId),
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
        checkTestCode(e.target.value);
      }
    },
    [dispatch, test, checkTestCode]
  );

  useEffect(() => {
    if (testId) {
      checkTestCode(test!.code);
    }
  }, [testId]);

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
          value={test!.title || ""}
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
          value={test!.code || ""}
          onChange={handleChange}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          placeholder="masalan: MATH-2025"
          required
        />
        {test?.code && (
          <>
          {isCheckingTestCode ? (
            <span className="text-sm text-green-500">
               Test kodi tekshirilmoqda...
            </span>
          ) : (
            <>
              {isCodeUnique ? (
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
          )}</>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Tavsif
        </label>
        <textarea
          id="description"
          name="description"
          value={test!.description || ""}
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
          value={test!.instructions || ""}
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
          value={test!.end_date || ""}
          onChange={handleChange}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
        />
      </div>

      <div className="grid gap-2 rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-800 dark:bg-violet-950/20">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={!!test?.is_public}
            onChange={(e) =>
              dispatch(
                testFromActions.setTest({
                  ...test,
                  is_public: e.target.checked,
                })
              )
            }
            className="mt-0.5 h-4 w-4 cursor-pointer accent-violet-600"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-violet-900 dark:text-violet-200">
              🌍 Public test qilish
            </div>
            <div className="mt-0.5 text-xs text-violet-700 dark:text-violet-300">
              Bu testni har bir o'quvchi katalogdan topib topshirishi mumkin. Leaderboard'da top 10 ko'rinadi.
            </div>
          </div>
        </label>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Umumiy audio <span className="text-neutral-500">(ixtiyoriy — IELTS Listening uchun)</span>
        </label>
        <p className="text-xs text-neutral-500">
          Agar test bir audio'ga asoslangan bo'lsa (masalan, Listening), shu yerga yuklang. Barcha savollar tepasida ko'rinadi.
        </p>
        <MediaUpload
          accept="audio"
          teacherId={test?.teacher_id || "anon"}
          url={test?.shared_audio_url}
          type={test?.shared_audio_url ? "audio" : undefined}
          onChange={(url) =>
            dispatch(
              testFromActions.setTest({
                ...test,
                shared_audio_url: url,
              })
            )
          }
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

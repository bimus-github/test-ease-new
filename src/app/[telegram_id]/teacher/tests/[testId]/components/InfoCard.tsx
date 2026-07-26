"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Test } from "@/types/test";
import { BOT_TEST_START_LINK, EDIT_TEST_ROUTE, MY_TESTS_ROUTE, TEST_ATTEMPTS_ROUTE } from "@/constants/routes";
import { formatLocalDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { testTypeText } from "@/lib/helpers";
import { ShareTestModal } from "@/components/ShareTestModal";
import { deleteTestAction } from "../../actions";

export function InfoCard({
  test,
  telegramId,
  testId,
}: {
  test: Test;
  telegramId: string;
  testId: string;
}) {

  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const onCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Kod nusxalandi");
  };

  const deleteMut = useMutation({
    mutationFn: () => deleteTestAction(testId),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Test o'chirildi");
        router.push(MY_TESTS_ROUTE(telegramId));
      } else {
        toast.error("O'chirishda xato");
      }
    },
    onError: () => toast.error("O'chirishda xato"),
  });

  // O'quvchi linkni bosganda bot ochilib, uning haqiqiy telegram_id si bilan
  // testni boshlaydi. Shu sabab to'g'ridan-to'g'ri web link emas, bot deep-link.
  const shareUrl = BOT_TEST_START_LINK(test.code);

  return (
    <section className="mb-6 grid gap-3 rounded-md border border-neutral-200 p-4 shadow-sm dark:border-neutral-800">
      <ShareTestModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        testCode={test.code}
        testTitle={test.title}
        shareUrl={shareUrl}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold">Asosiy ma’lumotlar</h1>
        <div className="flex items-center gap-2">
          {test.is_public && (
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              🌍 Public
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            Kod: <span className="ml-1 font-mono">{test.code}</span>
          </span>
        </div>
      </div>
      <div className="grid gap-2 text-sm">
        {test.description && (
          <div className="text-neutral-700 dark:text-neutral-300">
            <span className="text-neutral-500">Tavsif:</span> {test.description}
          </div>
        )}
        {test.instructions && (
          <div className="text-neutral-700 dark:text-neutral-300">
            <span className="text-neutral-500">Ko‘rsatmalar:</span>{" "}
            {test.instructions}
          </div>
        )}
        <div>
          <span className="text-neutral-500">Test turi:</span> {testTypeText(test.scoring_type)}
        </div>
        {test.end_date && (
          <div>
            <span className="text-neutral-500">Tugash vaqti:</span>{" "}
            {formatLocalDate(test.end_date)}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={EDIT_TEST_ROUTE({
              testId,
              telegramId,
              scoringType: test.scoring_type,
              sertificateType: test.sertificate_type,
              satSection: test.sat_section,
              uzDtmSection: test.uz_dtm_section,
            })}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Tahrirlash
          </Link>
          <Link
            href={TEST_ATTEMPTS_ROUTE({testId, telegramId: telegramId})}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Urinishlar
          </Link>
          <button
            onClick={() => onCopy(test.code)}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Kodni nusxalash
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 active:scale-[0.99] dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            🔗 Ulashish
          </button>
          <button
            onClick={() => {
              setConfirmText("");
              setDeleteOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 active:scale-[0.99] dark:border-red-800 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            🗑 O'chirish
          </button>
        </div>

        {deleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
              <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
                ⚠️ Testni o'chirishni tasdiqlaysizmi?
              </h3>
              <p className="mb-4 text-sm text-neutral-700 dark:text-neutral-300">
                Bu harakat <b>qaytarib bo'lmaydi</b>. Test bilan birga{" "}
                <b>barcha savollar va o'quvchilar topshirgan natijalar</b> ham o'chiriladi.
              </p>
              <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
                Tasdiqlash uchun test sarlavhasini ko'chiring: <b>{test.title}</b>
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Test sarlavhasini kiriting"
                className="mb-4 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={deleteMut.isPending}
                  onClick={() => setDeleteOpen(false)}
                  className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={confirmText !== test.title || deleteMut.isPending}
                  onClick={() => deleteMut.mutate()}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMut.isPending ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

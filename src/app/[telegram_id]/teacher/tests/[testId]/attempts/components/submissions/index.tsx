"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { SubmissionListItem } from "@/types/submission";
import { Test } from "@/types/test";
import Row from "./table/Row";
import Header from "./table/Header";
import MobileCard from "./MobileCard";
import { SendMessageModal } from "./SendMessageModal";
import { File, Loader2, Send, MessageSquare } from "lucide-react";
import { sendExcelViaTelegramAction, sendResultsToUsersAction, sendingMessageToUsersAction } from "../../actions";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

interface SubmissionsProps {
  submissions: SubmissionListItem[];
  renderResultLink: (submissionId: string) => string;
  test: Test;
}

/** Bo'laklab yuborish natijasi */
type ChunkResult =
  | {
      ok: true;
      sent: number;
      failed: number;
      processed: number;
      total: number;
      nextOffset: number | null;
    }
  | { ok: false; error: string };

/**
 * Bo'laklab bajariladigan yuborishni oxirigacha olib boradi.
 *
 * Telegram'ga 1000 ta xabarni bitta so'rovda yuborib bo'lmaydi — funksiya
 * 60 soniyada uziladi. Shu sababli mijoz `offset` bilan ketma-ket chaqiradi
 * va har bo'lakdan keyin jarayonni ko'rsatadi.
 */
async function runChunked(
  step: (offset: number) => Promise<ChunkResult>,
  onProgress: (done: number, total: number) => void
): Promise<{ ok: true; sent: number; failed: number } | { ok: false; error: string }> {
  let offset = 0;
  let sent = 0;
  let failed = 0;

  for (;;) {
    const res = await step(offset);
    if (!res.ok) return res;

    sent += res.sent;
    failed += res.failed;
    onProgress(Math.min(offset + res.processed, res.total), res.total);

    if (res.nextOffset === null) return { ok: true, sent, failed };
    offset = res.nextOffset;
  }
}

export const Submissions = (props: SubmissionsProps) => {
  const { submissions, renderResultLink, test } = props;
  const { telegram_id, testId } = useParams<{ telegram_id: string; testId: string }>();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Extract unique telegram IDs from submissions
  const uniqueTelegramIds = useMemo(() => {
    const ids = submissions
      .map((s) => s.user?.telegram_id)
      .filter((id): id is string => Boolean(id));
    return Array.from(new Set(ids));
  }, [submissions]);

  const gettingTableAsExcelMutate = useMutation({
    mutationFn: () => sendExcelViaTelegramAction({ testId, telegramId: telegram_id }),
  });

  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );

  const sendingResultsToUsersMutate = useMutation({
    mutationFn: () =>
      runChunked(
        (offset) => sendResultsToUsersAction({ testId, offset }),
        (done, total) => setProgress({ done, total })
      ),
    onSettled: () => setProgress(null),
  });

  const sendingMessageToUsersMutate = useMutation({
    mutationFn: (message: string) =>
      runChunked(
        (offset) =>
          sendingMessageToUsersAction({ ids: uniqueTelegramIds, message, offset }),
        (done, total) => setProgress({ done, total })
      ),
    onSettled: () => setProgress(null),
  });

  const handleExportToExcel = async () => {
    if (!telegram_id || !testId) {
      toast.error("Telegram ID yoki Test ID topilmadi");
      return;
    }

    try {
      const result = await gettingTableAsExcelMutate.mutateAsync();
      if (result.ok) {
        toast.success("Excel fayl Telegram orqali yuborildi!");
      } else {
        toast.error(result.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error sending Excel:", error);
      toast.error("Excel faylni yuborishda xatolik yuz berdi");
    }
  };

  const handleSendResultsToUsers = async () => {
    if (!testId) {
      toast.error("Test ID topilmadi");
      return;
    }

    try {
      const result = await sendingResultsToUsersMutate.mutateAsync();
      if (result.ok) {
        toast.success(
          `Natijalar yuborildi! ${result.sent} ta muvaffaqiyatli, ${result.failed} ta xatolik`
        );
      } else {
        toast.error(result.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error sending results to users:", error);
      toast.error("Natijalarni yuborishda xatolik yuz berdi");
    }
  };

  const handleSendMessage = async (message: string) => {
    if (uniqueTelegramIds.length === 0) {
      toast.error("Xabar yuborish uchun talabalar topilmadi");
      return;
    }

    try {
      const result = await sendingMessageToUsersMutate.mutateAsync(message);
      if (result.ok) {
        toast.success(
          `Xabar yuborildi! ${result.sent} ta muvaffaqiyatli, ${result.failed} ta xatolik`
        );
        setIsMessageModalOpen(false);
      } else {
        toast.error(result.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Error sending message to users:", error);
      toast.error("Xabarni yuborishda xatolik yuz berdi");
    }
  };

  if (!submissions?.length) {
    return (
      <div className="rounded-md border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800">
        Hozircha urinishlar yo'q.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="flex flex-col md:flex-row justify-end gap-2 mb-4">
          {/* Export to Excel Button */}
          <button
            onClick={handleExportToExcel}
            disabled={gettingTableAsExcelMutate.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {gettingTableAsExcelMutate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <File className="w-4 h-4" />
                Jadvalni Excelga yuklab olish
              </>
            )}
          </button>

          {/* Send Message to Users Button */}
          <button
            onClick={() => setIsMessageModalOpen(true)}
            disabled={uniqueTelegramIds.length === 0}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <MessageSquare className="w-4 h-4" />
            Talabalarga xabar yuborish
          </button>

          {/* Send Results to Users Button */}
          <button
            onClick={handleSendResultsToUsers}
            disabled={sendingResultsToUsersMutate.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            {sendingResultsToUsersMutate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress
                  ? `Yuborilmoqda… ${progress.done}/${progress.total}`
                  : "Yuborilmoqda..."}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Talabalarga natijalarni yuborish
              </>
            )}
          </button>
        </div>

      {/* Desktop Table */}
      <div className="hidden w-full overflow-x-auto rounded-md border border-neutral-200 shadow-sm dark:border-neutral-800 md:block">
        <table className="w-full text-left text-sm">
          <Header test={test} />
          <tbody>
            {submissions.map((s, i) => {
              return (
                <Row
                  key={s.id}
                  submission={s}
                  index={i}
                  test={test}
                  renderResultLink={renderResultLink}
                />
              );
            })}
          </tbody>
        </table>
      </div>

        {/* Mobile Cards */}
        <div className="grid gap-3 md:hidden">
          {submissions.map((s, i) => (
            <MobileCard
              key={s.id}
              submission={s}
              index={i}
              test={test}
              renderResultLink={renderResultLink}
            />
          ))}
        </div>
      </div>

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        onSend={handleSendMessage}
        isLoading={sendingMessageToUsersMutate.isPending}
        recipientCount={uniqueTelegramIds.length}
      />
    </>
  );
};
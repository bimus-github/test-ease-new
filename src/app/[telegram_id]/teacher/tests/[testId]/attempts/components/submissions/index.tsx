"use client";

import { useParams } from "next/navigation";
import { FullSubmission } from "@/types/submission";
import { Test } from "@/types/test";
import Row from "./table/Row";
import Header from "./table/Header";
import MobileCard from "./MobileCard";
import { File, Loader2, Send } from "lucide-react";
import { sendExcelViaTelegramAction, sendResultsToUsersAction } from "../../actions";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

interface SubmissionsProps {
  submissions: FullSubmission[];
  renderResultLink: (submissionId: string) => string;
  test: Test;
}

export const Submissions = (props: SubmissionsProps) => {
  const { submissions, renderResultLink, test } = props;
  const { telegram_id, testId } = useParams<{ telegram_id: string; testId: string }>();
  const gettingTableAsExcelMutate = useMutation({
    mutationFn: () => sendExcelViaTelegramAction({ testId, telegramId: telegram_id }),
  });

  const sendingResultsToUsersMutate = useMutation({
    mutationFn: () => sendResultsToUsersAction({ testId }),
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

  if (!submissions?.length) {
    return (
      <div className="rounded-md border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800">
        Hozircha urinishlar yo'q.
      </div>
    );
  }

  return (
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

        {/* Send Results to Users Button */}
        <button
          onClick={handleSendResultsToUsers}
          disabled={sendingResultsToUsersMutate.isPending}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          {sendingResultsToUsersMutate.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Yuborilmoqda...
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
  );
};
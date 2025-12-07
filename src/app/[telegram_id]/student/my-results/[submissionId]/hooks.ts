'use client';

import { useQuery } from "@tanstack/react-query";
import { MY_RESULT_KEY } from "@/constants/react-query-keys";
import { getFullSubmissionByIdAction } from "./actions";
import { FullSubmission } from "@/types/submission";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export const useMyResult = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    return useQuery<FullSubmission | null>({
        queryKey: MY_RESULT_KEY(submissionId),
        queryFn: async () => {
            const res = await getFullSubmissionByIdAction({ submissionId });
            if (!res.ok) {
                toast.error(res.error);
                return null;
            }
            return res.submission as FullSubmission;
        },
        enabled: Boolean(submissionId),
    });
};
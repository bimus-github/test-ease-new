"use client";

import type { SubmissionListItem } from "@/types/submission";
import { Header } from "./Header";
import { Row } from "./Row";

interface ResultsTableProps {
  submissions: SubmissionListItem[];
  renderResultLink: (submissionId: string) => string;
}

export function ResultsTable({
  submissions,
  renderResultLink,
}: ResultsTableProps) {
  return (
    <table className="w-full text-left text-sm">
      <Header submissions={submissions} />
      <tbody>
        {submissions.map((submission, index) => (
          <Row
            key={submission.id}
            submission={submission}
            index={index}
            renderResultLink={renderResultLink}
          />
        ))}
      </tbody>
    </table>
  );
}


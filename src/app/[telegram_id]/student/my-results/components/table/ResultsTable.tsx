"use client";

import type { FullSubmission } from "@/types/submission";
import { Header } from "./Header";
import { Row } from "./Row";

interface ResultsTableProps {
  submissions: FullSubmission[];
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


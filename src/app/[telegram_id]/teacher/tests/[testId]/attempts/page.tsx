'use client';

import { useCallback } from 'react'
import { useSubmissionsList, useTestWithQuestions } from '../../hooks';
import { AttemptsSkeleton } from './components/AttemptsSkeleton';
import { AttemptsHeader } from './components/AttemptsHeader';
import { AttemptsInfoCard } from './components/AttemptsInfoCard';
import { testTypeText } from '@/lib/helpers';
import { Submissions } from './components/submissions';
import { TEST_ATTEMPT_ROUTE } from '@/constants/routes';
import { useParams } from 'next/navigation';
import { ScoringType } from '@/types/test';
import { isPast } from '@/lib/utils';

function AttemptsPage() {
    const { telegram_id, testId } = useParams<{ telegram_id: string, testId: string }>();
    const submissionsQuery = useSubmissionsList()
    const testMetaQuery = useTestWithQuestions()

    const isLoading = submissionsQuery.isLoading || testMetaQuery.isLoading;
    const isError = submissionsQuery.isError || testMetaQuery.isError;
    const isFetching = submissionsQuery.isFetching || testMetaQuery.isFetching;

    const refetch = useCallback(() => {
        submissionsQuery.refetch();
        testMetaQuery.refetch();
    }, [submissionsQuery, testMetaQuery]);

    const submissions = submissionsQuery.data || [];
    const testMeta = testMetaQuery.data;

      if (isLoading) {
        return (
          <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            <AttemptsSkeleton />
          </main>
        );
      }
    
      if (isError || !testMeta) {
        // testMeta bo'lmasa AttemptsHeader `test.title` da yiqilardi.
        const message =
          submissionsQuery.error instanceof Error
            ? submissionsQuery.error.message
            : "Xatolik yuz berdi.";

        return (
          <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
            {testMeta && (
              <AttemptsHeader
                test={testMeta}
                isFetching={isFetching}
                onRefetch={() => refetch()}
              />
            )}
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30">
              {message}
              <button onClick={() => refetch()} className="ml-2 underline">
                Qayta urinish
              </button>
            </div>
          </main>
        );
      }
      
  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <AttemptsHeader
            test={testMeta}
            isFetching={isFetching}
            onRefetch={() => refetch()} 
        />

        <AttemptsInfoCard
            stats={[
              { label: "Urinishlar", value: submissions.length },
              { label: "Savollar soni", value: testMeta.questions.length },
              // Rasch testlarida holat DOIM ko'rsatiladi — avval faqat
              // "hisoblangan" holat ko'rinardi, hisoblanmagani esa umuman
              // bilinmasdi.
              ...(testMeta.scoring_type === ScoringType.RASCH_SCORING
                ? [
                    {
                      label: "Rasch holati",
                      value: testMeta.isRaschCalculated
                        ? "Hisoblangan"
                        : isPast(testMeta.end_date)
                        ? "Hisoblanmagan"
                        : "Test yakunlanmagan",
                    },
                  ]
                : []),
            ]}
            testType={testTypeText(testMeta.scoring_type)}
            code={testMeta.code}
            description={testMeta.description}
            endDate={testMeta.end_date ?? undefined}
        />

        <Submissions 
            submissions={submissions} 
            renderResultLink={(submissionId) => TEST_ATTEMPT_ROUTE({ testId, telegramId: telegram_id, submissionId })} 
            test={testMeta} 
        />
    </main>
  )
}

export default AttemptsPage
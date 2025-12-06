'use client';
import { useParams, useRouter } from 'next/navigation';
import { useLoadTest } from '../../hooks/useLoadTest';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Stepper } from '../../components/Stepper';
import { BasicInfoForm } from '../../components/BasicInfoForm';
import { QuestionsForm } from '../../components/QuestionsForm';
import { Preview } from '../../components/Preview';
import { testFromActions } from '@/store/slices/forms/test';
import { handleQuestionsThunk } from '../../thunks/handleQuestionsThunk';
import { basicInfoThunk } from '../../thunks/basicInfoThunk';
import { updateTestWithQuestionsThunk } from '../../thunks/handleEditTestThunk';
import { VIEW_TEST_ROUTE } from '@/constants/routes';

function EditTest() {
  const { testId } = useParams<{ testId: string, telegram_id: string }>();
  const dispatch = useAppDispatch();
  const { step } = useAppSelector(state => state.test);
  const { telegram_id: telegramId } = useParams<{ telegram_id: string }>();
  const router = useRouter();
  useLoadTest()

  return (
    <div className="mx-auto w-full max-w-4xl">
        <div className="sticky top-0 z-10 border-b border-neutral-200 bg-background p-4 dark:border-neutral-800">
            <Stepper
                steps={[
                { id: "basic_info", label: "Asosiy ma’lumotlar" },
                { id: "questions", label: "Savollar" },
                { id: "preview", label: "Oldindan ko‘rish" },
                ]}
                current={step}
            />
        </div>

        {step === "basic_info" && (
            <BasicInfoForm  onSubmit={() => dispatch(basicInfoThunk(testId))} testId={testId} />
        )}
        
        {step === "questions" && (
            <QuestionsForm onSubmit={() => dispatch(handleQuestionsThunk())} />
        )}

        {step === "preview" && (
            <Preview
                onBack={() => dispatch(testFromActions.setStep("questions"))}
                onConfirm={() => dispatch(updateTestWithQuestionsThunk(testId, () => {
                    router.push(VIEW_TEST_ROUTE({ testId, telegramId }));
                    router.refresh();
                }))}
            />
        )}
    </div>
)
}

export default EditTest
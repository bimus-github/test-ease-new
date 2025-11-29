"use client";
import { BasicInfoForm } from '../components/BasicInfoForm';
import { Stepper } from '../components/Stepper';
import { useInitTest } from '../hooks/useInitTest';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { testFromActions } from '@/store/slices/forms/test';
import { QuestionsForm } from '../components/QuestionsForm';
import { Preview } from '../components/Preview';
import { basicInfoThunk } from '../thunks/basicInfoThunk';
import { handleQuestionsThunk } from '../thunks/handleQuestionsThunk';
import { handleSaveTestThunk } from '../thunks/handleSaveTestThunk';
import { useParams } from 'next/navigation';

function CreateNewTest() {
  const { telegram_id } = useParams<{ telegram_id: string }>();
  const dispatch = useAppDispatch()
  const {step} = useAppSelector(state => state.test)
    useInitTest()

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
                <BasicInfoForm onSubmit={() => dispatch(basicInfoThunk())} />
            )}
            
            {step === "questions" && (
                <QuestionsForm onSubmit={() => dispatch(handleQuestionsThunk())} />
            )}

            {step === "preview" && (
                <Preview
                    onBack={() => dispatch(testFromActions.setStep("questions"))}
                    onConfirm={() => dispatch(handleSaveTestThunk(telegram_id))}
                />
            )}
        </div>
  )
}

export default CreateNewTest
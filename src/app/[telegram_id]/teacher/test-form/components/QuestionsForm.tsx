"use client";

import { ToggleMathInput } from "@/components/math-live";
import { MediaUpload } from "@/components/MediaUpload";
import { AIGenerateModal } from "@/components/AIGenerateModal";
import { BankImportModal } from "@/components/BankImportModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { testFromActions } from "@/store/slices/forms/test";
import { SATSection, ScoringType } from "@/types/test";
import { MediaType } from "@/types/question";
import { useMemo, useState } from "react";
import { saveToBankAction } from "@/app/[telegram_id]/teacher/question-bank/actions";

interface Props {
  onSubmit: () => void;
}

export function QuestionsForm({ onSubmit }: Props) {
  const { questions, test } = useAppSelector((state) => state.test);
  const dispatch = useAppDispatch();
  const [savedToBank, setSavedToBank] = useState<Record<string, boolean>>({});
  const [aiOpen, setAiOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);

  const handleSaveToBank = async (label: string) => {
    const q = questions.find((x) => x.question_label === label);
    if (!q || !test?.teacher_id) return;
    const result = await saveToBankAction({
      teacher_id: test.teacher_id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      correct_answer: q.correct_answer,
      correct_options: q.correct_options,
      is_multiple_answers: q.is_multiple_answers,
      points: q.points,
      media_url: q.media_url,
      media_type: q.media_type,
      tags: [],
    });
    if (result) {
      setSavedToBank((prev) => ({ ...prev, [label]: true }));
    }
  };

  const unansweredQuestions = useMemo(() => questions.filter(q => !q.correct_answer && !q.correct_options?.length),[questions])
  const isSimpleScoring = test?.scoring_type === ScoringType.SIMPLE_SCORING;

  const setMCAnswer = (label: string, answer: string) => {
    dispatch(
      testFromActions.setQuestion({
        question_label: label,
        correct_answer: answer,
      })
    );
  };

  const setFillAnswer = (label: string, answer: string) => {
    dispatch(
      testFromActions.setQuestion({
        question_label: label,
        correct_answer: answer,
      })
    );
  };

  const setSatScore = (label: string, score: number) => {
    dispatch(
      testFromActions.setSatScore({
        question_label: label,
        sat_score: score,
      })
    );
  };

  const setQuestionType = (label: string, type: "multiple_choice" | "fill_blank") => {
    dispatch(
      testFromActions.setQuestionType({
        question_label: label,
        question_type: type,
      })
    );
  };

  const setQuestionPoints = (label: string, points: number) => {
    dispatch(
      testFromActions.setQuestionPoints({
        question_label: label,
        points: points || 1,
      })
    );
  };

  const setQuestionMedia = (
    label: string,
    media_url: string | undefined,
    media_type: MediaType | undefined
  ) => {
    dispatch(
      testFromActions.setQuestionMedia({
        question_label: label,
        media_url,
        media_type,
      })
    );
  };

  const handleQuestionsCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0;
    if (count === 0) {
      dispatch(testFromActions.setQuestionsCount(1));
    }
    if (count > 0 && count <= 200) {
      dispatch(testFromActions.setQuestionsCount(count));
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Savollar</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBankOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            📚 Bankdan import
          </button>
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300"
          >
            🤖 AI bilan generatsiya
          </button>
        </div>
      </div>

      <AIGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onAccept={(generated) => {
          dispatch(testFromActions.appendGeneratedQuestions(generated));
        }}
      />

      <BankImportModal
        teacherId={test?.teacher_id || ""}
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        onImport={(imported) => {
          dispatch(testFromActions.appendBankQuestions(imported));
        }}
      />
      
      {isSimpleScoring && (
        <div className="mb-4 grid gap-2">
          <label htmlFor="questions_count" className="text-sm font-medium">
            Savollar soni
          </label>
          <input
            id="questions_count"
            type="number"
            min="1"
            max="200"
            value={questions.length.toString()}
            onChange={handleQuestionsCountChange}
            className="w-32 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="Savollar soni"
          />
        </div>
      )}

      <div className="grid gap-4">
        {questions.map((q) => (
          <div
            key={q.question_label}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-medium"><b>{q.question_label}</b></div>
              
              {isSimpleScoring && (
                <div className="flex items-center gap-2">
                  <label htmlFor={`points_${q.question_label}`} className="text-xs text-neutral-500">
                    Ball:
                  </label>
                  <input 
                    type="number" 
                    name="points" 
                    id={`points_${q.question_label}`}
                    value={q.points || 1} 
                    onChange={(e) => setQuestionPoints(q.question_label, parseInt(e.target.value) || 1)} 
                    placeholder="1"
                    min="1"
                    className="w-16 rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm text-center outline-none transition-colors focus:border-black focus:bg-white dark:border-neutral-700 dark:focus:border-white dark:focus:bg-neutral-900" 
                  />
                </div>
              )}

              {test?.scoring_type === ScoringType.SAT_SCORING && (
                <div className="flex items-center gap-2">
                  <label htmlFor={`sat_score_${q.question_label}`} className="text-xs text-neutral-500">
                    SAT:
                  </label>
                  <input 
                    type="number" 
                    name="sat_score" 
                    id={`sat_score_${q.question_label}`}
                    value={q.sat_score || ""} 
                    onChange={(e) => setSatScore(q.question_label, parseInt(e.target.value) || 0)} 
                    placeholder="0"
                    min="0"
                    className="w-16 rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm text-center outline-none transition-colors focus:border-black focus:bg-white dark:border-neutral-700 dark:focus:border-white dark:focus:bg-neutral-900" 
                  />
                </div>
              )}
              {(test?.sat_section === SATSection.MATH && test.scoring_type === ScoringType.SAT_SCORING) || isSimpleScoring ? (
                <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
                  <button
                    type="button"
                    onClick={() => setQuestionType(q.question_label, "multiple_choice")}
                    className={`px-2 py-0.5 text-xs font-medium transition-all ${
                      q.question_type === "multiple_choice"
                        ? "rounded bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                  >
                    MC
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionType(q.question_label, "fill_blank")}
                    className={`px-2 py-0.5 text-xs font-medium transition-all ${
                      q.question_type === "fill_blank"
                        ? "rounded bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                  >
                    FB
                  </button>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">{q.question_type}</div>
              )}
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              {q.question_text}
            </div>

            <MediaUpload
              teacherId={test?.teacher_id || "anon"}
              url={q.media_url}
              type={q.media_type}
              onChange={(url, type) => setQuestionMedia(q.question_label, url, type)}
            />

            {(q.correct_answer || q.correct_options?.length) && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => handleSaveToBank(q.question_label)}
                  disabled={savedToBank[q.question_label]}
                  className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {savedToBank[q.question_label] ? "✅ Bankka saqlandi" : "📚 Bankka saqlash"}
                </button>
              </div>
            )}

            {q.question_type === "multiple_choice" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {q.options?.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMCAnswer(q.question_label, opt)}
                    className={
                      "rounded-md border px-3 py-1 text-sm " +
                      (q.correct_answer === opt
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100")
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.question_type === "fill_blank" && (
              <div className="mt-3">
                <ToggleMathInput
                  value={q.correct_answer || ""}
                  onChange={(value) => setFillAnswer(q.question_label, value)}
                  placeholder="To‘g‘ri javobni kiriting"
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {unansweredQuestions.length > 0 && (
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="text-sm font-medium"><b>Javobsiz savollar:</b></div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300">
            {unansweredQuestions.map(q => q.question_label).join(", ")}
          </div>
        </div>
      )}


      <div className="sticky bottom-0 mt-4 -mx-4 -mb-4 flex gap-3 border-t border-neutral-200 bg-background p-4 dark:border-neutral-800 sm:-mx-6 sm:-mb-6">
        <button
          type="button"
          onClick={() => dispatch(testFromActions.setStep("basic_info"))}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 active:opacity-90 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          Orqaga
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={unansweredQuestions.length !== 0}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Keyingi
        </button>
      </div>
    </div>
  );
}

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { broadcastMessageAction, BroadcastState } from "../actions";

const initialState: BroadcastState = {
  status: "idle",
  message: "",
  total: 0,
  sent: 0,
  failed: 0,
  blocked: 0,
};

function SubmitButton({ isNextBatch = false }: { isNextBatch?: boolean }) {
  const { pending } = useFormStatus();

  const label = pending
    ? "Yuborilmoqda..."
    : isNextBatch
      ? "Keyingi batchni yuborish"
      : "Yuborish";

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {label}
    </button>
  );
}

export function BroadcastForm() {
  const [state, formAction] = useFormState(broadcastMessageAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" key={state.nextPage ?? 0}>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm text-gray-300">
            Xabar matni
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            defaultValue={state.lastMessage}
            placeholder="Barcha foydalanuvchilarga yuboriladigan xabar..."
            className="w-full resize-y rounded-lg border border-gray-700 bg-gray-800 p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Ko'p qatorli matn qo'llab-quvvatlanadi. Har bir batch 150 ta foydalanuvchi.
          </p>
        </div>
        {state.nextPage != null && (
          <input type="hidden" name="page" value={state.nextPage} />
        )}
        <SubmitButton isNextBatch={state.hasMore} />
      </form>

      {state.status !== "idle" && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          <p>{state.message}</p>
        </div>
      )}
    </div>
  );
}

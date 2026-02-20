import { BroadcastForm } from "./components/BroadcastForm";

export default function BroadcastPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">📣 Xabar yuborish</h1>
          <p className="text-sm text-gray-400">
            Barcha faol foydalanuvchilarga tezkor xabar yuboring.
          </p>
        </header>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 shadow-sm">
          <BroadcastForm />
        </div>
      </div>
    </main>
  );
}

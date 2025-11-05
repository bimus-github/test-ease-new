"use client";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative h-8 w-auto">
              <img
                src="/logo/vector/default.svg"
                alt="Test Ease Logo"
                className="h-full w-auto dark:hidden"
              />
              <img
                src="/logo/vector/default-monochrome-white.svg"
                alt="Test Ease Logo"
                className="hidden h-full w-auto dark:block"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Test yaratish va natijalarni tahlil qilish platformasi
              </p>
            </div>
          </div>

          {/* Platform Info */}
          <div className="flex flex-col items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 sm:items-end">
            <p>
              © {new Date().getFullYear()} Test Ease. Barcha huquqlar
              himoyalangan.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

export function LoadingSpinner({ small = false }: { small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-5 w-5";
  return (
    <svg
      className={`${size} animate-spin text-neutral-500`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}


"use client";

import { ErrorBoundary } from "./ErrorBoundary";

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

export function RootErrorBoundary({ children }: RootErrorBoundaryProps) {
  return (
    <ErrorBoundary
      showToast={true}
      onError={(error, errorInfo) => {
        // You can add error reporting here (e.g., Sentry, LogRocket, etc.)
        if (process.env.NODE_ENV === "production") {
          // Example: sendProductionErrors(error, "RootErrorBoundary");
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

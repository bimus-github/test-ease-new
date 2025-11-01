// src/components/math-live/MathLiveRendererWithErrorBoundary.tsx
"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import "mathlive";

interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  fontSize?: number | string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const LatexRenderer = forwardRef<HTMLDivElement, LatexRendererProps>(
  (
    {
      latex,
      displayMode = false,
      className = "",
      fontSize = "1em",
      fallback = null,
      onError,
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!containerRef.current || !latex) return;

      setHasError(false);
      setError(null);

      // Clear previous content
      containerRef.current.innerHTML = "";

      try {
        // Create a new math-field element
        const mathField = document.createElement("math-field");
        // @ts-ignore
        mathField.value = latex;
        // @ts-ignore
        mathField.readOnly = true;
        // @ts-ignore
        mathField.disabled = true;
        mathField.className = "math-live-renderer";

        // Configure MathLive for rendering only
        (mathField as any).setOptions({
          readOnly: true,
          disabled: true,
          virtualKeyboardMode: "off",
          virtualKeyboards: "none",
          defaultMode: displayMode ? "math" : "text",
          smartFence: true,
          smartSuperscript: true,
          removeExtraneousParentheses: true,
          keypressSound: "none",
          plonkSound: "none",
          fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
        });

        // Handle errors
        const handleError = (event: any) => {
          const error = new Error(
            `MathLive rendering error: ${
              event.detail?.message || "Unknown error"
            }`
          );
          setHasError(true);
          setError(error);
          onError?.(error);
        };

        mathField.addEventListener("error", handleError);

        // Append to container
        containerRef.current.appendChild(mathField);

        return () => {
          mathField.removeEventListener("error", handleError);
        };
      } catch (err) {
        const error = err as Error;
        setHasError(true);
        setError(error);
        onError?.(error);
      }
    }, [latex, displayMode, fontSize, onError]);

    if (hasError) {
      return (
        <div className={`math-live-error ${className}`}>
          {fallback || (
            <div className="text-red-500 text-sm border border-red-200 bg-red-50 p-2 rounded dark:border-red-800 dark:bg-red-900/20">
              <div>MathLive Error: {error?.message}</div>
              <div className="font-mono text-xs mt-1 opacity-75">
                LaTeX: {latex}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref || containerRef}
        className={`math-live-renderer-container ${className}`}
        style={{ fontSize }}
      />
    );
  }
);

LatexRenderer.displayName = "LatexRenderer";

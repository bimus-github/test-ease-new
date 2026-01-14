"use client";

import { useState } from "react";
import { Type, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathField } from ".";

interface ToggleMathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  initialPlainMode?: boolean;
}

export function ToggleMathInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  readOnly,
  id,
  name,
  initialPlainMode = true,
}: ToggleMathInputProps) {
  const [plainMode, setPlainMode] = useState(initialPlainMode);

  const handleToggleMode = () => {
    if (disabled || readOnly) return;
    setPlainMode((prev) => !prev);
  };

  const buttonLabel = plainMode
    ? "Switch to math keyboard"
    : "Switch to regular keyboard";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleToggleMode}
        aria-label={buttonLabel}
        title={buttonLabel}
        className={cn(
          "absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors",
          "hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300",
          (disabled || readOnly) && "cursor-not-allowed opacity-50"
        )}
        disabled={disabled || readOnly}
      >
        {plainMode ? (
          <Calculator className="h-4 w-4" />
        ) : (
          <Type className="h-4 w-4" />
        )}
      </button>

      {plainMode ? (
        <input
          id={id}
          name={name}
          type="text"
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 pr-9 text-sm outline-none transition-colors",
            "focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white dark:text-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "read-only:bg-neutral-50 dark:read-only:bg-neutral-800"
          )}
        />
      ) : (
        <MathField
          id={id}
          name={name}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn("pr-9")}
        />
      )}
    </div>
  );
}


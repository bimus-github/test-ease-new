// src/components/ui/MathField.tsx
"use client";

import { useEffect, useRef, forwardRef } from "react";
import "mathlive";

interface MathFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onInput?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
}

export const MathField = forwardRef<HTMLInputElement, MathFieldProps>(
  (
    {
      value = "",
      onChange,
      onInput,
      placeholder = "Enter mathematical expression...",
      className = "",
      disabled = false,
      readOnly = false,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const mathFieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const mathField = mathFieldRef.current;
      if (!mathField) return;

      // Configure MathLive options
      (mathField as any).setOptions({
        virtualKeyboardMode: "off",
        virtualKeyboards: "all",
        smartFence: true,
        smartSuperscript: true,
        removeExtraneousParentheses: true,
        defaultMode: "math",
      });

      // Handle input events
      const handleInput = (evt: Event) => {
        const target = evt.target as HTMLInputElement;
        const newValue = target.value;

        if (onInput) {
          onInput(newValue);
        }
        if (onChange) {
          onChange(newValue);
        }
      };

      mathField.addEventListener("input", handleInput);

      return () => {
        mathField.removeEventListener("input", handleInput);
      };
    }, [onChange, onInput]);

    // Update value when prop changes
    useEffect(() => {
      if (mathFieldRef.current && mathFieldRef.current.value !== value) {
        mathFieldRef.current.value = value;
      }
    }, [value]);

    return (
      // @ts-ignore
      <math-field
        ref={mathFieldRef}
        id={id}
        name={name}
        disabled={disabled}
        read-only={readOnly}
        placeholder={placeholder}
        className={`math-field ${className}`}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);

MathField.displayName = "MathField";

export { ToggleMathInput } from "./ToggleMathInput";

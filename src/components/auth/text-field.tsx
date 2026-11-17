"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TextFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export default function TextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  hint,
  placeholder,
  autoComplete,
  disabled = false,
}: TextFieldProps) {
  const inputId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#555555]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`h-12 w-full border bg-white px-4 text-sm text-[#252525] outline-none transition-colors placeholder:text-[#aaaaaa] focus:border-[#252525] focus:ring-4 focus:ring-[#252525]/5 disabled:cursor-not-allowed disabled:bg-[#f4f4f2] ${
            error ? "border-[#b91c1c]" : "border-[#e9e7e4]"
          } ${isPassword ? "pr-12" : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={disabled}
            className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center text-[#999999] transition-colors hover:text-[#252525] disabled:pointer-events-none"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-[#b91c1c]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-[#999999]">{hint}</p>
      ) : null}
    </div>
  );
}

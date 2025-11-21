"use client";

import { ChangeEvent } from "react";

type TextFieldProps = {
  className?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
};

export default function TextField({
  className = "",
  id = "",
  label,
  placeholder = "Votre texte...",
  value,
  onChange,
  disabled = false,
  rows = 3,
}: TextFieldProps) {
  const fieldId = id || (label ? `text-field-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`.trim()}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
      />
    </div>
  );
}

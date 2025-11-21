"use client";

import { FormEvent } from "react";

type FormComponentProps = {
  className?: string;
  id?: string;
  // Rendu du champ principal : ex. un input texte ou un canvas wrapper
  renderField: () => React.ReactNode;
  // Texte du bouton
  submitLabel?: string;
  // Callback submit (recevant l'événement pour laisser le parent lire le state via refs/hooks)
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  // Désactiver le bouton (ex : envoi en cours)
  disabled?: boolean;
};

export default function FormComponent({
  className = "",
  id = "",
  renderField,
  submitLabel = "Envoyer",
  onSubmit,
  disabled = false,
}: FormComponentProps) {
  return (
    <form
      id={id || undefined}
      onSubmit={onSubmit}
      className={`flex w-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`.trim()}
    >
      <div className="w-full">{renderField()}</div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-600/60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

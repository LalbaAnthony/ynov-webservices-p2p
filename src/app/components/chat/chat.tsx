"use client";

import { useState } from "react";

type ComponentTemplateProps = {
  className?: string;
  id?: string;
  text?: string
};

// Copie/colle ce composant pour démarrer un nouveau bloc UI (card + actions).
export default function ComponentTemplate({
  className = "",
  id = "",
  text = "",
}: ComponentTemplateProps) {
  const [active, setActive] = useState(false);

  const base =
    "w-full rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <p id={id || undefined} className={`${base} ${className}`.trim()}>
      {text}
    </p>
  );
}

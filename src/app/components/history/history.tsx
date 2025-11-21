"use client";

import { ReactNode, useState } from "react";
import Mattrix from "../mattrix_component/mattrix";

type ComponentTemplateProps = {
  className?: string;
  id?: string;
  items?: ReactNode[];
};

// Affiche une liste d'éléments en 1 colonne via le composant Mattrix.
export default function ComponentTemplate({
  className = "",
  id = "",
  items = [],
}: ComponentTemplateProps) {
  const [active, setActive] = useState(false);

  const base =
    "w-full rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <div id={id || undefined} className={`${base} ${className}`.trim()}>
      <Mattrix
        rows={items.length}
        cols={1}
        renderCell={(r) => items[r] ?? null}
      />
    </div>
  );
}

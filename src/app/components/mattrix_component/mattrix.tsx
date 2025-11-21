"use client";

import { useState } from "react";

type ComponentTemplateProps = {
  className?: string;
  id?: string;
  rows?: number;
  cols?: number;
  renderCell?: (row: number, col: number) => React.ReactNode;
};

export default function ComponentTemplate({
  className = "",
  id = "",
  rows = 3,
  cols = 3,
  renderCell,
}: ComponentTemplateProps) {
  const [active, setActive] = useState(false);

  const base =
    "w-full rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";

  // Boucle pour créer une grille rows x cols.
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ r, c }))
  );

  return (
    <div id={id || undefined} className={`${base} ${className}`.trim()}>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.map((row) =>
          row.map((cell) => (
            <div
              key={`${cell.r}-${cell.c}`}
              className="flex items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100"
            >
              {renderCell ? renderCell(cell.r, cell.c) : `(${cell.r + 1}, ${cell.c + 1})`}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

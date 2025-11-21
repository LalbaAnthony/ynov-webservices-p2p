"use client";

import { useState } from "react";

type ComponentTemplateProps = {
  className?: string;
  id?: string;
  rows?: number;
  cols?: number;
  renderCell?: (row: number, col: number) => React.ReactNode;
  columnTemplate?: string; // ex: "60% 35%" pour définir des largeurs personnalisées
};

export default function ComponentTemplate({
  className = "",
  id = "",
  rows = 3,
  cols = 3,
  renderCell,
  columnTemplate,
}: ComponentTemplateProps) {
  const [active, setActive] = useState(false);

  const base = "w-full";

  // Boucle pour créer une grille rows x cols.
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ r, c }))
  );

  return (
    <div id={id || undefined} className={`${base} ${className}`.trim()}>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: columnTemplate
            ? columnTemplate
            : `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row) =>
          row.map((cell) => (
            <div
              key={`${cell.r}-${cell.c}`}
              className="flex h-full w-full flex-col items-center justify-center p-2 text-sm"
            >
              <div className="h-full w-full">
                {renderCell ? renderCell(cell.r, cell.c) : `(${cell.r + 1}, ${cell.c + 1})`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

type ImageDrawedProps = {
  className?: string;
  id?: string;
  src?: string; // dataURL ou URL de fichier généré
  alt?: string;
  createdAt?: string;
};

export default function ImageDrawed({
  className = "",
  id = "",
  src,
  alt = "Dessin généré",
  createdAt,
}: ImageDrawedProps) {
  const base =
    "w-full rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <section id={id || undefined} className={`${base} ${className}`.trim()}>
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Image générée
          </p>
          {createdAt && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{createdAt}</p>
          )}
        </div>
      </header>

      <div className="relative overflow-hidden rounded-lg border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-auto w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
            Aucune image pour le moment
          </div>
        )}
      </div>
    </section>
  );
}

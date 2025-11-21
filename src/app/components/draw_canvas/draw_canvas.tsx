"use client";

import { useEffect, useRef, useState } from "react";

type DrawCanvasProps = {
  className?: string;
  id?: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  paletteColors?: string[];
  onChange?: (dataUrl: string) => void;
};

export default function DrawCanvas({
  className = "",
  id,
  width = 800,
  height = 500,
  strokeColor = "#111827",
  strokeWidth = 3,
  backgroundColor = "#ffffff",
  paletteColors = ["#111827", "#2563eb", "#ef4444", "#f59e0b", "#10b981", "#a855f7"],
  onChange,
}: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState(strokeColor);

  // Init canvas (DPR aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    if (onChange) onChange(canvas.toDataURL("image/png"));
  }, [width, height, backgroundColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Context is already scaled with DPR, so we want plain CSS pixel coords here.
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleDown = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      isDrawing.current = true;
      lastPos.current = getPos(e);
    };

    const handleUp = (e: PointerEvent) => {
      isDrawing.current = false;
      lastPos.current = null;
      canvas.releasePointerCapture(e.pointerId);
      if (onChange) onChange(canvas.toDataURL("image/png"));
    };

    const handleMove = (e: PointerEvent) => {
      if (!isDrawing.current) return;
      const pos = getPos(e);
      if (!lastPos.current) {
        lastPos.current = pos;
        return;
      }
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    };

    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointerleave", handleUp);
    canvas.addEventListener("pointermove", handleMove);

    return () => {
      canvas.removeEventListener("pointerdown", handleDown);
      canvas.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointerleave", handleUp);
      canvas.removeEventListener("pointermove", handleMove);
    };
  }, [currentColor, strokeWidth, onChange, width, height]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    if (onChange) onChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <canvas
        id={id}
        ref={canvasRef}
        className="rounded-lg border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        style={{ touchAction: "none" }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-row flex-wrap items-center gap-2">
          {paletteColors.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Choisir la couleur ${color}`}
              onClick={() => setCurrentColor(color)}
              className={`h-7 w-7 rounded-full border-2 transition ${
                currentColor === color ? "border-zinc-900 shadow-sm" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full border border-zinc-300 shadow-sm"
            style={{ backgroundColor: currentColor }}
            aria-label="Couleur actuelle"
          />
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Effacer
          </button>
        </div>
      </div>
    </div>
  );
}

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
  onChange?: (dataUrl: string) => void;
};

export default function DrawCanvas({
  className = "",
  id,
  width = 480,
  height = 320,
  strokeColor = "#111827",
  strokeWidth = 4,
  backgroundColor = "#ffffff",
  onChange,
}: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [backgroundColor]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const end = () => {
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas && onChange) onChange(canvas.toDataURL("image/png"));
  };

  const move = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const current = getPos(e);
    if (!ctx || !canvas || !lastPos.current) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    lastPos.current = current;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (onChange) onChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <canvas
        id={id}
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded-lg border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        onMouseDown={start}
        onMouseUp={end}
        onMouseLeave={end}
        onMouseMove={move}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Effacer
        </button>
      </div>
    </div>
  );
}

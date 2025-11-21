"use client";

import { useEffect, useRef, useState } from "react";

type CanvasDrawingProps = {
  className?: string;
  id?: string;
};

export default function CanvasDrawing({
  className = "",
  id = "",
}: CanvasDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDrawingRef.current = true;
      lastPos.current = getPos(e);
    };

    const handleMouseUp = () => {
      isDrawingRef.current = false;
    };

    const handleMouseLeave = () => {
      isDrawingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;

      const { x, y } = getPos(e);

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastPos.current = { x, y };
    };

    // Add listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousemove", handleMouseMove);

    // Clean up
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const base =
    "w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

  return (
    <div id={id || undefined} className={`${base} ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="border-2 border-black mx-auto bg-white"
      />
    </div>
  );
}

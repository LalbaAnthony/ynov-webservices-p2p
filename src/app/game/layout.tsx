"use client";

import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export const TimerContext = createContext<{
  time: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
} | null>(null);

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const code = params?.code as string | undefined;

  const [time, setTime] = useState(0); // time in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (intervalRef.current) return; // already running

    intervalRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  };

  const stop = () => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const reset = () => {
    stop();
    setTime(0);
  };

  return (
    <TimerContext.Provider value={{ time, start, stop, reset }}>
      <header className="p-4 border-b flex flex-row gap-2 justify-between items-center">
        <h1>Funny Phone</h1>
        {code && <span className="font-mono">Room ID:  {code}</span>}

        {time && (time > 0) && <span className="font-mono">Time: {time}s</span>}
      </header>

      <main>{children}</main>
    </TimerContext.Provider>
  );
}

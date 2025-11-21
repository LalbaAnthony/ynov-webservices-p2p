"use client";

import { useParams } from "next/navigation";
import { createContext, useRef, useState } from "react";
import TopBar from "../components/top_bar/top_bar";

export const TimerContext = createContext<{
  time: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  playersCount: number;
  setPlayersCount: (n: number) => void;
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
  const [playersCount, setPlayersCount] = useState(0);

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
    <TimerContext.Provider value={{ time, start, stop, reset, playersCount, setPlayersCount }}>
      <header className="p-4 border-b flex flex-row gap-2 justify-between items-center">
        <TopBar roomId={code} nbPlayers={playersCount} nbSeconds={time} />
      </header>

      <main>{children}</main>
    </TimerContext.Provider>
  );
}

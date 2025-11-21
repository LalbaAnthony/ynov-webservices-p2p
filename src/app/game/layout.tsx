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
  turnSeconds: number;
  setTurnSeconds: (n: number) => void;
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
  const [turnSeconds, setTurnSeconds] = useState(30);

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
    <TimerContext.Provider
      value={{
        time,
        start,
        stop,
        reset,
        playersCount,
        setPlayersCount,
        turnSeconds,
        setTurnSeconds,
      }}
    >
      <header className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
        <TopBar roomId={code} nbPlayers={playersCount} nbSeconds={turnSeconds} />
      </header>

      <main>{children}</main>
    </TimerContext.Provider>
  );
}

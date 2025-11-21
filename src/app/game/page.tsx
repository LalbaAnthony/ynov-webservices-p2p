"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Game() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  async function createRoom() {
    setLoading(true);

    const res = await fetch("/api/rooms/create", {
      method: "POST",
    });

    const data = await res.json();

    if (data.error) {
      alert("Erreur : " + data.error);
      setLoading(false);
      return;
    }

    router.push(`/game/${data.code}`);
  }

  function joinRoom(e: FormEvent) {
    e.preventDefault();
    const code = joinCode.trim();
    if (!code) return;
    router.push(`/game/${code}`);
  }

  return (
    <div className="p-10">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">Rejoindre une room</h2>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={joinRoom}>
            <input
              type="text"
              placeholder="Code de la partie"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={!joinCode.trim()}
            >
              Rejoindre
            </button>
          </form>
        </div>

        <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">Creer une room</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Cree une nouvelle partie et partage le code pour inviter tes amis.
          </p>
          <button
            disabled={loading}
            onClick={createRoom}
            className="w-fit rounded-lg bg-blue-500 px-4 py-2 text-white shadow transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Creation..." : "Creer la partie"}
          </button>
        </div>
      </div>
    </div>
  );
}

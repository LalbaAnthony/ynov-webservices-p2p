"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Game() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Créer une room</h1>
      <button
        disabled={loading}
        onClick={createRoom}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Création..." : "Créer la room"}
      </button>
    </div>
  );
}

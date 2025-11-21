"use client";

import { usePeer } from "@/hooks/usePeer";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Message =
  | { type: "WELCOME"; players: string[] }
  | { type: "PLAYER_JOINED"; peerId: string };

export default function RoomPageClient() {
  const params = useParams();
  const code = params?.code as string | undefined;

  const { peerId, peer } = usePeer();

  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [hostPeerId, setHostPeerId] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !peerId) return;

    async function join() {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, peerId }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Impossible de rejoindre la room : " + data.error);
        return;
      }

      setHostPeerId(data.host);
      setPlayers(data.players);
      setIsHost(data.host === peerId);
    }

    join();
  }, [code, peerId]);


  useEffect(() => {
    if (!peer) return;

    if (isHost) {
      peer.on("connection", (conn) => {
        conn.on("data", (data) => handleMessage(conn.peer, data as Message));

        addPlayer(conn.peer);

        conn.send({ type: "WELCOME", players });
      });
    } else if (hostPeerId) {
      const conn = peer.connect(hostPeerId);

      conn.on("open", () => {
        conn.send({ type: "PLAYER_JOINED", peerId });
      });

      conn.on("data", (data) => handleMessage(conn.peer, data as Message));
    }
  }, [peer, isHost, hostPeerId, players]);

  function handleMessage(from: string, msg: Message) {
    if (msg.type === "WELCOME") setPlayers(msg.players);
    if (msg.type === "PLAYER_JOINED") addPlayer(msg.peerId);
  }

  function addPlayer(id: string) {
    setPlayers((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  if (!code) return <div>Chargement de la room...</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Room {code} {isHost && "(Host)"}
      </h1>

      <h2 className="text-xl mt-6">Joueurs :</h2>
      <ul className="mt-2">
        {players.map((p) => (
          <li key={p} className="text-sm">
            {p} {p === hostPeerId && "(Hôte)"}
          </li>
        ))}
      </ul>

      {isHost && (
        <button
          className="mt-10 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => alert("Lancement de la partie → bientôt")}
        >
          Lancer la partie
        </button>
      )}
    </div>
  );
}

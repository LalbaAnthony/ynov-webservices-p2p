"use client";

import { usePeer } from "@/hooks/usePeer";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

// --- TYPES DU JEU ---

type Message =
  | {
      type: "WELCOME";
      players: string[];
      history: GameTurn[];
      lastInput: string | null;
    }
  | { type: "PLAYER_JOINED"; peerId: string }
  | { type: "START_GAME"; order: string[] }
  | { type: "NEXT_TURN"; activePeerId: string; lastInput: string }
  | { type: "PLAYER_FINISHED"; turn: GameTurn }
  | { type: "GAME_END" };

type TurnType = "text" | "drawing" | "guess";

type GameTurn = {
  type: TurnType;
  content: string;
  player: string;
};

type PlayerState = {
  player: string;
  as_played: boolean;
  response: string;
};

// --- COMPOSANT PRINCIPAL ---

export default function RoomPageClient() {
  const params = useParams();
  const code = params?.code as string | undefined;

  const { peerId, peer } = usePeer();

  // État de la connexion/room
  const [isHost, setIsHost] = useState(false);
  const [hostPeerId, setHostPeerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);

  // État de la partie
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOrder, setGameOrder] = useState<string[]>([]);
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameTurn[]>([]);
  const [lastInput, setLastInput] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  // Entrée utilisateur
  const [currentInput, setCurrentInput] = useState("");

  // ------------------ HOST MINI DB ------------------
  const [playersState, setPlayersState] = useState<PlayerState[]>([]);

  // ------------------ LOGIQUE DE NETTOYAGE PEERJS (Fix du problème de reconnexion) ------------------
  // Gère uniquement la destruction de l'objet Peer lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (peer && !peer.destroyed) {
        console.log("Nettoyage : Destruction de l'objet Peer.");
        peer.destroy();
      }
    };
  }, [peer]); // Se déclenche seulement si 'peer' change.

  // ------------------ FONCTIONS DE COMMUNICATION/UTILITAIRES ------------------

  const broadcast = useCallback(
    (msg: Message, excludePeer?: string) => {
      if (!peer || !peer.connections) return;

      Object.values(peer.connections).forEach((conns: any[]) => {
        conns.forEach((conn) => {
          if (conn.peer !== excludePeer) conn.send(msg);
        });
      });
    },
    [peer]
  );

  const addPlayer = useCallback(
    (id: string) => {
      setPlayers((prev) => (prev.includes(id) ? prev : [...prev, id]));
      if (isHost) {
        setPlayersState((prev) => {
          if (prev.find((ps) => ps.player === id)) return prev;
          return [...prev, { player: id, as_played: false, response: "" }];
        });
      }
    },
    [isHost]
  );

  const handleMessage = useCallback(
    (from: string, msg: Message) => {
      switch (msg.type) {
        case "WELCOME":
          setPlayers(msg.players);
          setGameHistory(msg.history);
          setLastInput(msg.lastInput);
          break;
        case "PLAYER_JOINED":
          addPlayer(msg.peerId);
          break;
        case "START_GAME":
          setGameStarted(true);
          setGameOrder(msg.order);
          setActivePeerId(msg.order[0]);
          break;
        case "NEXT_TURN":
          setActivePeerId(msg.activePeerId);
          setLastInput(msg.lastInput);
          break;
        case "PLAYER_FINISHED":
          // Logique exécutée uniquement par l'hôte quand un non-hôte a joué
          if (!isHost) return;

          const turn = msg.turn;

          setGameHistory((prev) => [...prev, turn]);
          setLastInput(turn.content);

          let allPlayed = false;

          setPlayersState((prev) => {
            const newState = prev.map((ps) =>
              ps.player === turn.player
                ? { ...ps, as_played: true, response: turn.content }
                : ps
            );

            // Vérification de la fin de partie
            allPlayed = newState.every((p) => p.as_played);
            return newState;
          });

          // Passage au joueur suivant
          const currentIndex = gameOrder.indexOf(turn.player);
          const nextIndex = (currentIndex + 1) % gameOrder.length;
          const nextPeerId = gameOrder[nextIndex];

          setActivePeerId(nextPeerId);

          if (allPlayed) {
            setGameEnded(true);
            broadcast({ type: "GAME_END" });
          } else {
            broadcast({
              type: "NEXT_TURN",
              activePeerId: nextPeerId,
              lastInput: turn.content,
            });
          }
          break;
        case "GAME_END":
          setGameEnded(true);
          break;
      }
    },
    [isHost, addPlayer, gameOrder, broadcast]
  );

  // ------------------ LOGIQUE DE JOIN ROOM ------------------
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

      const isCurrentHost = data.host === peerId;
      setHostPeerId(data.host);
      setPlayers(data.players);
      setIsHost(isCurrentHost);
      setGameHistory(data.history || []);
      setLastInput(data.history?.at(-1)?.content || null);

      if (data.gameStarted) {
        setGameStarted(true);
        setGameOrder(data.order);
        setActivePeerId(data.activePeerId);
        if (isCurrentHost) {
          setPlayersState(data.playersState || []);
        }
      }
    }

    join();
  }, [code, peerId]);

  // ------------------ PEER CONNECTION (Gestion des connexions P2P) ------------------
  useEffect(() => {
    if (!peer || !peerId) return;
    if (!isHost && !hostPeerId) return; // pour les joueurs

    // --- Hôte ---
    if (isHost) {
      const handleConn = (conn: any) => {
        conn.on("data", (data) => handleMessage(conn.peer, data as Message));
        addPlayer(conn.peer);

        conn.on("open", () => {
          conn.send({
            type: "WELCOME",
            players,
            history: gameHistory,
            lastInput,
          });
          broadcast({ type: "PLAYER_JOINED", peerId: conn.peer }, conn.peer);
        });
      };

      peer.on("connection", handleConn);

      // Cleanup : enlever l'écouteur quand le composant est démonté
      return () => {
        peer.off("connection", handleConn);
      };
    }

    // --- Joueur ---
    if (!isHost) {
      // Vérifie si on n'a pas déjà une connexion
      if (!peer.connections[hostPeerId!]) {
        const conn = peer.connect(hostPeerId!);
        conn.on("open", () => {
          conn.send({ type: "PLAYER_JOINED", peerId });
        });
        conn.on("data", (data) => handleMessage(conn.peer, data as Message));
      }
    }
  }, [peer, peerId, isHost, hostPeerId, addPlayer, handleMessage, broadcast]);

  // ------------------ HOST START GAME ------------------
  function startGame() {
    if (!isHost || players.length < 3 || gameStarted) return;

    const order = [...players].sort(() => Math.random() - 0.5);
    setGameOrder(order);
    setActivePeerId(order[0]);
    setGameStarted(true);

    const initialState = order.map((p) => ({
      player: p,
      as_played: false,
      response: "",
    }));
    setPlayersState(initialState);

    broadcast({ type: "START_GAME", order });
  }

  // ------------------ HANDLE PLAYER ACTION ------------------
  function submitTurn() {
    if (!currentInput || !activePeerId || gameEnded) return;

    const playerData = playersState.find((p) => p.player === peerId);
    if (playerData?.as_played) return;

    const turn: GameTurn = {
      type: "text",
      content: currentInput,
      player: peerId!,
    };

    setCurrentInput("");

    if (isHost) {
      // Hôte : Gère localement et broadcast
      let allPlayed = false;

      setPlayersState((prev) => {
        const newState = prev.map((ps) =>
          ps.player === activePeerId
            ? { ...ps, as_played: true, response: turn.content }
            : ps
        );

        allPlayed = newState.every((p) => p.as_played);
        return newState;
      });

      setGameHistory((prev) => [...prev, turn]);
      setLastInput(turn.content);

      const currentIndex = gameOrder.indexOf(activePeerId);
      const nextIndex = (currentIndex + 1) % gameOrder.length;
      const nextPeerId = gameOrder[nextIndex];
      setActivePeerId(nextPeerId);

      if (allPlayed) {
        setGameEnded(true);
        broadcast({ type: "GAME_END" });
        return;
      }

      broadcast({
        type: "NEXT_TURN",
        activePeerId: nextPeerId,
        lastInput: turn.content,
      });
    } else {
      // Joueur non-hôte : Envoie son tour au host
      const conn = peer?.connections[hostPeerId!][0];
      if (conn) {
        conn.send({ type: "PLAYER_FINISHED", turn });
      }
    }
  }

  // ------------------ RENDER ------------------

  if (!code) return <div>Chargement de la room...</div>;

  if (!gameStarted)
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold">🎮 Room {code}</h1>

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
            className={`mt-10 px-4 py-2 text-white rounded ${
              players.length >= 3
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={players.length < 3}
            onClick={startGame}
          >
            Lancer la partie ({players.length} / 3 min)
          </button>
        )}
      </div>
    );

  const isActive = peerId === activePeerId;
  const hasPlayed = playersState.find((p) => p.player === peerId)?.as_played;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        ✍️ Room {code} {isHost && "(Host)"}
      </h1>

      <h2 className="text-xl mt-6">Ordre du jeu :</h2>
      <ul className="mt-2 text-sm">
        {gameOrder.map((p, index) => (
          <li
            key={p}
            className={p === activePeerId ? "font-bold text-blue-600" : ""}
          >
            {index + 1}. {p} {p === activePeerId && "(ACTIF)"}
          </li>
        ))}
      </ul>

      <h2 className="text-xl mt-6">Historique des tours :</h2>
      <ul className="mt-2">
        {gameHistory.map((t, i) => (
          <li key={i} className="text-sm">
            **{t.player}** ({t.type}):{" "}
            {t.type === "text" ? t.content : "[dessin]"}
          </li>
        ))}
      </ul>

      {gameEnded && (
        <div className="mt-6 text-2xl text-red-600 font-bold">
          🎉 FIN DE PARTIE !
        </div>
      )}

      {/* ZONE D'ACTION */}
      {!gameEnded && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Votre Tour</h3>

          {isActive && !hasPlayed ? (
            <div>
              <p className="mb-2 italic text-gray-700">
                {lastInput
                  ? `Dernière entrée : "${lastInput}"`
                  : "C'est votre tour de commencer ! Écrivez une phrase."}
              </p>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="border px-3 py-2 w-full max-w-sm rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez votre phrase/réponse"
                disabled={gameEnded}
              />
              <button
                className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                onClick={submitTurn}
                disabled={!currentInput.trim() || gameEnded}
              >
                Valider le Tour
              </button>
            </div>
          ) : (
            <div className="text-gray-600">
              {hasPlayed
                ? "✅ Vous avez joué dans ce tour. En attente du tour des autres joueurs..."
                : `⏳ En attente. C'est le tour de : ${activePeerId}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

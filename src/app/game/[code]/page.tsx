"use client";

import { usePeer } from "@/hooks/usePeer";
import { useEffect, useState, useCallback, useRef, useContext } from "react";
import { useParams } from "next/navigation";
import TopBar from "../../components/top_bar/top_bar";
import { TimerContext } from "../layout";
import FormComponent from "../../components/form_component/form";
import DrawCanvas from "../../components/draw_canvas/draw_canvas";

// --- TYPES DU JEU ---

type Message =
  | {
      type: "WELCOME";
      players: string[];
      history: GameTurn[];
      lastInput: string | null;
      lastTurnType?: TurnType | null;
      currentTurnType?: TurnType;
      order?: string[];
      activePeerId?: string;
    }
  | { type: "PLAYER_JOINED"; peerId: string }
  | { type: "START_GAME"; order: string[] }
  | {
      type: "NEXT_TURN";
      activePeerId: string;
      lastInput: string;
      lastTurnType: TurnType;
      nextTurnType: TurnType;
    }
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
  const timerCtx = useContext(TimerContext);

  // Etat de la connexion/room
  const [isHost, setIsHost] = useState(false);
  const [hostPeerId, setHostPeerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);

  // Etat de la partie
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOrder, setGameOrder] = useState<string[]>([]);
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameTurn[]>([]);
  const [lastInput, setLastInput] = useState<string | null>(null);
  const [lastTurnType, setLastTurnType] = useState<TurnType | null>(null);
  const [currentTurnType, setCurrentTurnType] = useState<TurnType>("drawing");
  const [gameEnded, setGameEnded] = useState(false);

  // Entree utilisateur
  const [currentInput, setCurrentInput] = useState("");
  const [drawingData, setDrawingData] = useState<string | null>(null);

  // Host mini DB
  const [playersState, setPlayersState] = useState<PlayerState[]>([]);

  // Refs pour éviter les valeurs obsolètes dans les handlers/broadcast
  const playersRef = useRef<string[]>([]);
  const historyRef = useRef<GameTurn[]>([]);
  const lastInputRef = useRef<string | null>(null);
  const orderRef = useRef<string[]>([]);
  const lastTurnTypeRef = useRef<TurnType | null>(null);
  const currentTurnTypeRef = useRef<TurnType>("drawing");

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    historyRef.current = gameHistory;
  }, [gameHistory]);

  useEffect(() => {
    lastInputRef.current = lastInput;
  }, [lastInput]);

  useEffect(() => {
    orderRef.current = gameOrder;
  }, [gameOrder]);

  useEffect(() => {
    lastTurnTypeRef.current = lastTurnType;
  }, [lastTurnType]);

  useEffect(() => {
    currentTurnTypeRef.current = currentTurnType;
  }, [currentTurnType]);

  // Remonte le nombre de joueurs au layout (TopBar)
  useEffect(() => {
    timerCtx?.setPlayersCount(players.length);
  }, [players, timerCtx]);

  // Nettoyage PeerJS
  useEffect(() => {
    return () => {
      if (peer && !peer.destroyed) {
        peer.destroy();
      }
    };
  }, [peer]);

  // ------------------ COMMUNICATION/UTILITAIRES ------------------

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
          setLastTurnType(msg.lastTurnType ?? msg.history.at(-1)?.type ?? null);
          setCurrentTurnType(msg.currentTurnType ?? "drawing");
          if (msg.order) setGameOrder(msg.order);
          if (msg.activePeerId) setActivePeerId(msg.activePeerId);
          if (msg.order) setGameStarted(true);
          break;
        case "PLAYER_JOINED":
          addPlayer(msg.peerId);
          break;
        case "START_GAME":
          setGameStarted(true);
          setGameOrder(msg.order);
          setActivePeerId(msg.order[0]);
          setCurrentTurnType("drawing");
          break;
        case "NEXT_TURN":
          setActivePeerId(msg.activePeerId);
          setLastInput(msg.lastInput);
          setLastTurnType(msg.lastTurnType);
          setCurrentTurnType(msg.nextTurnType);
          break;
        case "PLAYER_FINISHED":
          // Hote uniquement
          if (!isHost) return;

          const turn = msg.turn;

          setGameHistory((prev) => [...prev, turn]);
          setLastInput(turn.content);
          setLastTurnType(turn.type);

          let allPlayed = false;

          setPlayersState((prev) => {
            const newState = prev.map((ps) =>
              ps.player === turn.player
                ? { ...ps, as_played: true, response: turn.content }
                : ps
            );

            allPlayed = newState.every((p) => p.as_played);
            return newState;
          });

          // Passage au joueur suivant
          const currentIndex = orderRef.current.indexOf(turn.player);
          if (currentIndex === -1) {
            console.warn("PLAYER_FINISHED inconnu, peer ignore :", turn.player);
            return;
          }
          const nextIndex = (currentIndex + 1) % orderRef.current.length;
          const nextPeerId = orderRef.current[nextIndex];
          const nextTurnType: TurnType = turn.type === "drawing" ? "text" : "drawing";

          setActivePeerId(nextPeerId);
          setCurrentTurnType(nextTurnType);

          if (allPlayed) {
            setGameEnded(true);
            broadcast({ type: "GAME_END" });
          } else {
            broadcast({
              type: "NEXT_TURN",
              activePeerId: nextPeerId,
              lastInput: turn.content,
              lastTurnType: turn.type,
              nextTurnType,
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

  // ------------------ JOIN ROOM ------------------
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

  // ------------------ PEER CONNECTION ------------------
  useEffect(() => {
    if (!peer || !peerId) return;
    if (!isHost && !hostPeerId) return; // pour les joueurs

    // Hote
    if (isHost) {
      const handleConn = (conn: any) => {
        conn.on("data", (data) => handleMessage(conn.peer, data as Message));
        addPlayer(conn.peer);

        conn.on("open", () => {
          conn.send({
            type: "WELCOME",
            players: playersRef.current,
            history: historyRef.current,
            lastInput: lastInputRef.current,
            lastTurnType: lastTurnTypeRef.current,
            currentTurnType: currentTurnTypeRef.current,
            order: orderRef.current,
            activePeerId,
          });
          broadcast({ type: "PLAYER_JOINED", peerId: conn.peer }, conn.peer);
        });
      };

      peer.on("connection", handleConn);

      // Cleanup
      return () => {
        peer.off("connection", handleConn);
      };
    }

    // Joueur
    if (!isHost) {
      if (!peer.connections[hostPeerId!]) {
        const conn = peer.connect(hostPeerId!);
        conn.on("open", () => {
          conn.send({ type: "PLAYER_JOINED", peerId });
        });
        conn.on("data", (data) => handleMessage(conn.peer, data as Message));
      }
    }
  }, [peer, peerId, isHost, hostPeerId, addPlayer, handleMessage, broadcast, gameOrder, activePeerId]);

  // ------------------ HOST START GAME ------------------
  function startGame() {
    if (!isHost || players.length < 3 || gameStarted) return;

    const order = [...players].sort(() => Math.random() - 0.5);
    setGameOrder(order);
    setActivePeerId(order[0]);
    setGameStarted(true);
    setCurrentTurnType("drawing");
    setLastTurnType(null);

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
    if (!activePeerId || gameEnded) return;

    let contentToSend: string | null = null;
    let turnType: TurnType = currentTurnType;

    if (currentTurnType === "drawing") {
      if (!drawingData) return;
      contentToSend = drawingData;
    } else {
      if (!currentInput.trim()) return;
      contentToSend = currentInput.trim();
    }

    const playerData = playersState.find((p) => p.player === peerId);
    if (playerData?.as_played) return;

    const turn: GameTurn = {
      type: turnType,
      content: contentToSend,
      player: peerId!,
    };

    setCurrentInput("");
    setDrawingData(null);

    if (isHost) {
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
      setLastTurnType(turn.type);

      const currentIndex = orderRef.current.indexOf(activePeerId);
      if (currentIndex === -1) {
        console.warn("submitTurn: activePeerId introuvable", activePeerId);
        return;
      }
      const nextIndex = (currentIndex + 1) % orderRef.current.length;
      const nextPeerId = orderRef.current[nextIndex];
      const nextTurnType: TurnType = turn.type === "drawing" ? "text" : "drawing";
      setActivePeerId(nextPeerId);
      setCurrentTurnType(nextTurnType);

      if (allPlayed) {
        setGameEnded(true);
        broadcast({ type: "GAME_END" });
        return;
      }

      broadcast({
        type: "NEXT_TURN",
        activePeerId: nextPeerId,
        lastInput: turn.content,
        lastTurnType: turn.type,
        nextTurnType,
      });
    } else {
      const existing = peer?.connections[hostPeerId!]?.find((c) => c.open) ?? null;
      if (existing) {
        existing.send({ type: "PLAYER_FINISHED", turn });
      } else if (peer && hostPeerId) {
        const conn = peer.connect(hostPeerId);
        conn.on("open", () => conn.send({ type: "PLAYER_FINISHED", turn }));
      }
    }
  }

  // ------------------ RENDER ------------------

  if (!code) return <div>Chargement de la room...</div>;

  if (!gameStarted)
    return (
      <div className="p-10 space-y-6">
        <h1 className="text-3xl font-bold">Room {code}</h1>

        <h2 className="text-xl mt-6">Joueurs :</h2>
        <ul className="mt-2">
          {players.map((p) => (
            <li key={p} className="text-sm">
              {p} {p === hostPeerId && "(Hote)"}
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
    <div className="p-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Room {code} {isHost && "(Host)"}
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
            <div className="flex flex-col gap-2">
              <span>
                **{t.player}** ({t.type}):
              </span>
              {t.type === "text" ? (
                <span>{t.content}</span>
              ) : (
                <img
                  src={t.content}
                  alt={`Dessin de ${t.player}`}
                  className="max-w-md rounded border border-zinc-200"
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      {gameEnded && (
        <div className="mt-6 text-2xl text-red-600 font-bold">
          FIN DE PARTIE !
        </div>
      )}

      {!gameEnded && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Votre Tour</h3>

          {isActive && !hasPlayed ? (
            <div className="space-y-3">
              {currentTurnType === "drawing" ? (
                <>
                  <p className="italic text-gray-700">
                    {lastInput
                      ? lastTurnType === "text"
                        ? `Derniere entree : "${lastInput}"`
                        : "Derniere entree : un dessin"
                      : "C'est votre tour de commencer ! Dessinez."}
                  </p>
                  <FormComponent
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitTurn();
                    }}
                    renderField={() => (
                      <DrawCanvas
                        className="w-full"
                        onChange={(data) => setDrawingData(data)}
                        strokeColor="#2563eb"
                        strokeWidth={4}
                        backgroundColor="#ffffff"
                      />
                    )}
                    submitLabel="Valider le dessin"
                    disabled={gameEnded}
                  />
                </>
              ) : (
                <>
                  {lastTurnType === "drawing" && lastInput && (
                    <div className="mb-2">
                      <p className="italic text-gray-700 mb-1">Dessin à décrire :</p>
                      <img
                        src={lastInput}
                        alt="Dessin à décrire"
                        className="max-w-lg rounded border border-zinc-200"
                      />
                    </div>
                  )}
                  <FormComponent
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitTurn();
                    }}
                    renderField={() => (
                      <textarea
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        placeholder="Décris ce que tu vois..."
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        rows={3}
                      />
                    )}
                    submitLabel="Valider la description"
                    disabled={gameEnded || !currentInput.trim()}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-600">
              {hasPlayed
                ? "Vous avez deja joue dans ce tour. En attente des autres joueurs..."
                : `En attente. C'est le tour de : ${activePeerId}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

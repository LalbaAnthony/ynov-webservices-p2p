"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Send } from "lucide-react";
import { useConnectFour } from "@/hooks/use-connect-four";
import { ROWS, COLS } from "@/lib/types";

export default function ConnectFour() {
  const {
    gameState,
    messages,
    roomId,
    myColor,
    createRoom,
    joinRoom,
    makeMove,
    sendChatMessage,
    restartGame,
  } = useConnectFour();

  const [roomCode, setRoomCode] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateRoom = async () => {
    setError("");
    await createRoom();
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Veuillez entrer un code de room");
      return;
    }
    setError("");
    try {
      await joinRoom(roomCode.trim());
    } catch (err) {
      setError("Impossible de rejoindre la room. Vérifiez le code.");
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput("");
    }
  };

  if (!roomId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Puissance 4 P2P
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCreateRoom} className="w-full" size="lg">
              Créer une partie
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Code de la room"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              />
              <Button
                onClick={handleJoinRoom}
                variant="outline"
                className="w-full"
              >
                Rejoindre une partie
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.status === "waiting") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              En attente d'un adversaire...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Code de la room :
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded font-mono text-sm">
                  {roomId}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyRoomId}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Partagez ce code avec votre adversaire
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Puissance 4</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Vous êtes
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full ${
                      myColor === "red" ? "bg-red-500" : "bg-yellow-400"
                    }`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center">
                {gameState.status === "finished" ? (
                  <div className="space-y-2">
                    <p className="text-xl font-bold">
                      {gameState.winner === myColor
                        ? "🎉 Vous avez gagné !"
                        : gameState.winner === "draw"
                        ? "🤝 Match nul !"
                        : "😢 Vous avez perdu"}
                    </p>
                    <Button onClick={restartGame}>Rejouer</Button>
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    {gameState.currentPlayer === myColor
                      ? "✨ À votre tour"
                      : "⏳ Tour de l'adversaire"}
                  </p>
                )}
              </div>

              <div className="bg-blue-600 p-4 rounded-lg inline-block">
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
                >
                  {Array.from({ length: ROWS }).map((_, rowIndex) =>
                    Array.from({ length: COLS }).map((_, colIndex) => {
                      const cell = gameState.board[rowIndex][colIndex];
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => makeMove(colIndex)}
                          disabled={
                            gameState.currentPlayer != myColor ||
                            gameState.status !== "playing"
                          }
                          className="w-14 h-14 rounded-full bg-white shadow-inner hover:bg-gray-100 transition-colors disabled:cursor-not-allowed relative"
                        >
                          {cell && (
                            <div
                              className={`absolute inset-1 rounded-full ${
                                cell === "red" ? "bg-red-500" : "bg-yellow-400"
                              } shadow-lg animate-in zoom-in duration-300`}
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Aucun message
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg ${
                          msg.sender === "me"
                            ? "bg-blue-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm wrap-break-word">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Envoyer un message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

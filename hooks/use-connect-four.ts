import {
  canDropInColumn,
  checkWinner,
  dropPiece,
  isBoardFull,
  switchPlayer,
} from '@/lib/game-logic';
import { PeerManager } from '@/lib/peer-manager';
import {
  ChatMessage,
  createEmptyBoard,
  GameState,
  PeerMessage,
  Player,
} from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

export const useConnectFour = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: 'red',
    winner: null,
    status: 'waiting',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [myColor, setMyColor] = useState<Player>(null);

  const peerManagerRef = useRef<PeerManager | null>(null);

  useEffect(() => {
    return () => {
      peerManagerRef.current?.destroy();
    };
  }, []);

  const createRoom = async () => {
    const peerManager = new PeerManager();
    peerManagerRef.current = peerManager;

    try {
      const id = await peerManager.createRoom();
      setRoomId(id);
      setIsHost(true);
      setMyColor('red');

      peerManager.onConnected(() => {
        peerManager.sendMessage({
          type: 'game-start',
          data: { startingPlayer: 'red' },
        });

        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentPlayer: 'red',
        }));
      });

      peerManager.onMessage(handlePeerMessage);
      peerManager.onDisconnected(handleDisconnect);
    } catch (error) {
      console.error('Erreur lors de la création de la room:', error);
    }
  };

  const joinRoom = async (roomCode: string) => {
    const peerManager = new PeerManager();
    peerManagerRef.current = peerManager;

    try {
      await peerManager.joinRoom(roomCode);
      setRoomId(roomCode);
      setIsHost(false);
      setMyColor('yellow');

      peerManager.onMessage(handlePeerMessage);
      peerManager.onDisconnected(handleDisconnect);
    } catch (error) {
      console.error('Erreur lors de la connexion à la room:', error);
      throw error;
    }
  };

  const handlePeerMessage = (message: PeerMessage) => {
    switch (message.type) {
      case 'game-start':
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentPlayer: message.data.startingPlayer,
        }));
        break;

      case 'move':
        handleOpponentMove(message.data);
        break;

      case 'chat':
        addMessage(message.data.text, 'opponent');
        break;

      case 'restart':
        handleOpponentRestart();
        break;
    }
  };

  const handleOpponentMove = (data: { column: number; player: Player }) => {
    const { column, player } = data;

    setGameState(prev => {
      if (!canDropInColumn(prev.board, column)) return prev;

      const newBoard = dropPiece(prev.board, column, player);
      const hasWon = checkWinner(newBoard, player);
      const isDraw = isBoardFull(newBoard);

      return {
        ...prev,
        board: newBoard,
        currentPlayer: switchPlayer(player),
        winner: hasWon ? player : isDraw ? 'draw' : null,
        status: hasWon || isDraw ? 'finished' : 'playing',
      };
    });
  };

  const makeMove = (column: number) => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentPlayer !== myColor) return;
    if (!canDropInColumn(gameState.board, column)) return;

    const newBoard = dropPiece(gameState.board, column, myColor);
    const hasWon = checkWinner(newBoard, myColor);
    const isDraw = isBoardFull(newBoard);

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: switchPlayer(myColor),
      winner: hasWon ? myColor : isDraw ? 'draw' : null,
      status: hasWon || isDraw ? 'finished' : 'playing',
    }));

    peerManagerRef.current?.sendMessage({
      type: 'move',
      data: { column, player: myColor },
    });
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    addMessage(text, 'me');

    peerManagerRef.current?.sendMessage({
      type: 'chat',
      data: { text },
    });
  };

  const addMessage = (text: string, sender: 'me' | 'opponent') => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender,
        timestamp: Date.now(),
      },
    ]);
  };

  const restartGame = () => {
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: 'red',
      winner: null,
      status: 'playing',
    });

    peerManagerRef.current?.sendMessage({ type: 'restart' });
  };

  const handleOpponentRestart = () => {
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: 'red',
      winner: null,
      status: 'playing',
    });
  };

  const handleDisconnect = () => {
    setGameState(prev => ({
      ...prev,
      status: 'waiting',
    }));
  };

  return {
    gameState,
    messages,
    roomId,
    myColor,
    isHost,
    createRoom,
    joinRoom,
    makeMove,
    sendChatMessage,
    restartGame,
  };
};

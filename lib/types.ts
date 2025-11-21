export type Player = 'red' | 'yellow' | 'draw' | null;
export type GameBoard = Player[][];
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  board: GameBoard;
  currentPlayer: Player;
  winner: Player;
  status: GameStatus;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'opponent';
  timestamp: number;
}

export interface PeerMessage {
  type: 'move' | 'chat' | 'restart' | 'game-start';
  data?: any;
}

export const ROWS = 6;
export const COLS = 7;
export const EMPTY_CELL: Player = null;

export const createEmptyBoard = (): GameBoard => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY_CELL));
};

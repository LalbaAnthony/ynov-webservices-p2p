import { COLS, EMPTY_CELL, GameBoard, Player, ROWS } from './types';

export const canDropInColumn = (board: GameBoard, col: number): boolean => {
  return board[0][col] === EMPTY_CELL;
};

export const findLowestRow = (board: GameBoard, col: number): number => {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY_CELL) {
      return row;
    }
  }
  return -1;
};

export const dropPiece = (
  board: GameBoard,
  col: number,
  player: Player
): GameBoard => {
  const newBoard = board.map(row => [...row]);
  const row = findLowestRow(newBoard, col);

  if (row !== -1) {
    newBoard[row][col] = player;
  }

  return newBoard;
};

const checkHorizontal = (board: GameBoard, player: Player): boolean => {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row][col + 3] === player
      ) {
        return true;
      }
    }
  }
  return false;
};

const checkVertical = (board: GameBoard, player: Player): boolean => {
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - 4; row++) {
      if (
        board[row][col] === player &&
        board[row + 1][col] === player &&
        board[row + 2][col] === player &&
        board[row + 3][col] === player
      ) {
        return true;
      }
    }
  }
  return false;
};

const checkDiagonalAsc = (board: GameBoard, player: Player): boolean => {
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (
        board[row][col] === player &&
        board[row - 1][col + 1] === player &&
        board[row - 2][col + 2] === player &&
        board[row - 3][col + 3] === player
      ) {
        return true;
      }
    }
  }
  return false;
};

const checkDiagonalDesc = (board: GameBoard, player: Player): boolean => {
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col + 1] === player &&
        board[row + 2][col + 2] === player &&
        board[row + 3][col + 3] === player
      ) {
        return true;
      }
    }
  }
  return false;
};

export const checkWinner = (board: GameBoard, player: Player): boolean => {
  return (
    checkHorizontal(board, player) ||
    checkVertical(board, player) ||
    checkDiagonalAsc(board, player) ||
    checkDiagonalDesc(board, player)
  );
};

export const isBoardFull = (board: GameBoard): boolean => {
  return board[0].every(cell => cell !== EMPTY_CELL);
};

export const switchPlayer = (player: Player): Player => {
  return player === 'red' ? 'yellow' : 'red';
};

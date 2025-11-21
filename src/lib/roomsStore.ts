export type Room = {
  code: string;
  hostPeerId: string | null;
  players: string[];
  createdAt: number;
};

const rooms: Record<string, Room> = {};

export function createRoom(code: string): Room {
  rooms[code] = { code, hostPeerId: null, players: [], createdAt: Date.now() };
  return rooms[code];
}

export function getRoom(code: string): Room | null {
  return rooms[code] || null;
}

export function joinRoom(code: string, peerId: string): boolean {
  const room = rooms[code];
  if (!room || room.players.includes(peerId)) return false;
  room.players.push(peerId);
  return true;
}

export function setHost(code: string, peerId: string) {
  const room = rooms[code];
  if (room) room.hostPeerId = peerId;
}

export function deleteRoom(code: string) {
  delete rooms[code];
}

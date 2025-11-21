import { rateLimit } from "@/lib/rateLimit";
import { getRoom, joinRoom, setHost } from "@/lib/roomsStore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";

  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { code, peerId } = await req.json();
  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (!peerId) return NextResponse.json({ error: "No peerId" }, { status: 400 });

  const ok = joinRoom(code, peerId);
  if (!ok) return NextResponse.json({ error: "Cannot join" }, { status: 400 });

  if (!room.hostPeerId) setHost(code, peerId);

  return NextResponse.json({
    ok: true,
    host: room.hostPeerId,
    players: room.players,
  });
}

import { createRoom } from "@/lib/roomsStore";
import { NextResponse } from "next/server";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST() {
  const code = generateCode();
  createRoom(code);
  return NextResponse.json({ code });
}

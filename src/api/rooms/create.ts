import { rateLimit } from '@/lib/rateLimit';
import { createRoom } from '@/lib/roomsStore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';

  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  createRoom(code);

  return NextResponse.json({ code });
}

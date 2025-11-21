'use client';

import { useParams } from 'next/navigation';

export default function GameCode() {
  const { code } = useParams();

  return (
    <div>
      <h1>Game code: {code}</h1>
    </div>
  );
}

"use client";

import { useState } from "react";
import Mattrix from "../mattrix_component/mattrix";

type ComponentTemplateProps = {
  className?: string;
  id?: string;
  roomId?: string;
  nbPlayers?: number;
  nbSeconds?: number;
};

// Copie/colle ce composant pour démarrer un nouveau bloc UI (card + actions).
export default function ComponentTemplate({
  className = "",
  id = "",
  roomId = "",
  nbPlayers = 1,
  nbSeconds = 20,
}: ComponentTemplateProps) {
  const [active, setActive] = useState(false);

  const base = "w-full px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600";

  return (
    <div id={id || undefined} className={`${base} ${className}`.trim()}>
      <Mattrix
        rows={1}
        cols={4}
        renderCell={(r, c) => {
          if (r === 0 && c === 0) {
            return (
              <h1>Funny Phone</h1>
            );
          }
          if (r === 0 && c === 1) {
            return (
              <p>Room ID: {roomId}</p>
            );
          }
          if (r === 0 && c === 2) {
            return (
              <p>players: {nbPlayers}/9 </p>
            );
          }
          if (r === 0 && c === 3) {
            return (
              <p>time : {nbSeconds}</p>
            );
          }
          return null;
        }}
      />
    </div>
  );
}

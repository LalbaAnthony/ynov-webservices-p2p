import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";

export function usePeer() {
  const [peerId] = useState(() => "p-" + Math.random().toString(36).slice(2, 10));
  const peerRef = useRef<Peer | null>(null);
  const [connections, setConnections] = useState({});

  useEffect(() => {
    const peer = new Peer(peerId, {
      host: 'localhost',
      port: 9000,
      path: '/peerjs'
    });
    peerRef.current = peer;

    peer.on("connection", conn => {
      conn.on("data", d => console.log("data", d));
    });

    return () => peer.destroy();
  }, []);

  return { peerId, peer: peerRef.current };
}

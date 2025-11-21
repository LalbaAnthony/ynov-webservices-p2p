"use client";

import { FormEvent, useState } from "react";
import History from "../history_component/history";
import Chat from "../chat/chat";
import Image from "../image_drawed/image";
import Mattrix from "../mattrix_component/mattrix";

const defaultChats = [
  { id: "chat_1", text: "hello" },
  { id: "chat_2", text: "hello" },
  { id: "chat_3", text: "how are You?" },
  { id: "chat_4", text: "fine and You?" },
  { id: "chat_5", text: "fine" },
];

// Exemples d'items pouvant être affichés dans l'historique général.
const defaultItems = [
  <Image key="item_1" id="item_1" alt="Dessin exemple 1" />,
  <Chat key="item_2" id="chat_1" text="c'est un cheval qui fume un pétard" />,
  <Image key="item_3" id="item_3" alt="Dessin exemple 2" />,
];

type WaitroomProps = {
  className?: string;
  id?: string;
  items?: React.ReactNode[];
  initialChats?: { id: string; text: string }[];
};

// Composant plein écran (overlay) affichable depuis la page principale.
export default function Waitroom({
  className = "",
  id = "",
  items = defaultItems,
  initialChats = defaultChats,
}: WaitroomProps) {
  const [messages, setMessages] = useState(initialChats);
  const [draft, setDraft] = useState("");

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const nextId = `chat_${messages.length + 1}`;
    setMessages((prev) => [...prev, { id: nextId, text: draft.trim() }]);
    setDraft("");
  };

  return (
    <div
      id={id || undefined}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur p-6 ${className}`.trim()}
    >
      <div className="flex w-full max-w-6xl flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <Mattrix
          rows={1}
          cols={2}
          columnTemplate="60% 35%"
          renderCell={(r, c) => {
            if (r === 0 && c === 0) {
              return (
                <div id="party_history" className="h-full">
                  <History id="party_history" items={items} />
                </div>
              );
            }
            if (r === 0 && c === 1) {
              return (
                <div id="chats" className="h-full">
                  <History
                    id="chat_history"
                    className="bg-white dark:bg-zinc-900"
                    items={messages.map((item) => (
                      <Chat key={item.id} id={item.id} text={item.text} />
                    ))}
                  />
                  <form
                    id="chat_form"
                    className="mt-4 flex gap-2"
                    onSubmit={handleSend}
                  >
                    <input
                      id="chat_writer"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a message"
                      className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <button
                      id="send_chat_button"
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Send
                    </button>
                  </form>
                </div>
              );
            }
            return null;
          }}
        />
      </div>
    </div>
  );
}

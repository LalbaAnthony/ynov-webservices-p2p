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
  fullPage?: boolean;
  messages?: { id: string; text: string }[];
  onSendMessage?: (text: string) => void;
};

// Composant plein écran (overlay) affichable depuis la page principale.
export default function Waitroom({
  className = "",
  id = "",
  items = defaultItems,
  initialChats = defaultChats,
  fullPage = false,
  messages,
  onSendMessage,
}: WaitroomProps) {
  const [localMessages, setLocalMessages] = useState(initialChats);
  const [draft, setDraft] = useState("");

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    const nextId = `chat_${(messages ?? localMessages).length + 1}`;
    if (onSendMessage) {
      onSendMessage(text);
    } else {
      setLocalMessages((prev) => [...prev, { id: nextId, text }]);
    }
    setDraft("");
  };

  const containerClass = fullPage
    ? `flex min-h-screen w-full items-start justify-center bg-transparent p-0 ${className}`.trim()
    : `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur p-6 ${className}`.trim();

  const panelClass = fullPage
    ? "flex w-full flex-col border-0 bg-transparent p-0"
    : "flex w-full max-w-6xl flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900";

  const chatSource = messages ?? localMessages;

  return (
    <div id={id || undefined} className={containerClass}>
      <div className={panelClass}>
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
                  items={chatSource.map((item, idx) => (
                    <Chat key={item.id ?? idx} id={item.id} text={item.text} />
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

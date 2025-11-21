"use client";

import { FormEvent, useState } from "react";
import History from "../components/history/history";
import Chat from "../components/chat/chat";
import Image from "../components/image_drawed/image";

const chatList = [
    { id: "chat_1", text: "hello" },
    { id: "chat_2", text: "hello" },
    { id: "chat_3", text: "how are You?" },
    { id: "chat_4", text: "fine and You?" },
    { id: "chat_5", text: "fine" },
];

// Exemples d'items pouvant être affichés dans l'historique général.
const itemList = [
    <Image key="item_1" id="item_1" alt="Dessin exemple 1" />,
    <Chat key="item_2" id="chat_1" text="c'est un cheval qui fume un pétard" />,
    <Image key="item_3" id="item_3" alt="Dessin exemple 2" />,
];

export default function Home() {
    const [messages, setMessages] = useState(chatList);
    const [draft, setDraft] = useState("");

    const handleSend = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!draft.trim()) return;
        const nextId = `chat_${messages.length + 1}`;
        setMessages((prev) => [...prev, { id: nextId, text: draft.trim() }]);
        setDraft("");
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
            <header className="border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
                    <span className="text-lg font-semibold">funny phone</span>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
                <div id="party_history">
                    <History id="party_history" items={itemList} />
                </div>

                <div id="chats">
                    <History
                        id="chat_history"
                        className="bg-white dark:bg-zinc-900"
                        items={messages.map((item) => (
                            <Chat key={item.id} id={item.id} text={item.text} />
                        ))}
                    />
                    <form id="chat_form" className="mt-4 flex gap-2" onSubmit={handleSend}>
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
            </main>
        </div>
    );
}

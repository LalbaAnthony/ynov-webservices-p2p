import History from "./components/history/history";
import Chat from "./components/chat/chat";

const chatList = [
  { id: "chat_1", text: "hello" },
  { id: "chat_2", text: "hello" },
  { id: "chat_3", text: "how are You?" },
  { id: "chat_4", text: "fine and You?" },
  { id: "chat_5", text: "fine" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <span className="text-lg font-semibold">funny phone</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">hello world</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            Remplace ce texte par le contenu de ta page. Structure de base : header, main, footer.
          </p>
        </div>

        <History
          id="chats"
          className="bg-white dark:bg-zinc-900"
          items={chatList.map((item) => (
            <Chat key={item.id} id={item.id} text={item.text} />
          ))}
        />
      </main>

      <footer className="border-t border-zinc-200 bg-white/80 px-6 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
        <div className="mx-auto w-full max-w-4xl">footer</div>
      </footer>
    </div>
  );
}

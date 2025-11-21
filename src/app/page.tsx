import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <span className="text-lg font-semibold">funny phone</span>
          <Link
            href="/game"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Jouer
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-6 py-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome in Funny Phone</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300">
            click to the button for play
          </p>
          <Link
            href="/game"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Jouer
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white/80 px-6 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
        <div className="mx-auto w-full max-w-4xl">footer</div>
      </footer>
    </div>
  );
}

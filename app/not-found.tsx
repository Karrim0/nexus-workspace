import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/40 p-7 text-center sm:p-9">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-400">
          404
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          This page does not exist
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          The link may be outdated, or the project or task may no longer be
          available in your workspace.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Go to dashboard
          </Link>

          <Link
            href="/search"
            className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            Search workspace
          </Link>
        </div>
      </section>
    </main>
  );
}

export function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-800 px-5 sm:px-8">
      <div>
        <p className="text-sm text-zinc-500">Workspace</p>
        <h1 className="text-lg font-semibold text-white">Product Team</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 sm:block">
          Search
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-semibold text-white">
          KM
        </button>
      </div>
    </header>
  );
}

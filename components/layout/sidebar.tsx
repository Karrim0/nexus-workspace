const navigation = [
  { label: "Overview", active: true },
  { label: "Projects", active: false },
  { label: "My Tasks", active: false },
  { label: "Team", active: false },
  { label: "Activity", active: false },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 px-4 py-6 lg:flex lg:flex-col">
      <div className="px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-black">
            N
          </div>

          <div>
            <p className="font-semibold text-white">Nexus</p>
            <p className="text-xs text-zinc-500">Workspace</p>
          </div>
        </div>
      </div>

      <nav className="mt-10 space-y-1">
        {navigation.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              item.active
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-sm font-medium text-white">Nexus Pro</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Unlock advanced team analytics and automation.
        </p>
        <button className="mt-4 w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200">
          Upgrade
        </button>
      </div>
    </aside>
  );
}

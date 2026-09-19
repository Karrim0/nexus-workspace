"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Overview", shortLabel: "Home", href: "/dashboard", icon: "O" },
  { label: "Projects", shortLabel: "Projects", href: "/projects", icon: "P" },
  { label: "My Tasks", shortLabel: "Tasks", href: "/tasks", icon: "T" },
  { label: "Team", shortLabel: "Team", href: "/team", icon: "M" },
  { label: "Activity", shortLabel: "Activity", href: "/activity", icon: "A" },
  { label: "Insights", shortLabel: "Insights", href: "/insights", icon: "I" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
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

        <nav className="mt-10 space-y-1" aria-label="Workspace navigation">
          {navigation.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[10px] font-semibold ${
                    active
                      ? "border-zinc-600 bg-zinc-700 text-white"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500"
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-medium text-white">Nexus Workspace</p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Projects, tasks, team access, activity, and insights in one place.
          </p>
        </div>
      </aside>

      <nav
        aria-label="Mobile workspace navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-6">
          {navigation.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[10px] font-semibold ${
                    active
                      ? "border-zinc-600 bg-zinc-800 text-white"
                      : "border-zinc-800 text-zinc-500"
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span className="max-w-full truncate">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

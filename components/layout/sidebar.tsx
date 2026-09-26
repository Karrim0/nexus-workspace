"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const desktopNavigation = [
  { label: "Overview", href: "/dashboard", icon: "O" },
  { label: "Projects", href: "/projects", icon: "P" },
  { label: "My Tasks", href: "/tasks", icon: "T" },
  { label: "Inbox", href: "/inbox", icon: "I" },
  { label: "Team", href: "/team", icon: "M" },
  { label: "Activity", href: "/activity", icon: "A" },
  { label: "Insights", href: "/insights", icon: "N" },
];

const mobilePrimaryNavigation = [
  { label: "Home", href: "/dashboard", icon: "O" },
  { label: "Projects", href: "/projects", icon: "P" },
  { label: "Tasks", href: "/tasks", icon: "T" },
  { label: "Inbox", href: "/inbox", icon: "I" },
  { label: "Team", href: "/team", icon: "M" },
];

const mobileMoreNavigation = [
  {
    label: "Search",
    description: "Find projects, tasks, and people",
    href: "/search",
    icon: "S",
  },
  {
    label: "Activity",
    description: "Review recent workspace changes",
    href: "/activity",
    icon: "A",
  },
  {
    label: "Insights",
    description: "See workload and delivery health",
    href: "/insights",
    icon: "N",
  },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const moreActive = mobileMoreNavigation.some((item) =>
    isActivePath(pathname, item.href)
  );

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
          {desktopNavigation.map((item) => {
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
            Projects, tasks, inbox, team access, activity, and insights in one
            place.
          </p>
        </div>
      </aside>

      {moreOpen ? (
        <>
          <button
            type="button"
            aria-label="Close more navigation"
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] lg:hidden"
            onClick={() => setMoreOpen(false)}
          />

          <section
            aria-label="More workspace navigation"
            className="fixed inset-x-3 bottom-20 z-40 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between px-2 py-2">
              <div>
                <p className="text-sm font-semibold text-white">More</p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  Search, activity, and workspace insights
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-2 grid gap-2">
              {mobileMoreNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                      active
                        ? "border-zinc-700 bg-zinc-900 text-white"
                        : "border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/60 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[10px] font-semibold ${
                        active
                          ? "border-zinc-600 bg-zinc-800 text-white"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500"
                      }`}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-600">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      <nav
        aria-label="Mobile workspace navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-6">
          {mobilePrimaryNavigation.map((item) => {
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

                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            aria-expanded={moreOpen}
            aria-label="More workspace navigation"
            onClick={() => setMoreOpen((open) => !open)}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition ${
              moreActive || moreOpen
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm leading-none ${
                moreActive || moreOpen
                  ? "border-zinc-600 bg-zinc-800 text-white"
                  : "border-zinc-800 text-zinc-500"
              }`}
              aria-hidden="true"
            >
              ···
            </span>

            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}

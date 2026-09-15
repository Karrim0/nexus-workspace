"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserMenuProps = {
  user: {
    name: string;
    email: string;
    initials: string;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex h-10 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-2 pr-3 text-sm text-white transition hover:border-zinc-700 hover:bg-zinc-800"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
          {user.initials}
        </span>

        <span className="hidden max-w-28 truncate text-xs font-medium sm:block">
          {user.name}
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="border-b border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                  {user.initials}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:cursor-wait disabled:opacity-50"
              >
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

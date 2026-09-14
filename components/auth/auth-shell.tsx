import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLinkLabel,
}: Props) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden border-r border-zinc-900 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex w-fit items-center gap-3 text-sm font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">N</span>
            Nexus Workspace
          </Link>

          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-600">
              Plan. Ship. Improve.
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">
              One workspace for projects, tasks, people, and progress.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-500">
              Keep the team aligned with a focused workspace that connects execution,
              ownership, and activity in one place.
            </p>
          </div>

          <p className="text-xs text-zinc-700">Built for focused product teams.</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex w-fit items-center gap-3 text-sm font-semibold lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">N</span>
              Nexus Workspace
            </Link>

            <p className="text-sm font-medium text-zinc-500">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-center text-sm text-zinc-600">
              {footerText}{" "}
              <Link href={footerHref} className="font-medium text-zinc-300 transition hover:text-white">
                {footerLinkLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

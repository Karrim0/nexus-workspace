import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";

export const dynamic = "force-dynamic";

export default async function AccessDeniedPage() {
  const [user, access] = await Promise.all([
    getCurrentUser(),
    getCurrentWorkspaceAccess(),
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/40 p-7 sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-900/50 bg-amber-950/30 text-lg text-amber-300">
          !
        </div>

        <p className="mt-6 text-sm font-medium text-zinc-500">
          Nexus Workspace
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Workspace access required
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          {user
            ? `${user.name}, your account is authenticated, but it does not currently have an active membership in this workspace.`
            : "You need to sign in before accessing a workspace."}
        </p>

        {access ? (
          <div className="mt-6 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-sm text-emerald-300">
            Your workspace access is active. Return to the dashboard to continue.
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Try dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/"
            className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}

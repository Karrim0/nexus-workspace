import Link from "next/link";

type WorkspaceAccessRequiredProps = {
  title?: string;
  description?: string;
};

export function WorkspaceAccessRequired({
  title = "Workspace setup required",
  description = "Your account is signed in, but it does not have an active workspace yet.",
}: WorkspaceAccessRequiredProps) {
  return (
    <section className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6">
      <p className="text-sm font-semibold text-amber-300">{title}</p>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/onboarding"
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Create workspace
        </Link>

        <Link
          href="/access-denied"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
        >
          View access details
        </Link>
      </div>
    </section>
  );
}

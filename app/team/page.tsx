import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { getWorkspaceMembers } from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const members = await getWorkspaceMembers();

  const activeMembers = members.filter(
    (member) => member.status === "Active"
  ).length;

  const invitedMembers = members.filter(
    (member) => member.status === "Invited"
  ).length;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Workspace</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                  Team
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Manage the people working across your workspace.
                </p>
              </div>

              <InviteMemberDialog />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Total members</p>
                <p className="mt-3 text-3xl font-semibold">{members.length}</p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Active</p>
                <p className="mt-3 text-3xl font-semibold">{activeMembers}</p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Invited</p>
                <p className="mt-3 text-3xl font-semibold">{invitedMembers}</p>
              </article>
            </div>

            <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h3 className="font-semibold">Workspace members</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  People with access to Product Team
                </p>
              </div>

              <div className="divide-y divide-zinc-800">
                {members.map((member) => (
                  <article
                    key={member.id}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {member.initials}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium">{member.name}</p>
                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                        {member.role}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          member.status === "Active"
                            ? "bg-emerald-950/40 text-emerald-300"
                            : "bg-amber-950/40 text-amber-300"
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { MemberActions } from "@/components/team/member-actions";
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
                  Invite people and manage workspace access from one place.
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
                    className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {member.initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{member.name}</p>

                          {member.id === "member-kareem" ? (
                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                              Owner
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                      <div className="flex flex-wrap items-center gap-3">
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

                      <MemberActions
                        member={{
                          id: member.id,
                          name: member.name,
                          role: member.role,
                          status: member.status,
                        }}
                      />
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

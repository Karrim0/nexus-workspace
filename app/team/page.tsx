import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { MemberActions } from "@/components/team/member-actions";
import {
  canManageWorkspaceMembers,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { filterAndSortTeamMembers } from "@/lib/team-member-filters";
import { getWorkspaceMembers } from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    sort?: string;
  }>;
};

export default async function TeamPage({
  searchParams,
}: TeamPageProps) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="flex min-h-screen">
          <Sidebar />

          <section className="min-w-0 flex-1">
            <Topbar />

            <div className="px-5 py-8 pb-28 sm:px-8 lg:pb-8">
              <WorkspaceAccessRequired />
            </div>
          </section>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const members = await getWorkspaceMembers(access.workspaceId);

  const filteredMembers = filterAndSortTeamMembers(members, {
    query: params.q,
    role: params.role,
    status: params.status,
    sort: params.sort,
  });

  const canManageMembers = canManageWorkspaceMembers(access);

  const activeMembers = members.filter(
    (member) => member.status.toLowerCase() === "active"
  ).length;

  const invitedMembers = members.filter(
    (member) => member.status.toLowerCase() === "invited"
  ).length;

  const roles = Array.from(
    new Set(members.map((member) => member.role))
  ).sort((a, b) => a.localeCompare(b));

  const statuses = Array.from(
    new Set(members.map((member) => member.status))
  ).sort((a, b) => a.localeCompare(b));

  const filtersActive = Boolean(
    params.q?.trim() ||
      (params.role && params.role !== "all") ||
      (params.status && params.status !== "all") ||
      (params.sort && params.sort !== "name")
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 pb-28 sm:px-8 lg:pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Workspace
                </p>

                <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                  Team
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Invite people and manage workspace access from one place.
                </p>
              </div>

              {canManageMembers ? <InviteMemberDialog /> : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-400">
                Signed in as {access.user.name}
              </span>

              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium capitalize text-zinc-300">
                {access.role}
              </span>

              {!canManageMembers ? (
                <span className="text-zinc-600">
                  Member management is read-only for your role.
                </span>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Total members</p>
                <p className="mt-3 text-3xl font-semibold">
                  {members.length}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Active</p>
                <p className="mt-3 text-3xl font-semibold">
                  {activeMembers}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Invited</p>
                <p className="mt-3 text-3xl font-semibold">
                  {invitedMembers}
                </p>
              </article>
            </div>

            <form
              action="/team"
              method="get"
              className="mt-7 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 md:grid-cols-[1.3fr_0.75fr_0.75fr_0.8fr_auto]"
            >
              <div>
                <label
                  htmlFor="team-query"
                  className="text-xs font-medium text-zinc-500"
                >
                  Search
                </label>

                <input
                  id="team-query"
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ""}
                  placeholder="Name or email..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="team-role"
                  className="text-xs font-medium text-zinc-500"
                >
                  Role
                </label>

                <select
                  id="team-role"
                  name="role"
                  defaultValue={params.role ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All roles</option>

                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="team-status"
                  className="text-xs font-medium text-zinc-500"
                >
                  Status
                </label>

                <select
                  id="team-status"
                  name="status"
                  defaultValue={params.status ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All statuses</option>

                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="team-sort"
                  className="text-xs font-medium text-zinc-500"
                >
                  Sort
                </label>

                <select
                  id="team-sort"
                  name="sort"
                  defaultValue={params.sort ?? "name"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="name">Name</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Apply
                </button>

                {filtersActive ? (
                  <Link
                    href="/team"
                    className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Reset
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs text-zinc-600">
              <span>
                Showing {filteredMembers.length} of {members.length} members
              </span>

              {filtersActive ? <span>Filtered view</span> : null}
            </div>

            <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h3 className="font-semibold">Workspace members</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  People with access to {access.workspaceName}
                </p>
              </div>

              <div className="divide-y divide-zinc-800">
                {filteredMembers.map((member) => {
                  const isOwner =
                    member.role.trim().toLowerCase() === "owner";

                  return (
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

                            {isOwner ? (
                              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                                Owner
                              </span>
                            ) : null}

                            {member.id === access.user.id ? (
                              <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                                You
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
                              member.status.toLowerCase() === "active"
                                ? "bg-emerald-950/40 text-emerald-300"
                                : "bg-amber-950/40 text-amber-300"
                            }`}
                          >
                            {member.status}
                          </span>
                        </div>

                        <MemberActions
                          canManage={canManageMembers}
                          member={{
                            id: member.id,
                            name: member.name,
                            role: member.role,
                            status: member.status,
                          }}
                        />
                      </div>
                    </article>
                  );
                })}

                {filteredMembers.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-zinc-400">
                      No members match these filters
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Reset the filters or try another name, email, role, or status.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

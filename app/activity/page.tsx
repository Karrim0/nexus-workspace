import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { filterAndSortActivity } from "@/lib/activity-filters";
import {
  getWorkspaceActivity,
  getWorkspaceMembers,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type ActivityPageProps = {
  searchParams: Promise<{
    q?: string;
    member?: string;
    range?: string;
    sort?: string;
  }>;
};

export default async function ActivityPage({
  searchParams,
}: ActivityPageProps) {
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

  const [activities, members] = await Promise.all([
    getWorkspaceActivity(access.workspaceId),
    getWorkspaceMembers(access.workspaceId),
  ]);

  const visibleActivities = filterAndSortActivity(activities, {
    query: params.q,
    memberId: params.member,
    range: params.range,
    sort: params.sort,
  });

  const visibleContributors = new Set(
    visibleActivities
      .map((activity) => activity.memberId)
      .filter(Boolean)
  ).size;

  const myVisibleActions = visibleActivities.filter(
    (activity) => activity.memberId === access.user.id
  ).length;

  const filtersActive = Boolean(
    params.q?.trim() ||
      (params.member && params.member !== "all") ||
      (params.range && params.range !== "all") ||
      (params.sort && params.sort !== "newest")
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 pb-28 sm:px-8 lg:pb-8">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Workspace
              </p>

              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Activity
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                <span>
                  Search and review recent activity across {access.workspaceName}.
                </span>

                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium capitalize text-zinc-400">
                  {access.role}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Visible events</p>
                <p className="mt-3 text-3xl font-semibold">
                  {visibleActivities.length}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  {activities.length} total workspace events
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Contributors</p>
                <p className="mt-3 text-3xl font-semibold">
                  {visibleContributors}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  In the current result set
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Your actions</p>
                <p className="mt-3 text-3xl font-semibold">
                  {myVisibleActions}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  Matching the current filters
                </p>
              </article>
            </div>

            <form
              action="/activity"
              method="get"
              className="mt-7 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 md:grid-cols-[1.3fr_0.9fr_0.8fr_0.8fr_auto]"
            >
              <div>
                <label
                  htmlFor="activity-query"
                  className="text-xs font-medium text-zinc-500"
                >
                  Search
                </label>

                <input
                  id="activity-query"
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ""}
                  placeholder="Action text..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="activity-member"
                  className="text-xs font-medium text-zinc-500"
                >
                  Member
                </label>

                <select
                  id="activity-member"
                  name="member"
                  defaultValue={params.member ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All members</option>

                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="activity-range"
                  className="text-xs font-medium text-zinc-500"
                >
                  Time range
                </label>

                <select
                  id="activity-range"
                  name="range"
                  defaultValue={params.range ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All time</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="activity-sort"
                  className="text-xs font-medium text-zinc-500"
                >
                  Sort
                </label>

                <select
                  id="activity-sort"
                  name="sort"
                  defaultValue={params.sort ?? "newest"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
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
                    href="/activity"
                    className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Reset
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs text-zinc-600">
              <span>
                Showing {visibleActivities.length} of {activities.length} events
              </span>

              {filtersActive ? <span>Filtered view</span> : null}
            </div>

            <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h3 className="font-semibold">Recent Activity</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Latest actions from workspace members
                </p>
              </div>

              <div className="divide-y divide-zinc-800">
                {visibleActivities.map((activity) => {
                  const member = members.find(
                    (item) => item.id === activity.memberId
                  );

                  const isCurrentUser =
                    activity.memberId === access.user.id;

                  return (
                    <article
                      key={activity.id}
                      className="flex gap-4 px-5 py-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {member?.initials ?? "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm leading-6 text-zinc-300">
                            <span className="font-medium text-white">
                              {member?.name ?? "System"}
                            </span>{" "}
                            {activity.message}
                          </p>

                          {isCurrentUser ? (
                            <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                              You
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <span>{member?.role ?? "Workspace event"}</span>
                          <span>•</span>
                          <span>
                            {new Date(activity.occurredAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {visibleActivities.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-zinc-400">
                      No activity matches these filters
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Reset the filters or try a different member, phrase, or
                      time range.
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

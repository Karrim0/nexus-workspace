import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  getWorkspaceActivity,
  getWorkspaceMembers,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const [activities, members] = await Promise.all([
    getWorkspaceActivity(),
    getWorkspaceMembers(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 sm:px-8">
            <div>
              <p className="text-sm font-medium text-zinc-500">Workspace</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Activity
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Follow recent updates stored in PostgreSQL.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Recent events</p>
                <p className="mt-3 text-3xl font-semibold">
                  {activities.length}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Contributors</p>
                <p className="mt-3 text-3xl font-semibold">
                  {
                    new Set(
                      activities
                        .map((activity) => activity.memberId)
                        .filter(Boolean)
                    ).size
                  }
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Workspace status</p>
                <p className="mt-3 text-xl font-semibold">Active</p>
              </article>
            </div>

            <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h3 className="font-semibold">Recent Activity</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Latest actions from workspace members
                </p>
              </div>

              <div className="divide-y divide-zinc-800">
                {activities.map((activity) => {
                  const member = members.find(
                    (item) => item.id === activity.memberId
                  );

                  return (
                    <article key={activity.id} className="flex gap-4 px-5 py-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {member?.initials ?? "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-6 text-zinc-300">
                          <span className="font-medium text-white">
                            {member?.name ?? "System"}
                          </span>{" "}
                          {activity.message}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <span>{member?.role ?? "Workspace event"}</span>
                          <span>•</span>
                          <span>
                            {new Date(activity.occurredAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

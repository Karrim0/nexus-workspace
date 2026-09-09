import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  activities,
  getMemberById,
} from "@/lib/workspace-data";

export default function ActivityPage() {
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
                  Activity
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Follow recent updates and changes across your workspace.
                </p>
              </div>

              <button className="w-fit rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900">
                Export activity
              </button>
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
                  {new Set(activities.map((activity) => activity.memberId)).size}
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
                  const member = getMemberById(activity.memberId);

                  return (
                    <article
                      key={activity.id}
                      className="flex gap-4 px-5 py-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {member?.initials ?? "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-6 text-zinc-300">
                          <span className="font-medium text-white">
                            {member?.name ?? "Unknown member"}
                          </span>{" "}
                          {activity.message}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <span>{member?.role ?? "Workspace member"}</span>
                          <span>•</span>
                          <span>{activity.occurredAt}</span>
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

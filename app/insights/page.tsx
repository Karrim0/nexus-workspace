import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { buildWorkspaceInsights } from "@/lib/workspace-insights";
import {
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="flex min-h-screen">
          <Sidebar />

          <section className="min-w-0 flex-1">
            <Topbar />

            <div className="px-5 py-8 sm:px-8">
              <WorkspaceAccessRequired />
            </div>
          </section>
        </div>
      </main>
    );
  }

  const [projects, tasks, members] = await Promise.all([
    getWorkspaceProjects(),
    getWorkspaceTasks(),
    getWorkspaceMembers(),
  ]);

  const insights = buildWorkspaceInsights({
    projects,
    tasks,
    members,
  });

  const maxStatusCount = Math.max(
    1,
    ...insights.statusDistribution.map((item) => item.count)
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
                Insights
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                <span>
                  A live operational view of projects, delivery, and workload.
                </span>

                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium capitalize text-zinc-400">
                  {access.role}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Completion rate</p>
                <p className="mt-3 text-3xl font-semibold">
                  {insights.summary.completionRate}%
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  {insights.summary.completedTasks} of{" "}
                  {insights.summary.totalTasks} tasks completed
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Active projects</p>
                <p className="mt-3 text-3xl font-semibold">
                  {insights.summary.activeProjects}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  Current delivery initiatives
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Overdue tasks</p>
                <p className="mt-3 text-3xl font-semibold">
                  {insights.summary.overdueTasks}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  Open tasks past their due date
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Active members</p>
                <p className="mt-3 text-3xl font-semibold">
                  {insights.summary.activeMembers}
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  People currently active in the workspace
                </p>
              </article>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <p className="text-sm text-zinc-500">
                  High-priority open
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  {insights.summary.highPriorityOpenTasks}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <p className="text-sm text-zinc-500">Open tasks</p>
                <p className="mt-3 text-2xl font-semibold">
                  {insights.summary.openTasks}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <p className="text-sm text-zinc-500">Unassigned tasks</p>
                <p className="mt-3 text-2xl font-semibold">
                  {insights.summary.unassignedTasks}
                </p>
              </article>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <h3 className="font-semibold">Workflow distribution</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Current tasks across the delivery pipeline
                </p>

                <div className="mt-6 space-y-5">
                  {insights.statusDistribution.map((item) => {
                    const width =
                      (item.count / maxStatusCount) * 100;

                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400">
                            {item.status}
                          </span>
                          <span className="font-medium text-white">
                            {item.count}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-white"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <h3 className="font-semibold">Team workload</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Open, completed, and overdue tasks by active member
                  </p>
                </div>

                <div className="divide-y divide-zinc-800">
                  {insights.workload.map((member) => {
                    const workloadWidth =
                      (member.open / insights.maxOpenWorkload) * 100;

                    return (
                      <article
                        key={member.id}
                        className="px-5 py-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                              {member.initials}
                            </div>

                            <div>
                              <p className="text-sm font-medium">
                                {member.name}
                              </p>
                              <p className="mt-1 text-xs text-zinc-600">
                                {member.assigned} assigned ·{" "}
                                {member.completed} completed
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-zinc-400">
                              {member.open} open
                            </span>

                            {member.overdue > 0 ? (
                              <span className="rounded-full border border-red-950 bg-red-950/20 px-2.5 py-1 text-red-400">
                                {member.overdue} overdue
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-white"
                            style={{ width: `${workloadWidth}%` }}
                          />
                        </div>
                      </article>
                    );
                  })}

                  {insights.workload.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-zinc-600">
                      No active members to analyze yet.
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

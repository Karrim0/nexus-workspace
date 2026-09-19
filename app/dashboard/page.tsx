import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import {
  canManageProjects,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import {
  getWorkspaceActivity,
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  const [projects, tasks, members, activities] = await Promise.all([
    getWorkspaceProjects(),
    getWorkspaceTasks(),
    getWorkspaceMembers(),
    getWorkspaceActivity(),
  ]);

  const activeProjects = projects.filter(
    (project) => project.status !== "Completed"
  );

  const openTasks = tasks.filter((task) => task.status !== "Done");

  const activeMembers = members.filter(
    (member) => member.status === "Active"
  );

  const myOpenTasks = tasks.filter(
    (task) =>
      task.assigneeId === access.user.id &&
      task.status !== "Done"
  );

  const totalCompletedTasks = projects.reduce(
    (sum, project) => sum + project.completedTasks,
    0
  );

  const totalTasks = projects.reduce(
    (sum, project) => sum + project.totalTasks,
    0
  );

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round((totalCompletedTasks / totalTasks) * 100);

  const stats = [
    {
      label: "Active Projects",
      value: String(activeProjects.length).padStart(2, "0"),
      detail: `${projects.length} total projects`,
    },
    {
      label: "Open Tasks",
      value: String(openTasks.length).padStart(2, "0"),
      detail: `${myOpenTasks.length} assigned to you`,
    },
    {
      label: "Team Members",
      value: String(activeMembers.length).padStart(2, "0"),
      detail: `${members.length} total members`,
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      detail: `${totalCompletedTasks} tasks completed`,
    },
  ];

  const canCreateProject = canManageProjects(access);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Dashboard
                </p>

                <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                  Good to see you, {access.user.name.split(" ")[0]}.
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>Live workspace data from PostgreSQL.</span>

                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium capitalize text-zinc-400">
                    {access.role}
                  </span>
                </div>
              </div>

              {canCreateProject ? (
                <Link
                  href="/projects"
                  className="w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  + New Project
                </Link>
              ) : (
                <Link
                  href="/tasks"
                  className="w-fit rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                >
                  View My Tasks
                </Link>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
                >
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-2 text-xs text-zinc-500">{stat.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <h3 className="font-semibold">Active Projects</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Current team progress
                  </p>
                </div>

                <div className="divide-y divide-zinc-800">
                  {activeProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {project.completedTasks} / {project.totalTasks} tasks
                          </p>
                        </div>

                        <span className="text-sm font-medium text-zinc-300">
                          {project.progress}%
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {activeProjects.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-zinc-600">
                      No active projects yet.
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <h3 className="font-semibold">Recent Activity</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Latest workspace updates
                </p>

                <div className="mt-6 space-y-5">
                  {activities.slice(0, 5).map((activity) => {
                    const member = members.find(
                      (item) => item.id === activity.memberId
                    );

                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                          {member?.initials ?? "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm text-zinc-300">
                            <span className="font-medium text-white">
                              {member?.name ?? "System"}
                            </span>{" "}
                            {activity.message}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {new Date(activity.occurredAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {activities.length === 0 ? (
                    <p className="text-sm text-zinc-600">
                      No workspace activity yet.
                    </p>
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

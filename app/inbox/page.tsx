import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { buildWorkspaceInbox } from "@/lib/workspace-inbox";
import {
  getWorkspaceActivity,
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

function formatDueDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function InboxPage() {
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

  const [tasks, activity, projects, members] = await Promise.all([
    getWorkspaceTasks(access.workspaceId),
    getWorkspaceActivity(access.workspaceId),
    getWorkspaceProjects(access.workspaceId),
    getWorkspaceMembers(access.workspaceId),
  ]);

  const inbox = buildWorkspaceInbox({
    tasks,
    activity,
    currentUserId: access.user.id,
  });

  const projectById = new Map(
    projects.map((project) => [project.id, project.name])
  );

  const memberById = new Map(
    members.map((member) => [member.id, member])
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
                {access.workspaceName}
              </p>

              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Inbox
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Your current delivery pressure and the latest workspace updates.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Open assigned</p>
                <p className="mt-3 text-3xl font-semibold">
                  {inbox.summary.openAssigned}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Overdue</p>
                <p className="mt-3 text-3xl font-semibold">
                  {inbox.summary.overdue}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Due in 7 days</p>
                <p className="mt-3 text-3xl font-semibold">
                  {inbox.summary.dueSoon}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">High priority</p>
                <p className="mt-3 text-3xl font-semibold">
                  {inbox.summary.highPriority}
                </p>
              </article>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <h3 className="font-semibold">Needs your attention</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Overdue and upcoming work assigned to you
                  </p>
                </div>

                <div className="divide-y divide-zinc-800">
                  {[...inbox.overdue, ...inbox.dueSoon]
                    .filter(
                      (task, index, all) =>
                        all.findIndex((item) => item.id === task.id) === index
                    )
                    .slice(0, 10)
                    .map((task) => {
                      const overdue = inbox.overdue.some(
                        (item) => item.id === task.id
                      );

                      return (
                        <Link
                          key={task.id}
                          href={`/tasks/${task.id}`}
                          className="flex flex-col gap-3 px-5 py-5 transition hover:bg-zinc-900/60 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {task.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-600">
                              {projectById.get(task.projectId) ?? "Unknown project"}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {overdue ? (
                              <span className="rounded-full border border-red-950 bg-red-950/30 px-2.5 py-1 text-red-400">
                                Overdue
                              </span>
                            ) : (
                              <span className="rounded-full border border-amber-950 bg-amber-950/30 px-2.5 py-1 text-amber-300">
                                Due soon
                              </span>
                            )}

                            <span className="text-zinc-600">
                              {formatDueDate(task.dueDate)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}

                  {inbox.overdue.length === 0 &&
                  inbox.dueSoon.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <p className="text-sm font-medium text-zinc-400">
                        You are clear for now
                      </p>
                      <p className="mt-2 text-xs text-zinc-600">
                        No overdue or due-soon work is assigned to you.
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Recent updates</h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Latest workspace activity
                      </p>
                    </div>

                    <Link
                      href="/activity"
                      className="text-xs font-medium text-zinc-500 transition hover:text-white"
                    >
                      View all →
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-zinc-800">
                  {inbox.recentActivity.map((item) => {
                    const member = item.memberId
                      ? memberById.get(item.memberId)
                      : null;

                    return (
                      <article
                        key={item.id}
                        className="flex gap-3 px-5 py-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold">
                          {member?.initials ?? "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm leading-6 text-zinc-300">
                            <span className="font-medium text-white">
                              {member?.name ?? "System"}
                            </span>{" "}
                            {item.message}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {formatActivityDate(item.occurredAt)}
                          </p>
                        </div>
                      </article>
                    );
                  })}

                  {inbox.recentActivity.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-zinc-600">
                      No workspace activity yet.
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

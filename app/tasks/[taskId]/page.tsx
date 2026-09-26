import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { TaskCommentForm } from "@/components/tasks/task-comment-form";
import { TaskCommentItem } from "@/components/tasks/task-comment-item";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { getWorkspaceTaskById } from "@/lib/workspace-repository";
import { getWorkspaceTaskComments } from "@/lib/task-comments";

export const dynamic = "force-dynamic";

type TaskDetailsPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function dueState(dueDate: string | null, status: string) {
  if (!dueDate) {
    return null;
  }

  const due = new Date(dueDate);
  const now = new Date();

  if (status !== "Done" && due.getTime() < now.getTime()) {
    return "Overdue";
  }

  return null;
}

export default async function TaskDetailsPage({
  params,
}: TaskDetailsPageProps) {
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

  const { taskId } = await params;

  const [task, comments] = await Promise.all([
    getWorkspaceTaskById(taskId, access.workspaceId),
    getWorkspaceTaskComments(taskId, access.workspaceId),
  ]);

  if (!task || !comments) {
    notFound();
  }

  const overdue = dueState(task.dueDate, task.status);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 pb-28 sm:px-8 lg:pb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <Link
                  href="/tasks"
                  className="text-sm font-medium text-zinc-500 transition hover:text-white"
                >
                  ← Back to tasks
                </Link>

                <p className="mt-6 text-sm font-medium text-zinc-500">
                  {task.project.name}
                </p>

                <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  {task.title}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                    {task.status}
                  </span>

                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
                    {task.priority} priority
                  </span>

                  {overdue ? (
                    <span className="rounded-full border border-red-950 bg-red-950/30 px-3 py-1 text-xs text-red-400">
                      {overdue}
                    </span>
                  ) : null}
                </div>
              </div>

              <Link
                href={`/projects/${task.project.id}`}
                className="shrink-0 rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                Open project
              </Link>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
                  <div className="border-b border-zinc-800 px-5 py-4">
                    <h3 className="font-semibold">Task overview</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Delivery context and ownership
                    </p>
                  </div>

                  <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
                    <div className="bg-zinc-950 p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                        Project
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {task.project.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {task.project.status}
                      </p>
                    </div>

                    <div className="bg-zinc-950 p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                        Assignee
                      </p>

                      {task.assignee ? (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                            {task.assignee.initials}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {task.assignee.name}
                            </p>
                            <p className="truncate text-xs text-zinc-600">
                              {task.assignee.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-zinc-500">
                          Unassigned
                        </p>
                      )}
                    </div>

                    <div className="bg-zinc-950 p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                        Due date
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {formatDate(task.dueDate)}
                      </p>
                      {overdue ? (
                        <p className="mt-1 text-xs text-red-400">
                          This task is past its due date.
                        </p>
                      ) : null}
                    </div>

                    <div className="bg-zinc-950 p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                        Priority
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {task.priority}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                  <div className="border-b border-zinc-800 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">Comments</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          Task discussion and delivery updates
                        </p>
                      </div>

                      <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                        {comments.length}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-zinc-800">
                    {comments.map((comment) => (
                      <TaskCommentItem
                        key={comment.id}
                        taskId={task.id}
                        comment={{
                          id: comment.id,
                          body: comment.body,
                          authorName: comment.author.name,
                          authorInitials: comment.author.initials,
                          createdLabel: formatDateTime(
                            comment.createdAt
                          ),
                          edited:
                            comment.updatedAt !==
                            comment.createdAt,
                          isOwn:
                            comment.author.id ===
                            access.user.id,
                        }}
                      />
                    ))}

                    {comments.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <p className="text-sm font-medium text-zinc-400">
                          No comments yet
                        </p>
                        <p className="mt-2 text-xs text-zinc-600">
                          Start the task discussion with the first update.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <TaskCommentForm taskId={task.id} />
                </section>
              </div>

              <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <h3 className="font-semibold">Metadata</h3>

                <dl className="mt-5 space-y-5">
                  <div>
                    <dt className="text-xs text-zinc-600">Task ID</dt>
                    <dd className="mt-1 break-all text-sm text-zinc-400">
                      {task.id}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-zinc-600">Created</dt>
                    <dd className="mt-1 text-sm text-zinc-400">
                      {formatDateTime(task.createdAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-zinc-600">Last updated</dt>
                    <dd className="mt-1 text-sm text-zinc-400">
                      {formatDateTime(task.updatedAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-zinc-600">Workspace</dt>
                    <dd className="mt-1 text-sm text-zinc-400">
                      {access.workspaceName}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

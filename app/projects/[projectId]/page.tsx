import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getWorkspaceProjectById } from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type ProjectDetailsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { projectId } = await params;
  const project = await getWorkspaceProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 sm:px-8">
            <Link
              href="/projects"
              className="text-sm font-medium text-zinc-500 transition hover:text-white"
            >
              ← Back to projects
            </Link>

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {project.name}
                  </h1>

                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                    {project.status}
                  </span>
                </div>

                <p className="mt-3 leading-7 text-zinc-500">
                  {project.description}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Project progress
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {project.progress}%
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Total tasks</p>
                <p className="mt-3 text-3xl font-semibold">
                  {project.totalTasks}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="mt-3 text-3xl font-semibold">
                  {project.completedTasks}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Members</p>
                <p className="mt-3 text-3xl font-semibold">
                  {project.members.length}
                </p>
              </article>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
              <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <h2 className="font-semibold">Project tasks</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Work connected to this project
                  </p>
                </div>

                <div className="divide-y divide-zinc-800">
                  {project.tasks.map((task) => (
                    <article
                      key={task.id}
                      className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{task.title}</p>
                          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
                            {task.priority}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-zinc-600">
                          {task.dueDate
                            ? `Due ${new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`
                            : "No due date"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                          {task.status}
                        </span>

                        <div
                          title={task.assignee?.name}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold"
                        >
                          {task.assignee?.initials ?? "?"}
                        </div>
                      </div>
                    </article>
                  ))}

                  {project.tasks.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-zinc-600">
                      No tasks have been added to this project yet.
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <h2 className="font-semibold">Project team</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Members assigned to this project
                </p>

                <div className="mt-6 space-y-4">
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {member.initials}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="truncate text-xs text-zinc-600">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

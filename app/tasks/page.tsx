import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import {
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

const columns = ["Todo", "In Progress", "Review", "Done"] as const;

export default async function TasksPage() {
  const [tasks, projects, members] = await Promise.all([
    getWorkspaceTasks(),
    getWorkspaceProjects(),
    getWorkspaceMembers(),
  ]);

  const assignedTasks = tasks.filter(
    (task) => task.assigneeId === "member-kareem"
  );

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
                  My Tasks
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Create tasks and move them through the workflow in real time.
                </p>
              </div>

              <NewTaskDialog
                projects={projects.map((project) => ({
                  id: project.id,
                  name: project.name,
                }))}
                members={members.map((member) => ({
                  id: member.id,
                  name: member.name,
                  initials: member.initials,
                }))}
              />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Assigned to me</p>
                <p className="mt-3 text-3xl font-semibold">
                  {assignedTasks.length}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">In progress</p>
                <p className="mt-3 text-3xl font-semibold">
                  {
                    assignedTasks.filter(
                      (task) => task.status === "In Progress"
                    ).length
                  }
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="mt-3 text-3xl font-semibold">
                  {
                    assignedTasks.filter((task) => task.status === "Done")
                      .length
                  }
                </p>
              </article>
            </div>

            <div className="mt-8 overflow-x-auto pb-4">
              <div className="grid min-w-[1180px] grid-cols-4 gap-5">
                {columns.map((column) => {
                  const columnTasks = assignedTasks.filter(
                    (task) => task.status === column
                  );

                  return (
                    <section
                      key={column}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{column}</h3>
                        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {columnTasks.map((task) => {
                          const project = projects.find(
                            (item) => item.id === task.projectId
                          );
                          const assignee = members.find(
                            (item) => item.id === task.assigneeId
                          );

                          return (
                            <TaskCard
                              key={task.id}
                              task={{
                                id: task.id,
                                title: task.title,
                                priority: task.priority,
                                status: task.status,
                                dueDate: task.dueDate,
                              }}
                              projectName={project?.name ?? "Unknown project"}
                              assigneeName={assignee?.name}
                              assigneeInitials={assignee?.initials}
                            />
                          );
                        })}

                        {columnTasks.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-xs text-zinc-600">
                            No tasks here
                          </div>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

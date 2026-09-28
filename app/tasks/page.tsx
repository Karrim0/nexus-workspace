import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { SavedTaskViews } from "@/components/tasks/saved-task-views";
import { TaskBoard } from "@/components/tasks/task-board";
import {
  canManageAllTasks,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { filterAndSortTasks } from "@/lib/task-filters";
import { normalizeSavedTaskViewFilters } from "@/lib/saved-task-views";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/task-workflow";
import {
  getSavedTaskViews,
  getWorkspaceLabels,
  getWorkspaceMembers,
  getWorkspaceMilestones,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

const columns = TASK_STATUSES;

type TasksPageProps = {
  searchParams: Promise<{
    q?: string;
    project?: string;
    priority?: string;
    status?: string;
    label?: string;
    milestone?: string;
    due?: string;
    sort?: string;
  }>;
};

export default async function TasksPage({
  searchParams,
}: TasksPageProps) {
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

  const [tasks, projects, members, labels, milestones, savedViews] = await Promise.all([
    getWorkspaceTasks(access.workspaceId),
    getWorkspaceProjects(access.workspaceId),
    getWorkspaceMembers(access.workspaceId),
    getWorkspaceLabels(access.workspaceId),
    getWorkspaceMilestones(access.workspaceId),
    getSavedTaskViews(access.workspaceId, access.user.id),
  ]);

  const assignedTasks = tasks.filter(
    (task) => task.assigneeId === access.user.id
  );

  const visibleTasks = filterAndSortTasks(assignedTasks, {
    query: params.q,
    projectId: params.project,
    priority: params.priority,
    status: params.status,
    labelId: params.label,
    milestoneId: params.milestone,
    due: params.due,
    sort: params.sort,
  });

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
  }));

  const allMemberOptions = members.map((member) => ({
    id: member.id,
    name: member.name,
    initials: member.initials,
    status: member.status,
  }));

  const manageAllTasks = canManageAllTasks(access);

  const createTaskMemberOptions = manageAllTasks
    ? allMemberOptions
    : allMemberOptions.filter((member) => member.id === access.user.id);

  const filtersActive = Boolean(
    params.q?.trim() ||
      (params.project && params.project !== "all") ||
      (params.priority && params.priority !== "all") ||
      (params.status && params.status !== "all") ||
      (params.label && params.label !== "all") ||
      (params.milestone && params.milestone !== "all") ||
      (params.due && params.due !== "all") ||
      (params.sort && params.sort !== "due-asc")
  );

  const currentViewFilters = normalizeSavedTaskViewFilters({
    query: params.q,
    projectId: params.project,
    priority: params.priority,
    status: params.status,
    labelId: params.label,
    milestoneId: params.milestone,
    due: params.due,
    sort: params.sort,
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 pb-28 sm:px-8 lg:pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Workspace</p>

                <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                  My Tasks
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>Track the work currently assigned to you.</span>

                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium capitalize text-zinc-400">
                    {access.role}
                  </span>
                </div>
              </div>

              <NewTaskDialog
                projects={projectOptions}
                members={createTaskMemberOptions}
              />
            </div>

            {!manageAllTasks ? (
              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs leading-5 text-zinc-500">
                Members can create tasks for themselves and move their own tasks
                through the workflow. Task reassignment, full editing, and
                deletion are reserved for admins and owners.
              </div>
            ) : null}

            <SavedTaskViews
              views={savedViews}
              currentFilters={currentViewFilters}
            />

            <form
              action="/tasks"
              method="get"
              className="mt-7 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 xl:grid-cols-4 2xl:grid-cols-[1.15fr_0.9fr_0.75fr_0.8fr_0.8fr_0.9fr_0.8fr_0.9fr_auto]"
            >
              <div>
                <label
                  htmlFor="task-query"
                  className="text-xs font-medium text-zinc-500"
                >
                  Search
                </label>

                <input
                  id="task-query"
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ""}
                  placeholder="Task title..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="task-project"
                  className="text-xs font-medium text-zinc-500"
                >
                  Project
                </label>

                <select
                  id="task-project"
                  name="project"
                  defaultValue={params.project ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All projects</option>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-priority"
                  className="text-xs font-medium text-zinc-500"
                >
                  Priority
                </label>

                <select
                  id="task-priority"
                  name="priority"
                  defaultValue={params.priority ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All priorities</option>
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-status"
                  className="text-xs font-medium text-zinc-500"
                >
                  Status
                </label>

                <select
                  id="task-status"
                  name="status"
                  defaultValue={params.status ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All statuses</option>
                  {columns.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-label"
                  className="text-xs font-medium text-zinc-500"
                >
                  Label
                </label>

                <select
                  id="task-label"
                  name="label"
                  defaultValue={params.label ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All labels</option>
                  {labels.map((label) => (
                    <option key={label.id} value={label.id}>
                      {label.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-milestone"
                  className="text-xs font-medium text-zinc-500"
                >
                  Milestone
                </label>

                <select
                  id="task-milestone"
                  name="milestone"
                  defaultValue={params.milestone ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All milestones</option>
                  <option value="none">No milestone</option>
                  {milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title} · {milestone.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-due"
                  className="text-xs font-medium text-zinc-500"
                >
                  Due
                </label>

                <select
                  id="task-due"
                  name="due"
                  defaultValue={params.due ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">Any due date</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="no-date">No due date</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-sort"
                  className="text-xs font-medium text-zinc-500"
                >
                  Sort
                </label>

                <select
                  id="task-sort"
                  name="sort"
                  defaultValue={params.sort ?? "due-asc"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="due-asc">Due date: soonest</option>
                  <option value="due-desc">Due date: latest</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
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
                    href="/tasks"
                    className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Reset
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs text-zinc-600">
              <span>
                Showing {visibleTasks.length} of {assignedTasks.length} assigned tasks
              </span>

              {filtersActive ? <span>Filtered view</span> : null}
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

            <TaskBoard
              tasks={visibleTasks}
              projects={projectOptions}
              members={allMemberOptions}
              manageAllTasks={manageAllTasks}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

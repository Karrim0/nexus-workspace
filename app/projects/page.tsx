import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import {
  canManageProjects,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { filterAndSortProjects } from "@/lib/project-filters";
import {
  getWorkspaceMembers,
  getWorkspaceProjects,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type ProjectsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
  }>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
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

  const params = await searchParams;

  const [projects, members] = await Promise.all([
    getWorkspaceProjects(),
    getWorkspaceMembers(),
  ]);

  const filteredProjects = filterAndSortProjects(projects, {
    query: params.q,
    status: params.status,
    sort: params.sort,
  });

  const canManage = canManageProjects(access);

  const statuses = Array.from(
    new Set(projects.map((project) => project.status))
  ).sort((a, b) => a.localeCompare(b));

  const filtersActive = Boolean(
    params.q?.trim() ||
      (params.status && params.status !== "all") ||
      (params.sort && params.sort !== "name")
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
                  Projects
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Track every active initiative across the team.
                </p>
              </div>

              {canManage ? (
                <NewProjectDialog
                  members={members.map((member) => ({
                    id: member.id,
                    name: member.name,
                    initials: member.initials,
                  }))}
                />
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-400">
                Signed in as {access.user.name}
              </span>

              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-medium capitalize text-zinc-300">
                {access.role}
              </span>

              {!canManage ? (
                <span className="text-zinc-600">
                  Project management is read-only for your role.
                </span>
              ) : null}
            </div>

            <form
              action="/projects"
              method="get"
              className="mt-7 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto]"
            >
              <div>
                <label
                  htmlFor="project-query"
                  className="text-xs font-medium text-zinc-500"
                >
                  Search
                </label>

                <input
                  id="project-query"
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ""}
                  placeholder="Project name or status..."
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="project-status"
                  className="text-xs font-medium text-zinc-500"
                >
                  Status
                </label>

                <select
                  id="project-status"
                  name="status"
                  defaultValue={params.status ?? "all"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-sort"
                  className="text-xs font-medium text-zinc-500"
                >
                  Sort
                </label>

                <select
                  id="project-sort"
                  name="sort"
                  defaultValue={params.sort ?? "name"}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="name">Name</option>
                  <option value="progress-desc">Progress: high to low</option>
                  <option value="progress-asc">Progress: low to high</option>
                  <option value="status">Status</option>
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
                    href="/projects"
                    className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                  >
                    Reset
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs text-zinc-600">
              <span>
                Showing {filteredProjects.length} of {projects.length} projects
              </span>

              {filtersActive ? (
                <span>Filtered view</span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const projectMembers = members.filter((member) =>
                  project.memberIds.includes(member.id)
                );

                return (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                          {project.description}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400">
                        {project.status}
                      </span>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">
                          {project.completedTasks} / {project.totalTasks} tasks
                        </span>
                        <span className="font-medium text-zinc-300">
                          {project.progress}%
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {projectMembers.map((member) => (
                          <div
                            key={member.id}
                            title={member.name}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-[10px] font-semibold"
                          >
                            {member.initials}
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium text-zinc-400 transition hover:text-white"
                      >
                        Open project →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProjects.length === 0 ? (
              <section className="mt-8 rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
                <p className="text-sm font-medium text-zinc-400">
                  No projects match these filters
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  Reset the filters or try a different search term.
                </p>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

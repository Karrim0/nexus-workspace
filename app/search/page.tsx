import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import {
  includesWorkspaceQuery,
  normalizeWorkspaceSearchType,
} from "@/lib/workspace-search";
import {
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
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
  const rawQuery = params.q?.trim() ?? "";
  const query = rawQuery.toLowerCase();
  const type = normalizeWorkspaceSearchType(params.type);

  const [projects, tasks, members] = await Promise.all([
    getWorkspaceProjects(access.workspaceId),
    getWorkspaceTasks(access.workspaceId),
    getWorkspaceMembers(access.workspaceId),
  ]);

  const allProjectResults = query
    ? projects.filter(
        (project) =>
          includesWorkspaceQuery(project.name, query) ||
          includesWorkspaceQuery(project.description, query) ||
          includesWorkspaceQuery(project.status, query)
      )
    : [];

  const allTaskResults = query
    ? tasks.filter(
        (task) =>
          includesWorkspaceQuery(task.title, query) ||
          includesWorkspaceQuery(task.priority, query) ||
          includesWorkspaceQuery(task.status, query)
      )
    : [];

  const allMemberResults = query
    ? members.filter(
        (member) =>
          includesWorkspaceQuery(member.name, query) ||
          includesWorkspaceQuery(member.email, query) ||
          includesWorkspaceQuery(member.role, query) ||
          includesWorkspaceQuery(member.status, query)
      )
    : [];

  const projectResults =
    type === "all" || type === "projects"
      ? allProjectResults
      : [];

  const taskResults =
    type === "all" || type === "tasks"
      ? allTaskResults
      : [];

  const memberResults =
    type === "all" || type === "members"
      ? allMemberResults
      : [];

  const totalMatches =
    allProjectResults.length +
    allTaskResults.length +
    allMemberResults.length;

  const visibleResults =
    projectResults.length +
    taskResults.length +
    memberResults.length;

  const categories = [
    {
      value: "all",
      label: "All",
      count: totalMatches,
    },
    {
      value: "projects",
      label: "Projects",
      count: allProjectResults.length,
    },
    {
      value: "tasks",
      label: "Tasks",
      count: allTaskResults.length,
    },
    {
      value: "members",
      label: "People",
      count: allMemberResults.length,
    },
  ] as const;

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
                Search
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Find projects, tasks, and people without leaving the workspace.
              </p>
            </div>

            <form
              action="/search"
              method="get"
              role="search"
              className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-[1fr_170px_auto]"
            >
              <div>
                <label htmlFor="search-page-query" className="sr-only">
                  Search projects, tasks, and members
                </label>

                <input
                  id="search-page-query"
                  name="q"
                  type="search"
                  defaultValue={rawQuery}
                  autoFocus
                  placeholder="Project, task, email, role..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
              </div>

              <div>
                <label htmlFor="search-type" className="sr-only">
                  Result type
                </label>

                <select
                  id="search-type"
                  name="type"
                  defaultValue={type}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 outline-none focus:border-zinc-600"
                >
                  <option value="all">All results</option>
                  <option value="projects">Projects</option>
                  <option value="tasks">Tasks</option>
                  <option value="members">People</option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Search
              </button>
            </form>

            {!rawQuery ? (
              <section className="mt-8 rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
                <p className="text-sm font-medium text-zinc-400">
                  Search {access.workspaceName}
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Results are grouped across projects, tasks, and team members.
                </p>
              </section>
            ) : (
              <>
                <div className="mt-7 flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const active = type === category.value;

                    return (
                      <Link
                        key={category.value}
                        href={`/search?q=${encodeURIComponent(
                          rawQuery
                        )}&type=${category.value}`}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? "border-zinc-600 bg-zinc-800 text-white"
                            : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {category.label} · {category.count}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>
                    {visibleResults} visible result
                    {visibleResults === 1 ? "" : "s"} for
                  </span>

                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-zinc-300">
                    {rawQuery}
                  </span>

                  {type !== "all" ? (
                    <span className="capitalize text-zinc-600">
                      in {type}
                    </span>
                  ) : null}
                </div>

                {visibleResults === 0 ? (
                  <section className="mt-6 rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
                    <p className="text-sm font-medium text-zinc-400">
                      No matches in this category
                    </p>

                    <p className="mt-2 text-xs text-zinc-600">
                      Try All results, another category, or a shorter search term.
                    </p>
                  </section>
                ) : null}

                {projectResults.length > 0 ? (
                  <section className="mt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Projects</h3>
                      <span className="text-xs text-zinc-600">
                        {projectResults.length}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {projectResults.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/70"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium">
                                {project.name}
                              </p>

                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                                {project.description}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500">
                              {project.status}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}

                {taskResults.length > 0 ? (
                  <section className="mt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Tasks</h3>
                      <span className="text-xs text-zinc-600">
                        {taskResults.length}
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {taskResults.map((task) => {
                        const project = projects.find(
                          (item) => item.id === task.projectId
                        );

                        return (
                          <Link
                            key={task.id}
                            href="/tasks"
                            className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-medium">{task.title}</p>

                              <p className="mt-1 text-xs text-zinc-600">
                                {project?.name ?? "Unknown project"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500">
                                {task.priority}
                              </span>

                              <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                                {task.status}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {memberResults.length > 0 ? (
                  <section className="mt-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Team members</h3>
                      <span className="text-xs text-zinc-600">
                        {memberResults.length}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {memberResults.map((member) => (
                        <Link
                          key={member.id}
                          href="/team"
                          className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/70"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                            {member.initials}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {member.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-600">
                              {member.email}
                            </p>
                          </div>

                          <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs capitalize text-zinc-500">
                            {member.role}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

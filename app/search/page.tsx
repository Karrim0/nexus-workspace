import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { WorkspaceAccessRequired } from "@/components/auth/workspace-access-required";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import {
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function includesQuery(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query) ?? false;
}

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

            <div className="px-5 py-8 sm:px-8">
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

  const [projects, tasks, members] = await Promise.all([
    getWorkspaceProjects(),
    getWorkspaceTasks(),
    getWorkspaceMembers(),
  ]);

  const projectResults = query
    ? projects.filter(
        (project) =>
          includesQuery(project.name, query) ||
          includesQuery(project.description, query) ||
          includesQuery(project.status, query)
      )
    : [];

  const taskResults = query
    ? tasks.filter(
        (task) =>
          includesQuery(task.title, query) ||
          includesQuery(task.priority, query) ||
          includesQuery(task.status, query)
      )
    : [];

  const memberResults = query
    ? members.filter(
        (member) =>
          includesQuery(member.name, query) ||
          includesQuery(member.email, query) ||
          includesQuery(member.role, query) ||
          includesQuery(member.status, query)
      )
    : [];

  const totalResults =
    projectResults.length +
    taskResults.length +
    memberResults.length;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 sm:px-8">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Workspace
              </p>

              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Search
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Find projects, tasks, and people from one place.
              </p>
            </div>

            <form
              action="/search"
              method="get"
              role="search"
              className="mt-7 flex max-w-2xl gap-3"
            >
              <label htmlFor="search-page-query" className="sr-only">
                Search projects, tasks, and members
              </label>

              <input
                id="search-page-query"
                name="q"
                type="search"
                defaultValue={rawQuery}
                autoFocus
                placeholder="Try a project name, task, email, or role..."
                className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
              />

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
                  Search your workspace
                </p>
                <p className="mt-2 text-xs text-zinc-600">
                  Results will be grouped by projects, tasks, and team members.
                </p>
              </section>
            ) : (
              <>
                <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>
                    {totalResults} result{totalResults === 1 ? "" : "s"} for
                  </span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-zinc-300">
                    {rawQuery}
                  </span>
                </div>

                {totalResults === 0 ? (
                  <section className="mt-6 rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
                    <p className="text-sm font-medium text-zinc-400">
                      No matches found
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Try a shorter name, status, role, or email.
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
                              <p className="font-medium">{project.name}</p>
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

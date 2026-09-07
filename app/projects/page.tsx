import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const projects = [
  {
    name: "Website Redesign",
    description: "Rebuild the marketing website with a new responsive experience.",
    progress: 82,
    status: "In Progress",
    tasks: "18 / 22 tasks",
    members: ["KM", "SA", "YO"],
  },
  {
    name: "Mobile Dashboard",
    description: "Design and build a mobile-first analytics dashboard experience.",
    progress: 64,
    status: "In Progress",
    tasks: "14 / 22 tasks",
    members: ["KM", "SA"],
  },
  {
    name: "API Integration",
    description: "Connect the workspace to external services and internal APIs.",
    progress: 41,
    status: "Planning",
    tasks: "9 / 21 tasks",
    members: ["KM", "YO"],
  },
  {
    name: "Team Onboarding",
    description: "Create a smoother onboarding experience for new workspace members.",
    progress: 27,
    status: "Planning",
    tasks: "6 / 22 tasks",
    members: ["SA", "YO"],
  },
];

export default function ProjectsPage() {
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

              <button className="w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200">
                + New Project
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                placeholder="Search projects..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
              />

              <select
                defaultValue="all"
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300 outline-none"
              >
                <option value="all">All projects</option>
                <option value="progress">In progress</option>
                <option value="planning">Planning</option>
              </select>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.name}
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
                      <span className="text-zinc-500">{project.tasks}</span>
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
                      {project.members.map((member) => (
                        <div
                          key={member}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-[10px] font-semibold"
                        >
                          {member}
                        </div>
                      ))}
                    </div>

                    <button className="text-sm font-medium text-zinc-400 transition hover:text-white">
                      Open project →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

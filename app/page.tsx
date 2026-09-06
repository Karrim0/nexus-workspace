import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const stats = [
  { label: "Active Projects", value: "08", detail: "+2 this month" },
  { label: "Open Tasks", value: "24", detail: "7 due this week" },
  { label: "Team Members", value: "06", detail: "All active" },
  { label: "Completion Rate", value: "78%", detail: "+12% this month" },
];

const projects = [
  { name: "Website Redesign", progress: 82, tasks: "18 / 22 tasks" },
  { name: "Mobile Dashboard", progress: 64, tasks: "14 / 22 tasks" },
  { name: "API Integration", progress: 41, tasks: "9 / 21 tasks" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <Topbar />

          <div className="px-5 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">Dashboard</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                  Good evening, Kareem.
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Here&apos;s what&apos;s happening across your workspace.
                </p>
              </div>

              <button className="w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200">
                + New Project
              </button>
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
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                  <div>
                    <h3 className="font-semibold">Active Projects</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Current team progress
                    </p>
                  </div>

                  <button className="text-sm text-zinc-400 transition hover:text-white">
                    View all
                  </button>
                </div>

                <div className="divide-y divide-zinc-800">
                  {projects.map((project) => (
                    <div key={project.name} className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {project.tasks}
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
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <h3 className="font-semibold">Recent Activity</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Latest workspace updates
                </p>

                <div className="mt-6 space-y-5">
                  {[
                    ["KM", "Created Website Redesign", "12 min ago"],
                    ["SA", "Completed homepage wireframe", "42 min ago"],
                    ["YO", "Joined Product Team", "2 hours ago"],
                    ["KM", "Updated API Integration", "4 hours ago"],
                  ].map(([initials, activity, time]) => (
                    <div key={`${activity}-${time}`} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm text-zinc-300">{activity}</p>
                        <p className="mt-1 text-xs text-zinc-600">{time}</p>
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

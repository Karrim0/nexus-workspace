import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const members = [
  {
    name: "Kareem Mostafa",
    initials: "KM",
    role: "Workspace Owner",
    email: "kareem@nexus.dev",
    status: "Active",
  },
  {
    name: "Sara Ahmed",
    initials: "SA",
    role: "Product Designer",
    email: "sara@nexus.dev",
    status: "Active",
  },
  {
    name: "Youssef Omar",
    initials: "YO",
    role: "Backend Engineer",
    email: "youssef@nexus.dev",
    status: "Active",
  },
  {
    name: "Mariam Ali",
    initials: "MA",
    role: "Frontend Engineer",
    email: "mariam@nexus.dev",
    status: "Invited",
  },
];

export default function TeamPage() {
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
                  Team
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Manage members, roles, and workspace access.
                </p>
              </div>

              <button className="w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200">
                + Invite Member
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Total members</p>
                <p className="mt-3 text-3xl font-semibold">{members.length}</p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Active</p>
                <p className="mt-3 text-3xl font-semibold">
                  {members.filter((member) => member.status === "Active").length}
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <p className="text-sm text-zinc-500">Pending invites</p>
                <p className="mt-3 text-3xl font-semibold">
                  {members.filter((member) => member.status === "Invited").length}
                </p>
              </article>
            </div>

            <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h3 className="font-semibold">Workspace Members</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  People with access to Product Team
                </p>
              </div>

              <div className="divide-y divide-zinc-800">
                {members.map((member) => (
                  <div
                    key={member.email}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
                        {member.initials}
                      </div>

                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
                        {member.role}
                      </span>
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

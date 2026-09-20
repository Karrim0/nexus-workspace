import { UserMenu } from "@/components/auth/user-menu";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";

export async function Topbar() {
  const access = await getCurrentWorkspaceAccess();
  const user = access?.user ?? (await getCurrentUser());

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4 sm:px-8">
      <div className="min-w-0">
        <p className="text-sm text-zinc-500">Workspace</p>

        <h1 className="truncate text-lg font-semibold text-white">
          {access?.workspaceName ?? "Nexus Workspace"}
        </h1>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        {access ? (
          <>
            <form
              action="/search"
              method="get"
              className="hidden sm:block"
              role="search"
            >
              <label htmlFor="workspace-search" className="sr-only">
                Search workspace
              </label>

              <input
                id="workspace-search"
                name="q"
                type="search"
                placeholder={`Search ${access.workspaceName}...`}
                className="w-44 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:w-64 focus:border-zinc-600"
              />
            </form>

            <a
              href="/search"
              className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white sm:hidden"
              aria-label={`Search ${access.workspaceName}`}
            >
              Search
            </a>
          </>
        ) : null}

        {user ? (
          <UserMenu
            user={{
              name: user.name,
              email: user.email,
              initials: user.initials,
            }}
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-500">
            ?
          </div>
        )}
      </div>
    </header>
  );
}

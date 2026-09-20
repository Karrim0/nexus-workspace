import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { WorkspaceOnboardingForm } from "@/components/onboarding/workspace-onboarding-form";
import { getWorkspaceOnboardingState } from "@/lib/workspaces/onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getWorkspaceOnboardingState(user.id);

  if (!state.needsWorkspace) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 py-10 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/40 p-7 sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-bold text-black">
          N
        </div>

        <p className="mt-6 text-sm font-medium text-zinc-500">
          Welcome, {user.name}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Create your workspace
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Give your team a home for projects, tasks, members, activity, and
          insights. You can change how you use the workspace later.
        </p>

        <WorkspaceOnboardingForm userName={user.name} />
      </section>
    </main>
  );
}

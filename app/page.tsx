import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWorkspaceOnboardingState } from "@/lib/workspaces/onboarding";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getWorkspaceOnboardingState(user.id);

  if (state.needsWorkspace) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

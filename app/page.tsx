import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    redirect("/access-denied");
  }

  redirect("/dashboard");
}

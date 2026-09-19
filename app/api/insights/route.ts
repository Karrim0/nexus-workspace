import { NextResponse } from "next/server";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { buildWorkspaceInsights } from "@/lib/workspace-insights";
import {
  getWorkspaceMembers,
  getWorkspaceProjects,
  getWorkspaceTasks,
} from "@/lib/workspace-repository";

export async function GET() {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return NextResponse.json(
      {
        error: "WORKSPACE_ACCESS_REQUIRED",
        message: "You do not have active access to this workspace.",
      },
      { status: 403 }
    );
  }

  try {
    const [projects, tasks, members] = await Promise.all([
      getWorkspaceProjects(),
      getWorkspaceTasks(),
      getWorkspaceMembers(),
    ]);

    const insights = buildWorkspaceInsights({
      projects,
      tasks,
      members,
    });

    return NextResponse.json({
      data: insights,
    });
  } catch (error) {
    console.error("GET /api/insights failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to calculate workspace insights.",
      },
      { status: 500 }
    );
  }
}

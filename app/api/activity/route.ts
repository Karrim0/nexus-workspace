import { NextResponse } from "next/server";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { getWorkspaceActivity } from "@/lib/workspace-repository";

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
    const activities = await getWorkspaceActivity();

    return NextResponse.json({
      data: activities,
      count: activities.length,
      currentUserActions: activities.filter(
        (activity) => activity.memberId === access.user.id
      ).length,
    });
  } catch (error) {
    console.error("GET /api/activity failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to load workspace activity.",
      },
      { status: 500 }
    );
  }
}

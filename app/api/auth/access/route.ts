import { NextResponse } from "next/server";
import {
  canManageProjects,
  canManageTasks,
  canManageWorkspaceMembers,
  getCurrentWorkspaceAccess,
  isWorkspaceOwner,
} from "@/lib/auth/workspace-access";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        authenticated: false,
        workspaceAccess: null,
      },
      { status: 401 }
    );
  }

  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return NextResponse.json(
      {
        authenticated: true,
        user,
        workspaceAccess: null,
        error: "WORKSPACE_ACCESS_REQUIRED",
        message:
          "Your account does not have an active membership in this workspace.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: access.user,
    workspaceAccess: {
      workspaceId: access.workspaceId,
      role: access.role,
      status: access.status,
      permissions: {
        manageMembers: canManageWorkspaceMembers(access),
        manageProjects: canManageProjects(access),
        manageTasks: canManageTasks(access),
        owner: isWorkspaceOwner(access),
      },
    },
  });
}

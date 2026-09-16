import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { PRODUCT_TEAM_WORKSPACE_ID } from "@/lib/workspace-repository";

export type WorkspaceRole = "owner" | "admin" | "member";

export type WorkspaceAccess = {
  user: {
    id: string;
    name: string;
    email: string;
    initials: string;
  };
  workspaceId: string;
  role: WorkspaceRole;
  status: string;
};

function normalizeWorkspaceRole(role: string): WorkspaceRole {
  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole === "owner") {
    return "owner";
  }

  if (normalizedRole === "admin") {
    return "admin";
  }

  return "member";
}

function isActiveStatus(status: string) {
  return status.trim().toLowerCase() === "active";
}

export async function getCurrentWorkspaceAccess(): Promise<WorkspaceAccess | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const membership = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        userId: user.id,
      },
    },
    select: {
      role: true,
      status: true,
    },
  });

  if (!membership || !isActiveStatus(membership.status)) {
    return null;
  }

  return {
    user,
    workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
    role: normalizeWorkspaceRole(membership.role),
    status: membership.status,
  };
}

export function canManageWorkspaceMembers(access: WorkspaceAccess) {
  return access.role === "owner" || access.role === "admin";
}

export function canManageProjects(access: WorkspaceAccess) {
  return access.role === "owner" || access.role === "admin";
}

export function canManageTasks(access: WorkspaceAccess) {
  return (
    access.role === "owner" ||
    access.role === "admin" ||
    access.role === "member"
  );
}

export function canManageAllTasks(access: WorkspaceAccess) {
  return access.role === "owner" || access.role === "admin";
}

export function canCreateTaskForAssignee(
  access: WorkspaceAccess,
  assigneeId: string
) {
  return canManageAllTasks(access) || access.user.id === assigneeId;
}

export function canUpdateAssignedTaskStatus(
  access: WorkspaceAccess,
  assigneeId: string | null
) {
  return canManageAllTasks(access) || access.user.id === assigneeId;
}

export function isWorkspaceOwner(access: WorkspaceAccess) {
  return access.role === "owner";
}

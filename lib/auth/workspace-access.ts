import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";

export type WorkspaceRole = "owner" | "admin" | "member";

export type WorkspaceAccess = {
  user: {
    id: string;
    name: string;
    email: string;
    initials: string;
  };
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
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

export async function getCurrentWorkspaceAccess(): Promise<WorkspaceAccess | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const membership = await db.workspaceMember.findFirst({
    where: {
      userId: user.id,
      status: {
        equals: "Active",
        mode: "insensitive",
      },
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  if (!membership) {
    return null;
  }

  return {
    user,
    workspaceId: membership.workspace.id,
    workspaceName: membership.workspace.name,
    workspaceSlug: membership.workspace.slug,
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

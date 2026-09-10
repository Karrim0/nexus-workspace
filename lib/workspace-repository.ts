import { db } from "@/lib/db";

export const PRODUCT_TEAM_WORKSPACE_ID = "workspace-product-team";

export async function getWorkspaceProjects() {
  const projects = await db.project.findMany({
    where: {
      workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
    },
    include: {
      members: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    progress: project.progress,
    status: project.status,
    completedTasks: project.completedTasks,
    totalTasks: project.totalTasks,
    memberIds: project.members.map((member) => member.userId),
  }));
}

export async function getWorkspaceTasks() {
  const tasks = await db.task.findMany({
    where: {
      project: {
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate?.toISOString() ?? null,
  }));
}

export async function getWorkspaceMembers() {
  const memberships = await db.workspaceMember.findMany({
    where: {
      workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
    },
    include: {
      user: true,
    },
    orderBy: {
      user: {
        createdAt: "asc",
      },
    },
  });

  return memberships.map((membership) => ({
    id: membership.user.id,
    name: membership.user.name,
    initials: membership.user.initials,
    email: membership.user.email,
    role: membership.role,
    status: membership.status,
  }));
}

export async function getWorkspaceActivity() {
  const activities = await db.activity.findMany({
    where: {
      workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
    },
    orderBy: {
      occurredAt: "desc",
    },
  });

  return activities.map((activity) => ({
    id: activity.id,
    memberId: activity.userId,
    message: activity.message,
    occurredAt: activity.occurredAt.toISOString(),
  }));
}

import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";

async function resolveWorkspaceId(workspaceId?: string) {
  if (workspaceId) {
    return workspaceId;
  }

  const access = await getCurrentWorkspaceAccess();

  return access?.workspaceId ?? null;
}

export async function getWorkspaceProjects(workspaceId?: string) {
  const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);

  if (!resolvedWorkspaceId) {
    return [];
  }

  const projects = await db.project.findMany({
    where: {
      workspaceId: resolvedWorkspaceId,
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

export async function getWorkspaceProjectById(
  projectId: string,
  workspaceId?: string
) {
  const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);

  if (!resolvedWorkspaceId) {
    return null;
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      workspaceId: resolvedWorkspaceId,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        include: {
          assignee: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    progress: project.progress,
    status: project.status,
    completedTasks: project.completedTasks,
    totalTasks: project.totalTasks,
    members: project.members.map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      initials: membership.user.initials,
      email: membership.user.email,
    })),
    tasks: project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate?.toISOString() ?? null,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            initials: task.assignee.initials,
          }
        : null,
    })),
  };
}

export async function getWorkspaceTasks(workspaceId?: string) {
  const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);

  if (!resolvedWorkspaceId) {
    return [];
  }

  const tasks = await db.task.findMany({
    where: {
      project: {
        workspaceId: resolvedWorkspaceId,
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

export async function getWorkspaceMembers(workspaceId?: string) {
  const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);

  if (!resolvedWorkspaceId) {
    return [];
  }

  const memberships = await db.workspaceMember.findMany({
    where: {
      workspaceId: resolvedWorkspaceId,
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

export async function getWorkspaceActivity(workspaceId?: string) {
  const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);

  if (!resolvedWorkspaceId) {
    return [];
  }

  const activities = await db.activity.findMany({
    where: {
      workspaceId: resolvedWorkspaceId,
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

import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { normalizeProjectStatus } from "@/lib/project-lifecycle";
import {
  normalizeTaskPriority,
  normalizeTaskStatus,
} from "@/lib/task-workflow";

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
    status: normalizeProjectStatus(project.status),
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
    status: normalizeProjectStatus(project.status),
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
      priority: normalizeTaskPriority(task.priority),
      status: normalizeTaskStatus(task.status),
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
    include: {
      subtasks: {
        select: {
          completed: true,
        },
      },
      dependencies: {
        select: {
          dependsOn: {
            select: {
              status: true,
            },
          },
        },
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
    priority: normalizeTaskPriority(task.priority),
    status: normalizeTaskStatus(task.status),
    dueDate: task.dueDate?.toISOString() ?? null,
    subtaskCount: task.subtasks.length,
    completedSubtaskCount: task.subtasks.filter((subtask) => subtask.completed).length,
    blockingDependencyCount: task.dependencies.filter(
      (dependency) => normalizeTaskStatus(dependency.dependsOn.status) !== "Done"
    ).length,
  }));
}

export async function getWorkspaceTaskById(
  taskId: string,
  workspaceId?: string
) {
  const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);

  if (!resolvedWorkspaceId) {
    return null;
  }

  const task = await db.task.findFirst({
    where: {
      id: taskId,
      project: {
        workspaceId: resolvedWorkspaceId,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          initials: true,
          email: true,
        },
      },
      subtasks: {
        orderBy: [
          { position: "asc" },
          { createdAt: "asc" },
        ],
      },
      dependencies: {
        include: {
          dependsOn: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      blockingTasks: {
        include: {
          task: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  return {
    id: task.id,
    title: task.title,
    priority: normalizeTaskPriority(task.priority),
    status: normalizeTaskStatus(task.status),
    dueDate: task.dueDate?.toISOString() ?? null,
    startedAt: task.startedAt?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    project: {
      ...task.project,
      status: normalizeProjectStatus(task.project.status),
    },
    assignee: task.assignee,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      position: subtask.position,
      createdAt: subtask.createdAt.toISOString(),
      updatedAt: subtask.updatedAt.toISOString(),
    })),
    dependencies: task.dependencies.map((dependency) => ({
      id: dependency.dependsOn.id,
      title: dependency.dependsOn.title,
      status: normalizeTaskStatus(dependency.dependsOn.status),
      project: dependency.dependsOn.project,
    })),
    blockingTasks: task.blockingTasks.map((dependency) => ({
      id: dependency.task.id,
      title: dependency.task.title,
      status: normalizeTaskStatus(dependency.task.status),
      project: dependency.task.project,
    })),
  };
}

export async function getWorkspaceTaskDependencyCandidates(
  taskId: string,
  workspaceId?: string
) {
  const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);

  if (!resolvedWorkspaceId) {
    return [];
  }

  const tasks = await db.task.findMany({
    where: {
      id: {
        not: taskId,
      },
      project: {
        workspaceId: resolvedWorkspaceId,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { projectId: "asc" },
      { title: "asc" },
    ],
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: normalizeTaskStatus(task.status),
    project: task.project,
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

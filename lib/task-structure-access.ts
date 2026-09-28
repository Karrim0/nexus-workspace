import {
  canManageAllTasks,
  canUpdateAssignedTaskStatus,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";

export async function getTaskStructureContext(taskId: string) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return { access: null, task: null, canManage: false } as const;
  }

  const task = await db.task.findFirst({
    where: {
      id: taskId,
      project: {
        workspaceId: access.workspaceId,
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      assigneeId: true,
      projectId: true,
    },
  });

  if (!task) {
    return { access, task: null, canManage: false } as const;
  }

  return {
    access,
    task,
    canManage:
      canManageAllTasks(access) ||
      canUpdateAssignedTaskStatus(access, task.assigneeId),
  } as const;
}

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateUpdateTask } from "@/lib/api-validation";
import { PRODUCT_TEAM_WORKSPACE_ID } from "@/lib/workspace-repository";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

async function syncProjectProgress(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  const [totalTasks, completedTasks] = await Promise.all([
    tx.task.count({
      where: {
        projectId,
      },
    }),
    tx.task.count({
      where: {
        projectId,
        status: "Done",
      },
    }),
  ]);

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  await tx.project.update({
    where: {
      id: projectId,
    },
    data: {
      totalTasks,
      completedTasks,
      progress,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { taskId } = await context.params;

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
      { status: 400 }
    );
  }

  const result = validateUpdateTask(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        errors: result.errors,
      },
      { status: 400 }
    );
  }

  try {
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        },
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        assigneeId: true,
        priority: true,
        status: true,
        dueDate: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          error: "TASK_NOT_FOUND",
          message: "The task does not exist.",
        },
        { status: 404 }
      );
    }

    const nextProjectId = result.data.projectId ?? existingTask.projectId;
    const nextAssigneeId = result.data.assigneeId ?? existingTask.assigneeId;

    if (!nextAssigneeId) {
      return NextResponse.json(
        {
          error: "ASSIGNEE_REQUIRED",
          message: "The task must have an assignee.",
        },
        { status: 400 }
      );
    }

    const [project, assignee] = await Promise.all([
      db.project.findFirst({
        where: {
          id: nextProjectId,
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        },
        select: {
          id: true,
        },
      }),
      db.workspaceMember.findFirst({
        where: {
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: nextAssigneeId,
        },
        select: {
          userId: true,
        },
      }),
    ]);

    if (!project) {
      return NextResponse.json(
        {
          error: "PROJECT_NOT_FOUND",
          message: "The selected project does not exist.",
        },
        { status: 400 }
      );
    }

    if (!assignee) {
      return NextResponse.json(
        {
          error: "ASSIGNEE_NOT_FOUND",
          message: "The selected assignee is not a workspace member.",
        },
        { status: 400 }
      );
    }

    const updatedTask = await db.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: {
          id: taskId,
        },
        data: {
          title: result.data.title ?? existingTask.title,
          projectId: nextProjectId,
          assigneeId: nextAssigneeId,
          priority: result.data.priority ?? existingTask.priority,
          status: result.data.status ?? existingTask.status,
          dueDate: result.data.dueDate
            ? new Date(result.data.dueDate)
            : existingTask.dueDate,
        },
      });

      const affectedProjectIds = Array.from(
        new Set([existingTask.projectId, nextProjectId])
      );

      for (const projectId of affectedProjectIds) {
        await syncProjectProgress(tx, projectId);
      }

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: "member-kareem",
          message:
            result.data.status &&
            Object.keys(result.data).length === 1
              ? `moved "${updated.title}" to ${updated.status}`
              : `updated task "${updated.title}"`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      data: {
        id: updatedTask.id,
        title: updatedTask.title,
        projectId: updatedTask.projectId,
        assigneeId: updatedTask.assigneeId,
        priority: updatedTask.priority,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate?.toISOString() ?? null,
      },
      message: "Task updated successfully.",
    });
  } catch (error) {
    console.error(`PATCH /api/tasks/${taskId} failed:`, error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to update task.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { taskId } = await context.params;

  try {
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        },
      },
      select: {
        id: true,
        title: true,
        projectId: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          error: "TASK_NOT_FOUND",
          message: "The task does not exist.",
        },
        { status: 404 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.task.delete({
        where: {
          id: taskId,
        },
      });

      await syncProjectProgress(tx, existingTask.projectId);

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: "member-kareem",
          message: `deleted task "${existingTask.title}"`,
        },
      });
    });

    return NextResponse.json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error(`DELETE /api/tasks/${taskId} failed:`, error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to delete task.",
      },
      { status: 500 }
    );
  }
}

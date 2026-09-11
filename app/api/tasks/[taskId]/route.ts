import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PRODUCT_TEAM_WORKSPACE_ID } from "@/lib/workspace-repository";

const allowedStatuses = ["Todo", "In Progress", "Review", "Done"] as const;

type TaskStatus = (typeof allowedStatuses)[number];

function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    allowedStatuses.includes(value as TaskStatus)
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
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

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("status" in payload) ||
    !isTaskStatus(payload.status)
  ) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "status must be Todo, In Progress, Review, or Done.",
      },
      { status: 400 }
    );
  }

  try {
    const task = await db.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        projectId: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          error: "TASK_NOT_FOUND",
          message: "The task does not exist.",
        },
        { status: 404 }
      );
    }

    if (task.status === payload.status) {
      return NextResponse.json({
        data: task,
        message: "Task status is already up to date.",
      });
    }

    const updatedTask = await db.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: {
          id: task.id,
        },
        data: {
          status: payload.status,
        },
      });

      const [totalTasks, completedTasks] = await Promise.all([
        tx.task.count({
          where: {
            projectId: task.projectId,
          },
        }),
        tx.task.count({
          where: {
            projectId: task.projectId,
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
          id: task.projectId,
        },
        data: {
          totalTasks,
          completedTasks,
          progress,
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: "member-kareem",
          message: `moved "${task.title}" to ${payload.status}`,
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
      message: "Task status updated successfully.",
    });
  } catch (error) {
    console.error(`PATCH /api/tasks/${taskId} failed:`, error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to update task status.",
      },
      { status: 500 }
    );
  }
}

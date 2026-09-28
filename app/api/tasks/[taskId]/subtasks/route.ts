import { NextResponse } from "next/server";
import { validateCreateSubtask } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { getTaskStructureContext } from "@/lib/task-structure-access";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { taskId } = await context.params;
  const { access, task, canManage } = await getTaskStructureContext(taskId);

  if (!access) {
    return NextResponse.json(
      {
        error: "WORKSPACE_ACCESS_REQUIRED",
        message: "You do not have active access to this workspace.",
      },
      { status: 403 }
    );
  }

  if (!task) {
    return NextResponse.json(
      { error: "TASK_NOT_FOUND", message: "The task does not exist." },
      { status: 404 }
    );
  }

  if (!canManage) {
    return NextResponse.json(
      {
        error: "FORBIDDEN",
        message: "You cannot manage the checklist for this task.",
      },
      { status: 403 }
    );
  }

  if (task.status === "Done") {
    return NextResponse.json(
      {
        error: "TASK_ALREADY_DONE",
        message: "Reopen the task before adding an incomplete subtask.",
      },
      { status: 409 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must contain valid JSON." },
      { status: 400 }
    );
  }

  const result = validateCreateSubtask(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", errors: result.errors },
      { status: 400 }
    );
  }

  try {
    const subtask = await db.$transaction(async (tx) => {
      const aggregate = await tx.taskSubtask.aggregate({
        where: { taskId },
        _max: { position: true },
      });

      const created = await tx.taskSubtask.create({
        data: {
          id: crypto.randomUUID(),
          taskId,
          title: result.data.title,
          position: (aggregate._max.position ?? -1) + 1,
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: access.workspaceId,
          userId: access.user.id,
          message: `added subtask "${created.title}" to "${task.title}"`,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        data: {
          id: subtask.id,
          title: subtask.title,
          completed: subtask.completed,
          position: subtask.position,
        },
        message: "Subtask added successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`POST /api/tasks/${taskId}/subtasks failed:`, error);

    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to add subtask." },
      { status: 500 }
    );
  }
}

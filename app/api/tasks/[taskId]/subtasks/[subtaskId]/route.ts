import { NextResponse } from "next/server";
import { validateUpdateSubtask } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { getTaskStructureContext } from "@/lib/task-structure-access";

type RouteContext = {
  params: Promise<{
    taskId: string;
    subtaskId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { taskId, subtaskId } = await context.params;
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

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must contain valid JSON." },
      { status: 400 }
    );
  }

  const result = validateUpdateSubtask(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", errors: result.errors },
      { status: 400 }
    );
  }

  try {
    const existing = await db.taskSubtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "SUBTASK_NOT_FOUND", message: "The subtask does not exist." },
        { status: 404 }
      );
    }

    if (
      task.status === "Done" &&
      result.data.completed === false &&
      existing.completed
    ) {
      return NextResponse.json(
        {
          error: "TASK_ALREADY_DONE",
          message: "Reopen the task before marking a subtask incomplete.",
        },
        { status: 409 }
      );
    }

    const updated = await db.$transaction(async (tx) => {
      const subtask = await tx.taskSubtask.update({
        where: { id: subtaskId },
        data: {
          ...(result.data.title !== undefined
            ? { title: result.data.title }
            : {}),
          ...(result.data.completed !== undefined
            ? { completed: result.data.completed }
            : {}),
        },
      });

      const action =
        result.data.completed === true && !existing.completed
          ? "completed"
          : result.data.completed === false && existing.completed
            ? "reopened"
            : "updated";

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: access.workspaceId,
          userId: access.user.id,
          message: `${action} subtask "${subtask.title}" on "${task.title}"`,
        },
      });

      return subtask;
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        title: updated.title,
        completed: updated.completed,
        position: updated.position,
      },
      message: "Subtask updated successfully.",
    });
  } catch (error) {
    console.error(
      `PATCH /api/tasks/${taskId}/subtasks/${subtaskId} failed:`,
      error
    );

    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to update subtask." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { taskId, subtaskId } = await context.params;
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

  try {
    const existing = await db.taskSubtask.findFirst({
      where: {
        id: subtaskId,
        taskId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "SUBTASK_NOT_FOUND", message: "The subtask does not exist." },
        { status: 404 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.taskSubtask.delete({ where: { id: subtaskId } });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: access.workspaceId,
          userId: access.user.id,
          message: `removed subtask "${existing.title}" from "${task.title}"`,
        },
      });
    });

    return NextResponse.json({ message: "Subtask removed successfully." });
  } catch (error) {
    console.error(
      `DELETE /api/tasks/${taskId}/subtasks/${subtaskId} failed:`,
      error
    );

    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to remove subtask." },
      { status: 500 }
    );
  }
}

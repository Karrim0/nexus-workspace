import { NextResponse } from "next/server";
import { validateCreateTaskDependency } from "@/lib/api-validation";
import { db } from "@/lib/db";
import { getTaskStructureContext } from "@/lib/task-structure-access";
import { wouldCreateDependencyCycle } from "@/lib/task-structure";

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
        message: "You cannot manage dependencies for this task.",
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

  const result = validateCreateTaskDependency(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", errors: result.errors },
      { status: 400 }
    );
  }

  if (result.data.dependsOnTaskId === taskId) {
    return NextResponse.json(
      {
        error: "SELF_DEPENDENCY",
        message: "A task cannot depend on itself.",
      },
      { status: 409 }
    );
  }

  try {
    const prerequisite = await db.task.findFirst({
      where: {
        id: result.data.dependsOnTaskId,
        project: {
          workspaceId: access.workspaceId,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!prerequisite) {
      return NextResponse.json(
        {
          error: "DEPENDENCY_TASK_NOT_FOUND",
          message: "The selected dependency does not exist in this workspace.",
        },
        { status: 404 }
      );
    }

    const existing = await db.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId,
          dependsOnTaskId: prerequisite.id,
        },
      },
      select: {
        taskId: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "DEPENDENCY_EXISTS",
          message: "This dependency is already attached to the task.",
        },
        { status: 409 }
      );
    }

    if (task.status === "Done" && prerequisite.status !== "Done") {
      return NextResponse.json(
        {
          error: "TASK_ALREADY_DONE",
          message:
            "Reopen the task before adding an incomplete dependency.",
        },
        { status: 409 }
      );
    }

    const edges = await db.taskDependency.findMany({
      where: {
        task: {
          project: {
            workspaceId: access.workspaceId,
          },
        },
      },
      select: {
        taskId: true,
        dependsOnTaskId: true,
      },
    });

    if (wouldCreateDependencyCycle(taskId, prerequisite.id, edges)) {
      return NextResponse.json(
        {
          error: "DEPENDENCY_CYCLE",
          message: "This dependency would create a circular task chain.",
        },
        { status: 409 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.taskDependency.create({
        data: {
          taskId,
          dependsOnTaskId: prerequisite.id,
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: access.workspaceId,
          userId: access.user.id,
          message: `made "${task.title}" depend on "${prerequisite.title}"`,
        },
      });
    });

    return NextResponse.json(
      {
        data: {
          taskId,
          dependsOnTaskId: prerequisite.id,
        },
        message: "Dependency added successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`POST /api/tasks/${taskId}/dependencies failed:`, error);

    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to add dependency." },
      { status: 500 }
    );
  }
}

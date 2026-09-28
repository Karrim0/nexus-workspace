import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTaskStructureContext } from "@/lib/task-structure-access";

type RouteContext = {
  params: Promise<{
    taskId: string;
    dependsOnTaskId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { taskId, dependsOnTaskId } = await context.params;
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

  try {
    const dependency = await db.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId,
          dependsOnTaskId,
        },
      },
      include: {
        dependsOn: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!dependency) {
      return NextResponse.json(
        {
          error: "DEPENDENCY_NOT_FOUND",
          message: "The dependency does not exist.",
        },
        { status: 404 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.taskDependency.delete({
        where: {
          taskId_dependsOnTaskId: {
            taskId,
            dependsOnTaskId,
          },
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: access.workspaceId,
          userId: access.user.id,
          message: `removed dependency "${dependency.dependsOn.title}" from "${task.title}"`,
        },
      });
    });

    return NextResponse.json({ message: "Dependency removed successfully." });
  } catch (error) {
    console.error(
      `DELETE /api/tasks/${taskId}/dependencies/${dependsOnTaskId} failed:`,
      error
    );

    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to remove dependency." },
      { status: 500 }
    );
  }
}

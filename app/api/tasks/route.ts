import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCreateTask } from "@/lib/api-validation";
import {
  getWorkspaceTasks,
  PRODUCT_TEAM_WORKSPACE_ID,
} from "@/lib/workspace-repository";

export async function GET() {
  try {
    const tasks = await getWorkspaceTasks();

    return NextResponse.json({
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("GET /api/tasks failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to load tasks.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

  const result = validateCreateTask(payload);

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
    const project = await db.project.findFirst({
      where: {
        id: result.data.projectId,
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "PROJECT_NOT_FOUND",
          message: "The selected project does not exist.",
        },
        { status: 404 }
      );
    }

    const assignee = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: result.data.assigneeId,
        },
      },
      select: {
        userId: true,
      },
    });

    if (!assignee) {
      return NextResponse.json(
        {
          error: "ASSIGNEE_NOT_FOUND",
          message: "The selected assignee does not exist.",
        },
        { status: 404 }
      );
    }

    const dueDate = new Date(result.data.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        {
          error: "INVALID_DUE_DATE",
          message: "dueDate must be a valid date.",
        },
        { status: 400 }
      );
    }

    const task = await db.$transaction(async (tx) => {
      const createdTask = await tx.task.create({
        data: {
          id: crypto.randomUUID(),
          projectId: result.data.projectId,
          assigneeId: result.data.assigneeId,
          title: result.data.title,
          priority: result.data.priority,
          status: result.data.status,
          dueDate,
        },
      });

      await tx.project.update({
        where: {
          id: result.data.projectId,
        },
        data: {
          totalTasks: {
            increment: 1,
          },
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: result.data.assigneeId,
          message: `was assigned "${createdTask.title}" in ${project.name}`,
        },
      });

      return createdTask;
    });

    return NextResponse.json(
      {
        data: {
          id: task.id,
          title: task.title,
          projectId: task.projectId,
          assigneeId: task.assigneeId,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate?.toISOString() ?? null,
        },
        message: "Task created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to create task.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCreateTask } from "@/lib/api-validation";
import {
  getWorkspaceTasks,
  PRODUCT_TEAM_WORKSPACE_ID,
} from "@/lib/workspace-repository";
import type { Task } from "@/types/workspace";

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

  const project = await db.project.findFirst({
    where: {
      id: result.data.projectId,
      workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
    },
    select: {
      id: true,
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

  const task: Task = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  return NextResponse.json(
    {
      data: task,
      message:
        "Task validated successfully. Database persistence will be added next.",
    },
    { status: 201 }
  );
}

import { NextResponse } from "next/server";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import {
  createWorkspaceTaskComment,
  getWorkspaceTaskComments,
  validateTaskCommentBody,
} from "@/lib/task-comments";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return NextResponse.json(
      {
        error: "WORKSPACE_ACCESS_REQUIRED",
        message: "Active workspace access is required.",
      },
      { status: 403 }
    );
  }

  const { taskId } = await context.params;

  const comments = await getWorkspaceTaskComments(
    taskId,
    access.workspaceId
  );

  if (!comments) {
    return NextResponse.json(
      {
        error: "TASK_NOT_FOUND",
        message: "Task was not found in this workspace.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: comments,
    count: comments.length,
  });
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return NextResponse.json(
      {
        error: "WORKSPACE_ACCESS_REQUIRED",
        message: "Active workspace access is required.",
      },
      { status: 403 }
    );
  }

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

  const validation = validateTaskCommentBody(payload);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: validation.message,
      },
      { status: 400 }
    );
  }

  try {
    const comment = await createWorkspaceTaskComment({
      taskId: (await context.params).taskId,
      workspaceId: access.workspaceId,
      authorId: access.user.id,
      body: validation.body,
    });

    if (!comment) {
      return NextResponse.json(
        {
          error: "TASK_NOT_FOUND",
          message: "Task was not found in this workspace.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST task comment failed:", error);

    return NextResponse.json(
      {
        error: "COMMENT_CREATE_ERROR",
        message: "Unable to add comment.",
      },
      { status: 500 }
    );
  }
}

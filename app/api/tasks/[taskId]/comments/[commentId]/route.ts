import { NextResponse } from "next/server";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import {
  crossSiteMutationResponse,
  isTrustedMutationRequest,
} from "@/lib/auth/http";
import {
  deleteOwnWorkspaceTaskComment,
  updateOwnWorkspaceTaskComment,
  validateTaskCommentBody,
} from "@/lib/task-comments";

type RouteContext = {
  params: Promise<{
    taskId: string;
    commentId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  if (!isTrustedMutationRequest(request)) {
    return crossSiteMutationResponse();
  }

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

  const { taskId, commentId } = await context.params;

  try {
    const comment = await updateOwnWorkspaceTaskComment({
      taskId,
      commentId,
      workspaceId: access.workspaceId,
      authorId: access.user.id,
      body: validation.body,
    });

    if (!comment) {
      return NextResponse.json(
        {
          error: "COMMENT_NOT_FOUND",
          message:
            "Comment was not found or cannot be edited by this user.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: comment,
      message: "Comment updated.",
    });
  } catch (error) {
    console.error("PATCH task comment failed:", error);

    return NextResponse.json(
      {
        error: "COMMENT_UPDATE_ERROR",
        message: "Unable to update comment.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  if (!isTrustedMutationRequest(request)) {
    return crossSiteMutationResponse();
  }

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

  const { taskId, commentId } = await context.params;

  try {
    const deleted = await deleteOwnWorkspaceTaskComment({
      taskId,
      commentId,
      workspaceId: access.workspaceId,
      authorId: access.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        {
          error: "COMMENT_NOT_FOUND",
          message:
            "Comment was not found or cannot be deleted by this user.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Comment deleted.",
    });
  } catch (error) {
    console.error("DELETE task comment failed:", error);

    return NextResponse.json(
      {
        error: "COMMENT_DELETE_ERROR",
        message: "Unable to delete comment.",
      },
      { status: 500 }
    );
  }
}

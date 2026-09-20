import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createWorkspaceForUser,
  getWorkspaceOnboardingState,
} from "@/lib/workspaces/onboarding";
import { validateWorkspaceName } from "@/lib/workspaces/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "UNAUTHENTICATED",
        message: "You must be signed in to create a workspace.",
      },
      { status: 401 }
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

  const validation = validateWorkspaceName(payload);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        errors: validation.errors,
      },
      { status: 400 }
    );
  }

  try {
    const state = await getWorkspaceOnboardingState(user.id);

    if (!state.needsWorkspace) {
      return NextResponse.json(
        {
          error: "ACTIVE_WORKSPACE_EXISTS",
          message: "Your account already has an active workspace.",
          data: state.membership,
        },
        { status: 409 }
      );
    }

    const result = await createWorkspaceForUser({
      userId: user.id,
      name: validation.data.name,
    });

    if (!result.created) {
      return NextResponse.json(
        {
          error: result.reason,
          message: "Your account already has an active workspace.",
          data: {
            workspaceId: result.workspaceId,
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        data: {
          workspace: result.workspace,
          role: result.role,
          status: result.status,
        },
        message: "Workspace created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/workspaces failed:", error);

    return NextResponse.json(
      {
        error: "WORKSPACE_CREATE_ERROR",
        message: "Unable to create workspace.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { validateUpdateMember } from "@/lib/team-validation";
import { PRODUCT_TEAM_WORKSPACE_ID } from "@/lib/workspace-repository";

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

function unauthorized() {
  return NextResponse.json(
    {
      error: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    },
    { status: 401 }
  );
}

function isOwnerRole(role: string) {
  return role.trim().toLowerCase() === "owner";
}

export async function PATCH(request: Request, context: RouteContext) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return unauthorized();
  }

  const { memberId } = await context.params;

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

  const result = validateUpdateMember(payload);

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
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        userId: memberId,
      },
      include: {
        user: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error: "MEMBER_NOT_FOUND",
          message: "This workspace member does not exist.",
        },
        { status: 404 }
      );
    }

    const owner = isOwnerRole(membership.role);

    if (
      owner &&
      result.data.status &&
      result.data.status !== "Active"
    ) {
      return NextResponse.json(
        {
          error: "OWNER_STATUS_PROTECTED",
          message: "The workspace owner must remain active.",
        },
        { status: 400 }
      );
    }

    if (
      owner &&
      result.data.role &&
      !isOwnerRole(result.data.role)
    ) {
      return NextResponse.json(
        {
          error: "OWNER_ROLE_PROTECTED",
          message: "The workspace owner role cannot be changed.",
        },
        { status: 400 }
      );
    }

    const updatedMembership = await db.$transaction(async (tx) => {
      const updated = await tx.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
            userId: memberId,
          },
        },
        data: {
          ...(result.data.role ? { role: result.data.role } : {}),
          ...(result.data.status ? { status: result.data.status } : {}),
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: currentUser.id,
          message: `updated ${membership.user.name}'s workspace access`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      data: {
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        initials: membership.user.initials,
        role: updatedMembership.role,
        status: updatedMembership.status,
      },
      message: "Workspace member updated successfully.",
    });
  } catch (error) {
    console.error(`PATCH /api/team/${memberId} failed:`, error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to update workspace member.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return unauthorized();
  }

  const { memberId } = await context.params;

  try {
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        userId: memberId,
      },
      include: {
        user: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error: "MEMBER_NOT_FOUND",
          message: "This workspace member does not exist.",
        },
        { status: 404 }
      );
    }

    if (isOwnerRole(membership.role)) {
      return NextResponse.json(
        {
          error: "OWNER_DELETE_PROTECTED",
          message: "The workspace owner cannot be removed.",
        },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: {
          assigneeId: memberId,
          project: {
            workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          },
        },
        data: {
          assigneeId: null,
        },
      });

      await tx.projectMember.deleteMany({
        where: {
          userId: memberId,
          project: {
            workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          },
        },
      });

      await tx.workspaceMember.delete({
        where: {
          workspaceId_userId: {
            workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
            userId: memberId,
          },
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: currentUser.id,
          message: `removed ${membership.user.name} from the workspace`,
        },
      });
    });

    return NextResponse.json({
      message: "Workspace member removed successfully.",
    });
  } catch (error) {
    console.error(`DELETE /api/team/${memberId} failed:`, error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to remove workspace member.",
      },
      { status: 500 }
    );
  }
}

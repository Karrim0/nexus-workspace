import { NextResponse } from "next/server";
import {
  canManageWorkspaceMembers,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { validateUpdateMember } from "@/lib/team-validation";

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

function workspaceAccessRequired() {
  return NextResponse.json(
    {
      error: "WORKSPACE_ACCESS_REQUIRED",
      message: "You do not have active access to this workspace.",
    },
    { status: 403 }
  );
}

function memberManagementForbidden() {
  return NextResponse.json(
    {
      error: "FORBIDDEN",
      message: "Only workspace owners and admins can manage members.",
    },
    { status: 403 }
  );
}

function isOwnerRole(role: string) {
  return role.trim().toLowerCase() === "owner";
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return workspaceAccessRequired();
  }

  if (!canManageWorkspaceMembers(access)) {
    return memberManagementForbidden();
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
        workspaceId: access.workspaceId,
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

    if (owner && access.role !== "owner") {
      return NextResponse.json(
        {
          error: "OWNER_PROTECTED",
          message: "Only the workspace owner can manage the owner account.",
        },
        { status: 403 }
      );
    }

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
            workspaceId: access.workspaceId,
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
          workspaceId: access.workspaceId,
          userId: access.user.id,
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
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return workspaceAccessRequired();
  }

  if (!canManageWorkspaceMembers(access)) {
    return memberManagementForbidden();
  }

  const { memberId } = await context.params;

  try {
    const membership = await db.workspaceMember.findFirst({
      where: {
        workspaceId: access.workspaceId,
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
            workspaceId: access.workspaceId,
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
            workspaceId: access.workspaceId,
          },
        },
      });

      await tx.workspaceMember.delete({
        where: {
          workspaceId_userId: {
            workspaceId: access.workspaceId,
            userId: memberId,
          },
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: access.workspaceId,
          userId: access.user.id,
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

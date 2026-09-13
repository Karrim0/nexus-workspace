import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateUpdateMember } from "@/lib/team-validation";
import { PRODUCT_TEAM_WORKSPACE_ID } from "@/lib/workspace-repository";

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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

    if (
      memberId === "member-kareem" &&
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
          userId: "member-kareem",
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
  const { memberId } = await context.params;

  if (memberId === "member-kareem") {
    return NextResponse.json(
      {
        error: "OWNER_DELETE_PROTECTED",
        message: "The workspace owner cannot be removed.",
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
          userId: "member-kareem",
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

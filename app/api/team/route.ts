import { NextResponse } from "next/server";
import {
  canManageWorkspaceMembers,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { validateInviteMember } from "@/lib/team-validation";
import {
  getWorkspaceMembers,
  PRODUCT_TEAM_WORKSPACE_ID,
} from "@/lib/workspace-repository";

function createInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function unauthorized() {
  return NextResponse.json(
    {
      error: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    },
    { status: 401 }
  );
}

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

export async function GET() {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return workspaceAccessRequired();
  }

  try {
    const members = await getWorkspaceMembers();

    return NextResponse.json({
      data: members,
    });
  } catch (error) {
    console.error("GET /api/team failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to load workspace members.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) {
    return workspaceAccessRequired();
  }

  if (!canManageWorkspaceMembers(access)) {
    return memberManagementForbidden();
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

  const result = validateInviteMember(payload);

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
    const existingUser = await db.user.findFirst({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (existingUser) {
      const existingMembership = await db.workspaceMember.findFirst({
        where: {
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: existingUser.id,
        },
        select: {
          userId: true,
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          {
            error: "MEMBER_ALREADY_EXISTS",
            message: "This person is already a member of the workspace.",
          },
          { status: 409 }
        );
      }

      const membership = await db.$transaction(async (tx) => {
        const createdMembership = await tx.workspaceMember.create({
          data: {
            workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
            userId: existingUser.id,
            role: result.data.role,
            status: "Invited",
          },
        });

        await tx.activity.create({
          data: {
            id: crypto.randomUUID(),
            workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
            userId: access.user.id,
            message: `invited ${existingUser.name} to the workspace`,
          },
        });

        return createdMembership;
      });

      return NextResponse.json(
        {
          data: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            initials: createInitials(existingUser.name),
            role: membership.role,
            status: membership.status,
          },
          message: "Member invited successfully.",
        },
        { status: 201 }
      );
    }

    const createdMember = await db.$transaction(async (tx) => {
      const userId = crypto.randomUUID();

      const user = await tx.user.create({
        data: {
          id: userId,
          name: result.data.name,
          email: result.data.email,
          initials: createInitials(result.data.name),
        },
      });

      const membership = await tx.workspaceMember.create({
        data: {
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: user.id,
          role: result.data.role,
          status: "Invited",
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: access.user.id,
          message: `invited ${user.name} to the workspace`,
        },
      });

      return {
        user,
        membership,
      };
    });

    return NextResponse.json(
      {
        data: {
          id: createdMember.user.id,
          name: createdMember.user.name,
          email: createdMember.user.email,
          initials: createdMember.user.initials,
          role: createdMember.membership.role,
          status: createdMember.membership.status,
        },
        message: "Member invited successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/team failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to invite workspace member.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateUpdateProject } from "@/lib/api-validation";
import { PRODUCT_TEAM_WORKSPACE_ID } from "@/lib/workspace-repository";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { projectId } = await context.params;

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

  const result = validateUpdateProject(payload);

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
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          error: "PROJECT_NOT_FOUND",
          message: "The project does not exist.",
        },
        { status: 404 }
      );
    }

    const validMembers = await db.workspaceMember.findMany({
      where: {
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
        userId: {
          in: result.data.memberIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const validMemberIds = new Set(
      validMembers.map((membership) => membership.userId)
    );

    const invalidMemberIds = result.data.memberIds.filter(
      (memberId) => !validMemberIds.has(memberId)
    );

    if (invalidMemberIds.length > 0) {
      return NextResponse.json(
        {
          error: "INVALID_MEMBERS",
          message: "One or more workspace members do not exist.",
          memberIds: invalidMemberIds,
        },
        { status: 400 }
      );
    }

    const updatedProject = await db.$transaction(async (tx) => {
      await tx.projectMember.deleteMany({
        where: {
          projectId,
        },
      });

      const updated = await tx.project.update({
        where: {
          id: projectId,
        },
        data: {
          name: result.data.name,
          description: result.data.description,
          status: result.data.status,
          members: {
            create: result.data.memberIds.map((userId) => ({
              userId,
            })),
          },
        },
        include: {
          members: true,
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: "member-kareem",
          message: `updated ${updated.name}`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      data: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        progress: updatedProject.progress,
        completedTasks: updatedProject.completedTasks,
        totalTasks: updatedProject.totalTasks,
        memberIds: updatedProject.members.map((member) => member.userId),
      },
      message: "Project updated successfully.",
    });
  } catch (error) {
    console.error(`PATCH /api/projects/${projectId} failed:`, error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to update project.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { projectId } = await context.params;

  try {
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
        workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          error: "PROJECT_NOT_FOUND",
          message: "The project does not exist.",
        },
        { status: 404 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.project.delete({
        where: {
          id: projectId,
        },
      });

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          userId: "member-kareem",
          message: `deleted ${existingProject.name}`,
        },
      });
    });

    return NextResponse.json({
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error(`DELETE /api/projects/${projectId} failed:`, error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to delete project.",
      },
      { status: 500 }
    );
  }
}

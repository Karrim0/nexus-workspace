import { NextResponse } from "next/server";
import {
  canManageProjects,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { validateCreateProject } from "@/lib/api-validation";
import {
  getWorkspaceProjects,
  PRODUCT_TEAM_WORKSPACE_ID,
} from "@/lib/workspace-repository";

function workspaceAccessRequired() {
  return NextResponse.json(
    {
      error: "WORKSPACE_ACCESS_REQUIRED",
      message: "You do not have active access to this workspace.",
    },
    { status: 403 }
  );
}

function projectManagementForbidden() {
  return NextResponse.json(
    {
      error: "FORBIDDEN",
      message: "Only workspace owners and admins can manage projects.",
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
    const projects = await getWorkspaceProjects();

    return NextResponse.json({
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("GET /api/projects failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to load projects.",
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

  if (!canManageProjects(access)) {
    return projectManagementForbidden();
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

  const result = validateCreateProject(payload);

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
    const workspace = await db.workspace.findUnique({
      where: {
        id: PRODUCT_TEAM_WORKSPACE_ID,
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        {
          error: "WORKSPACE_NOT_FOUND",
          message: "The workspace does not exist.",
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

    const projectId = crypto.randomUUID();

    const project = await db.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          id: projectId,
          workspaceId: PRODUCT_TEAM_WORKSPACE_ID,
          name: result.data.name,
          description: result.data.description,
          status: result.data.status,
          progress: 0,
          completedTasks: 0,
          totalTasks: 0,
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
          userId: access.user.id,
          message: `created ${createdProject.name}`,
        },
      });

      return createdProject;
    });

    return NextResponse.json(
      {
        data: {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
          completedTasks: project.completedTasks,
          totalTasks: project.totalTasks,
          memberIds: project.members.map((member) => member.userId),
        },
        message: "Project created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects failed:", error);

    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: "Unable to create project.",
      },
      { status: 500 }
    );
  }
}

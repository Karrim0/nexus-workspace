import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCreateProject } from "@/lib/api-validation";
import {
  getWorkspaceProjects,
  PRODUCT_TEAM_WORKSPACE_ID,
} from "@/lib/workspace-repository";
import type { Project } from "@/types/workspace";

export async function GET() {
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

  const project: Project = {
    id: crypto.randomUUID(),
    name: result.data.name,
    description: result.data.description,
    status: result.data.status,
    progress: 0,
    completedTasks: 0,
    totalTasks: 0,
    memberIds: result.data.memberIds,
  };

  return NextResponse.json(
    {
      data: project,
      message:
        "Project validated successfully. Database persistence will be added next.",
    },
    { status: 201 }
  );
}

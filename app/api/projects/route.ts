import { NextResponse } from "next/server";
import { projects, teamMembers } from "@/lib/workspace-data";
import { validateCreateProject } from "@/lib/api-validation";
import type { Project } from "@/types/workspace";

export async function GET() {
  return NextResponse.json({
    data: projects,
    count: projects.length,
  });
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

  const invalidMemberIds = result.data.memberIds.filter(
    (memberId) => !teamMembers.some((member) => member.id === memberId)
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

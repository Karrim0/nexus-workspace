import { NextResponse } from "next/server";
import { canManageProjects, getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();
  if (!access || !canManageProjects(access)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Only workspace owners and admins can manage milestones." },
      { status: 403 }
    );
  }

  const { projectId } = await context.params;
  const project = await db.project.findFirst({
    where: { id: projectId, workspaceId: access.workspaceId },
    select: { id: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ error: "PROJECT_NOT_FOUND", message: "Project not found." }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON", message: "Request body must contain valid JSON." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Request body must be an object." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const dueDateInput = typeof body.dueDate === "string" ? body.dueDate.trim() : "";

  if (title.length < 2 || title.length > 80) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Milestone title must be between 2 and 80 characters." }, { status: 400 });
  }

  const dueDate = dueDateInput ? new Date(dueDateInput) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Milestone due date is invalid." }, { status: 400 });
  }

  const milestone = await db.$transaction(async (tx) => {
    const created = await tx.milestone.create({
      data: {
        id: crypto.randomUUID(),
        projectId,
        title,
        description,
        dueDate,
      },
    });

    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: `created milestone "${created.title}" in ${project.name}`,
      },
    });

    return created;
  });

  return NextResponse.json({ data: milestone, message: "Milestone created successfully." }, { status: 201 });
}

import { NextResponse } from "next/server";
import { canManageProjects, getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { isMilestoneStatus } from "@/lib/milestones";

type RouteContext = { params: Promise<{ projectId: string; milestoneId: string }> };

function forbidden() {
  return NextResponse.json(
    { error: "FORBIDDEN", message: "Only workspace owners and admins can manage milestones." },
    { status: 403 }
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();
  if (!access || !canManageProjects(access)) return forbidden();

  const { projectId, milestoneId } = await context.params;
  const existing = await db.milestone.findFirst({
    where: { id: milestoneId, projectId, project: { workspaceId: access.workspaceId } },
    include: { project: { select: { name: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "MILESTONE_NOT_FOUND", message: "Milestone not found." }, { status: 404 });
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
  const title = "title" in body && typeof body.title === "string" ? body.title.trim() : existing.title;
  const description = "description" in body && typeof body.description === "string" ? body.description.trim() : existing.description;
  const status = "status" in body && typeof body.status === "string" ? body.status : existing.status;
  let dueDate = existing.dueDate;

  if ("dueDate" in body) {
    if (body.dueDate === null || body.dueDate === "") {
      dueDate = null;
    } else if (typeof body.dueDate === "string") {
      const parsed = new Date(body.dueDate);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "VALIDATION_ERROR", message: "Milestone due date is invalid." }, { status: 400 });
      }
      dueDate = parsed;
    } else {
      return NextResponse.json({ error: "VALIDATION_ERROR", message: "Milestone due date is invalid." }, { status: 400 });
    }
  }

  if (title.length < 2 || title.length > 80 || !isMilestoneStatus(status)) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Invalid milestone title or status." }, { status: 400 });
  }

  const updated = await db.$transaction(async (tx) => {
    const item = await tx.milestone.update({
      where: { id: milestoneId },
      data: { title, description, status, dueDate },
    });

    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: `updated milestone "${item.title}" in ${existing.project.name}`,
      },
    });

    return item;
  });

  return NextResponse.json({ data: updated, message: "Milestone updated successfully." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();
  if (!access || !canManageProjects(access)) return forbidden();

  const { projectId, milestoneId } = await context.params;
  const existing = await db.milestone.findFirst({
    where: { id: milestoneId, projectId, project: { workspaceId: access.workspaceId } },
    include: { project: { select: { name: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "MILESTONE_NOT_FOUND", message: "Milestone not found." }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.milestone.delete({ where: { id: milestoneId } });
    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: `deleted milestone "${existing.title}" from ${existing.project.name}`,
      },
    });
  });

  return NextResponse.json({ message: "Milestone deleted successfully." });
}

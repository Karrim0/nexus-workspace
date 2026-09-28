import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTaskStructureContext } from "@/lib/task-structure-access";

type RouteContext = { params: Promise<{ taskId: string }> };

function forbidden() {
  return NextResponse.json({ error: "FORBIDDEN", message: "You cannot change the milestone for this task." }, { status: 403 });
}

export async function PUT(request: Request, context: RouteContext) {
  const { taskId } = await context.params;
  const { access, task, canManage } = await getTaskStructureContext(taskId);

  if (!access) return forbidden();
  if (!task) return NextResponse.json({ error: "TASK_NOT_FOUND", message: "Task not found." }, { status: 404 });
  if (!canManage) return forbidden();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON", message: "Request body must contain valid JSON." }, { status: 400 });
  }

  const milestoneId =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>).milestoneId
      : undefined;

  if (milestoneId !== null && typeof milestoneId !== "string") {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "milestoneId must be a string or null." }, { status: 400 });
  }

  let milestone: { id: string; title: string } | null = null;

  if (milestoneId) {
    milestone = await db.milestone.findFirst({
      where: {
        id: milestoneId,
        projectId: task.projectId,
        project: { workspaceId: access.workspaceId },
      },
      select: { id: true, title: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: "MILESTONE_NOT_FOUND", message: "The selected milestone does not belong to this project." }, { status: 404 });
    }
  }

  await db.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { milestoneId: milestone?.id ?? null },
    });

    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: milestone
          ? `assigned task "${task.title}" to milestone "${milestone.title}"`
          : `removed task "${task.title}" from its milestone`,
      },
    });
  });

  return NextResponse.json({ message: milestone ? "Milestone assigned." : "Milestone removed." });
}

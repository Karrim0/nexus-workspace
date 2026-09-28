import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTaskStructureContext } from "@/lib/task-structure-access";

type RouteContext = { params: Promise<{ taskId: string }> };

function forbidden() {
  return NextResponse.json(
    { error: "FORBIDDEN", message: "You cannot manage labels for this task." },
    { status: 403 }
  );
}

export async function POST(request: Request, context: RouteContext) {
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

  const labelId =
    typeof payload === "object" && payload !== null && !Array.isArray(payload) &&
    typeof (payload as Record<string, unknown>).labelId === "string"
      ? ((payload as Record<string, unknown>).labelId as string).trim()
      : "";

  if (!labelId) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "labelId is required." }, { status: 400 });
  }

  const label = await db.label.findFirst({
    where: { id: labelId, workspaceId: access.workspaceId },
    select: { id: true, name: true },
  });

  if (!label) {
    return NextResponse.json({ error: "LABEL_NOT_FOUND", message: "Label not found." }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.taskLabel.upsert({
      where: { taskId_labelId: { taskId, labelId } },
      update: {},
      create: { taskId, labelId },
    });

    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: `added label "${label.name}" to task "${task.title}"`,
      },
    });
  });

  return NextResponse.json({ message: "Label added to task." });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { taskId } = await context.params;
  const { access, task, canManage } = await getTaskStructureContext(taskId);

  if (!access) return forbidden();
  if (!task) return NextResponse.json({ error: "TASK_NOT_FOUND", message: "Task not found." }, { status: 404 });
  if (!canManage) return forbidden();

  const labelId = new URL(request.url).searchParams.get("labelId")?.trim() ?? "";
  if (!labelId) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "labelId is required." }, { status: 400 });
  }

  const assignment = await db.taskLabel.findUnique({
    where: { taskId_labelId: { taskId, labelId } },
    include: { label: { select: { name: true, workspaceId: true } } },
  });

  if (!assignment || assignment.label.workspaceId !== access.workspaceId) {
    return NextResponse.json({ error: "LABEL_NOT_FOUND", message: "Task label was not found." }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.taskLabel.delete({ where: { taskId_labelId: { taskId, labelId } } });
    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: `removed label "${assignment.label.name}" from task "${task.title}"`,
      },
    });
  });

  return NextResponse.json({ message: "Label removed from task." });
}

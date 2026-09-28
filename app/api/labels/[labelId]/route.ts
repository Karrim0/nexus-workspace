import { NextResponse } from "next/server";
import {
  canManageAllTasks,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { isLabelColor } from "@/lib/task-labels";

type RouteContext = { params: Promise<{ labelId: string }> };

function forbidden() {
  return NextResponse.json(
    { error: "FORBIDDEN", message: "Only workspace owners and admins can manage labels." },
    { status: 403 }
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();
  if (!access) return forbidden();
  if (!canManageAllTasks(access)) return forbidden();

  const { labelId } = await context.params;
  const existing = await db.label.findFirst({
    where: { id: labelId, workspaceId: access.workspaceId },
  });

  if (!existing) {
    return NextResponse.json({ error: "LABEL_NOT_FOUND", message: "Label not found." }, { status: 404 });
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
  const name = typeof body.name === "string" ? body.name.trim() : existing.name;
  const color = typeof body.color === "string" ? body.color.trim() : existing.color;

  if (name.length < 2 || name.length > 28 || !isLabelColor(color)) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Invalid label name or color." }, { status: 400 });
  }

  const duplicate = await db.label.findFirst({
    where: {
      workspaceId: access.workspaceId,
      id: { not: labelId },
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });

  if (duplicate) {
    return NextResponse.json({ error: "LABEL_EXISTS", message: "A label with this name already exists." }, { status: 409 });
  }

  const updated = await db.label.update({
    where: { id: labelId },
    data: { name, color },
  });

  return NextResponse.json({
    data: { id: updated.id, name: updated.name, color: updated.color },
    message: "Label updated successfully.",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();
  if (!access || !canManageAllTasks(access)) return forbidden();

  const { labelId } = await context.params;
  const existing = await db.label.findFirst({
    where: { id: labelId, workspaceId: access.workspaceId },
  });

  if (!existing) {
    return NextResponse.json({ error: "LABEL_NOT_FOUND", message: "Label not found." }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.label.delete({ where: { id: labelId } });
    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: `deleted label "${existing.name}"`,
      },
    });
  });

  return NextResponse.json({ message: "Label deleted successfully." });
}

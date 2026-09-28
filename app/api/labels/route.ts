import { NextResponse } from "next/server";
import {
  canManageAllTasks,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { isLabelColor, normalizeLabelColor } from "@/lib/task-labels";

function accessRequired() {
  return NextResponse.json(
    { error: "WORKSPACE_ACCESS_REQUIRED", message: "Workspace access is required." },
    { status: 403 }
  );
}

export async function GET() {
  const access = await getCurrentWorkspaceAccess();
  if (!access) return accessRequired();

  const labels = await db.label.findMany({
    where: { workspaceId: access.workspaceId },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json({
    data: labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: normalizeLabelColor(label.color),
    })),
  });
}

export async function POST(request: Request) {
  const access = await getCurrentWorkspaceAccess();
  if (!access) return accessRequired();

  if (!canManageAllTasks(access)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "Only workspace owners and admins can create labels." },
      { status: 403 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must contain valid JSON." },
      { status: 400 }
    );
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Request body must be an object." },
      { status: 400 }
    );
  }

  const body = payload as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const color = typeof body.color === "string" ? body.color.trim() : "slate";

  if (name.length < 2 || name.length > 28) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Label name must be between 2 and 28 characters." },
      { status: 400 }
    );
  }

  if (!isLabelColor(color)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Label color is invalid." },
      { status: 400 }
    );
  }

  const existing = await db.label.findFirst({
    where: {
      workspaceId: access.workspaceId,
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "LABEL_EXISTS", message: "A label with this name already exists." },
      { status: 409 }
    );
  }

  const label = await db.$transaction(async (tx) => {
    const created = await tx.label.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        name,
        color,
      },
    });

    await tx.activity.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        message: `created label "${created.name}"`,
      },
    });

    return created;
  });

  return NextResponse.json(
    {
      data: { id: label.id, name: label.name, color: normalizeLabelColor(label.color) },
      message: "Label created successfully.",
    },
    { status: 201 }
  );
}

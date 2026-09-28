import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { normalizeSavedTaskViewFilters } from "@/lib/saved-task-views";

type RouteContext = {
  params: Promise<{ viewId: string }>;
};

function accessRequired() {
  return NextResponse.json(
    {
      error: "WORKSPACE_ACCESS_REQUIRED",
      message: "You do not have active access to this workspace.",
    },
    { status: 403 }
  );
}

function parseName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : "";
  return name.length >= 2 && name.length <= 50 ? name : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) return accessRequired();

  const { viewId } = await context.params;
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must contain valid JSON." },
      { status: 400 }
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const existing = await db.savedTaskView.findFirst({
    where: {
      id: viewId,
      workspaceId: access.workspaceId,
      userId: access.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "VIEW_NOT_FOUND", message: "Saved task view not found." },
      { status: 404 }
    );
  }

  const record = payload as Record<string, unknown>;
  const data: Prisma.SavedTaskViewUpdateInput = {};

  if ("name" in record) {
    const name = parseName(record.name);
    if (!name) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "View name must be between 2 and 50 characters.",
        },
        { status: 400 }
      );
    }
    data.name = name;
  }

  if (record.filters && typeof record.filters === "object" && !Array.isArray(record.filters)) {
    const filters = record.filters as Record<string, unknown>;
    Object.assign(
      data,
      normalizeSavedTaskViewFilters({
        query: filters.query,
        projectId: filters.projectId,
        priority: filters.priority,
        status: filters.status,
        labelId: filters.labelId,
        milestoneId: filters.milestoneId,
        due: filters.due,
        sort: filters.sort,
      })
    );
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Provide a name or filters to update." },
      { status: 400 }
    );
  }

  try {
    const view = await db.savedTaskView.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json({ data: view, message: "Saved task view updated." });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "VIEW_NAME_EXISTS",
          message: "You already have a saved task view with this name.",
        },
        { status: 409 }
      );
    }

    console.error(`PATCH /api/task-views/${viewId} failed:`, error);
    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to update saved task view." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) return accessRequired();

  const { viewId } = await context.params;
  const result = await db.savedTaskView.deleteMany({
    where: {
      id: viewId,
      workspaceId: access.workspaceId,
      userId: access.user.id,
    },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "VIEW_NOT_FOUND", message: "Saved task view not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Saved task view deleted." });
}

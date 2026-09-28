import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentWorkspaceAccess } from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import { normalizeSavedTaskViewFilters } from "@/lib/saved-task-views";

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

  if (name.length < 2 || name.length > 50) {
    return null;
  }

  return name;
}

export async function GET() {
  const access = await getCurrentWorkspaceAccess();

  if (!access) return accessRequired();

  const views = await db.savedTaskView.findMany({
    where: {
      workspaceId: access.workspaceId,
      userId: access.user.id,
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ data: views });
}

export async function POST(request: Request) {
  const access = await getCurrentWorkspaceAccess();

  if (!access) return accessRequired();

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

  const record = payload as Record<string, unknown>;
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

  const filters = normalizeSavedTaskViewFilters({
    query: record.query,
    projectId: record.projectId,
    priority: record.priority,
    status: record.status,
    labelId: record.labelId,
    milestoneId: record.milestoneId,
    due: record.due,
    sort: record.sort,
  });

  try {
    const view = await db.savedTaskView.create({
      data: {
        id: crypto.randomUUID(),
        workspaceId: access.workspaceId,
        userId: access.user.id,
        name,
        ...filters,
      },
    });

    return NextResponse.json(
      { data: view, message: "Task view saved." },
      { status: 201 }
    );
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

    console.error("POST /api/task-views failed:", error);
    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to save task view." },
      { status: 500 }
    );
  }
}

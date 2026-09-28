import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  canManageAllTasks,
  getCurrentWorkspaceAccess,
} from "@/lib/auth/workspace-access";
import { db } from "@/lib/db";
import {
  getTaskWorkflowTimestamps,
  isTaskPriority,
  isTaskStatus,
} from "@/lib/task-workflow";
import type { TaskPriority, TaskStatus } from "@/types/workspace";

type BulkAction = "status" | "priority" | "assignee" | "dueDate" | "delete";

type ParsedBulkRequest =
  | { success: true; taskIds: string[]; action: BulkAction; value: string | null }
  | { success: false; message: string };

function parseBulkRequest(payload: unknown): ParsedBulkRequest {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { success: false, message: "Request body must be a JSON object." };
  }

  const record = payload as Record<string, unknown>;
  const rawIds = Array.isArray(record.taskIds) ? record.taskIds : [];
  const taskIds = Array.from(
    new Set(
      rawIds
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  if (taskIds.length === 0) {
    return { success: false, message: "Select at least one task." };
  }

  if (taskIds.length > 100) {
    return { success: false, message: "Bulk actions are limited to 100 tasks at a time." };
  }

  const action = record.action;
  if (
    action !== "status" &&
    action !== "priority" &&
    action !== "assignee" &&
    action !== "dueDate" &&
    action !== "delete"
  ) {
    return { success: false, message: "Bulk action is invalid." };
  }

  if (action === "delete") {
    return { success: true, taskIds, action, value: null };
  }

  const value = typeof record.value === "string" ? record.value.trim() : "";
  if (!value) {
    return { success: false, message: "Bulk action value is required." };
  }

  if (action === "status" && !isTaskStatus(value)) {
    return { success: false, message: "Task status is invalid." };
  }

  if (action === "priority" && !isTaskPriority(value)) {
    return { success: false, message: "Task priority is invalid." };
  }

  if (action === "dueDate" && Number.isNaN(new Date(value).getTime())) {
    return { success: false, message: "Due date must be a valid date." };
  }

  return { success: true, taskIds, action, value };
}

async function syncProjectProgress(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  const [totalTasks, completedTasks] = await Promise.all([
    tx.task.count({ where: { projectId } }),
    tx.task.count({ where: { projectId, status: "Done" } }),
  ]);

  await tx.project.update({
    where: { id: projectId },
    data: {
      totalTasks,
      completedTasks,
      progress:
        totalTasks === 0
          ? 0
          : Math.round((completedTasks / totalTasks) * 100),
    },
  });
}

function workspaceAccessRequired() {
  return NextResponse.json(
    {
      error: "WORKSPACE_ACCESS_REQUIRED",
      message: "You do not have active access to this workspace.",
    },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  const access = await getCurrentWorkspaceAccess();
  if (!access) return workspaceAccessRequired();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must contain valid JSON." },
      { status: 400 }
    );
  }

  const parsed = parseBulkRequest(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: parsed.message },
      { status: 400 }
    );
  }

  const tasks = await db.task.findMany({
    where: {
      id: { in: parsed.taskIds },
      project: { workspaceId: access.workspaceId },
    },
    select: {
      id: true,
      title: true,
      projectId: true,
      assigneeId: true,
      status: true,
      startedAt: true,
      completedAt: true,
    },
  });

  if (tasks.length !== parsed.taskIds.length) {
    return NextResponse.json(
      {
        error: "TASK_NOT_FOUND",
        message: "One or more selected tasks no longer exist in this workspace.",
      },
      { status: 404 }
    );
  }

  const manageAll = canManageAllTasks(access);

  if (!manageAll) {
    if (parsed.action !== "status") {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          message: "Members can only bulk-update the status of their own assigned tasks.",
        },
        { status: 403 }
      );
    }

    if (tasks.some((task) => task.assigneeId !== access.user.id)) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          message: "You can only update tasks assigned to you.",
        },
        { status: 403 }
      );
    }
  }

  if (parsed.action === "assignee") {
    const assignee = await db.workspaceMember.findFirst({
      where: {
        workspaceId: access.workspaceId,
        userId: parsed.value!,
        status: { equals: "Active", mode: "insensitive" },
      },
      select: { userId: true },
    });

    if (!assignee) {
      return NextResponse.json(
        {
          error: "ASSIGNEE_NOT_FOUND",
          message: "The selected assignee is not an active workspace member.",
        },
        { status: 400 }
      );
    }
  }

  if (parsed.action === "status" && parsed.value === "Done") {
    const transitioningIds = tasks
      .filter((task) => task.status !== "Done")
      .map((task) => task.id);

    if (transitioningIds.length > 0) {
      const [subtaskBlockers, dependencyBlockers] = await Promise.all([
        db.taskSubtask.findMany({
          where: {
            taskId: { in: transitioningIds },
            completed: false,
          },
          select: { taskId: true },
        }),
        db.taskDependency.findMany({
          where: {
            taskId: { in: transitioningIds },
            dependsOn: { status: { not: "Done" } },
          },
          select: { taskId: true },
        }),
      ]);

      const blockedIds = new Set([
        ...subtaskBlockers.map((item) => item.taskId),
        ...dependencyBlockers.map((item) => item.taskId),
      ]);

      if (blockedIds.size > 0) {
        const blockedTitles = tasks
          .filter((task) => blockedIds.has(task.id))
          .slice(0, 4)
          .map((task) => task.title);

        return NextResponse.json(
          {
            error: "TASK_COMPLETION_BLOCKED",
            message: `Complete outstanding subtasks or dependencies before finishing: ${blockedTitles.join(", ")}${blockedIds.size > 4 ? ` and ${blockedIds.size - 4} more` : ""}.`,
          },
          { status: 409 }
        );
      }
    }
  }

  const affectedProjectIds = Array.from(
    new Set(tasks.map((task) => task.projectId))
  );

  try {
    await db.$transaction(async (tx) => {
      if (parsed.action === "delete") {
        if (!manageAll) {
          throw new Error("BULK_DELETE_FORBIDDEN");
        }

        await tx.task.deleteMany({
          where: { id: { in: parsed.taskIds } },
        });
      } else if (parsed.action === "status") {
        const nextStatus = parsed.value as TaskStatus;
        const now = new Date();

        for (const task of tasks) {
          const timestamps = getTaskWorkflowTimestamps(
            nextStatus,
            {
              startedAt: task.startedAt,
              completedAt: task.completedAt,
            },
            now
          );

          await tx.task.update({
            where: { id: task.id },
            data: {
              status: nextStatus,
              ...timestamps,
            },
          });
        }
      } else if (parsed.action === "priority") {
        await tx.task.updateMany({
          where: { id: { in: parsed.taskIds } },
          data: { priority: parsed.value as TaskPriority },
        });
      } else if (parsed.action === "assignee") {
        await tx.task.updateMany({
          where: { id: { in: parsed.taskIds } },
          data: { assigneeId: parsed.value! },
        });
      } else if (parsed.action === "dueDate") {
        await tx.task.updateMany({
          where: { id: { in: parsed.taskIds } },
          data: { dueDate: new Date(parsed.value!) },
        });
      }

      if (parsed.action === "status" || parsed.action === "delete") {
        for (const projectId of affectedProjectIds) {
          await syncProjectProgress(tx, projectId);
        }
      }

      const actionDescription =
        parsed.action === "delete"
          ? `deleted ${tasks.length} tasks`
          : parsed.action === "status"
            ? `moved ${tasks.length} tasks to ${parsed.value}`
            : parsed.action === "priority"
              ? `set ${tasks.length} tasks to ${parsed.value} priority`
              : parsed.action === "assignee"
                ? `reassigned ${tasks.length} tasks`
                : `updated the due date for ${tasks.length} tasks`;

      await tx.activity.create({
        data: {
          id: crypto.randomUUID(),
          workspaceId: access.workspaceId,
          userId: access.user.id,
          message: actionDescription,
        },
      });
    });

    return NextResponse.json({
      data: { count: tasks.length, action: parsed.action },
      message: `Updated ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}.`,
    });
  } catch (error) {
    console.error("POST /api/tasks/bulk failed:", error);
    return NextResponse.json(
      { error: "DATABASE_ERROR", message: "Unable to apply bulk task action." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import {
  projects,
  tasks,
  teamMembers,
} from "@/lib/workspace-data";
import { validateCreateTask } from "@/lib/api-validation";
import type { Task } from "@/types/workspace";

export async function GET() {
  return NextResponse.json({
    data: tasks,
    count: tasks.length,
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

  const result = validateCreateTask(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        errors: result.errors,
      },
      { status: 400 }
    );
  }

  const projectExists = projects.some(
    (project) => project.id === result.data.projectId
  );

  if (!projectExists) {
    return NextResponse.json(
      {
        error: "PROJECT_NOT_FOUND",
        message: "The selected project does not exist.",
      },
      { status: 404 }
    );
  }

  const assigneeExists = teamMembers.some(
    (member) => member.id === result.data.assigneeId
  );

  if (!assigneeExists) {
    return NextResponse.json(
      {
        error: "ASSIGNEE_NOT_FOUND",
        message: "The selected assignee does not exist.",
      },
      { status: 404 }
    );
  }

  const task: Task = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  return NextResponse.json(
    {
      data: task,
      message:
        "Task validated successfully. Database persistence will be added next.",
    },
    { status: 201 }
  );
}

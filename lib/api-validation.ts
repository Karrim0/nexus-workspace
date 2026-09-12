import type {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/types/workspace";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export type CreateProjectInput = {
  name: string;
  description: string;
  status: ProjectStatus;
  memberIds: string[];
};

export type UpdateProjectInput = CreateProjectInput;

export type CreateTaskInput = {
  title: string;
  projectId: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
};

const projectStatuses: ProjectStatus[] = [
  "Planning",
  "In Progress",
  "Completed",
];

const taskPriorities: TaskPriority[] = ["Low", "Medium", "High"];

const taskStatuses: TaskStatus[] = [
  "Todo",
  "In Progress",
  "Review",
  "Done",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateProjectPayload(
  payload: unknown
): ValidationResult<CreateProjectInput> {
  if (!isRecord(payload)) {
    return { success: false, errors: ["Request body must be a JSON object."] };
  }

  const errors: string[] = [];

  const name =
    typeof payload.name === "string" ? payload.name.trim() : "";
  const description =
    typeof payload.description === "string"
      ? payload.description.trim()
      : "";
  const status = payload.status;
  const memberIds = payload.memberIds;

  if (name.length < 3) {
    errors.push("Project name must be at least 3 characters.");
  }

  if (description.length < 10) {
    errors.push("Project description must be at least 10 characters.");
  }

  if (
    typeof status !== "string" ||
    !projectStatuses.includes(status as ProjectStatus)
  ) {
    errors.push("Project status is invalid.");
  }

  if (
    !Array.isArray(memberIds) ||
    !memberIds.every((memberId) => typeof memberId === "string")
  ) {
    errors.push("memberIds must be an array of strings.");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      description,
      status: status as ProjectStatus,
      memberIds: memberIds as string[],
    },
  };
}

export function validateCreateProject(
  payload: unknown
): ValidationResult<CreateProjectInput> {
  return validateProjectPayload(payload);
}

export function validateUpdateProject(
  payload: unknown
): ValidationResult<UpdateProjectInput> {
  return validateProjectPayload(payload);
}

export function validateCreateTask(
  payload: unknown
): ValidationResult<CreateTaskInput> {
  if (!isRecord(payload)) {
    return { success: false, errors: ["Request body must be a JSON object."] };
  }

  const errors: string[] = [];

  const title =
    typeof payload.title === "string" ? payload.title.trim() : "";
  const projectId =
    typeof payload.projectId === "string" ? payload.projectId.trim() : "";
  const assigneeId =
    typeof payload.assigneeId === "string" ? payload.assigneeId.trim() : "";
  const dueDate =
    typeof payload.dueDate === "string" ? payload.dueDate.trim() : "";
  const priority = payload.priority;
  const status = payload.status;

  if (title.length < 3) {
    errors.push("Task title must be at least 3 characters.");
  }

  if (!projectId) {
    errors.push("projectId is required.");
  }

  if (!assigneeId) {
    errors.push("assigneeId is required.");
  }

  if (
    typeof priority !== "string" ||
    !taskPriorities.includes(priority as TaskPriority)
  ) {
    errors.push("Task priority is invalid.");
  }

  if (
    typeof status !== "string" ||
    !taskStatuses.includes(status as TaskStatus)
  ) {
    errors.push("Task status is invalid.");
  }

  if (!dueDate) {
    errors.push("dueDate is required.");
  } else if (Number.isNaN(new Date(dueDate).getTime())) {
    errors.push("dueDate must be a valid date.");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      title,
      projectId,
      assigneeId,
      priority: priority as TaskPriority,
      status: status as TaskStatus,
      dueDate,
    },
  };
}

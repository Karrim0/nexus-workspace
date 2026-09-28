import type { TaskPriority, TaskStatus } from "@/types/workspace";

export const TASK_STATUSES: TaskStatus[] = [
  "Backlog",
  "Todo",
  "In Progress",
  "Review",
  "Blocked",
  "Done",
];

export const TASK_PRIORITIES: TaskPriority[] = [
  "No Priority",
  "Low",
  "Medium",
  "High",
  "Urgent",
];

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; description: string; tone: string }
> = {
  Backlog: {
    label: "Backlog",
    description: "Captured but not committed to the active queue.",
    tone: "text-zinc-400 border-zinc-800 bg-zinc-900/60",
  },
  Todo: {
    label: "Todo",
    description: "Ready to be picked up.",
    tone: "text-sky-300 border-sky-950 bg-sky-950/30",
  },
  "In Progress": {
    label: "In Progress",
    description: "Actively being worked on.",
    tone: "text-amber-300 border-amber-950 bg-amber-950/30",
  },
  Review: {
    label: "Review",
    description: "Waiting for review or approval.",
    tone: "text-violet-300 border-violet-950 bg-violet-950/30",
  },
  Blocked: {
    label: "Blocked",
    description: "Unable to move forward until an impediment is cleared.",
    tone: "text-red-300 border-red-950 bg-red-950/30",
  },
  Done: {
    label: "Done",
    description: "Completed and counted toward project progress.",
    tone: "text-emerald-300 border-emerald-950 bg-emerald-950/30",
  },
};

export const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; weight: number; tone: string }
> = {
  "No Priority": {
    label: "No Priority",
    weight: 0,
    tone: "text-zinc-500 border-zinc-800 bg-zinc-900/40",
  },
  Low: {
    label: "Low",
    weight: 1,
    tone: "text-zinc-300 border-zinc-800 bg-zinc-900/40",
  },
  Medium: {
    label: "Medium",
    weight: 2,
    tone: "text-sky-300 border-sky-950 bg-sky-950/25",
  },
  High: {
    label: "High",
    weight: 3,
    tone: "text-amber-300 border-amber-950 bg-amber-950/25",
  },
  Urgent: {
    label: "Urgent",
    weight: 4,
    tone: "text-red-300 border-red-950 bg-red-950/30",
  },
};

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

export function normalizeTaskStatus(value: string): TaskStatus {
  return isTaskStatus(value) ? value : "Todo";
}

export function normalizeTaskPriority(value: string): TaskPriority {
  return isTaskPriority(value) ? value : "Medium";
}

export function getTaskWorkflowTimestamps(
  nextStatus: TaskStatus,
  current: { startedAt: Date | null; completedAt: Date | null },
  now = new Date()
) {
  let startedAt = current.startedAt;
  let completedAt = current.completedAt;

  if (
    !startedAt &&
    ["In Progress", "Review", "Blocked", "Done"].includes(nextStatus)
  ) {
    startedAt = now;
  }

  if (nextStatus === "Done") {
    completedAt = current.completedAt ?? now;
  } else if (current.completedAt) {
    completedAt = null;
  }

  return { startedAt, completedAt };
}

import type { ProjectStatus } from "@/types/workspace";

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "Draft",
  "Active",
  "On Hold",
  "Completed",
  "Archived",
];

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  {
    label: string;
    description: string;
    badgeClassName: string;
  }
> = {
  Draft: {
    label: "Draft",
    description: "Scope and team are still being prepared.",
    badgeClassName: "border-zinc-700 bg-zinc-900/70 text-zinc-400",
  },
  Active: {
    label: "Active",
    description: "Work is currently moving through the delivery workflow.",
    badgeClassName: "border-emerald-900/60 bg-emerald-950/30 text-emerald-300",
  },
  "On Hold": {
    label: "On Hold",
    description: "Delivery is intentionally paused until the blocker is resolved.",
    badgeClassName: "border-amber-900/60 bg-amber-950/30 text-amber-300",
  },
  Completed: {
    label: "Completed",
    description: "The project has reached its intended delivery outcome.",
    badgeClassName: "border-sky-900/60 bg-sky-950/30 text-sky-300",
  },
  Archived: {
    label: "Archived",
    description: "The project is retained for history but is no longer active.",
    badgeClassName: "border-zinc-800 bg-zinc-900/40 text-zinc-500",
  },
};

export function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus);
}

export function normalizeProjectStatus(value: string): ProjectStatus {
  if (isProjectStatus(value)) {
    return value;
  }

  // Compatibility with workspaces created before the lifecycle migration.
  if (value === "Planning") {
    return "Draft";
  }

  if (value === "In Progress") {
    return "Active";
  }

  return "Draft";
}

export function isOpenProjectStatus(value: string) {
  const status = normalizeProjectStatus(value);
  return status !== "Completed" && status !== "Archived";
}

export function compareProjectStatuses(a: string, b: string) {
  const aIndex = PROJECT_STATUSES.indexOf(normalizeProjectStatus(a));
  const bIndex = PROJECT_STATUSES.indexOf(normalizeProjectStatus(b));
  return aIndex - bIndex;
}

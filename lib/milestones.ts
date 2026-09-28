export const MILESTONE_STATUSES = ["Open", "Completed"] as const;

export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const MILESTONE_STATUS_META: Record<
  MilestoneStatus,
  { label: string; badgeClassName: string }
> = {
  Open: {
    label: "Open",
    badgeClassName: "border-blue-900/70 bg-blue-950/30 text-blue-300",
  },
  Completed: {
    label: "Completed",
    badgeClassName: "border-emerald-900/70 bg-emerald-950/30 text-emerald-300",
  },
};

export function isMilestoneStatus(value: string): value is MilestoneStatus {
  return MILESTONE_STATUSES.includes(value as MilestoneStatus);
}

export function normalizeMilestoneStatus(value: string): MilestoneStatus {
  return isMilestoneStatus(value) ? value : "Open";
}

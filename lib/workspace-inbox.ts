type InboxTask = {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
};

type InboxActivity = {
  id: string;
  memberId: string | null;
  message: string;
  occurredAt: string;
};

function isDone(status: string) {
  return status.trim().toLowerCase() === "done";
}

function parseDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isOverdue(task: InboxTask, now: Date) {
  if (isDone(task.status)) {
    return false;
  }

  const dueDate = parseDate(task.dueDate);

  return Boolean(dueDate && dueDate.getTime() < now.getTime());
}

function isDueSoon(task: InboxTask, now: Date) {
  if (isDone(task.status)) {
    return false;
  }

  const dueDate = parseDate(task.dueDate);

  if (!dueDate) {
    return false;
  }

  const sevenDaysFromNow =
    now.getTime() + 7 * 24 * 60 * 60 * 1000;

  return (
    dueDate.getTime() >= now.getTime() &&
    dueDate.getTime() <= sevenDaysFromNow
  );
}

export function buildWorkspaceInbox(input: {
  tasks: InboxTask[];
  activity: InboxActivity[];
  currentUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  const assignedOpenTasks = input.tasks.filter(
    (task) =>
      task.assigneeId === input.currentUserId &&
      !isDone(task.status)
  );

  const overdue = assignedOpenTasks
    .filter((task) => isOverdue(task, now))
    .sort((a, b) => {
      const aDue = parseDate(a.dueDate)?.getTime() ?? 0;
      const bDue = parseDate(b.dueDate)?.getTime() ?? 0;

      return aDue - bDue;
    });

  const dueSoon = assignedOpenTasks
    .filter((task) => isDueSoon(task, now))
    .sort((a, b) => {
      const aDue = parseDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bDue = parseDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;

      return aDue - bDue;
    });

  const highPriority = assignedOpenTasks.filter((task) =>
    ["high", "urgent"].includes(task.priority.trim().toLowerCase())
  );

  const recentActivity = input.activity.slice(0, 12);

  const myRecentActivity = recentActivity.filter(
    (activity) => activity.memberId === input.currentUserId
  );

  return {
    summary: {
      openAssigned: assignedOpenTasks.length,
      overdue: overdue.length,
      dueSoon: dueSoon.length,
      highPriority: highPriority.length,
      recentEvents: recentActivity.length,
      myRecentEvents: myRecentActivity.length,
    },
    overdue,
    dueSoon,
    highPriority,
    recentActivity,
  };
}

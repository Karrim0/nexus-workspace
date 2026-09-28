import { isOpenProjectStatus } from "@/lib/project-lifecycle";
import { TASK_STATUSES } from "@/lib/task-workflow";

type InsightProject = {
  status: string;
  completedTasks: number;
  totalTasks: number;
};

type InsightTask = {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
};

type InsightMember = {
  id: string;
  name: string;
  initials: string;
  status: string;
};

type WorkspaceInsightsInput = {
  projects: InsightProject[];
  tasks: InsightTask[];
  members: InsightMember[];
};

function isDone(status: string) {
  return status.trim().toLowerCase() === "done";
}

function isActiveMember(status: string) {
  return status.trim().toLowerCase() === "active";
}

function parseDueDate(task: InsightTask) {
  if (!task.dueDate) {
    return null;
  }

  const dueDate = new Date(task.dueDate);

  return Number.isNaN(dueDate.getTime()) ? null : dueDate;
}

function isOverdue(task: InsightTask, now: Date) {
  if (isDone(task.status)) {
    return false;
  }

  const dueDate = parseDueDate(task);

  return Boolean(dueDate && dueDate.getTime() < now.getTime());
}

function isDueSoon(task: InsightTask, now: Date, days = 7) {
  if (isDone(task.status)) {
    return false;
  }

  const dueDate = parseDueDate(task);

  if (!dueDate) {
    return false;
  }

  const windowEnd = new Date(
    now.getTime() + days * 24 * 60 * 60 * 1000
  );

  return (
    dueDate.getTime() >= now.getTime() &&
    dueDate.getTime() <= windowEnd.getTime()
  );
}

function isHighPriorityOpen(task: InsightTask) {
  return (
    ["high", "urgent"].includes(task.priority.trim().toLowerCase()) &&
    !isDone(task.status)
  );
}

function attentionScore(task: InsightTask, now: Date) {
  let score = 0;

  if (isOverdue(task, now)) {
    score += 100;
  }

  if (isHighPriorityOpen(task)) {
    score += 40;
  }

  if (isDueSoon(task, now)) {
    score += 20;
  }

  if (!task.assigneeId && !isDone(task.status)) {
    score += 10;
  }

  return score;
}

export function buildWorkspaceInsights(
  { projects, tasks, members }: WorkspaceInsightsInput,
  now = new Date()
) {
  const completedTasks = tasks.filter((task) => isDone(task.status)).length;
  const openTasks = tasks.length - completedTasks;

  const completionRate =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks / tasks.length) * 100);

  const openProjects = projects.filter((project) =>
    isOpenProjectStatus(project.status)
  ).length;

  const activeMembers = members.filter((member) =>
    isActiveMember(member.status)
  ).length;

  const overdueTasks = tasks.filter((task) => isOverdue(task, now)).length;

  const dueSoonTasks = tasks.filter((task) =>
    isDueSoon(task, now)
  ).length;

  const highPriorityOpenTasks = tasks.filter((task) =>
    isHighPriorityOpen(task)
  ).length;

  const unassignedTasks = tasks.filter(
    (task) => !task.assigneeId && !isDone(task.status)
  ).length;

  const statusDistribution = TASK_STATUSES.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length,
  }));

  const workload = members
    .filter((member) => isActiveMember(member.status))
    .map((member) => {
      const assigned = tasks.filter(
        (task) => task.assigneeId === member.id
      );

      const completed = assigned.filter((task) =>
        isDone(task.status)
      ).length;

      const overdue = assigned.filter((task) =>
        isOverdue(task, now)
      ).length;

      const dueSoon = assigned.filter((task) =>
        isDueSoon(task, now)
      ).length;

      return {
        id: member.id,
        name: member.name,
        initials: member.initials,
        assigned: assigned.length,
        completed,
        open: assigned.length - completed,
        overdue,
        dueSoon,
      };
    })
    .sort((a, b) => b.open - a.open || b.assigned - a.assigned);

  const maxOpenWorkload = Math.max(
    1,
    ...workload.map((member) => member.open)
  );

  const attentionQueue = tasks
    .filter((task) => attentionScore(task, now) > 0)
    .map((task) => ({
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeId: task.assigneeId,
      overdue: isOverdue(task, now),
      dueSoon: isDueSoon(task, now),
      highPriority: isHighPriorityOpen(task),
      unassigned: !task.assigneeId && !isDone(task.status),
      score: attentionScore(task, now),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aDue = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.POSITIVE_INFINITY;

      const bDue = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.POSITIVE_INFINITY;

      return aDue - bDue;
    });

  return {
    summary: {
      openProjects,
      activeMembers,
      totalTasks: tasks.length,
      openTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      dueSoonTasks,
      highPriorityOpenTasks,
      unassignedTasks,
    },
    statusDistribution,
    workload,
    maxOpenWorkload,
    attentionQueue,
  };
}

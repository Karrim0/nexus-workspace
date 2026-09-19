type InsightProject = {
  status: string;
  completedTasks: number;
  totalTasks: number;
};

type InsightTask = {
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

function isOverdue(task: InsightTask, now: Date) {
  if (!task.dueDate || isDone(task.status)) {
    return false;
  }

  const dueDate = new Date(task.dueDate);

  return !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < now.getTime();
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

  const activeProjects = projects.filter(
    (project) => project.status.trim().toLowerCase() !== "completed"
  ).length;

  const activeMembers = members.filter((member) =>
    isActiveMember(member.status)
  ).length;

  const overdueTasks = tasks.filter((task) => isOverdue(task, now)).length;

  const highPriorityOpenTasks = tasks.filter(
    (task) =>
      task.priority.trim().toLowerCase() === "high" &&
      !isDone(task.status)
  ).length;

  const unassignedTasks = tasks.filter((task) => !task.assigneeId).length;

  const statusDistribution = [
    "Todo",
    "In Progress",
    "Review",
    "Done",
  ].map((status) => ({
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

      return {
        id: member.id,
        name: member.name,
        initials: member.initials,
        assigned: assigned.length,
        completed,
        open: assigned.length - completed,
        overdue,
      };
    })
    .sort((a, b) => b.open - a.open || b.assigned - a.assigned);

  const maxOpenWorkload = Math.max(
    1,
    ...workload.map((member) => member.open)
  );

  return {
    summary: {
      activeProjects,
      activeMembers,
      totalTasks: tasks.length,
      openTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      highPriorityOpenTasks,
      unassignedTasks,
    },
    statusDistribution,
    workload,
    maxOpenWorkload,
  };
}

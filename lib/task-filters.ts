export type TaskFilterItem = {
  title: string;
  projectId: string;
  priority: string;
  status: string;
  dueDate: string | null;
};

export type TaskSort =
  | "due-asc"
  | "due-desc"
  | "title"
  | "priority";

export type TaskDueFilter =
  | "all"
  | "overdue"
  | "today"
  | "upcoming"
  | "no-date";

const priorityWeight: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function normalizeTaskSort(value?: string): TaskSort {
  switch (value) {
    case "due-desc":
    case "title":
    case "priority":
      return value;
    default:
      return "due-asc";
  }
}

export function normalizeTaskDueFilter(
  value?: string
): TaskDueFilter {
  switch (value) {
    case "overdue":
    case "today":
    case "upcoming":
    case "no-date":
      return value;
    default:
      return "all";
  }
}

function dueDateValue(value: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed)
    ? Number.POSITIVE_INFINITY
    : parsed;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function matchesDueFilter(
  task: TaskFilterItem,
  due: TaskDueFilter,
  now: Date
) {
  if (due === "all") {
    return true;
  }

  if (due === "no-date") {
    return !task.dueDate;
  }

  if (!task.dueDate) {
    return false;
  }

  const dueDate = new Date(task.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (due === "overdue") {
    return (
      dueDate.getTime() < todayStart.getTime() &&
      task.status !== "Done"
    );
  }

  if (due === "today") {
    return (
      dueDate.getTime() >= todayStart.getTime() &&
      dueDate.getTime() <= todayEnd.getTime()
    );
  }

  return dueDate.getTime() > todayEnd.getTime();
}

export function filterAndSortTasks<T extends TaskFilterItem>(
  tasks: T[],
  options: {
    query?: string;
    projectId?: string;
    priority?: string;
    status?: string;
    due?: string;
    sort?: string;
    now?: Date;
  }
) {
  const query = options.query?.trim().toLowerCase() ?? "";
  const projectId = options.projectId?.trim() ?? "";
  const priority = options.priority?.trim() ?? "";
  const status = options.status?.trim() ?? "";
  const due = normalizeTaskDueFilter(options.due);
  const sort = normalizeTaskSort(options.sort);
  const now = options.now ?? new Date();

  const filtered = tasks.filter((task) => {
    const matchesQuery =
      !query || task.title.toLowerCase().includes(query);

    const matchesProject =
      !projectId ||
      projectId === "all" ||
      task.projectId === projectId;

    const matchesPriority =
      !priority ||
      priority === "all" ||
      task.priority.toLowerCase() === priority.toLowerCase();

    const matchesStatus =
      !status ||
      status === "all" ||
      task.status.toLowerCase() === status.toLowerCase();

    return (
      matchesQuery &&
      matchesProject &&
      matchesPriority &&
      matchesStatus &&
      matchesDueFilter(task, due, now)
    );
  });

  return [...filtered].sort((a, b) => {
    if (sort === "due-desc") {
      return dueDateValue(b.dueDate) - dueDateValue(a.dueDate);
    }

    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }

    if (sort === "priority") {
      return (
        (priorityWeight[b.priority] ?? 0) -
        (priorityWeight[a.priority] ?? 0)
      );
    }

    return dueDateValue(a.dueDate) - dueDateValue(b.dueDate);
  });
}

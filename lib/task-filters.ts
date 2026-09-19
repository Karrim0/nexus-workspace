export type TaskFilterItem = {
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
};

export type TaskSort =
  | "due-asc"
  | "due-desc"
  | "title"
  | "priority";

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

function dueDateValue(value: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed)
    ? Number.POSITIVE_INFINITY
    : parsed;
}

export function filterAndSortTasks<T extends TaskFilterItem>(
  tasks: T[],
  options: {
    query?: string;
    priority?: string;
    status?: string;
    sort?: string;
  }
) {
  const query = options.query?.trim().toLowerCase() ?? "";
  const priority = options.priority?.trim() ?? "";
  const status = options.status?.trim() ?? "";
  const sort = normalizeTaskSort(options.sort);

  const filtered = tasks.filter((task) => {
    const matchesQuery =
      !query || task.title.toLowerCase().includes(query);

    const matchesPriority =
      !priority ||
      priority === "all" ||
      task.priority.toLowerCase() === priority.toLowerCase();

    const matchesStatus =
      !status ||
      status === "all" ||
      task.status.toLowerCase() === status.toLowerCase();

    return matchesQuery && matchesPriority && matchesStatus;
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

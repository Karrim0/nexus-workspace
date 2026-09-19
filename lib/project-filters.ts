export type ProjectFilterItem = {
  name: string;
  status: string;
  progress: number;
};

export type ProjectSort =
  | "name"
  | "progress-desc"
  | "progress-asc"
  | "status";

export function normalizeProjectSort(value?: string): ProjectSort {
  switch (value) {
    case "progress-desc":
    case "progress-asc":
    case "status":
      return value;
    default:
      return "name";
  }
}

export function filterAndSortProjects<T extends ProjectFilterItem>(
  projects: T[],
  options: {
    query?: string;
    status?: string;
    sort?: string;
  }
) {
  const query = options.query?.trim().toLowerCase() ?? "";
  const status = options.status?.trim() ?? "";
  const sort = normalizeProjectSort(options.sort);

  const filtered = projects.filter((project) => {
    const matchesQuery =
      !query ||
      project.name.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query);

    const matchesStatus =
      !status ||
      status === "all" ||
      project.status.toLowerCase() === status.toLowerCase();

    return matchesQuery && matchesStatus;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "progress-desc") {
      return b.progress - a.progress;
    }

    if (sort === "progress-asc") {
      return a.progress - b.progress;
    }

    if (sort === "status") {
      return a.status.localeCompare(b.status);
    }

    return a.name.localeCompare(b.name);
  });
}

export type TeamMemberFilterItem = {
  name: string;
  email: string;
  role: string;
  status: string;
};

export type TeamMemberSort = "name" | "role" | "status";

const roleWeight: Record<string, number> = {
  owner: 0,
  admin: 1,
  member: 2,
};

export function normalizeTeamMemberSort(
  value?: string
): TeamMemberSort {
  switch (value) {
    case "role":
    case "status":
      return value;
    default:
      return "name";
  }
}

export function filterAndSortTeamMembers<
  T extends TeamMemberFilterItem
>(
  members: T[],
  options: {
    query?: string;
    role?: string;
    status?: string;
    sort?: string;
  }
) {
  const query = options.query?.trim().toLowerCase() ?? "";
  const role = options.role?.trim().toLowerCase() ?? "";
  const status = options.status?.trim().toLowerCase() ?? "";
  const sort = normalizeTeamMemberSort(options.sort);

  const filtered = members.filter((member) => {
    const matchesQuery =
      !query ||
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query);

    const matchesRole =
      !role ||
      role === "all" ||
      member.role.toLowerCase() === role;

    const matchesStatus =
      !status ||
      status === "all" ||
      member.status.toLowerCase() === status;

    return matchesQuery && matchesRole && matchesStatus;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "role") {
      const aWeight = roleWeight[a.role.toLowerCase()] ?? 99;
      const bWeight = roleWeight[b.role.toLowerCase()] ?? 99;

      return aWeight - bWeight || a.name.localeCompare(b.name);
    }

    if (sort === "status") {
      return (
        a.status.localeCompare(b.status) ||
        a.name.localeCompare(b.name)
      );
    }

    return a.name.localeCompare(b.name);
  });
}

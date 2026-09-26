export type ActivityFilterItem = {
  memberId: string | null;
  message: string;
  occurredAt: string;
};

export type ActivityRange = "all" | "24h" | "7d" | "30d";
export type ActivitySort = "newest" | "oldest";

export function normalizeActivityRange(value?: string): ActivityRange {
  switch (value) {
    case "24h":
    case "7d":
    case "30d":
      return value;
    default:
      return "all";
  }
}

export function normalizeActivitySort(value?: string): ActivitySort {
  return value === "oldest" ? "oldest" : "newest";
}

function rangeStart(range: ActivityRange, now: Date) {
  if (range === "all") {
    return null;
  }

  const hours =
    range === "24h"
      ? 24
      : range === "7d"
        ? 24 * 7
        : 24 * 30;

  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export function filterAndSortActivity<T extends ActivityFilterItem>(
  activities: T[],
  options: {
    query?: string;
    memberId?: string;
    range?: string;
    sort?: string;
    now?: Date;
  }
) {
  const query = options.query?.trim().toLowerCase() ?? "";
  const memberId = options.memberId?.trim() ?? "";
  const range = normalizeActivityRange(options.range);
  const sort = normalizeActivitySort(options.sort);
  const start = rangeStart(range, options.now ?? new Date());

  const filtered = activities.filter((activity) => {
    const matchesQuery =
      !query || activity.message.toLowerCase().includes(query);

    const matchesMember =
      !memberId ||
      memberId === "all" ||
      activity.memberId === memberId;

    const occurredAt = new Date(activity.occurredAt);

    const matchesRange =
      !start ||
      (!Number.isNaN(occurredAt.getTime()) &&
        occurredAt.getTime() >= start.getTime());

    return matchesQuery && matchesMember && matchesRange;
  });

  return [...filtered].sort((a, b) => {
    const aTime = new Date(a.occurredAt).getTime();
    const bTime = new Date(b.occurredAt).getTime();

    return sort === "oldest" ? aTime - bTime : bTime - aTime;
  });
}

import { normalizeTaskDueFilter, normalizeTaskSort } from "@/lib/task-filters";
import { isTaskPriority, isTaskStatus } from "@/lib/task-workflow";

export type SavedTaskViewFilters = {
  query: string;
  projectId: string | null;
  priority: string | null;
  status: string | null;
  labelId: string | null;
  milestoneId: string | null;
  due: string;
  sort: string;
};

export type SavedTaskViewItem = SavedTaskViewFilters & {
  id: string;
  name: string;
};

function normalizeOptionalFilter(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return !trimmed || trimmed === "all" ? null : trimmed;
}

export function normalizeSavedTaskViewFilters(input: {
  query?: unknown;
  projectId?: unknown;
  priority?: unknown;
  status?: unknown;
  labelId?: unknown;
  milestoneId?: unknown;
  due?: unknown;
  sort?: unknown;
}): SavedTaskViewFilters {
  const priority = normalizeOptionalFilter(input.priority);
  const status = normalizeOptionalFilter(input.status);

  return {
    query: typeof input.query === "string" ? input.query.trim().slice(0, 120) : "",
    projectId: normalizeOptionalFilter(input.projectId),
    priority: priority && isTaskPriority(priority) ? priority : null,
    status: status && isTaskStatus(status) ? status : null,
    labelId: normalizeOptionalFilter(input.labelId),
    milestoneId: normalizeOptionalFilter(input.milestoneId),
    due: normalizeTaskDueFilter(
      typeof input.due === "string" ? input.due : undefined
    ),
    sort: normalizeTaskSort(
      typeof input.sort === "string" ? input.sort : undefined
    ),
  };
}

export function savedTaskViewHref(view: SavedTaskViewFilters) {
  const params = new URLSearchParams();

  if (view.query) params.set("q", view.query);
  if (view.projectId) params.set("project", view.projectId);
  if (view.priority) params.set("priority", view.priority);
  if (view.status) params.set("status", view.status);
  if (view.labelId) params.set("label", view.labelId);
  if (view.milestoneId) params.set("milestone", view.milestoneId);
  if (view.due && view.due !== "all") params.set("due", view.due);
  if (view.sort && view.sort !== "due-asc") params.set("sort", view.sort);

  const query = params.toString();
  return query ? `/tasks?${query}` : "/tasks";
}

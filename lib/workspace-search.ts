export type WorkspaceSearchType =
  | "all"
  | "projects"
  | "tasks"
  | "members";

export function normalizeWorkspaceSearchType(
  value?: string
): WorkspaceSearchType {
  switch (value) {
    case "projects":
    case "tasks":
    case "members":
      return value;
    default:
      return "all";
  }
}

export function includesWorkspaceQuery(
  value: string | null | undefined,
  query: string
) {
  return value?.toLowerCase().includes(query) ?? false;
}

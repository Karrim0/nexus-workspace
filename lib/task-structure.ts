export type TaskDependencyEdge = {
  taskId: string;
  dependsOnTaskId: string;
};

export function wouldCreateDependencyCycle(
  taskId: string,
  dependsOnTaskId: string,
  edges: TaskDependencyEdge[]
) {
  if (taskId === dependsOnTaskId) {
    return true;
  }

  const prerequisites = new Map<string, string[]>();

  for (const edge of edges) {
    const current = prerequisites.get(edge.taskId) ?? [];
    current.push(edge.dependsOnTaskId);
    prerequisites.set(edge.taskId, current);
  }

  const stack = [dependsOnTaskId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current || visited.has(current)) {
      continue;
    }

    if (current === taskId) {
      return true;
    }

    visited.add(current);

    for (const prerequisite of prerequisites.get(current) ?? []) {
      stack.push(prerequisite);
    }
  }

  return false;
}

export function taskStructureProgress(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

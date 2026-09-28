"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TASK_STATUS_META } from "@/lib/task-workflow";

type DependencyTask = {
  id: string;
  title: string;
  status: string;
  project: {
    id: string;
    name: string;
  };
};

type TaskDependenciesProps = {
  taskId: string;
  taskStatus: string;
  canManage: boolean;
  dependencies: DependencyTask[];
  blockingTasks: DependencyTask[];
  candidates: DependencyTask[];
};

export function TaskDependencies({
  taskId,
  taskStatus,
  canManage,
  dependencies: initialDependencies,
  blockingTasks,
  candidates,
}: TaskDependenciesProps) {
  const router = useRouter();
  const [dependencies, setDependencies] = useState(initialDependencies);
  const [selectedId, setSelectedId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const availableCandidates = useMemo(() => {
    const dependencyIds = new Set(dependencies.map((item) => item.id));
    return candidates.filter((item) => !dependencyIds.has(item.id));
  }, [candidates, dependencies]);

  const blockingDependencies = dependencies.filter(
    (dependency) => dependency.status !== "Done"
  );

  async function addDependency() {
    if (!selectedId || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependsOnTaskId: selectedId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.errors?.join(" ") || payload?.message || "Unable to add dependency.");
        return;
      }

      const dependency = candidates.find((item) => item.id === selectedId);
      if (dependency) {
        setDependencies((current) => [...current, dependency]);
      }
      setSelectedId("");
      router.refresh();
    } catch {
      setError("Unable to add dependency.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeDependency(dependsOnTaskId: string) {
    if (removingId) return;

    setRemovingId(dependsOnTaskId);
    setError("");

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/dependencies/${dependsOnTaskId}`,
        { method: "DELETE" }
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to remove dependency.");
        return;
      }

      setDependencies((current) =>
        current.filter((item) => item.id !== dependsOnTaskId)
      );
      router.refresh();
    } catch {
      setError("Unable to remove dependency.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Dependencies</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Model blocked-by relationships and upstream delivery order.
            </p>
          </div>

          {blockingDependencies.length > 0 ? (
            <span className="rounded-full border border-red-950 bg-red-950/30 px-2.5 py-1 text-xs text-red-300">
              Blocked by {blockingDependencies.length}
            </span>
          ) : (
            <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
              {dependencies.length} dependencies
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        {dependencies.map((dependency) => {
          const meta = TASK_STATUS_META[
            dependency.status as keyof typeof TASK_STATUS_META
          ];
          const removing = removingId === dependency.id;

          return (
            <div
              key={dependency.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/tasks/${dependency.id}`}
                    className="truncate text-sm font-medium text-zinc-200 transition hover:text-white"
                  >
                    {dependency.title}
                  </Link>

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] ${
                      meta?.tone ?? "border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {meta?.label ?? dependency.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  {dependency.project.name}
                </p>
              </div>

              {canManage ? (
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => removeDependency(dependency.id)}
                  className="self-start rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-red-950 hover:bg-red-950/20 hover:text-red-400 disabled:opacity-50 sm:self-auto"
                >
                  {removing ? "Removing..." : "Remove"}
                </button>
              ) : null}
            </div>
          );
        })}

        {dependencies.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-zinc-400">No dependencies</p>
            <p className="mt-1 text-xs text-zinc-600">
              This task can currently move independently of other work.
            </p>
          </div>
        ) : null}
      </div>

      {canManage ? (
        <div className="border-t border-zinc-800 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedId}
              disabled={submitting || availableCandidates.length === 0}
              onChange={(event) => setSelectedId(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600 disabled:opacity-50"
            >
              <option value="">Select prerequisite task...</option>
              {availableCandidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.project.name} — {candidate.title} ({candidate.status})
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!selectedId || submitting}
              onClick={addDependency}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add dependency"}
            </button>
          </div>

          {taskStatus === "Done" ? (
            <p className="mt-2 text-xs text-zinc-600">
              Completed tasks can only accept dependencies that are already Done.
            </p>
          ) : null}
        </div>
      ) : null}

      {blockingTasks.length > 0 ? (
        <div className="border-t border-zinc-800 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
            This task blocks
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {blockingTasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-white"
              >
                {task.title}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="border-t border-zinc-800 px-5 py-3 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </section>
  );
}

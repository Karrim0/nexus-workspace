"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { taskStructureProgress } from "@/lib/task-structure";

type SubtaskItem = {
  id: string;
  title: string;
  completed: boolean;
  position: number;
};

type TaskSubtasksProps = {
  taskId: string;
  taskStatus: string;
  canManage: boolean;
  items: SubtaskItem[];
};

export function TaskSubtasks({
  taskId,
  taskStatus,
  canManage,
  items: initialItems,
}: TaskSubtasksProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const completed = items.filter((item) => item.completed).length;
  const progress = useMemo(
    () => taskStructureProgress(completed, items.length),
    [completed, items.length]
  );
  const taskDone = taskStatus === "Done";

  async function createSubtask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();

    if (!nextTitle || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.errors?.join(" ") || payload?.message || "Unable to add subtask.");
        return;
      }

      setItems((current) => [...current, payload.data]);
      setTitle("");
      router.refresh();
    } catch {
      setError("Unable to add subtask.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateSubtask(
    subtaskId: string,
    changes: { title?: string; completed?: boolean }
  ) {
    if (busyId) return false;

    setBusyId(subtaskId);
    setError("");

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.errors?.join(" ") || payload?.message || "Unable to update subtask.");
        return false;
      }

      setItems((current) =>
        current.map((item) => (item.id === subtaskId ? payload.data : item))
      );
      router.refresh();
      return true;
    } catch {
      setError("Unable to update subtask.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(subtaskId: string) {
    const nextTitle = editingTitle.trim();
    if (!nextTitle) return;

    if (await updateSubtask(subtaskId, { title: nextTitle })) {
      setEditingId(null);
      setEditingTitle("");
    }
  }

  async function removeSubtask(subtaskId: string) {
    if (busyId) return;

    setBusyId(subtaskId);
    setError("");

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`,
        { method: "DELETE" }
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to remove subtask.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== subtaskId));
      router.refresh();
    } catch {
      setError("Unable to remove subtask.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Subtasks & checklist</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Break delivery into concrete completion steps.
            </p>
          </div>

          <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
            {completed}/{items.length}
          </span>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-200 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        {items.map((item) => {
          const editing = editingId === item.id;
          const busy = busyId === item.id;

          return (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
              <input
                type="checkbox"
                checked={item.completed}
                disabled={!canManage || busy || (taskDone && item.completed)}
                onChange={() =>
                  updateSubtask(item.id, { completed: !item.completed })
                }
                className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-white"
              />

              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      maxLength={180}
                      className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy || editingTitle.trim().length < 2}
                        onClick={() => saveEdit(item.id)}
                        className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-sm ${
                      item.completed
                        ? "text-zinc-600 line-through"
                        : "text-zinc-300"
                    }`}
                  >
                    {item.title}
                  </p>
                )}
              </div>

              {canManage && !editing ? (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingTitle(item.title);
                      setError("");
                    }}
                    className="rounded-md px-2 py-1 text-[11px] text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeSubtask(item.id)}
                    className="rounded-md px-2 py-1 text-[11px] text-zinc-600 transition hover:bg-red-950/30 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}

        {items.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-zinc-400">No subtasks yet</p>
            <p className="mt-1 text-xs text-zinc-600">
              Add a checklist when this task needs multiple delivery steps.
            </p>
          </div>
        ) : null}
      </div>

      {canManage ? (
        <form onSubmit={createSubtask} className="border-t border-zinc-800 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={submitting || taskDone}
              maxLength={180}
              placeholder={taskDone ? "Reopen the task to add subtasks" : "Add a subtask..."}
              className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submitting || taskDone || title.trim().length < 2}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add subtask"}
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="border-t border-zinc-800 px-5 py-3 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </section>
  );
}

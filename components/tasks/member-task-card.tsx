"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["Todo", "In Progress", "Review", "Done"] as const;

type MemberTaskCardProps = {
  task: {
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate: string | null;
  };
  projectName: string;
  assigneeName?: string;
  assigneeInitials?: string;
};

export function MemberTaskCard({
  task,
  projectName,
  assigneeName,
  assigneeInitials,
}: MemberTaskCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState(task.status);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: string) {
    if (updating || nextStatus === status) {
      return;
    }

    const previousStatus = status;

    setStatus(nextStatus);
    setUpdating(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus(previousStatus);
        setError(
          payload?.message ||
            "Unable to update this task status."
        );
        return;
      }

      router.refresh();
    } catch {
      setStatus(previousStatus);
      setError("Unable to update this task status.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-medium leading-5">{task.title}</h4>

        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
          {task.priority}
        </span>
      </div>

      <p className="mt-3 text-xs text-zinc-500">{projectName}</p>

      <div className="mt-4">
        <label
          htmlFor={`member-status-${task.id}`}
          className="text-[11px] font-medium uppercase tracking-wide text-zinc-600"
        >
          Status
        </label>

        <select
          id={`member-status-${task.id}`}
          value={status}
          disabled={updating}
          onChange={(event) => updateStatus(event.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 outline-none transition focus:border-zinc-600 disabled:cursor-wait disabled:opacity-60"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      ) : null}

      <div className="mt-5 flex items-center justify-between border-t border-zinc-900 pt-4">
        <span className="text-xs text-zinc-600">
          {task.dueDate
            ? `Due ${new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`
            : "No due date"}
        </span>

        <div
          title={assigneeName}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold"
        >
          {assigneeInitials ?? "?"}
        </div>
      </div>
    </article>
  );
}

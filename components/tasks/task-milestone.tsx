"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MILESTONE_STATUS_META, type MilestoneStatus } from "@/lib/milestones";

type MilestoneOption = {
  id: string;
  title: string;
  status: MilestoneStatus;
  dueDate: string | null;
};

type TaskMilestoneProps = {
  taskId: string;
  milestone: MilestoneOption | null;
  milestones: MilestoneOption[];
  canManage: boolean;
};

export function TaskMilestone({
  taskId,
  milestone,
  milestones,
  canManage,
}: TaskMilestoneProps) {
  const router = useRouter();
  const [value, setValue] = useState(milestone?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function updateMilestone(nextValue: string) {
    if (busy || nextValue === value) return;

    const previous = value;
    setValue(nextValue);
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}/milestone`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: nextValue || null }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setValue(previous);
        setError(payload?.message || "Unable to update milestone.");
        return;
      }

      router.refresh();
    } catch {
      setValue(previous);
      setError("Unable to update milestone.");
    } finally {
      setBusy(false);
    }
  }

  const selected = milestones.find((item) => item.id === value) ?? milestone;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Milestone</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Group this task under a project delivery target
          </p>
        </div>
        {selected ? (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] ${MILESTONE_STATUS_META[selected.status].badgeClassName}`}
          >
            {selected.status}
          </span>
        ) : null}
      </div>

      {canManage ? (
        <select
          value={value}
          disabled={busy}
          onChange={(event) => updateMilestone(event.target.value)}
          className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600 disabled:cursor-wait disabled:opacity-60"
        >
          <option value="">No milestone</option>
          {milestones.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} · {item.status}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-4 text-sm text-zinc-300">
          {selected?.title ?? "No milestone"}
        </p>
      )}

      {selected ? (
        <p className="mt-3 text-xs text-zinc-600">
          {selected.dueDate
            ? `Target ${new Date(selected.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`
            : "No target date"}
        </p>
      ) : null}

      {milestones.length === 0 ? (
        <p className="mt-4 text-xs text-zinc-600">
          Create a milestone from the project page first.
        </p>
      ) : null}

      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </section>
  );
}

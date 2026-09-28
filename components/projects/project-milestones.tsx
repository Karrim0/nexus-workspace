"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MILESTONE_STATUS_META,
  type MilestoneStatus,
} from "@/lib/milestones";

type MilestoneItem = {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string | null;
  totalTasks: number;
  completedTasks: number;
};

type ProjectMilestonesProps = {
  projectId: string;
  milestones: MilestoneItem[];
  canManage: boolean;
};

export function ProjectMilestones({
  projectId,
  milestones,
  canManage,
}: ProjectMilestonesProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function createMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 2 || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          dueDate,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to create milestone.");
        return;
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Unable to create milestone.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(item: MilestoneItem) {
    if (busyId) return;
    setBusyId(item.id);
    setError("");

    try {
      const nextStatus: MilestoneStatus =
        item.status === "Completed" ? "Open" : "Completed";
      const response = await fetch(
        `/api/projects/${projectId}/milestones/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to update milestone.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to update milestone.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMilestone(item: MilestoneItem) {
    if (busyId) return;
    if (!window.confirm(`Delete milestone "${item.title}"? Tasks will be kept.`)) {
      return;
    }

    setBusyId(item.id);
    setError("");

    try {
      const response = await fetch(
        `/api/projects/${projectId}/milestones/${item.id}`,
        { method: "DELETE" }
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to delete milestone.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to delete milestone.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col gap-4 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Milestones</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Delivery targets that group project work into meaningful checkpoints
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={() => {
              setOpen((value) => !value);
              setError("");
            }}
            className="w-fit rounded-xl border border-zinc-700 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-900"
          >
            {open ? "Cancel" : "+ Milestone"}
          </button>
        ) : null}
      </div>

      {open ? (
        <form
          onSubmit={createMilestone}
          className="grid gap-3 border-b border-zinc-800 p-5 lg:grid-cols-[1fr_1.4fr_170px_auto]"
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Milestone title"
            maxLength={80}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-600"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional delivery note"
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-600"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={title.trim().length < 2 || submitting}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>
      ) : null}

      <div className="divide-y divide-zinc-800">
        {milestones.map((item) => {
          const progress =
            item.totalTasks === 0
              ? 0
              : Math.round((item.completedTasks / item.totalTasks) * 100);

          return (
            <article key={item.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] ${MILESTONE_STATUS_META[item.status].badgeClassName}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="mt-2 text-sm text-zinc-500">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-600">
                    {item.dueDate
                      ? `Target ${new Date(item.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : "No target date"}
                    {" · "}
                    {item.completedTasks}/{item.totalTasks} tasks done
                  </p>
                </div>

                {canManage ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={Boolean(busyId)}
                      onClick={() => toggleStatus(item)}
                      className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-900 disabled:opacity-40"
                    >
                      {item.status === "Completed" ? "Reopen" : "Complete"}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(busyId)}
                      onClick={() => deleteMilestone(item)}
                      className="rounded-lg border border-red-950 px-3 py-2 text-xs text-red-400 transition hover:bg-red-950/30 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </article>
          );
        })}

        {milestones.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-600">
            No milestones yet. Add the first delivery checkpoint for this project.
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="m-5 rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </section>
  );
}

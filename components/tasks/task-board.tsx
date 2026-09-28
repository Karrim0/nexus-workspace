"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberTaskCard } from "@/components/tasks/member-task-card";
import { TaskCard } from "@/components/tasks/task-card";
import type { LabelColor } from "@/lib/task-labels";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/task-workflow";

type ProjectOption = {
  id: string;
  name: string;
};

type MemberOption = {
  id: string;
  name: string;
  initials: string;
  status?: string;
};

export type TaskBoardTask = {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  subtaskCount: number;
  completedSubtaskCount: number;
  blockingDependencyCount: number;
  milestone: { id: string; title: string; status: string } | null;
  labels: Array<{ id: string; name: string; color: LabelColor }>;
};

type BulkAction = "status" | "priority" | "assignee" | "dueDate" | "delete";

type TaskBoardProps = {
  tasks: TaskBoardTask[];
  projects: ProjectOption[];
  members: MemberOption[];
  manageAllTasks: boolean;
};

export function TaskBoard({
  tasks,
  projects,
  members,
  manageAllTasks,
}: TaskBoardProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [action, setAction] = useState<BulkAction>("status");
  const [value, setValue] = useState("Todo");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const activeMembers = useMemo(
    () => members.filter((member) => !member.status || member.status.toLowerCase() === "active"),
    [members]
  );
  const selectableIds = tasks.slice(0, 100).map((task) => task.id);
  const allVisibleSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedSet.has(id));

  function setBulkAction(nextAction: BulkAction) {
    setAction(nextAction);
    setError("");
    setMessage("");

    if (nextAction === "status") setValue("Todo");
    if (nextAction === "priority") setValue("Medium");
    if (nextAction === "assignee") setValue(activeMembers[0]?.id ?? "");
    if (nextAction === "dueDate") setValue("");
    if (nextAction === "delete") setValue("");
  }

  function toggleTask(taskId: string) {
    setSelectedIds((current) => {
      if (current.includes(taskId)) {
        return current.filter((id) => id !== taskId);
      }

      if (current.length >= 100) {
        setError("Bulk actions are limited to 100 tasks at a time.");
        return current;
      }

      return [...current, taskId];
    });
  }

  function toggleAllVisible() {
    setError("");
    setMessage("");

    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(selectableIds);
    if (tasks.length > 100) {
      setMessage("Selected the first 100 visible tasks.");
    }
  }

  async function applyBulkAction() {
    if (selectedIds.length === 0 || pending) return;

    if (action === "delete") {
      const confirmed = window.confirm(
        `Delete ${selectedIds.length} selected ${selectedIds.length === 1 ? "task" : "tasks"}? This cannot be undone.`
      );
      if (!confirmed) return;
    }

    if (action !== "delete" && !value) {
      setError("Choose a value for this bulk action.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/tasks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskIds: selectedIds,
          action,
          value: action === "delete" ? null : value,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to apply bulk action.");
        return;
      }

      setMessage(payload?.message || "Bulk action applied.");
      setSelectedIds([]);
      router.refresh();
    } catch {
      setError("Unable to apply bulk action.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="mt-7 rounded-2xl border border-zinc-800 bg-zinc-900/35 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Bulk actions</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Select up to 100 visible tasks and update them together.
              {!manageAllTasks
                ? " Members can bulk-change status for their own assigned tasks."
                : " Admins and owners can also change priority, assignee, due date, or delete."}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={toggleAllVisible}
              disabled={tasks.length === 0 || pending}
              className="rounded-xl border border-zinc-800 px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allVisibleSelected ? "Clear selection" : "Select visible"}
            </button>

            <div>
              <label htmlFor="bulk-action" className="text-[11px] font-medium text-zinc-600">
                Action
              </label>
              <select
                id="bulk-action"
                value={action}
                disabled={pending}
                onChange={(event) => setBulkAction(event.target.value as BulkAction)}
                className="mt-1 block rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-zinc-600"
              >
                <option value="status">Set status</option>
                {manageAllTasks ? <option value="priority">Set priority</option> : null}
                {manageAllTasks ? <option value="assignee">Reassign</option> : null}
                {manageAllTasks ? <option value="dueDate">Set due date</option> : null}
                {manageAllTasks ? <option value="delete">Delete tasks</option> : null}
              </select>
            </div>

            {action === "status" ? (
              <div>
                <label htmlFor="bulk-status" className="text-[11px] font-medium text-zinc-600">
                  Status
                </label>
                <select
                  id="bulk-status"
                  value={value}
                  disabled={pending}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-1 block rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-zinc-600"
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {action === "priority" ? (
              <div>
                <label htmlFor="bulk-priority" className="text-[11px] font-medium text-zinc-600">
                  Priority
                </label>
                <select
                  id="bulk-priority"
                  value={value}
                  disabled={pending}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-1 block rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-zinc-600"
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {action === "assignee" ? (
              <div>
                <label htmlFor="bulk-assignee" className="text-[11px] font-medium text-zinc-600">
                  Assignee
                </label>
                <select
                  id="bulk-assignee"
                  value={value}
                  disabled={pending}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-1 block max-w-48 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-zinc-600"
                >
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {action === "dueDate" ? (
              <div>
                <label htmlFor="bulk-due-date" className="text-[11px] font-medium text-zinc-600">
                  Due date
                </label>
                <input
                  id="bulk-due-date"
                  type="date"
                  value={value}
                  disabled={pending}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-1 block rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-zinc-600"
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={applyBulkAction}
              disabled={selectedIds.length === 0 || pending}
              className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                action === "delete"
                  ? "border border-red-950 bg-red-950/30 text-red-300 hover:bg-red-950/50"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {pending ? "Applying..." : `Apply to ${selectedIds.length}`}
            </button>
          </div>
        </div>

        {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
        {message ? <p className="mt-3 text-xs text-emerald-400">{message}</p> : null}
      </div>

      <div className="mt-8 overflow-x-auto pb-4">
        <div className="grid min-w-[1760px] grid-cols-6 gap-5">
          {TASK_STATUSES.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column);

            return (
              <section
                key={column}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column}</h3>
                  <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {columnTasks.map((task) => {
                    const project = projects.find((item) => item.id === task.projectId);
                    const assignee = members.find((item) => item.id === task.assigneeId);
                    const selected = selectedSet.has(task.id);

                    return (
                      <div
                        key={task.id}
                        className={`rounded-xl border p-1 transition ${
                          selected
                            ? "border-sky-800 bg-sky-950/20"
                            : "border-transparent"
                        }`}
                      >
                        <label className="mb-1.5 flex cursor-pointer items-center gap-2 px-2 pt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={pending}
                            onChange={() => toggleTask(task.id)}
                            className="h-3.5 w-3.5 accent-white"
                          />
                          {selected ? "Selected" : "Select"}
                        </label>

                        {!manageAllTasks ? (
                          <MemberTaskCard
                            task={{
                              id: task.id,
                              title: task.title,
                              priority: task.priority,
                              status: task.status,
                              dueDate: task.dueDate,
                              subtaskCount: task.subtaskCount,
                              completedSubtaskCount: task.completedSubtaskCount,
                              blockingDependencyCount: task.blockingDependencyCount,
                              milestone: task.milestone,
                              labels: task.labels,
                            }}
                            projectName={project?.name ?? "Unknown project"}
                            assigneeName={assignee?.name}
                            assigneeInitials={assignee?.initials}
                          />
                        ) : (
                          <TaskCard
                            task={task}
                            projectName={project?.name ?? "Unknown project"}
                            assigneeName={assignee?.name}
                            assigneeInitials={assignee?.initials}
                            projects={projects}
                            members={members}
                          />
                        )}
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-xs text-zinc-600">
                      No tasks here
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

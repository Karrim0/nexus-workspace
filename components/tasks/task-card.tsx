"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["Todo", "In Progress", "Review", "Done"] as const;
const priorities = ["Low", "Medium", "High"] as const;

type ProjectOption = {
  id: string;
  name: string;
};

type MemberOption = {
  id: string;
  name: string;
  initials: string;
};

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    projectId: string;
    assigneeId: string | null;
    priority: string;
    status: string;
    dueDate: string | null;
  };
  projectName: string;
  assigneeName?: string;
  assigneeInitials?: string;
  projects: ProjectOption[];
  members: MemberOption[];
};

function toDateInputValue(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function TaskCard({
  task,
  projectName,
  assigneeName,
  assigneeInitials,
  projects,
  members,
}: TaskCardProps) {
  const router = useRouter();

  const [status, setStatus] = useState(task.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [projectId, setProjectId] = useState(task.projectId);
  const [assigneeId, setAssigneeId] = useState(
    task.assigneeId ?? members[0]?.id ?? ""
  );
  const [priority, setPriority] = useState(task.priority);
  const [editStatus, setEditStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canSubmit = useMemo(
    () =>
      title.trim().length >= 3 &&
      Boolean(projectId) &&
      Boolean(assigneeId) &&
      Boolean(dueDate) &&
      !submitting,
    [title, projectId, assigneeId, dueDate, submitting]
  );

  function resetEditForm() {
    setTitle(task.title);
    setProjectId(task.projectId);
    setAssigneeId(task.assigneeId ?? members[0]?.id ?? "");
    setPriority(task.priority);
    setEditStatus(task.status);
    setDueDate(toDateInputValue(task.dueDate));
    setError("");
  }

  function closeEdit() {
    if (submitting) return;
    setEditOpen(false);
    resetEditForm();
  }

  async function updateStatus(nextStatus: string) {
    if (nextStatus === status || updatingStatus) return;

    const previousStatus = status;
    setStatus(nextStatus);
    setUpdatingStatus(true);
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
          payload?.errors?.join(" ") ||
            payload?.message ||
            "Unable to update task status."
        );
        return;
      }

      router.refresh();
    } catch {
      setStatus(previousStatus);
      setError("Unable to update task status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          projectId,
          assigneeId,
          priority,
          status: editStatus,
          dueDate,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(
          payload?.errors?.join(" ") ||
            payload?.message ||
            "Unable to update task."
        );
        return;
      }

      setStatus(editStatus);
      setEditOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong while updating the task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to delete task.");
        return;
      }

      setDeleteOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong while deleting the task.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
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
            htmlFor={`status-${task.id}`}
            className="text-[11px] font-medium uppercase tracking-wide text-zinc-600"
          >
            Status
          </label>

          <select
            id={`status-${task.id}`}
            value={status}
            disabled={updatingStatus}
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

        {error && !editOpen && !deleteOpen ? (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
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

        <div className="mt-4 flex gap-2 border-t border-zinc-900 pt-4">
          <button
            type="button"
            onClick={() => {
              resetEditForm();
              setEditOpen(true);
            }}
            className="flex-1 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setDeleteOpen(true);
            }}
            className="rounded-lg border border-red-950 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-950/30"
          >
            Delete
          </button>
        </div>
      </article>

      {editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeEdit();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-task-${task.id}`}
            className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2
                  id={`edit-task-${task.id}`}
                  className="text-xl font-semibold"
                >
                  Edit task
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Update task details, ownership, and workflow state.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                aria-label="Close edit task dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor={`edit-title-${task.id}`}
                  className="text-sm font-medium text-zinc-300"
                >
                  Task title
                </label>
                <input
                  id={`edit-title-${task.id}`}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`edit-project-${task.id}`}
                    className="text-sm font-medium text-zinc-300"
                  >
                    Project
                  </label>
                  <select
                    id={`edit-project-${task.id}`}
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`edit-assignee-${task.id}`}
                    className="text-sm font-medium text-zinc-300"
                  >
                    Assignee
                  </label>
                  <select
                    id={`edit-assignee-${task.id}`}
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`edit-priority-${task.id}`}
                    className="text-sm font-medium text-zinc-300"
                  >
                    Priority
                  </label>
                  <select
                    id={`edit-priority-${task.id}`}
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                  >
                    {priorities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`edit-status-${task.id}`}
                    className="text-sm font-medium text-zinc-300"
                  >
                    Status
                  </label>
                  <select
                    id={`edit-status-${task.id}`}
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`edit-due-date-${task.id}`}
                  className="text-sm font-medium text-zinc-300"
                >
                  Due date
                </label>
                <input
                  id={`edit-due-date-${task.id}`}
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-task-${task.id}`}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h2
              id={`delete-task-${task.id}`}
              className="text-xl font-semibold"
            >
              Delete task?
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              This will permanently delete{" "}
              <span className="font-medium text-zinc-300">{task.title}</span>.
            </p>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteOpen(false);
                  setError("");
                }}
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete task"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

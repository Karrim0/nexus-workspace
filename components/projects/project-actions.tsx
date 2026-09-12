"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MemberOption = {
  id: string;
  name: string;
  initials: string;
};

type ProjectActionsProps = {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    memberIds: string[];
  };
  members: MemberOption[];
};

export function ProjectActions({
  project,
  members,
}: ProjectActionsProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [memberIds, setMemberIds] = useState<string[]>(project.memberIds);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canSubmit = useMemo(
    () =>
      name.trim().length >= 3 &&
      description.trim().length >= 10 &&
      !submitting,
    [name, description, submitting]
  );

  function resetForm() {
    setName(project.name);
    setDescription(project.description);
    setStatus(project.status);
    setMemberIds(project.memberIds);
    setError("");
  }

  function closeEdit() {
    if (submitting) return;
    setEditOpen(false);
    resetForm();
  }

  function toggleMember(memberId: string) {
    setMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          status,
          memberIds,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(
          payload?.errors?.join(" ") ||
            payload?.message ||
            "Unable to update project."
        );
        return;
      }

      setEditOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong while updating the project.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to delete project.");
        return;
      }

      router.push("/projects");
      router.refresh();
    } catch {
      setError("Something went wrong while deleting the project.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            resetForm();
            setEditOpen(true);
          }}
          className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
        >
          Edit project
        </button>

        <button
          type="button"
          onClick={() => {
            setError("");
            setDeleteOpen(true);
          }}
          className="rounded-xl border border-red-900/60 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/40"
        >
          Delete project
        </button>
      </div>

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
            aria-labelledby="edit-project-title"
            className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 id="edit-project-title" className="text-xl font-semibold">
                  Edit project
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Update project details and team assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                aria-label="Close edit project dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor="edit-project-name"
                  className="text-sm font-medium text-zinc-300"
                >
                  Project name
                </label>
                <input
                  id="edit-project-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-project-description"
                  className="text-sm font-medium text-zinc-300"
                >
                  Description
                </label>
                <textarea
                  id="edit-project-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-project-status"
                  className="text-sm font-medium text-zinc-300"
                >
                  Status
                </label>
                <select
                  id="edit-project-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-300">
                  Project members
                </p>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {members.map((member) => {
                    const selected = memberIds.includes(member.id);

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                          selected
                            ? "border-zinc-500 bg-zinc-800"
                            : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold">
                          {member.initials}
                        </span>
                        <span className="text-sm">{member.name}</span>
                      </button>
                    );
                  })}
                </div>
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
            aria-labelledby="delete-project-title"
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h2 id="delete-project-title" className="text-xl font-semibold">
              Delete project?
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              This will permanently delete{" "}
              <span className="font-medium text-zinc-300">{project.name}</span>{" "}
              and all tasks connected to it.
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
                {deleting ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

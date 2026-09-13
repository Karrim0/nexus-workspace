"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MemberActionsProps = {
  member: {
    id: string;
    name: string;
    role: string;
    status: string;
  };
};

export function MemberActions({ member }: MemberActionsProps) {
  const router = useRouter();
  const isOwner = member.id === "member-kareem";

  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const [role, setRole] = useState(member.role);
  const [status, setStatus] = useState(member.status);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const canSubmit = useMemo(
    () => role.trim().length >= 2 && !submitting,
    [role, submitting]
  );

  function resetEditForm() {
    setRole(member.role);
    setStatus(member.status);
    setError("");
  }

  function closeEdit() {
    if (submitting) return;
    setEditOpen(false);
    resetEditForm();
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/team/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: role.trim(),
          status,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(
          payload?.errors?.join(" ") ||
            payload?.message ||
            "Unable to update member."
        );
        return;
      }

      setEditOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong while updating the member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (removing || isOwner) return;

    setRemoving(true);
    setError("");

    try {
      const response = await fetch(`/api/team/${member.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to remove member.");
        return;
      }

      setRemoveOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong while removing the member.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            resetEditForm();
            setEditOpen(true);
          }}
          className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          Manage
        </button>

        <button
          type="button"
          disabled={isOwner}
          onClick={() => {
            setError("");
            setRemoveOpen(true);
          }}
          title={isOwner ? "The workspace owner cannot be removed" : undefined}
          className="rounded-lg border border-red-950 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-35"
        >
          Remove
        </button>
      </div>

      {editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closeEdit();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`manage-member-${member.id}`}
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2
                  id={`manage-member-${member.id}`}
                  className="text-xl font-semibold"
                >
                  Manage member
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Update {member.name}&apos;s workspace role and access status.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                aria-label="Close manage member dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5 p-6">
              <div>
                <label
                  htmlFor={`member-role-${member.id}`}
                  className="text-sm font-medium text-zinc-300"
                >
                  Role
                </label>
                <input
                  id={`member-role-${member.id}`}
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor={`member-status-${member.id}`}
                  className="text-sm font-medium text-zinc-300"
                >
                  Status
                </label>
                <select
                  id={`member-status-${member.id}`}
                  value={status}
                  disabled={isOwner}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                </select>

                {isOwner ? (
                  <p className="mt-2 text-xs text-zinc-600">
                    The workspace owner must remain active.
                  </p>
                ) : null}
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

      {removeOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`remove-member-${member.id}`}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h2
              id={`remove-member-${member.id}`}
              className="text-xl font-semibold"
            >
              Remove member?
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              This will remove{" "}
              <span className="font-medium text-zinc-300">{member.name}</span>{" "}
              from the workspace. Their assigned tasks will become unassigned.
            </p>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={removing}
                onClick={() => {
                  setRemoveOpen(false);
                  setError("");
                }}
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={removing}
                onClick={handleRemove}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-50"
              >
                {removing ? "Removing..." : "Remove member"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

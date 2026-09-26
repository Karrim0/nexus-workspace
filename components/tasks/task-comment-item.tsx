"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TaskCommentItemProps = {
  taskId: string;
  comment: {
    id: string;
    body: string;
    authorName: string;
    authorInitials: string;
    createdLabel: string;
    edited: boolean;
    isOwn: boolean;
  };
};

export function TaskCommentItem({
  taskId,
  comment,
}: TaskCommentItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveComment() {
    const value = body.trim();

    if (!value || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/comments/${comment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: value,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        setError(
          payload?.message || "Unable to update comment."
        );
        return;
      }

      setEditing(false);
      router.refresh();
    } catch {
      setError("Unable to update comment.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteComment() {
    if (deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this comment? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/comments/${comment.id}`,
        {
          method: "DELETE",
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        setError(
          payload?.message || "Unable to delete comment."
        );
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to delete comment.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="flex gap-4 px-5 py-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold">
        {comment.authorInitials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">
              {comment.authorName}
            </p>

            {comment.isOwn ? (
              <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                You
              </span>
            ) : null}

            {comment.edited ? (
              <span className="text-[10px] uppercase tracking-wide text-zinc-600">
                Edited
              </span>
            ) : null}
          </div>

          {comment.isOwn && !editing ? (
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setBody(comment.body);
                  setError("");
                  setEditing(true);
                }}
                className="text-zinc-500 transition hover:text-white"
              >
                Edit
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={deleteComment}
                className="text-zinc-600 transition hover:text-red-400 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <div className="mt-3">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-200 outline-none focus:border-zinc-600"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-zinc-600">
                {body.length} / 1000
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBody(comment.body);
                    setError("");
                    setEditing(false);
                  }}
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    saving ||
                    !body.trim() ||
                    body.trim() === comment.body
                  }
                  onClick={saveComment}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {comment.body}
          </p>
        )}

        {error ? (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        ) : null}

        <p className="mt-3 text-xs text-zinc-600">
          {comment.createdLabel}
        </p>
      </div>
    </article>
  );
}

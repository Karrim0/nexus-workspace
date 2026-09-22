"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TaskCommentFormProps = {
  taskId: string;
};

export function TaskCommentForm({
  taskId,
}: TaskCommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const comment = body.trim();

    if (!comment || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: comment,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        setError(
          payload?.message || "Unable to add comment."
        );
        return;
      }

      setBody("");
      router.refresh();
    } catch {
      setError("Unable to add comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-5">
      <label
        htmlFor={`task-comment-${taskId}`}
        className="text-xs font-medium uppercase tracking-wide text-zinc-600"
      >
        Add comment
      </label>

      <textarea
        id={`task-comment-${taskId}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="Share an update, decision, or blocker..."
        className="mt-3 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          {error ? (
            <p className="text-xs text-red-400">{error}</p>
          ) : (
            <p className="text-xs text-zinc-600">
              {body.length} / 1000
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </div>
    </form>
  );
}

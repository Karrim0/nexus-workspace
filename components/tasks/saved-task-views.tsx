"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  savedTaskViewHref,
  type SavedTaskViewFilters,
  type SavedTaskViewItem,
} from "@/lib/saved-task-views";

type SavedTaskViewsProps = {
  views: SavedTaskViewItem[];
  currentFilters: SavedTaskViewFilters;
};

function sameFilters(a: SavedTaskViewFilters, b: SavedTaskViewFilters) {
  return (
    a.query === b.query &&
    a.projectId === b.projectId &&
    a.priority === b.priority &&
    a.status === b.status &&
    a.labelId === b.labelId &&
    a.milestoneId === b.milestoneId &&
    a.due === b.due &&
    a.sort === b.sort
  );
}

export function SavedTaskViews({ views, currentFilters }: SavedTaskViewsProps) {
  const router = useRouter();
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const activeViewId = useMemo(
    () => views.find((view) => sameFilters(view, currentFilters))?.id ?? null,
    [views, currentFilters]
  );

  async function saveView(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2 || pendingId) return;

    setPendingId("new");
    setError("");

    try {
      const response = await fetch("/api/task-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ...currentFilters }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to save this view.");
        return;
      }

      setName("");
      setSaveOpen(false);
      router.refresh();
    } catch {
      setError("Unable to save this view.");
    } finally {
      setPendingId(null);
    }
  }

  async function renameView(viewId: string) {
    if (editingName.trim().length < 2 || pendingId) return;

    setPendingId(viewId);
    setError("");

    try {
      const response = await fetch(`/api/task-views/${viewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to rename this view.");
        return;
      }

      setEditingId(null);
      setEditingName("");
      router.refresh();
    } catch {
      setError("Unable to rename this view.");
    } finally {
      setPendingId(null);
    }
  }

  async function overwriteView(viewId: string) {
    if (pendingId) return;
    setPendingId(viewId);
    setError("");

    try {
      const response = await fetch(`/api/task-views/${viewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: currentFilters }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to update this saved view.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to update this saved view.");
    } finally {
      setPendingId(null);
    }
  }

  async function deleteView(viewId: string, viewName: string) {
    if (pendingId) return;
    if (!window.confirm(`Delete saved view “${viewName}”?`)) return;

    setPendingId(viewId);
    setError("");

    try {
      const response = await fetch(`/api/task-views/${viewId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to delete this view.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to delete this view.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-200">Saved views</p>
          <p className="mt-1 text-xs text-zinc-500">
            Save your current filters and reopen the same task view in one click.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeViewId ? (
            <span className="rounded-xl border border-sky-900 bg-sky-950/20 px-3.5 py-2 text-xs font-medium text-sky-300">
              Saved view active
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setSaveOpen((open) => !open);
              setError("");
            }}
            className="rounded-xl bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-white"
          >
            Save current view
          </button>
        </div>
      </div>

      {saveOpen ? (
        <form onSubmit={saveView} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
            placeholder="e.g. Urgent launch work"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={name.trim().length < 2 || pendingId === "new"}
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pendingId === "new" ? "Saving..." : "Save view"}
          </button>
        </form>
      ) : null}

      {views.length > 0 ? (
        <div className="mt-4 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
          {views.map((view) => {
            const active = activeViewId === view.id;
            const editing = editingId === view.id;

            return (
              <div
                key={view.id}
                className={`rounded-xl border p-3 ${
                  active
                    ? "border-sky-900 bg-sky-950/20"
                    : "border-zinc-800 bg-zinc-950/60"
                }`}
              >
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      maxLength={50}
                      className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={() => renameView(view.id)}
                      disabled={pendingId === view.id || editingName.trim().length < 2}
                      className="rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-black disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={savedTaskViewHref(view)}
                        className="block truncate text-sm font-medium text-zinc-200 hover:text-white"
                      >
                        {view.name}
                      </Link>
                      <p className="mt-1 text-[11px] text-zinc-600">
                        {active ? "Active view" : "Open saved filters"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(view.id);
                          setEditingName(view.name);
                          setError("");
                        }}
                        className="rounded-lg border border-zinc-800 px-2 py-1.5 text-[10px] text-zinc-500 transition hover:text-white"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => overwriteView(view.id)}
                        disabled={pendingId === view.id || active}
                        title={active ? "This view already matches the current filters" : "Replace this view with the current filters"}
                        className="rounded-lg border border-zinc-800 px-2 py-1.5 text-[10px] text-zinc-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteView(view.id, view.name)}
                        disabled={pendingId === view.id}
                        className="rounded-lg border border-red-950 px-2 py-1.5 text-[10px] text-red-500 transition hover:bg-red-950/30 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-800 px-4 py-5 text-center text-xs text-zinc-600">
          No saved views yet. Apply useful filters, then save them here.
        </div>
      )}

      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </section>
  );
}

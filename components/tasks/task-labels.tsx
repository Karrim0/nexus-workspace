"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LABEL_COLORS,
  LABEL_COLOR_META,
  type LabelColor,
} from "@/lib/task-labels";

type LabelItem = {
  id: string;
  name: string;
  color: LabelColor;
};

type TaskLabelsProps = {
  taskId: string;
  labels: LabelItem[];
  availableLabels: LabelItem[];
  canManage: boolean;
  canCreateLabels: boolean;
};

export function TaskLabels({
  taskId,
  labels,
  availableLabels,
  canManage,
  canCreateLabels,
}: TaskLabelsProps) {
  const router = useRouter();
  const [selectedLabelId, setSelectedLabelId] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<LabelColor>("slate");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const assignedIds = useMemo(
    () => new Set(labels.map((label) => label.id)),
    [labels]
  );

  const unassignedLabels = availableLabels.filter(
    (label) => !assignedIds.has(label.id)
  );

  async function attachLabel(labelId: string) {
    if (!labelId || busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${taskId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to add label.");
        return;
      }

      setSelectedLabelId("");
      router.refresh();
    } catch {
      setError("Unable to add label.");
    } finally {
      setBusy(false);
    }
  }

  async function removeLabel(labelId: string) {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `/api/tasks/${taskId}/labels?labelId=${encodeURIComponent(labelId)}`,
        { method: "DELETE" }
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to remove label.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to remove label.");
    } finally {
      setBusy(false);
    }
  }

  async function createLabel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (name.length < 2 || busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color: newColor }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to create label.");
        return;
      }

      const labelId = payload?.data?.id as string | undefined;

      if (labelId) {
        const attachResponse = await fetch(`/api/tasks/${taskId}/labels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labelId }),
        });

        if (!attachResponse.ok) {
          const attachPayload = await attachResponse.json();
          setError(
            attachPayload?.message ||
              "Label was created, but could not be attached to this task."
          );
          router.refresh();
          return;
        }
      }

      setNewName("");
      setNewColor("slate");
      router.refresh();
    } catch {
      setError("Unable to create label.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Labels</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Reusable workspace tags for triage and reporting
            </p>
          </div>
          <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
            {labels.length}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <span
              key={label.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${LABEL_COLOR_META[label.color].badgeClassName}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${LABEL_COLOR_META[label.color].dotClassName}`}
              />
              {label.name}
              {canManage ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeLabel(label.id)}
                  className="ml-0.5 opacity-60 transition hover:opacity-100 disabled:cursor-wait"
                  aria-label={`Remove ${label.name}`}
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}

          {labels.length === 0 ? (
            <p className="text-sm text-zinc-600">No labels assigned.</p>
          ) : null}
        </div>

        {canManage && unassignedLabels.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedLabelId}
              onChange={(event) => setSelectedLabelId(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
            >
              <option value="">Choose a workspace label</option>
              {unassignedLabels.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedLabelId || busy}
              onClick={() => attachLabel(selectedLabelId)}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition enabled:hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add label
            </button>
          </div>
        ) : null}

        {canCreateLabels ? (
          <form
            onSubmit={createLabel}
            className="grid gap-2 border-t border-zinc-800 pt-4 sm:grid-cols-[1fr_150px_auto]"
          >
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="New label name"
              maxLength={28}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-600"
            />
            <select
              value={newColor}
              onChange={(event) =>
                setNewColor(event.target.value as LabelColor)
              }
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
            >
              {LABEL_COLORS.map((color) => (
                <option key={color} value={color}>
                  {LABEL_COLOR_META[color].label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={newName.trim().length < 2 || busy}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition enabled:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create
            </button>
          </form>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

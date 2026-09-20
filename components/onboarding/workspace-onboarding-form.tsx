"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type WorkspaceOnboardingFormProps = {
  userName: string;
};

export function WorkspaceOnboardingForm({
  userName,
}: WorkspaceOnboardingFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload?.error === "ACTIVE_WORKSPACE_EXISTS") {
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        setError(
          payload?.errors?.name ||
            payload?.message ||
            "Unable to create workspace."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong while creating your workspace.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="workspace-name"
          className="text-sm font-medium text-zinc-300"
        >
          Workspace name
        </label>

        <input
          id="workspace-name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={60}
          autoFocus
          required
          placeholder={`${userName.split(" ")[0]}'s Team`}
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        <p className="mt-2 text-xs leading-5 text-zinc-600">
          You will become the Owner. You can invite teammates after setup.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition enabled:hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? "Creating workspace..." : "Create workspace"}
      </button>
    </form>
  );
}

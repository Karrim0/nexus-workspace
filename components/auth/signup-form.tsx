"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(
          payload?.errors?.join?.(" ") ||
            payload?.message ||
            "Unable to create account."
        );
        return;
      }

      router.replace("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong while creating your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="text-sm font-medium text-zinc-300"
        >
          Full name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Kareem Mohamed"
          minLength={2}
          required
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="text-sm font-medium text-zinc-300"
        >
          Email
        </label>

        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />
      </div>

      <div>
        <label
          htmlFor="signup-password"
          className="text-sm font-medium text-zinc-300"
        >
          Password
        </label>

        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        <p className="mt-2 text-xs text-zinc-600">
          Use at least 8 characters.
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
        {submitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

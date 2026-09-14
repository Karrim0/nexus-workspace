import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Nexus"
      description="Access your workspace, projects, tasks, and team activity."
      footerText="New to Nexus?"
      footerHref="/signup"
      footerLinkLabel="Create an account"
    >
      <form className="space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</label>
            <Link href="/login" className="text-xs font-medium text-zinc-500 transition hover:text-zinc-300">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <button type="submit" className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}

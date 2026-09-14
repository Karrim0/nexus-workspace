import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Create your workspace"
      title="Start with Nexus"
      description="Create your account and set up the workspace your team will use."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkLabel="Sign in"
    >
      <form className="space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Kareem Mohamed"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

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
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
          <p className="mt-2 text-xs text-zinc-600">
            Use at least 8 characters. Server validation comes next.
          </p>
        </div>

        <button type="submit" className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
          Create account
        </button>
      </form>
    </AuthShell>
  );
}

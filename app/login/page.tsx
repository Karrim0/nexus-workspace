import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

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
      <LoginForm />
    </AuthShell>
  );
}

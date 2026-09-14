import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

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
      <SignupForm />
    </AuthShell>
  );
}

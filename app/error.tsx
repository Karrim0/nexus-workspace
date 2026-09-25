"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

type AppErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function AppError({
  error,
  reset,
}: AppErrorProps) {
  useEffect(() => {
    console.error("Nexus route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <ErrorState
        title="Workspace view unavailable"
        description="Nexus hit an unexpected error while loading this view. Your data has not been changed."
        onRetry={reset}
      />
    </main>
  );
}

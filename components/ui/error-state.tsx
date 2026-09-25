"use client";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this workspace view. Try again in a moment.",
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center px-5 py-10">
      <div className="w-full rounded-3xl border border-red-950/50 bg-red-950/10 p-7 text-center sm:p-9">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/30 text-lg font-semibold text-red-300">
          !
        </div>

        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-400">
          {description}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Try again
          </button>
        ) : null}
      </div>
    </section>
  );
}

type PageLoadingProps = {
  title?: string;
  description?: string;
  cards?: number;
};

export function PageLoading({
  title = "Loading workspace",
  description = "Getting the latest workspace data ready.",
  cards = 4,
}: PageLoadingProps) {
  return (
    <div className="px-5 py-8 pb-28 sm:px-8 lg:pb-8">
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="mt-3 h-8 w-56 rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-zinc-900" />
      </div>

      <div className="sr-only">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
          >
            <div className="h-4 w-24 rounded bg-zinc-800" />
            <div className="mt-4 h-9 w-16 rounded bg-zinc-800" />
            <div className="mt-3 h-3 w-32 rounded bg-zinc-900" />
          </div>
        ))}
      </div>

      <div className="mt-8 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="h-5 w-40 rounded bg-zinc-800" />

        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-xl border border-zinc-800 bg-zinc-950"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

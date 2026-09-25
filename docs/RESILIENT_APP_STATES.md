# Resilient app states

Nexus Workspace now has shared loading, error, and not-found experiences.

## Loading

`app/loading.tsx` provides an App Router fallback while dynamic workspace routes are resolving server data.

The loading state uses skeleton blocks instead of a blank screen.

## Error boundary

`app/error.tsx` catches unexpected route rendering errors and gives the user a retry action through Next.js `reset()`.

The client error boundary logs the original error to the browser console without exposing internal details in the UI.

## Not found

`app/not-found.tsx` provides a workspace-aware 404 surface for missing pages, deleted records, and cross-workspace project/task lookups that intentionally resolve to `notFound()`.

## Reusable UI

Shared state components live under:

```text
components/ui/page-loading.tsx
components/ui/error-state.tsx
```

This gives later routes a consistent base for route-specific loading and error states.

# Entry routing

The root route now resolves the user's authentication and workspace-access state before sending them into the application.

## `/`

The application entry route uses this flow:

```text
No authenticated user
        ↓
      /login

Authenticated user without active workspace membership
        ↓
 /access-denied

Authenticated user with active workspace membership
        ↓
   /dashboard
```

## Why this matters

Previously `/` redirected directly to `/dashboard` for every visitor.

That worked before authentication and authorization existed, but it caused unnecessary redirects once protected routes and workspace membership checks were introduced.

The root route is now the canonical entry point for the current account state.

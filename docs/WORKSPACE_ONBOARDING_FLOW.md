# Workspace onboarding flow

Day 14 now exposes the user-owned workspace flow after read and mutation scoping have been migrated away from the seeded Product Team workspace.

## New account flow

```text
/signup
  ↓
Account + session created
  ↓
/onboarding
  ↓
Create workspace
  ↓
Owner + Active membership
  ↓
/dashboard
```

## Existing account flow

The root route resolves account state:

```text
signed out
  → /login

signed in without an active workspace
  → /onboarding

signed in with an active workspace
  → /dashboard
```

## API

`POST /api/workspaces`

Requires an authenticated user.

The endpoint validates the requested workspace name and creates a workspace with an initial Owner membership.

If the user already has an active workspace, creation is rejected and the client continues to the dashboard.

## Route protection

The session proxy now protects:

- dashboard
- projects
- tasks
- team
- activity
- search
- insights
- onboarding

Authenticated users who open `/login` or `/signup` are sent through `/` so the application can resolve whether they need onboarding or the dashboard.

## Isolation

This flow is safe to expose only because the earlier Day 14 commits migrated repository reads and mutation routes to the authenticated workspace ID.

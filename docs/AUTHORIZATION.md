# Authorization

Authentication answers: **Who is the user?**

Authorization answers: **What is that user allowed to do inside the workspace?**

Nexus Workspace now has a central workspace-access layer that resolves the signed-in user against the current workspace membership.

## Workspace roles

The authorization layer currently normalizes workspace roles to:

- `owner`
- `admin`
- `member`

Role values are normalized before permission checks so existing seeded role casing does not affect authorization behavior.

## Active membership

A valid session alone is not enough to receive workspace permissions.

The user must also have an active `WorkspaceMember` record for the workspace.

## Permission helpers

The current authorization foundation exposes permission helpers for:

- managing workspace members
- managing projects
- managing tasks
- identifying the workspace owner

These helpers will be applied to mutation APIs and UI controls in the next commits.

## Access inspection endpoint

```text
GET /api/auth/access
```

The endpoint returns:

- `401` when there is no authenticated user
- `403` when the user is authenticated but does not have active workspace access
- `200` with normalized role and permissions when access is valid

This keeps authentication and authorization as separate concerns.

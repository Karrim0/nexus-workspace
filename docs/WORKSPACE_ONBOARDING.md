# Workspace onboarding

Day 14 starts the transition from the seeded Product Team workspace to real user-owned workspaces.

## Goal

A newly authenticated user should not remain stuck in an access-denied state.

The intended onboarding flow is:

```text
Signup
  ↓
Authenticated account
  ↓
No active workspace membership
  ↓
Create workspace
  ↓
Owner + Active membership
  ↓
Dashboard
```

## Foundation

`lib/workspaces/validation.ts`

Validates the workspace name before creation.

`lib/workspaces/onboarding.ts`

Provides two server-side operations:

- inspect whether a user already has an active workspace membership
- create a new workspace and its initial Owner membership

Workspace creation uses the existing Prisma relations, so no schema migration is required for this foundation commit.

## Important

The application repository is still scoped to the seeded Product Team workspace at this point.

The next Day 14 commits will make repository reads and authorization resolve the current user's workspace dynamically before the onboarding UI is exposed.

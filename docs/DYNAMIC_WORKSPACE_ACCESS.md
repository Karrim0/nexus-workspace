# Dynamic workspace access

Workspace authorization no longer assumes that every authenticated user belongs to the seeded `workspace-product-team` workspace.

## Access resolution

`getCurrentWorkspaceAccess()` now resolves an active workspace membership by the authenticated user ID.

The returned access object contains:

- workspace ID
- workspace name
- workspace slug
- normalized role
- membership status
- authenticated user

## Top bar

The workspace header now displays the resolved workspace name instead of the hardcoded `Product Team` label.

Search controls are only shown when an active workspace is available.

## Current limitation

This commit changes workspace identity and authorization resolution only.

The repository data functions are still scoped to the seeded workspace until the next Day 14 commit. Onboarding UI must remain unavailable until repository reads and mutations also receive the resolved workspace ID.

A workspace switcher is outside this milestone. When a user belongs to multiple active workspaces, the first active membership is used temporarily.

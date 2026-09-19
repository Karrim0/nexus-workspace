# Workspace access states

Nexus Workspace distinguishes between authentication and workspace authorization.

## Signed out

The visitor has no valid session and must sign in before entering protected workspace routes.

## Signed in without workspace access

The user has a valid account and session, but no active `WorkspaceMember` record for the current workspace.

This state now has a dedicated `/access-denied` experience instead of relying on scattered one-off messages.

## Active workspace member

The user has an authenticated session and an active workspace membership. Role-based permissions are then evaluated for owner, admin, and member actions.

## Why this matters

Authentication should never imply access to workspace data.

The UI state is intentionally separated from API authorization so server-side permission checks remain the source of truth.

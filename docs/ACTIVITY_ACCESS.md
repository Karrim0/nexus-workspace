# Activity access

Workspace activity now follows the same authorization boundary as projects, tasks, and team data.

## Access requirement

A valid login session is not enough to read the activity feed.

The user must have an active workspace membership.

## UI behavior

The Activity page now:

- renders a workspace-access state when membership is missing
- shows the current user's normalized workspace role
- counts actions performed by the current user
- marks the current user's activity entries with a `You` badge
- includes an empty state when no activity exists

## API behavior

`GET /api/activity` returns `403` when the signed-in user does not have active workspace access.

The endpoint also returns `currentUserActions` alongside the total event count.

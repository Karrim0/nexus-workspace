# Bulk task actions and saved views

This iteration adds two task-management capabilities intended to make larger workspaces faster to operate without weakening the existing workspace-scoping and task-completion rules.

## Bulk task actions

The Tasks board now supports selecting up to 100 visible tasks and applying one operation to the selection.

### Member permissions

Members can bulk-change **status** only, and only for tasks assigned to themselves. The API re-checks task ownership; the client UI is not treated as an authorization boundary.

### Admin / owner permissions

Admins and owners can bulk:

- change status;
- change priority;
- reassign tasks to an active workspace member;
- set a due date;
- delete selected tasks.

### Workflow safeguards

Moving tasks to `Done` still respects the workflow rules introduced with subtasks and dependencies. A bulk completion is rejected if any task being completed still has an incomplete subtask or an unfinished dependency. This keeps bulk updates from bypassing the single-task completion guard.

Status changes update `startedAt` / `completedAt`, and status or delete operations recalculate project progress inside the transaction. A summarized workspace activity entry is written for each successful bulk action.

The endpoint is:

`POST /api/tasks/bulk`

## Saved task views

Task filters can now be persisted as personal saved views. A view stores:

- search query;
- project;
- priority;
- status;
- label;
- milestone;
- due-date filter;
- sort order.

Saved views belong to both a workspace and a user. Users cannot read, rename, overwrite, or delete another user's view, even inside the same workspace.

The Tasks page supports:

- saving the current filter state;
- reopening a saved view with one click;
- renaming a view;
- overwriting the active view with the current filters;
- deleting a view.

Endpoints:

- `GET /api/task-views`
- `POST /api/task-views`
- `PATCH /api/task-views/[viewId]`
- `DELETE /api/task-views/[viewId]`

## Database

The `SavedTaskView` model stores personal filter presets and is scoped by `workspaceId` and `userId`. The migration also adds foreign keys with cascade deletion so saved views are removed automatically when their workspace or owner is removed.

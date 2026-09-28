# Task Subtasks & Dependencies

Nexus Workspace supports lightweight subtasks/checklists and explicit task dependencies.

## Subtasks

- Tasks can contain ordered checklist items.
- The assigned member, workspace admins, and owners can add, rename, complete, reopen, and remove subtasks.
- A completed task cannot receive a new incomplete subtask or have a completed subtask reopened until the parent task is reopened.
- Task cards surface checklist completion as `completed/total`.

## Dependencies

- A task can depend on any other task in the same workspace.
- Self-dependencies and duplicate dependencies are rejected.
- Circular dependency chains are rejected before persistence.
- Task details show both prerequisites (`blocked by`) and downstream tasks (`this task blocks`).
- Task cards surface the count of unfinished dependencies.

## Completion gate

Moving a task to `Done` is rejected while it has:

- incomplete subtasks, or
- dependencies whose prerequisite task is not `Done`.

This keeps task completion aligned with its delivery structure instead of treating dependencies and checklists as visual-only metadata.

## API routes

- `POST /api/tasks/:taskId/subtasks`
- `PATCH /api/tasks/:taskId/subtasks/:subtaskId`
- `DELETE /api/tasks/:taskId/subtasks/:subtaskId`
- `POST /api/tasks/:taskId/dependencies`
- `DELETE /api/tasks/:taskId/dependencies/:dependsOnTaskId`

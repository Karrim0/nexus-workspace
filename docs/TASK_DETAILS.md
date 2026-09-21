# Task details foundation

Day 16 starts with a dedicated task detail surface.

## Route

```text
/tasks/[taskId]
```

The page shows:

- task title
- workflow status
- priority
- due date and overdue state
- project context
- assignee identity
- created and updated timestamps
- task ID

## Workspace isolation

`getWorkspaceTaskById()` always resolves the task through its parent project's workspace ID.

A task ID from another workspace returns `null`, so the detail route resolves to `404`.

## Architecture

Task detail reads live in the repository layer rather than querying Prisma directly from the page.

This keeps the page aligned with the existing workspace-scoped data boundary.

## Next step

The next task-focused commit can layer comments or task-specific activity onto this page without changing the isolation model.

# Task comments

Task details now support workspace-scoped discussion.

## Data model

`TaskComment` stores:

- task
- author
- comment body
- created timestamp
- updated timestamp

Comments are deleted automatically when their task is deleted.

## API

```text
GET  /api/tasks/[taskId]/comments
POST /api/tasks/[taskId]/comments
```

Both operations require active workspace access.

Task lookup is always constrained by the authenticated workspace, preventing cross-workspace comment reads or writes.

## Validation

Comment bodies:

- cannot be empty
- are trimmed before storage
- are limited to 1000 characters

## Activity integration

Creating a comment also creates a workspace Activity event inside the same Prisma transaction.

## UI

The task details page now shows the discussion history and an inline comment composer.

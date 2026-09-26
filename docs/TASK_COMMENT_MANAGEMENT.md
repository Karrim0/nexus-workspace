# Task comment management

Task comments can now be edited and deleted by their original author.

## API

```text
PATCH  /api/tasks/[taskId]/comments/[commentId]
DELETE /api/tasks/[taskId]/comments/[commentId]
```

Both operations require:

- an authenticated active workspace
- the task to belong to that workspace
- the current user to be the original comment author

## Validation

Edited comment bodies use the same validation as new comments:

- non-empty after trimming
- maximum 1000 characters

## Activity

Editing and deleting comments create workspace Activity records so collaboration changes remain visible.

## Mutation protection

Comment create, edit, and delete requests now use the shared trusted-request guard introduced by the authentication hardening pass.

## UI

Authors see Edit and Delete actions on their own comments.

Edited comments are labeled without changing the original creation timestamp shown in the thread.

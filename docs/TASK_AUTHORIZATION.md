# Task authorization

Task permissions are intentionally more collaborative than project and team administration.

## Owner and admin

Workspace owners and admins can:

- create tasks for any active workspace member
- edit task title, project, assignee, priority, status, and due date
- delete tasks

## Member

A regular member can:

- read workspace tasks
- create a task only when assigning it to themselves
- change the status of a task assigned to themselves

A regular member cannot:

- reassign tasks
- edit task metadata
- change another member's task
- delete tasks

## Why this split exists

Members need enough permission to execute day-to-day work without receiving administrative control over other people's assignments.

All restrictions are enforced server-side in the task API.

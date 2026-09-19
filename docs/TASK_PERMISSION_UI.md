# Task permission-aware UI

The task interface now mirrors server-side role permissions.

## Member experience

A regular member:

- sees only tasks assigned to them on the My Tasks board
- can move those tasks between workflow statuses
- can create a new task for themselves
- does not receive full edit or delete controls
- cannot select another assignee while creating a task

## Owner and admin experience

Owners and admins keep the full task card controls, including:

- status updates
- full metadata editing
- reassignment
- deletion

## Security model

The UI is only a usability layer.

Task permissions continue to be enforced by the API, so hiding a control is never treated as the security boundary.

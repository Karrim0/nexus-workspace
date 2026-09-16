# Project authorization

Project access is now role-aware.

## Read access

Any authenticated user with an active workspace membership can:

- view the projects list
- open project details
- inspect project progress, tasks, and members

## Write access

Only `owner` and `admin` roles can:

- create projects
- edit project details
- change project assignments
- delete projects

Members receive read-only project access.

## Server-side enforcement

The API enforces authorization independently from the UI:

```text
GET    /api/projects
POST   /api/projects
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId
```

Write endpoints return `403` when the active workspace role does not have project-management permission.

The UI also hides project-management controls for read-only members.

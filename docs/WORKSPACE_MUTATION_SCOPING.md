# Dynamic workspace mutation scoping

Day 14 now scopes workspace writes to the authenticated user's resolved workspace.

## Migrated mutation surfaces

The following routes no longer write to the seeded Product Team workspace:

- `POST /api/projects`
- `PATCH /api/projects/[projectId]`
- `DELETE /api/projects/[projectId]`
- `POST /api/tasks`
- `PATCH /api/tasks/[taskId]`
- `DELETE /api/tasks/[taskId]`
- `POST /api/team`
- `PATCH /api/team/[memberId]`
- `DELETE /api/team/[memberId]`

## Security boundary

Every mutation starts from `getCurrentWorkspaceAccess()`.

Workspace-sensitive database operations now use:

```text
access.workspaceId
```

That includes:

- project creation and lookup
- project member validation
- task project validation
- task assignee validation
- team membership creation/update/removal
- task unassignment when removing a member
- project-member cleanup
- activity log writes

The existing RBAC rules still apply on top of workspace isolation.

## Product Team constant

The temporary `PRODUCT_TEAM_WORKSPACE_ID` compatibility export is removed from the repository layer.

After this commit, application code under `app/` and `lib/` should contain no references to that constant.

## Next step

With both reads and writes isolated by the resolved workspace, the onboarding UI can safely allow a newly signed-up user to create their own workspace.

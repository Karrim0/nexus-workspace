# Workspace-scoped repository reads

Day 14 removes the seeded Product Team workspace from the repository read path.

## Before

Repository helpers queried:

```text
workspace-product-team
```

directly.

That meant a future user-owned workspace could resolve the correct membership in the authorization layer while still reading Product Team data from the repository.

## Now

Every repository read resolves the active authenticated workspace before querying:

- `getWorkspaceProjects`
- `getWorkspaceProjectById`
- `getWorkspaceTasks`
- `getWorkspaceMembers`
- `getWorkspaceActivity`

Each helper also accepts an optional explicit `workspaceId` for server code that already has a resolved access object.

When there is no active workspace:

- collection reads return an empty array
- single project lookup returns `null`

## Security boundary

Project lookup always combines:

```text
project id + workspace id
```

Tasks are scoped through their parent project's workspace.

Members and activity are filtered directly by workspace ID.

This prevents repository reads from crossing workspace boundaries.

## Remaining Day 14 work

`PRODUCT_TEAM_WORKSPACE_ID` is temporarily exported only because some mutation routes still use it.

The next commit migrates create/update/delete/invite mutations to `access.workspaceId`. Once those write paths are migrated, the compatibility constant can be removed completely.

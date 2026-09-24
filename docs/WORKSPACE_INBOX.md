# Workspace inbox

The workspace now includes an Inbox focused on personal delivery pressure plus recent team updates.

## Personal attention

The Inbox derives its task signals from existing workspace data:

- open tasks assigned to the current user
- overdue tasks
- tasks due within the next 7 days
- high-priority open tasks

No new source of truth is introduced.

## Recent updates

The Inbox also shows the latest workspace Activity events with member context and a link to the full Activity feed.

## Navigation

The top bar now includes a direct Inbox entry for authenticated workspace members.

## Access

`/inbox` is protected by the session proxy and all repository reads use the authenticated `workspaceId`.

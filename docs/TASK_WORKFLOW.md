# Advanced task workflow

Nexus Workspace uses one shared workflow definition across validation, APIs, filters, and task UI.

## Statuses

- `Backlog` — captured work that is not committed yet.
- `Todo` — ready to start.
- `In Progress` — active execution.
- `Review` — waiting for review or approval.
- `Blocked` — execution is stopped by an impediment.
- `Done` — completed work; only this state contributes to project completion metrics.

## Priorities

`No Priority`, `Low`, `Medium`, `High`, and `Urgent` are ordered from least to most important for priority sorting.

## Delivery timestamps

Tasks now track `startedAt` and `completedAt`.

- Moving into an active delivery state records the first start time.
- Moving to `Done` records completion time.
- Reopening a completed task clears `completedAt` while preserving its original start time.

These timestamps are persisted so later analytics can calculate cycle time and delivery throughput without reconstructing history from UI events.

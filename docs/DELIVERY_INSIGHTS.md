# Delivery insights refinement

The Insights surface now highlights tasks that need attention instead of only reporting aggregate counts.

## Due-soon signal

Open tasks due within the next 7 days are counted separately from overdue work.

## Attention queue

Tasks receive deterministic attention signals from existing workspace data:

- overdue
- high priority and still open
- due within 7 days
- unassigned and still open

The queue is ordered by signal severity, then due date.

No AI model decides task health and no new source of truth is introduced.

## Team workload

Per-member workload now includes due-soon counts alongside open, completed, and overdue work.

## Workspace isolation

Both the Insights page and API explicitly pass the authenticated workspace ID into repository reads.

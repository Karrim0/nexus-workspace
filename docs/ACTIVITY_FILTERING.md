# Activity filtering and sorting

The Activity page now supports URL-based filtering without adding client-side state.

## Filters

Activity can be narrowed by:

- action text
- member
- rolling time window

Supported time windows:

- all time
- last 24 hours
- last 7 days
- last 30 days

## Sorting

Results can be ordered newest-first or oldest-first.

## Result-aware metrics

The Activity summary cards now reflect the filtered result set while also showing the total workspace event count.

## Workspace isolation

The page explicitly passes the authenticated `workspaceId` into activity and member repository reads.

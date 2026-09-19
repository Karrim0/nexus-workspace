# Workspace insights

Nexus Workspace now derives operational analytics from existing project, task, and member data.

## `/insights`

The Insights page includes:

- workspace completion rate
- active project count
- active member count
- overdue task count
- high-priority open task count
- unassigned task count
- workflow status distribution
- per-member workload
- per-member overdue workload

## API

```text
GET /api/insights
```

The endpoint requires active workspace access and returns the same calculated insight model used by the UI.

## Architecture

Insight calculation lives in `lib/workspace-insights.ts` instead of inside the page.

This keeps the analytics logic reusable by the server-rendered UI and API without adding a second source of truth.

No new database schema or analytics service is required for this milestone.

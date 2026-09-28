# Project lifecycle

Nexus Workspace now treats project status as an explicit delivery lifecycle instead of a loose label.

## States

- **Draft** — scope, ownership, and delivery details are still being prepared.
- **Active** — the team is actively delivering work.
- **On Hold** — delivery is intentionally paused while a blocker or decision is resolved.
- **Completed** — the intended outcome has been delivered.
- **Archived** — the project is retained for historical context but is no longer operational.

## Behavior

- Owners and admins can change lifecycle state from the existing project edit flow.
- Lifecycle states are available as first-class project filters even when no project currently uses a state.
- Dashboard and workspace insights treat `Draft`, `Active`, and `On Hold` as open projects; `Completed` and `Archived` are excluded from open-project counts.
- Status sorting follows lifecycle order instead of alphabetical order.
- Activity history records meaningful lifecycle transitions (`from X to Y`).

## Migration

The migration maps legacy values as follows:

- `Planning` -> `Draft`
- `In Progress` -> `Active`
- `Completed` remains `Completed`

New database rows default to `Draft`.

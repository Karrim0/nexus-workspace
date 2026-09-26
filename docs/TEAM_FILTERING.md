# Team filtering and sorting

The Team page now completes the Day 15 filter experience across the main workspace data views.

## Filters

Workspace members can be narrowed by:

- name or email
- role
- membership status

## Sorting

Members can be sorted by:

- name
- role
- status

Role sorting keeps workspace responsibility readable by ordering Owner, Admin, then Member before falling back to alphabetical names.

## URL state

The Team page uses query parameters, so filtered views survive refreshes and can be shared.

Example:

```text
/team?role=Member&status=Active&sort=name
```

## Workspace-aware copy

The members panel now uses the resolved workspace name rather than the old seeded Product Team label.

# Project filtering and sorting

The Projects page now supports lightweight server-rendered filtering through URL query parameters.

## Supported parameters

```text
/projects?q=website
/projects?status=Active
/projects?sort=progress-desc
```

Parameters can be combined.

## Filters

Projects can be narrowed by:

- project name
- project status

## Sorting

Available sort modes:

- name
- progress, high to low
- progress, low to high
- status

## Why query parameters

The filter state is shareable, refresh-safe, and does not require client-side state to remain useful.

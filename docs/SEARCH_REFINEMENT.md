# Search refinement

Workspace search now supports result categories in addition to free-text matching.

## Categories

Search results can be limited to:

- all results
- projects
- tasks
- people

Each category displays its match count before the user opens it.

## URL state

The selected category is stored in the query string:

```text
/search?q=design&type=projects
```

This makes search states refresh-safe and shareable.

## Workspace isolation

Search explicitly reads projects, tasks, and members from the authenticated workspace ID.

## UX

The page now includes:

- workspace-aware copy
- result-category pills
- category counts
- category-specific empty states
- mobile bottom-navigation spacing

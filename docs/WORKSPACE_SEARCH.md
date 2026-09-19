# Workspace search

Nexus Workspace now includes a single search entry point for core workspace data.

## Search surface

`/search?q=...` searches across:

- project name, description, and status
- task title, priority, and status
- member name, email, role, and status

## Navigation

The top bar now contains a search field on desktop and a Search entry point on smaller screens.

## Authorization

Search results are only rendered for users with active workspace access.

Search is currently scoped to the active Product Team workspace and uses the existing repository layer.

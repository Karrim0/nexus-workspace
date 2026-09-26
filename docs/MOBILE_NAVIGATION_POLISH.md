# Mobile navigation polish

The workspace mobile shell now keeps core routes reachable without squeezing every destination into the bottom navigation bar.

## Primary mobile routes

The fixed bottom navigation includes:

- Home
- Projects
- Tasks
- Inbox
- Team

## More menu

Less frequent destinations are grouped behind a dedicated More sheet:

- Search
- Activity
- Insights

The sheet includes a backdrop, close action, active-route state, and short descriptions for each destination.

## Desktop

Desktop keeps the full sidebar with all workspace destinations visible.

## Route awareness

Nested routes continue to keep their parent section active, for example:

```text
/tasks/<taskId>
```

keeps Tasks selected.

## Why this change

As the product gained Search, Insights, and Inbox, placing every route directly in the mobile bottom bar became too dense. The new structure keeps the highest-frequency work one tap away while preserving access to secondary surfaces.

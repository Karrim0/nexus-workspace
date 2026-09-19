# Responsive workspace navigation

Nexus Workspace now exposes its primary navigation on mobile as well as desktop.

## Desktop

The existing sidebar remains available at large breakpoints and now treats nested project URLs as part of the active Projects section.

## Mobile

Below the desktop breakpoint, a fixed bottom navigation provides direct access to:

- Overview
- Projects
- My Tasks
- Team
- Activity

The mobile navigation includes safe-area spacing for devices with a home indicator.

## Accessibility

Active routes expose `aria-current="page"` and both navigation regions include explicit accessible labels.

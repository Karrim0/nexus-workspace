# Production readiness

This checklist is the final operational pass for the current Nexus Workspace milestone.

## Health endpoint

Production exposes:

```text
GET /api/health
```

The response checks database connectivity and returns:

- `200` with `status: "ok"` when PostgreSQL responds
- `503` with `status: "degraded"` when the database is unavailable

The endpoint never returns credentials, connection strings, user data, or stack traces.

Responses are marked `no-store`.

## Environment check

Before a production deployment, run:

```text
node scripts/check-production-env.mjs
```

with the production environment variables available in the shell.

The check verifies:

- `DATABASE_URL` exists
- `AUTH_SECRET` exists
- `AUTH_SECRET` is at least 32 characters
- a warning is shown for localhost database URLs

## Deployment checklist

Before treating a deployment as production-ready:

1. run `npx prisma generate`
2. run `npx prisma migrate deploy`
3. run `npm run build`
4. verify `/api/health`
5. test signup -> onboarding -> dashboard
6. test login and logout
7. test workspace isolation with two separate workspaces
8. test project/task/team mutations under Owner, Admin, and Member roles
9. test task comments create/edit/delete
10. test mobile navigation and protected routes

## Credential hygiene

Any database password, auth secret, seeded password, or other credential that has ever been pasted into chat, committed, logged publicly, or shared outside the intended secret store should be rotated before final production use.

Do not commit real `.env` values.

## Remaining architecture debt

The current custom session is stateless and signed.

Future requirements such as:

- logout all devices
- forced session revocation
- per-device session management

would require server-side session state or an equivalent revocation mechanism.

Distributed login rate limiting is also recommended before exposing the app to meaningful public traffic.

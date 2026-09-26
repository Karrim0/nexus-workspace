# Current milestone release checklist

Use this after the compressed catch-up series is merged.

## Build

- [ ] Prisma client generates successfully
- [ ] migrations deploy successfully
- [ ] Next.js production build passes
- [ ] no accidental `.zip` or `.env` files are staged

## Authentication

- [ ] signup creates a session
- [ ] onboarding creates the first workspace
- [ ] login rejects invalid credentials
- [ ] logout clears the session
- [ ] protected routes redirect signed-out visitors

## Workspace isolation

- [ ] projects are isolated
- [ ] tasks are isolated
- [ ] team members are isolated
- [ ] activity is isolated
- [ ] comments are isolated
- [ ] task detail IDs from another workspace return not found

## Product flows

- [ ] search categories work
- [ ] task filters work
- [ ] team filters work
- [ ] activity filters work
- [ ] task details render
- [ ] comments create/edit/delete
- [ ] insights attention queue renders
- [ ] inbox renders personal delivery pressure
- [ ] loading/error/404 states render
- [ ] mobile navigation reaches every workspace surface

## Production

- [ ] strong `AUTH_SECRET`
- [ ] production `DATABASE_URL`
- [ ] exposed development credentials rotated
- [ ] `/api/health` returns `200`
- [ ] Vercel deployment smoke-tested

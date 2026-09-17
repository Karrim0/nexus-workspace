# Authentication security hardening

This pass strengthens the existing custom authentication flow without changing the session architecture.

## Mutation source checks

Login, signup, and logout reject browser requests explicitly identified as cross-site.

Origin validation also accepts the current host and forwarded Vercel host when present.

## Login timing

Unknown users now execute a padding scrypt operation before returning the same generic invalid-credentials response.

This reduces the obvious timing difference between:

- an unknown email
- an existing email with an incorrect password

It is not a substitute for production-grade distributed rate limiting.

## Input bounds

Authentication validation now caps:

- name length
- email length
- password length

The password maximum also prevents very large password payloads from unnecessarily consuming scrypt resources.

## Duplicate signup race

The signup route still performs the friendly pre-check, while also handling Prisma `P2002` unique-constraint failures if two requests race.

## Sensitive response caching

Authentication responses now include:

```text
Cache-Control: no-store, max-age=0
Pragma: no-cache
```

## Browser security headers

Global responses now include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- strict-origin referrer policy
- camera, microphone, and geolocation disabled through Permissions Policy

## Remaining production work

Before a final public production launch:

- rotate any credentials that were ever exposed during development
- use a strong production password for seeded/demo owners
- consider distributed login rate limiting
- consider server-side session revocation if logout-all-devices or forced revocation becomes a product requirement

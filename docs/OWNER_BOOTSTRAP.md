# Bootstrap the Product Team owner account

The seeded `member-kareem` user already belongs to the Product Team workspace, but seeded users predate the credential-based authentication system.

This one-time script attaches a real password credential to that existing user and guarantees that the workspace membership is:

- role: `Owner`
- status: `Active`

## Run from Windows Command Prompt

Choose the password locally. Do not commit it and do not paste it into source files.

```bat
set NEXUS_OWNER_PASSWORD=CHOOSE_A_STRONG_PASSWORD_HERE
npm run auth:bootstrap-owner
set NEXUS_OWNER_PASSWORD=
```

The script prints the existing seeded email after success. Use that email plus the password you chose on `/login`.

## Database target

The command loads `DATABASE_URL` from the local `.env`.

If the deployed Vercel application uses the same PostgreSQL database, the account is immediately valid on the deployment too.

## Optional overrides

The defaults are:

```text
user: member-kareem
workspace: workspace-product-team
```

They can be overridden temporarily with:

```bat
set NEXUS_OWNER_USER_ID=...
set NEXUS_OWNER_WORKSPACE_ID=...
```

## Security

The password is hashed with the same scrypt format used by the application auth system. It is never printed or written to source code.

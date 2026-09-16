# Team authorization

Workspace member management is now protected by role-based authorization.

## Read access

Any authenticated user with an active workspace membership can load the team list.

## Write access

Only users with one of these normalized roles can manage members:

- `owner`
- `admin`

This applies to:

- inviting a member
- changing a member role
- changing a member status
- removing a member

## Owner protection

The owner account remains protected:

- admins cannot manage the owner account
- the owner cannot be made inactive
- the owner role cannot be downgraded
- the owner cannot be removed

API authorization is enforced server-side and does not depend on whether UI controls are visible.

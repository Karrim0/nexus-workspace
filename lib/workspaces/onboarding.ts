import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

function slugifyWorkspaceName(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "workspace";
}

function createWorkspaceSlug(name: string) {
  const base = slugifyWorkspaceName(name);
  const suffix = randomUUID().replace(/-/g, "").slice(0, 8);

  return `${base}-${suffix}`;
}

export async function getWorkspaceOnboardingState(userId: string) {
  const membership = await db.workspaceMember.findFirst({
    where: {
      userId,
      status: {
        equals: "Active",
        mode: "insensitive",
      },
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      workspace: {
        createdAt: "asc",
      },
    },
  });

  if (!membership) {
    return {
      needsWorkspace: true as const,
      membership: null,
    };
  }

  return {
    needsWorkspace: false as const,
    membership: {
      workspaceId: membership.workspaceId,
      workspaceName: membership.workspace.name,
      workspaceSlug: membership.workspace.slug,
      role: membership.role,
      status: membership.status,
    },
  };
}

export async function createWorkspaceForUser(input: {
  userId: string;
  name: string;
}) {
  const existingMembership = await db.workspaceMember.findFirst({
    where: {
      userId: input.userId,
      status: {
        equals: "Active",
        mode: "insensitive",
      },
    },
    select: {
      workspaceId: true,
    },
  });

  if (existingMembership) {
    return {
      created: false as const,
      reason: "ACTIVE_WORKSPACE_EXISTS" as const,
      workspaceId: existingMembership.workspaceId,
    };
  }

  const slug = createWorkspaceSlug(input.name);

  const workspace = await db.workspace.create({
    data: {
      name: input.name,
      slug,
      members: {
        create: {
          userId: input.userId,
          role: "Owner",
          status: "Active",
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
  });

  return {
    created: true as const,
    workspace,
    role: "Owner" as const,
    status: "Active" as const,
  };
}

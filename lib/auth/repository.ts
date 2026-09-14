import { db } from "@/lib/db";

type CredentialRow = {
  userId: string;
  passwordHash: string;
};

export async function findUserByEmail(email: string) {
  return db.user.findFirst({
    where: {
      email,
    },
  });
}

export async function findUserById(userId: string) {
  return db.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function getPasswordHash(userId: string) {
  const rows = await db.$queryRaw<CredentialRow[]>`
    SELECT "userId", "passwordHash"
    FROM "AuthCredential"
    WHERE "userId" = ${userId}
    LIMIT 1
  `;

  return rows[0]?.passwordHash ?? null;
}

export async function createUserWithPassword(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const initials = input.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        initials,
      },
    });

    await tx.$executeRaw`
      INSERT INTO "AuthCredential" (
        "userId",
        "passwordHash",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${user.id},
        ${input.passwordHash},
        NOW(),
        NOW()
      )
    `;

    return user;
  });
}

import {
  randomBytes,
  scrypt as nodeScrypt,
} from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const scrypt = promisify(nodeScrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

const WORKSPACE_ID =
  process.env.NEXUS_OWNER_WORKSPACE_ID?.trim() ||
  "workspace-product-team";

const USER_ID =
  process.env.NEXUS_OWNER_USER_ID?.trim() ||
  "member-kareem";

const OWNER_NAME =
  process.env.NEXUS_OWNER_NAME?.trim() ||
  "Kareem Mohamed";

const PASSWORD = process.env.NEXUS_OWNER_PASSWORD ?? "";

function createInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);

  return `scrypt:${salt}:${Buffer.from(derivedKey).toString("hex")}`;
}

async function main() {
  if (PASSWORD.length < 8) {
    throw new Error(
      "NEXUS_OWNER_PASSWORD is required and must be at least 8 characters."
    );
  }

  const user = await db.user.findUnique({
    where: {
      id: USER_ID,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new Error(
      `Could not find the seeded user "${USER_ID}". No database changes were made.`
    );
  }

  const membership = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: WORKSPACE_ID,
        userId: USER_ID,
      },
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new Error(
      `User "${USER_ID}" is not a member of workspace "${WORKSPACE_ID}". No database changes were made.`
    );
  }

  const passwordHash = await hashPassword(PASSWORD);
  const initials = createInitials(OWNER_NAME);

  const updatedUser = await db.$transaction(async (tx) => {
    const renamedUser = await tx.user.update({
      where: {
        id: USER_ID,
      },
      data: {
        name: OWNER_NAME,
        initials,
      },
      select: {
        id: true,
        name: true,
        email: true,
        initials: true,
      },
    });

    await tx.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: WORKSPACE_ID,
          userId: USER_ID,
        },
      },
      data: {
        role: "Owner",
        status: "Active",
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
        ${USER_ID},
        ${passwordHash},
        NOW(),
        NOW()
      )
      ON CONFLICT ("userId")
      DO UPDATE SET
        "passwordHash" = EXCLUDED."passwordHash",
        "updatedAt" = NOW()
    `;

    return renamedUser;
  });

  console.log("");
  console.log("Nexus owner account is ready.");
  console.log("--------------------------------");
  console.log(`Name:      ${updatedUser.name}`);
  console.log(`Email:     ${updatedUser.email}`);
  console.log(`Initials:  ${updatedUser.initials}`);
  console.log("Role:      Owner");
  console.log("Status:    Active");
  console.log(`Workspace: ${WORKSPACE_ID}`);
  console.log("");
  console.log("Use the email printed above with the password you supplied.");
  console.log("The password itself is never printed or stored in plaintext.");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Owner bootstrap failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });

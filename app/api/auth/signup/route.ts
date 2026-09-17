import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import {
  createUserWithPassword,
  findUserByEmail,
} from "@/lib/auth/repository";
import {
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { validateSignup } from "@/lib/auth/validation";
import {
  authJson,
  crossSiteMutationResponse,
  isTrustedMutationRequest,
} from "@/lib/auth/http";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request)) {
    return crossSiteMutationResponse();
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return authJson(
      {
        error: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
      { status: 400 }
    );
  }

  const result = validateSignup(payload);

  if (!result.success) {
    return authJson(
      {
        error: "VALIDATION_ERROR",
        errors: result.errors,
      },
      { status: 400 }
    );
  }

  try {
    const existingUser = await findUserByEmail(
      result.data.email
    );

    if (existingUser) {
      return authJson(
        {
          error: "EMAIL_IN_USE",
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(
      result.data.password
    );

    const user = await createUserWithPassword({
      name: result.data.name,
      email: result.data.email,
      passwordHash,
    });

    const token = createSessionToken(user.id);
    const cookie = getSessionCookieOptions();

    const response = authJson(
      {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials,
        },
        message: "Account created successfully.",
      },
      { status: 201 }
    );

    response.cookies.set({
      ...cookie,
      value: token,
    });

    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return authJson(
        {
          error: "EMAIL_IN_USE",
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    console.error("POST /api/auth/signup failed:", error);

    return authJson(
      {
        error: "AUTH_ERROR",
        message: "Unable to create account.",
      },
      { status: 500 }
    );
  }
}

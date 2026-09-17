import {
  burnPasswordVerification,
  verifyPassword,
} from "@/lib/auth/password";
import {
  findUserByEmail,
  getPasswordHash,
} from "@/lib/auth/repository";
import {
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { validateLogin } from "@/lib/auth/validation";
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

  const result = validateLogin(payload);

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
    const user = await findUserByEmail(result.data.email);

    const passwordHash = user
      ? await getPasswordHash(user.id)
      : null;

    const passwordMatches = passwordHash
      ? await verifyPassword(
          result.data.password,
          passwordHash
        )
      : await burnPasswordVerification(
          result.data.password
        );

    if (!user || !passwordHash || !passwordMatches) {
      return authJson(
        {
          error: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id);
    const cookie = getSessionCookieOptions();

    const response = authJson({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      },
      message: "Signed in successfully.",
    });

    response.cookies.set({
      ...cookie,
      value: token,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);

    return authJson(
      {
        error: "AUTH_ERROR",
        message: "Unable to sign in.",
      },
      { status: 500 }
    );
  }
}

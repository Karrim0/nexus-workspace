import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import {
  findUserByEmail,
  getPasswordHash,
} from "@/lib/auth/repository";
import {
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";
import { validateLogin } from "@/lib/auth/validation";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
      { status: 400 }
    );
  }

  const result = validateLogin(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        errors: result.errors,
      },
      { status: 400 }
    );
  }

  try {
    const user = await findUserByEmail(result.data.email);

    if (!user) {
      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect.",
        },
        { status: 401 }
      );
    }

    const passwordHash = await getPasswordHash(user.id);

    if (!passwordHash) {
      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect.",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await verifyPassword(
      result.data.password,
      passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id);
    const cookie = getSessionCookieOptions();

    const response = NextResponse.json({
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

    return NextResponse.json(
      {
        error: "AUTH_ERROR",
        message: "Unable to sign in.",
      },
      { status: 500 }
    );
  }
}

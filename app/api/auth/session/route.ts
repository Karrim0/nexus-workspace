import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findUserById } from "@/lib/auth/repository";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    const user = await findUserById(session.userId);

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/session failed:", error);

    return NextResponse.json(
      {
        error: "AUTH_ERROR",
        message: "Unable to read the current session.",
      },
      { status: 500 }
    );
  }
}

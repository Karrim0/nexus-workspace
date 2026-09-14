import { NextResponse } from "next/server";
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export async function POST() {
  const cookie = getSessionCookieOptions();

  const response = NextResponse.json({
    message: "Signed out successfully.",
  });

  response.cookies.set({
    ...cookie,
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
  });

  return response;
}

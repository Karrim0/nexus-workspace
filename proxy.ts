import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { verifyProxySessionToken } from "@/lib/auth/session-proxy";

const protectedPrefixes = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/team",
  "/activity",
];

const guestOnlyPaths = new Set(["/login", "/signup"]);

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const secret = process.env.AUTH_SECRET ?? "";
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const session =
    token && secret
      ? await verifyProxySessionToken(token, secret)
      : null;

  if (isProtectedPath(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    const response = NextResponse.redirect(loginUrl);

    if (token) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }

    return response;
  }

  if (guestOnlyPaths.has(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/team/:path*",
    "/activity/:path*",
    "/login",
    "/signup",
  ],
};

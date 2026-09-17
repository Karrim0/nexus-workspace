import { NextResponse } from "next/server";

export function authJson(
  body: unknown,
  init?: ResponseInit
) {
  const response = NextResponse.json(body, init);

  response.headers.set(
    "Cache-Control",
    "no-store, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");

  return response;
}

export function isTrustedMutationRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");

  if (
    fetchSite &&
    !["same-origin", "same-site", "none"].includes(fetchSite)
  ) {
    return false;
  }

  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const requestUrl = new URL(request.url);
  const trustedOrigins = new Set([requestUrl.origin]);

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "");

  if (forwardedHost) {
    trustedOrigins.add(`${forwardedProto}://${forwardedHost}`);
  }

  const host = request.headers.get("host");

  if (host) {
    trustedOrigins.add(`${requestUrl.protocol}//${host}`);
  }

  return trustedOrigins.has(origin);
}

export function crossSiteMutationResponse() {
  return authJson(
    {
      error: "UNTRUSTED_REQUEST",
      message: "This request could not be verified.",
    },
    {
      status: 403,
    }
  );
}

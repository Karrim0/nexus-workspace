import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import {
  authJson,
  crossSiteMutationResponse,
  isTrustedMutationRequest,
} from "@/lib/auth/http";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request)) {
    return crossSiteMutationResponse();
  }

  const cookie = getSessionCookieOptions();

  const response = authJson({
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

type SessionPayload = {
  userId: string;
  expiresAt: number;
  nonce: string;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  return atob(padded);
}

function decodePayload(value: string) {
  const binary = decodeBase64Url(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function base64UrlToBytes(value: string) {
  const binary = decodeBase64Url(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function verifyProxySessionToken(
  token: string,
  secret: string
): Promise<SessionPayload | null> {
  const [encodedPayload, encodedSignature] = token.split(".");

  if (!encodedPayload || !encodedSignature || secret.length < 32) {
    return null;
  }

  try {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(encodedSignature),
      encoder.encode(encodedPayload)
    );

    if (!validSignature) {
      return null;
    }

    const payload = JSON.parse(
      decodePayload(encodedPayload)
    ) as Partial<SessionPayload>;

    if (
      typeof payload.userId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.nonce !== "string"
    ) {
      return null;
    }

    if (payload.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

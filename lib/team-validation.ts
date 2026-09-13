type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export type InviteMemberInput = {
  name: string;
  email: string;
  role: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateInviteMember(
  payload: unknown
): ValidationResult<InviteMemberInput> {
  if (!isRecord(payload)) {
    return {
      success: false,
      errors: ["Request body must be a JSON object."],
    };
  }

  const errors: string[] = [];

  const name =
    typeof payload.name === "string" ? payload.name.trim() : "";
  const email =
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
  const role =
    typeof payload.role === "string" ? payload.role.trim() : "";

  if (name.length < 2) {
    errors.push("Member name must be at least 2 characters.");
  }

  if (!email || !isEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (role.length < 2) {
    errors.push("Member role must be at least 2 characters.");
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      name,
      email,
      role,
    },
  };
}

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeEmail(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateSignup(
  payload: unknown
): ValidationResult<SignupInput> {
  if (!isRecord(payload)) {
    return {
      success: false,
      errors: ["Request body must be a JSON object."],
    };
  }

  const name =
    typeof payload.name === "string"
      ? payload.name.trim()
      : "";

  const email = normalizeEmail(payload.email);

  const password =
    typeof payload.password === "string"
      ? payload.password
      : "";

  const errors: string[] = [];

  if (name.length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  if (name.length > MAX_NAME_LENGTH) {
    errors.push(
      `Name must be ${MAX_NAME_LENGTH} characters or fewer.`
    );
  }

  if (!email || !isEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    errors.push("Email address is too long.");
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(
      `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`
    );
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
      password,
    },
  };
}

export function validateLogin(
  payload: unknown
): ValidationResult<LoginInput> {
  if (!isRecord(payload)) {
    return {
      success: false,
      errors: ["Request body must be a JSON object."],
    };
  }

  const email = normalizeEmail(payload.email);

  const password =
    typeof payload.password === "string"
      ? payload.password
      : "";

  const errors: string[] = [];

  if (!email || !isEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    errors.push("Email address is too long.");
  }

  if (!password) {
    errors.push("Password is required.");
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push("Password is too long.");
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
      email,
      password,
    },
  };
}

const required = ["DATABASE_URL", "AUTH_SECRET"];

const missing = required.filter(
  (key) => !process.env[key]?.trim()
);

const errors = [];
const warnings = [];

if (missing.length > 0) {
  errors.push(
    `Missing required environment variables: ${missing.join(", ")}`
  );
}

const authSecret = process.env.AUTH_SECRET?.trim();

if (authSecret && authSecret.length < 32) {
  errors.push(
    "AUTH_SECRET should be at least 32 characters in production."
  );
}

const databaseUrl = process.env.DATABASE_URL?.trim();

if (
  databaseUrl &&
  /localhost|127\.0\.0\.1/i.test(databaseUrl)
) {
  warnings.push(
    "DATABASE_URL points to localhost. That is usually not valid for a hosted production deployment."
  );
}

if (warnings.length > 0) {
  console.warn("\nWarnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (errors.length > 0) {
  console.error("\nProduction environment check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
} else {
  console.log("\nProduction environment check passed.");
  console.log("- DATABASE_URL is configured");
  console.log("- AUTH_SECRET is configured");
  console.log("- AUTH_SECRET length check passed");
}

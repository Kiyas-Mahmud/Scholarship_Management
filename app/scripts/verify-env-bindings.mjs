import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const rootDir = path.resolve(cwd);
const wranglerPath = path.resolve(rootDir, "wrangler.toml");

const targetArg = process.argv
  .find((arg) => arg.startsWith("--target="))
  ?.split("=")[1];
const target = targetArg === "staging" ? "staging" : "production";

const requiredEnvVars = [
  "APP_ENV",
  "APP_BASE_URL",
  "SESSION_SECRET",
  "R2_BUCKET_NAME",
  "BKASH_APP_KEY",
  "BKASH_APP_SECRET",
  "BKASH_USERNAME",
  "BKASH_PASSWORD",
  "BKASH_CALLBACK_URL",
  "NAGAD_MERCHANT_ID",
  "NAGAD_MERCHANT_PRIVATE_KEY",
  "NAGAD_CALLBACK_URL",
];

const errors = [];
const warnings = [];

const isMissing = (value) => value == null || String(value).trim().length === 0;

for (const name of requiredEnvVars) {
  if (isMissing(process.env[name])) {
    errors.push(`Missing required environment variable: ${name}`);
  }
}

const appEnv = process.env.APP_ENV;
if (!isMissing(appEnv) && appEnv !== target) {
  errors.push(
    `APP_ENV mismatch: expected \"${target}\" but got \"${appEnv}\".`,
  );
}

const sessionSecret = process.env.SESSION_SECRET;
if (
  target === "production" &&
  !isMissing(sessionSecret) &&
  String(sessionSecret).trim().length < 32
) {
  errors.push("SESSION_SECRET must be at least 32 characters for production.");
}

if (!fs.existsSync(wranglerPath)) {
  errors.push(`wrangler.toml not found at ${wranglerPath}`);
} else {
  const wranglerText = fs.readFileSync(wranglerPath, "utf8");

  if (!wranglerText.includes("[[d1_databases]]")) {
    errors.push("wrangler.toml is missing [[d1_databases]] configuration.");
  }

  if (!/binding\s*=\s*"DB"/.test(wranglerText)) {
    errors.push('wrangler.toml must include a D1 binding named "DB".');
  }

  if (!/database_id\s*=\s*"[^"]+"/.test(wranglerText)) {
    errors.push("wrangler.toml is missing d1 database_id.");
  }

  if (!/preview_database_id\s*=\s*"[^"]+"/.test(wranglerText)) {
    errors.push("wrangler.toml is missing d1 preview_database_id.");
  }

  if (!/migrations_dir\s*=\s*"drizzle\/migrations"/.test(wranglerText)) {
    errors.push(
      'wrangler.toml must set d1 migrations_dir to "drizzle/migrations".',
    );
  }

  if (!/\[\[r2_buckets\]\]/.test(wranglerText)) {
    warnings.push(
      "No [[r2_buckets]] binding found in wrangler.toml. This is acceptable only if R2 is configured directly in Cloudflare Pages.",
    );
  }
}

if (warnings.length > 0) {
  console.log("[warn] Environment verification warnings:");
  for (const warning of warnings) {
    console.log(` - ${warning}`);
  }
}

if (errors.length > 0) {
  console.error("[fail] Environment and binding verification failed:");
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log(
  `[ok] Environment and binding verification passed for target: ${target}`,
);

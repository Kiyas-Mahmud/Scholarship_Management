import { createError, type H3Event } from "h3";
import { z } from "zod";

type AppEnv = "development" | "staging" | "production";

const runtimeConfigSchema = z.object({
  sessionSecret: z.string(),
  appBaseUrl: z.string(),
  r2BucketName: z.string(),
  bkashAppKey: z.string(),
  bkashAppSecret: z.string(),
  bkashUsername: z.string(),
  bkashPassword: z.string(),
  bkashCallbackUrl: z.string(),
  nagadMerchantId: z.string(),
  nagadMerchantPrivateKey: z.string(),
  nagadCallbackUrl: z.string(),
  public: z.object({
    appEnv: z.enum(["development", "staging", "production"]).default("development"),
  }),
});

export type ValidatedRuntimeConfig = z.infer<typeof runtimeConfigSchema> & {
  public: {
    appEnv: AppEnv;
  };
};

const DEV_FALLBACK_SESSION_SECRET = "dev-insecure-session-secret-change-before-production";

export const getValidatedRuntimeConfig = (event?: H3Event): ValidatedRuntimeConfig => {
  const parsed = runtimeConfigSchema.parse(useRuntimeConfig(event));
  const appEnv = parsed.public.appEnv;
  const issues: string[] = [];

  if (appEnv === "production") {
    if (parsed.sessionSecret.trim().length < 32) {
      issues.push("SESSION_SECRET must be at least 32 characters in production.");
    }

    if (!parsed.appBaseUrl.trim()) {
      issues.push("APP_BASE_URL is required in production.");
    }
  }

  if (issues.length > 0) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
      data: {
        code: "INVALID_RUNTIME_CONFIG",
        issues,
      },
    });
  }

  return {
    ...parsed,
    sessionSecret: parsed.sessionSecret || DEV_FALLBACK_SESSION_SECRET,
    public: {
      appEnv,
    },
  };
};

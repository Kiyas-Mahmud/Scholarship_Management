import { getRequestIP, setResponseHeader, type H3Event } from "h3";
import { fail } from "~/server/utils/response";

type RateLimitOptions = {
  bucket: string;
  maxRequests: number;
  windowMs: number;
  blockMs?: number;
  key?: string;
};

type BucketState = {
  count: number;
  resetAt: number;
  blockedUntil: number;
};

const store = new Map<string, BucketState>();

const toRetryAfterSeconds = (ms: number) => Math.max(1, Math.ceil(ms / 1000));

const getClientIp = (event: H3Event) =>
  getRequestIP(event, { xForwardedFor: true }) ?? "unknown";

export const enforceRateLimit = (event: H3Event, options: RateLimitOptions) => {
  const now = Date.now();
  const key = options.key ?? getClientIp(event);
  const id = `${options.bucket}:${key}`;
  const existing = store.get(id);

  let state = existing;

  if (!state || state.resetAt <= now) {
    state = {
      count: 0,
      resetAt: now + options.windowMs,
      blockedUntil: 0,
    };
  }

  if (state.blockedUntil > now) {
    const retryAfterSeconds = toRetryAfterSeconds(state.blockedUntil - now);
    setResponseHeader(event, "Retry-After", retryAfterSeconds);
    fail(429, {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again shortly.",
      details: {
        bucket: options.bucket,
        retryAfterSeconds,
      },
    });
  }

  state.count += 1;

  if (state.count > options.maxRequests) {
    const blockMs = options.blockMs ?? options.windowMs;
    state.blockedUntil = now + blockMs;
    store.set(id, state);

    const retryAfterSeconds = toRetryAfterSeconds(state.blockedUntil - now);
    setResponseHeader(event, "Retry-After", retryAfterSeconds);

    fail(429, {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again shortly.",
      details: {
        bucket: options.bucket,
        retryAfterSeconds,
      },
    });
  }

  store.set(id, state);
};
import { drizzle } from "drizzle-orm/d1";
import type { H3Event } from "h3";

export const getDb = (event: H3Event) => {
  const d1 = (event.context.cloudflare?.env?.DB ?? null) as {
    prepare: (...args: unknown[]) => unknown;
  } | null;

  if (!d1) {
    return null;
  }

  return drizzle(d1 as never);
};

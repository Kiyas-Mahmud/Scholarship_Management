import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { tags } from "~/server/db/schema/professors";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

const tagSchema = z.object({
  name: z.string().min(1).max(64),
});

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "tags-create-user",
    maxRequests: 80,
    windowMs: 60_000,
    key: user.id,
  });

  const body = await readBody(event);
  const input = tagSchema.parse(body);
  const normalized = input.name.trim().toLowerCase();

  const existing = await db
    .select()
    .from(tags)
    .where(and(eq(tags.userId, user.id), eq(tags.name, normalized)))
    .limit(1);

  if (existing[0]) {
    return ok(existing[0]);
  }

  const created = {
    id: nanoid(),
    userId: user.id,
    name: normalized,
  };

  await db.insert(tags).values(created);
  return ok(created);
});

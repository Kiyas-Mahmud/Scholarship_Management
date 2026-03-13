import { eq } from "drizzle-orm";
import { tags } from "~/server/db/schema/professors";
import { requireUser } from "~/server/utils/requireUser";
import { ok } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  const { db, user } = await requireUser(event);

  const rows = await db
    .select({ id: tags.id, name: tags.name, createdAt: tags.createdAt })
    .from(tags)
    .where(eq(tags.userId, user.id));

  return ok(rows);
});

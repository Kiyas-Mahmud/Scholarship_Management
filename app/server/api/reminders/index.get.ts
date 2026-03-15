import { z } from "zod";
import { listReminders } from "~/server/db/repositories/outreach";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

const querySchema = z.object({
  status: z.enum(["pending", "done", "snoozed", "cancelled"]).default("pending"),
  type: z.enum(["followup", "deadline", "subscription"]).optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const query = querySchema.parse(getQuery(event));

  const result = await listReminders(db, user.id, {
    status: query.status,
    type: query.type,
    dueBefore: query.dueBefore,
    dueAfter: query.dueAfter,
    page: query.page,
    limit: query.limit,
  });

  return ok(result);
});

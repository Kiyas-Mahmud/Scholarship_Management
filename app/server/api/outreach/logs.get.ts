import { z } from "zod";
import { listOutreachLogs } from "~/server/db/repositories/outreach";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

const querySchema = z.object({
  professorId: z.string().trim().min(1).optional(),
  actionType: z.enum(["generated", "sent", "followup_sent", "note_added"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const query = querySchema.parse(getQuery(event));

  const result = await listOutreachLogs(db, user.id, {
    professorId: query.professorId,
    actionType: query.actionType,
    page: query.page,
    limit: query.limit,
  });

  return ok(result);
});

import { z } from "zod";
import { listProfessors } from "~/server/db/repositories/professors";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

const professorStatusSchema = z.enum([
  "draft",
  "sent",
  "replied",
  "followup",
  "interview",
  "accepted",
  "rejected",
]);

const querySchema = z.object({
  status: professorStatusSchema.optional(),
  country: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().min(1).max(200).optional(),
  sort: z.enum(["deadline", "last_contact"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const query = querySchema.parse(getQuery(event));

  const result = await listProfessors(db, user.id, {
    status: query.status,
    country: query.country,
    q: query.q,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  });

  return ok(result);
});

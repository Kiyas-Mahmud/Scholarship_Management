import { z } from "zod";
import {
  getProfessorById,
  updateProfessor,
} from "~/server/db/repositories/professors";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok } from "~/server/utils/response";

const statusSchema = z.object({
  status: z.enum([
    "draft",
    "sent",
    "replied",
    "followup",
    "interview",
    "accepted",
    "rejected",
  ]),
  nextFollowupAt: z.string().datetime().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const { db, user } = await requireUser(event);
  const professorId = getRouterParam(event, "id");

  if (!professorId) {
    return fail(400, {
      code: "BAD_REQUEST",
      message: "Professor id is required.",
    });
  }

  const existing = await getProfessorById(db, user.id, professorId);

  if (!existing) {
    return fail(404, {
      code: "PROFESSOR_NOT_FOUND",
      message: "Professor not found.",
    });
  }

  const body = await readBody(event);
  const input = statusSchema.parse(body);

  const updated = await updateProfessor(db, user.id, professorId, {
    status: input.status,
    nextFollowupAt: input.nextFollowupAt,
  });

  return ok(updated);
});

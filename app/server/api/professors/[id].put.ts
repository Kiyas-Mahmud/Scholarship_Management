import { z } from "zod";
import {
  getProfessorById,
  updateProfessor,
} from "~/server/db/repositories/professors";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  universityName: z.string().min(2).max(300).optional(),
  department: z.string().max(200).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  researchArea: z.string().max(500).nullable().optional(),
  deadlineAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "professors-update-user",
    maxRequests: 50,
    windowMs: 60_000,
    key: user.id,
  });

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
  const input = updateSchema.parse(body);

  const updated = await updateProfessor(db, user.id, professorId, {
    professorName: input.name,
    email: input.email?.toLowerCase(),
    universityName: input.universityName,
    department: input.department,
    country: input.country,
    researchArea: input.researchArea,
    deadlineAt: input.deadlineAt,
    notes: input.notes,
  });

  return ok(updated);
});

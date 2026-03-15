import { z } from "zod";
import {
  getProfessorById,
  updateProfessor,
} from "~/server/db/repositories/professors";
import {
  PROFESSOR_STATUSES,
  isAllowedStatusTransition,
} from "~/server/utils/professorStatus.mjs";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

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

export default withErrorHandling(async (event) => {
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

  if (!isAllowedStatusTransition(existing.status, input.status)) {
    return fail(409, {
      code: "INVALID_STATUS_TRANSITION",
      message: `Transition from ${existing.status} to ${input.status} is not allowed.`,
    });
  }

  const requiresFollowupDate =
    existing.status !== PROFESSOR_STATUSES.FOLLOWUP &&
    input.status === PROFESSOR_STATUSES.FOLLOWUP;

  if (requiresFollowupDate && !input.nextFollowupAt) {
    return fail(400, {
      code: "FOLLOWUP_DATE_REQUIRED",
      message: "nextFollowupAt is required when moving into followup status.",
    });
  }

  const updated = await updateProfessor(db, user.id, professorId, {
    status: input.status,
    nextFollowupAt:
      input.status === PROFESSOR_STATUSES.FOLLOWUP
        ? (input.nextFollowupAt ?? existing.nextFollowupAt ?? null)
        : input.nextFollowupAt,
  });

  return ok(updated);
});

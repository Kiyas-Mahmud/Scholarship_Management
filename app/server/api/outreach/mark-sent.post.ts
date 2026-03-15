import { nanoid } from "nanoid";
import { z } from "zod";
import {
  createOutreachLog,
  createReminder,
} from "~/server/db/repositories/outreach";
import {
  getProfessorById,
  updateProfessor,
} from "~/server/db/repositories/professors";
import {
  getTemplateById,
  getTemplateVersionById,
} from "~/server/db/repositories/templates";
import {
  PROFESSOR_STATUSES,
  isAllowedStatusTransition,
} from "~/server/utils/professorStatus.mjs";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const markSentSchema = z.object({
  professorId: z.string().trim().min(1),
  subjectFinal: z.string().trim().min(1).max(500),
  bodyFinal: z.string().trim().min(1).max(20000),
  templateId: z.string().trim().min(1).optional(),
  templateVersionId: z.string().trim().min(1).optional(),
  followupInDays: z.coerce.number().int().min(1).max(365).default(7),
}).strict();

const addDaysIso = (date: Date, days: number) => {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy.toISOString();
};

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "outreach-mark-sent-user",
    maxRequests: 30,
    windowMs: 60_000,
    key: user.id,
  });

  const body = await readBody(event);
  const input = markSentSchema.parse(body);

  const professor = await getProfessorById(db, user.id, input.professorId);

  if (!professor) {
    return fail(404, {
      code: "PROFESSOR_NOT_FOUND",
      message: "Professor not found.",
    });
  }

  if (
    !isAllowedStatusTransition(professor.status, PROFESSOR_STATUSES.SENT)
  ) {
    return fail(409, {
      code: "INVALID_STATUS_TRANSITION",
      message: `Transition from ${professor.status} to sent is not allowed.`,
    });
  }

  if (input.templateId) {
    const template = await getTemplateById(db, user.id, input.templateId);

    if (!template) {
      return fail(404, {
        code: "TEMPLATE_NOT_FOUND",
        message: "Template not found.",
      });
    }
  }

  if (input.templateVersionId) {
    const templateVersion = await getTemplateVersionById(db, input.templateVersionId);

    if (!templateVersion) {
      return fail(404, {
        code: "TEMPLATE_VERSION_NOT_FOUND",
        message: "Template version not found.",
      });
    }

    if (input.templateId && templateVersion.templateId !== input.templateId) {
      return fail(400, {
        code: "TEMPLATE_VERSION_MISMATCH",
        message: "Template version does not belong to the provided template.",
      });
    }

    const ownershipTemplateId = input.templateId ?? templateVersion.templateId;
    const ownershipTemplate = await getTemplateById(db, user.id, ownershipTemplateId);

    if (!ownershipTemplate) {
      return fail(404, {
        code: "TEMPLATE_NOT_FOUND",
        message: "Template not found.",
      });
    }
  }

  const sentAt = new Date();
  const sentAtIso = sentAt.toISOString();
  const reminderDueAtIso = addDaysIso(sentAt, input.followupInDays);

  await createOutreachLog(db, {
    id: nanoid(),
    userId: user.id,
    professorId: professor.id,
    templateId: input.templateId ?? null,
    templateVersionId: input.templateVersionId ?? null,
    actionType: "sent",
    subjectFinal: input.subjectFinal,
    bodyFinal: input.bodyFinal,
    sentAt: sentAtIso,
    metaJson: JSON.stringify({
      followupInDays: input.followupInDays,
    }),
  });

  const updatedProfessor = await updateProfessor(db, user.id, professor.id, {
    status: PROFESSOR_STATUSES.SENT,
    lastContactAt: sentAtIso,
  });

  const reminder = await createReminder(db, {
    id: nanoid(),
    userId: user.id,
    professorId: professor.id,
    type: "followup",
    dueAt: reminderDueAtIso,
    status: "pending",
    payloadJson: JSON.stringify({
      professorName: professor.professorName,
      professorEmail: professor.email,
      outreachSubject: input.subjectFinal,
    }),
  });

  return ok({
    sentAt: sentAtIso,
    professor: updatedProfessor,
    reminder,
  });
});

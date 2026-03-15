import { nanoid } from "nanoid";
import { z } from "zod";
import { getProfileByUserId } from "~/server/db/repositories/auth";
import { createOutreachLog } from "~/server/db/repositories/outreach";
import { getProfessorById } from "~/server/db/repositories/professors";
import {
  getLatestTemplateVersion,
  getTemplateById,
} from "~/server/db/repositories/templates";
import {
  interpolateTemplate,
  type TemplateInterpolationContext,
} from "~/server/utils/templateInterpolation";
import { fail, ok, withErrorHandling } from "~/server/utils/response";
import { requireUser } from "~/server/utils/requireUser";

const generateSchema = z.object({
  professorId: z.string().trim().min(1),
}).strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const templateId = getRouterParam(event, "id");

  if (!templateId) {
    return fail(400, {
      code: "BAD_REQUEST",
      message: "Template id is required.",
    });
  }

  const template = await getTemplateById(db, user.id, templateId);

  if (!template) {
    return fail(404, {
      code: "TEMPLATE_NOT_FOUND",
      message: "Template not found.",
    });
  }

  const body = await readBody(event);
  const input = generateSchema.parse(body);

  const professor = await getProfessorById(db, user.id, input.professorId);

  if (!professor) {
    return fail(404, {
      code: "PROFESSOR_NOT_FOUND",
      message: "Professor not found.",
    });
  }

  const profile = await getProfileByUserId(db, user.id);

  const context: TemplateInterpolationContext = {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    profile: profile
      ? {
          fullName: profile.fullName,
          degreeTarget: profile.degreeTarget,
          researchInterests: profile.researchInterests,
          preferredCountries: profile.preferredCountries,
          signatureBlock: profile.signatureBlock,
          cvFileUrl: profile.cvFileUrl,
        }
      : undefined,
    professor: {
      id: professor.id,
      professorName: professor.professorName,
      email: professor.email,
      universityName: professor.universityName,
      department: professor.department,
      country: professor.country,
      researchArea: professor.researchArea,
      status: professor.status,
    },
  };

  const rendered = interpolateTemplate(
    {
      subject: template.subject,
      body: template.body,
    },
    context,
  );

  if (rendered.unsupportedVariables.length > 0) {
    return fail(422, {
      code: "TEMPLATE_UNSUPPORTED_VARIABLES",
      message: "Template contains unsupported placeholders.",
      details: {
        unsupportedVariables: rendered.unsupportedVariables,
      },
    });
  }

  const latestVersion = await getLatestTemplateVersion(db, template.id);

  await createOutreachLog(db, {
    id: nanoid(),
    userId: user.id,
    professorId: professor.id,
    templateId: template.id,
    templateVersionId: latestVersion?.id ?? null,
    actionType: "generated",
    subjectFinal: rendered.subjectFinal,
    bodyFinal: rendered.bodyFinal,
    metaJson: JSON.stringify({
      missingVariables: rendered.missingVariables,
      resolvedVariables: rendered.resolvedVariables,
    }),
  });

  return ok({
    templateId: template.id,
    professorId: professor.id,
    templateVersionId: latestVersion?.id ?? null,
    subjectFinal: rendered.subjectFinal,
    bodyFinal: rendered.bodyFinal,
    missingVariables: rendered.missingVariables,
    resolvedVariables: rendered.resolvedVariables,
  });
});

import { nanoid } from "nanoid";
import { z } from "zod";
import {
  getTemplateById,
  getTemplateByName,
  updateTemplate,
} from "~/server/db/repositories/templates";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const updateTemplateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    subject: z.string().trim().min(1).max(300),
    body: z.string().trim().min(1).max(10000),
    isDefault: z.boolean().optional(),
  })
  .strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "templates-update-user",
    maxRequests: 50,
    windowMs: 60_000,
    key: user.id,
  });

  const templateId = getRouterParam(event, "id");

  if (!templateId) {
    return fail(400, {
      code: "BAD_REQUEST",
      message: "Template id is required.",
    });
  }

  const existing = await getTemplateById(db, user.id, templateId);

  if (!existing) {
    return fail(404, {
      code: "TEMPLATE_NOT_FOUND",
      message: "Template not found.",
    });
  }

  const body = await readBody(event);
  const input = updateTemplateSchema.parse(body);

  const nameConflict = await getTemplateByName(
    db,
    user.id,
    input.name,
    templateId,
  );

  if (nameConflict) {
    return fail(409, {
      code: "TEMPLATE_NAME_EXISTS",
      message: "A template with this name already exists.",
    });
  }

  const updated = await updateTemplate(
    db,
    user.id,
    templateId,
    {
      name: input.name,
      subject: input.subject,
      body: input.body,
      isDefault: input.isDefault ?? existing.isDefault,
    },
    nanoid(),
  );

  return ok(updated);
});

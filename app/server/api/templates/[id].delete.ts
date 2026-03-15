import {
  getTemplateById,
  softDeleteTemplate,
} from "~/server/db/repositories/templates";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
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

  await softDeleteTemplate(db, user.id, templateId);

  return ok({ success: true });
});

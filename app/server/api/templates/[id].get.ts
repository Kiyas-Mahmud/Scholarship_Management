import {
  getTemplateById,
  getTemplateVersions,
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

  const template = await getTemplateById(db, user.id, templateId);

  if (!template) {
    return fail(404, {
      code: "TEMPLATE_NOT_FOUND",
      message: "Template not found.",
    });
  }

  const versions = await getTemplateVersions(db, templateId);

  return ok({
    ...template,
    versions,
  });
});

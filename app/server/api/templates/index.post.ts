import { nanoid } from "nanoid";
import { z } from "zod";
import {
  countActiveTemplatesByUser,
  createTemplate,
  getTemplateByName,
} from "~/server/db/repositories/templates";
import { getEntitlements, guardUsageLimit } from "~/server/utils/entitlements";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(10000),
  isDefault: z.boolean().optional(),
}).strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const body = await readBody(event);
  const input = createTemplateSchema.parse(body);

  const entitlements = await getEntitlements(db, user.id);
  const activeCount = await countActiveTemplatesByUser(db, user.id);

  guardUsageLimit(activeCount, entitlements.limits.maxTemplates, {
    resource: "templates",
    code: "TEMPLATE_LIMIT_REACHED",
    message: "You have reached your template limit for the current plan.",
  });

  const existing = await getTemplateByName(db, user.id, input.name);

  if (existing) {
    return fail(409, {
      code: "TEMPLATE_NAME_EXISTS",
      message: "A template with this name already exists.",
    });
  }

  const created = await createTemplate(
    db,
    {
      id: nanoid(),
      userId: user.id,
      name: input.name,
      subject: input.subject,
      body: input.body,
      isDefault: input.isDefault ?? false,
    },
    nanoid(),
  );

  return ok(created);
});

import { nanoid } from "nanoid";
import { z } from "zod";
import {
  createTemplate,
  getTemplateByName,
} from "~/server/db/repositories/templates";
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

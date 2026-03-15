import { z } from "zod";
import {
  attachOrDetachTags,
  getProfessorById,
  listProfessorTagNames,
} from "~/server/db/repositories/professors";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const tagNameSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, {
    message: "Tag name is required.",
  })
  .refine((value) => value.length <= 64, {
    message: "Tag name must be 64 characters or less.",
  });

const tagsSchema = z
  .object({
    add: z.array(tagNameSchema).default([]),
    remove: z.array(tagNameSchema).default([]),
  })
  .strict();

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
  const input = tagsSchema.parse(body ?? {});

  await attachOrDetachTags(db, user.id, professorId, input.add, input.remove);
  const tagNames = await listProfessorTagNames(db, professorId);

  return ok({
    professorId,
    tags: tagNames,
  });
});

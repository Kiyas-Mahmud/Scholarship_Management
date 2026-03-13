import { z } from "zod";
import {
  attachOrDetachTags,
  getProfessorById,
  listProfessorTagNames,
} from "~/server/db/repositories/professors";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok } from "~/server/utils/response";

const tagsSchema = z.object({
  add: z.array(z.string().min(1)).default([]),
  remove: z.array(z.string().min(1)).default([]),
});

export default defineEventHandler(async (event) => {
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
  const input = tagsSchema.parse(body);

  await attachOrDetachTags(db, user.id, professorId, input.add, input.remove);
  const tagNames = await listProfessorTagNames(db, professorId);

  return ok({
    professorId,
    tags: tagNames,
  });
});

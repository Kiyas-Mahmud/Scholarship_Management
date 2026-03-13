import {
  getProfessorById,
  listProfessorTagNames,
} from "~/server/db/repositories/professors";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  const { db, user } = await requireUser(event);
  const professorId = getRouterParam(event, "id");

  if (!professorId) {
    return fail(400, {
      code: "BAD_REQUEST",
      message: "Professor id is required.",
    });
  }

  const professor = await getProfessorById(db, user.id, professorId);

  if (!professor) {
    return fail(404, {
      code: "PROFESSOR_NOT_FOUND",
      message: "Professor not found.",
    });
  }

  const tagNames = await listProfessorTagNames(db, professorId);

  return ok({
    ...professor,
    tags: tagNames,
  });
});

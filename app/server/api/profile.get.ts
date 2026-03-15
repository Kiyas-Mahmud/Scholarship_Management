import { getProfileByUserId } from "~/server/db/repositories/auth";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const profile = await getProfileByUserId(db, user.id);

  if (!profile) {
    return fail(404, {
      code: "PROFILE_NOT_FOUND",
      message: "Profile was not found.",
    });
  }

  return ok(profile);
});

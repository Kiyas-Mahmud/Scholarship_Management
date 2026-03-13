import { z } from "zod";
import {
  getProfileByUserId,
  updateProfileByUserId,
} from "~/server/db/repositories/auth";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  degreeTarget: z.enum(["MS", "PhD", "RA"]),
  researchInterests: z.string().max(500).nullable(),
  preferredCountries: z.string().max(500).nullable(),
  signatureBlock: z.string().max(1000).nullable(),
});

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const existing = await getProfileByUserId(db, user.id);

  if (!existing) {
    return fail(404, {
      code: "PROFILE_NOT_FOUND",
      message: "Profile was not found.",
    });
  }

  const body = await readBody(event);
  const input = profileSchema.parse(body);

  const profile = await updateProfileByUserId(db, user.id, input);

  if (!profile) {
    return fail(500, {
      code: "PROFILE_UPDATE_FAILED",
      message: "Profile update failed.",
    });
  }

  return ok(profile);
});

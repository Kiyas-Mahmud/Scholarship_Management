import { z } from "zod";
import {
  getProfileByUserId,
  updateProfileByUserId,
} from "~/server/db/repositories/auth";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const nullableText = (maxLength: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value == null) {
        return null;
      }

      const normalized = value.trim();
      return normalized.length === 0 ? null : normalized;
    })
    .refine((value) => value == null || value.length <= maxLength, {
      message: `Must be ${maxLength} characters or less.`,
    });

const profileSchema = z
  .object({
    fullName: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length >= 2, {
        message: "Full name must be at least 2 characters.",
      })
      .refine((value) => value.length <= 100, {
        message: "Full name must be 100 characters or less.",
      }),
    degreeTarget: z.enum(["MS", "PhD", "RA"]),
    researchInterests: nullableText(500),
    preferredCountries: nullableText(500),
    signatureBlock: nullableText(1000),
  })
  .strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "profile-update-user",
    maxRequests: 20,
    windowMs: 60_000,
    key: user.id,
  });

  const existing = await getProfileByUserId(db, user.id);

  if (!existing) {
    return fail(404, {
      code: "PROFILE_NOT_FOUND",
      message: "Profile was not found.",
    });
  }

  const body = await readBody(event);
  const input = profileSchema.parse(body ?? {});

  const profile = await updateProfileByUserId(db, user.id, input);

  if (!profile) {
    return fail(500, {
      code: "PROFILE_UPDATE_FAILED",
      message: "Profile update failed.",
    });
  }

  return ok(profile);
});

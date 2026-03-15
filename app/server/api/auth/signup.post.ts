import { nanoid } from "nanoid";
import { getDb } from "~/server/db/connection";
import {
  createSession,
  createUserWithProfile,
  findUserByEmail,
} from "~/server/db/repositories/auth";
import {
  createSessionToken,
  getSessionExpiryIso,
  parseSignupBody,
  setSessionCookie,
} from "~/server/utils/auth";
import { hashPassword } from "~/server/utils/password";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const input = await parseSignupBody(event);
  const db = getDb(event);

  if (!db) {
    return fail(500, {
      code: "DB_NOT_CONFIGURED",
      message: "Database binding is not configured.",
    });
  }

  if (await findUserByEmail(db, input.email)) {
    return fail(409, {
      code: "EMAIL_EXISTS",
      message: "An account with this email already exists.",
    });
  }

  const userId = nanoid();
  const passwordHash = await hashPassword(input.password);

  await createUserWithProfile(
    db,
    {
      id: userId,
      email: input.email,
      passwordHash,
      authProvider: "local",
      role: "student",
      isActive: 1,
    },
    {
      userId,
      fullName: input.fullName,
      degreeTarget: "MS",
      researchInterests: null,
      preferredCountries: null,
      signatureBlock: null,
    },
  );

  const token = createSessionToken();
  await createSession(db, token, userId, getSessionExpiryIso());
  setSessionCookie(event, token);

  return ok({
    user: {
      id: userId,
      email: input.email,
      fullName: input.fullName,
    },
  });
});

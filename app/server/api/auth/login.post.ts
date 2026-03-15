import { getDb } from "~/server/db/connection";
import {
  createSession,
  deleteExpiredSessions,
  deleteSessionsByUserId,
  findUserByEmail,
  getProfileByUserId,
} from "~/server/db/repositories/auth";
import {
  createSessionToken,
  getSessionExpiryIso,
  parseLoginBody,
  setSessionCookie,
} from "~/server/utils/auth";
import { verifyPassword } from "~/server/utils/password";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const input = await parseLoginBody(event);
  const db = getDb(event);

  if (!db) {
    return fail(500, {
      code: "DB_NOT_CONFIGURED",
      message: "Database binding is not configured.",
    });
  }

  const user = await findUserByEmail(db, input.email);

  const isValidPassword = user?.passwordHash
    ? await verifyPassword(input.password, user.passwordHash)
    : false;

  if (!user || !isValidPassword) {
    return fail(401, {
      code: "INVALID_CREDENTIALS",
      message: "Email or password is incorrect.",
    });
  }

  await deleteExpiredSessions(db);
  await deleteSessionsByUserId(db, user.id);

  const token = createSessionToken();
  await createSession(db, token, user.id, getSessionExpiryIso());
  setSessionCookie(event, token);

  const profile = await getProfileByUserId(db, user.id);

  return ok({
    user: {
      id: user.id,
      email: user.email,
      fullName: profile?.fullName ?? user.email,
    },
  });
});

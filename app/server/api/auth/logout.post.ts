import { getDb } from "~/server/db/connection";
import { deleteSession } from "~/server/db/repositories/auth";
import { clearSessionCookie, getSessionToken } from "~/server/utils/auth";
import { ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const token = getSessionToken(event);
  const db = getDb(event);

  if (token && db) {
    await deleteSession(db, token);
  }

  clearSessionCookie(event);
  return ok({ success: true });
});

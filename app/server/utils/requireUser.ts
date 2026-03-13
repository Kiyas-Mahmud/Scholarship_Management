import type { H3Event } from "h3";
import { getDb } from "~/server/db/connection";
import { findUserByValidSession } from "~/server/db/repositories/auth";
import { getSessionToken } from "~/server/utils/auth";
import { fail } from "~/server/utils/response";

export const requireUser = async (event: H3Event) => {
  const token = getSessionToken(event);

  if (!token) {
    fail(401, {
      code: "UNAUTHENTICATED",
      message: "Authentication required.",
    });
  }

  const db = getDb(event);

  if (!db) {
    fail(500, {
      code: "DB_NOT_CONFIGURED",
      message: "Database binding is not configured.",
    });
  }

  const dbConn = db as NonNullable<typeof db>;

  const sessionToken = token as string;
  const user = await findUserByValidSession(dbConn, sessionToken);

  if (!user) {
    fail(401, {
      code: "SESSION_INVALID",
      message: "Session is invalid or expired.",
    });
  }

  return {
    token: sessionToken,
    db: dbConn,
    user,
  };
};

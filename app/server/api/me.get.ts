import { getEntitlements } from "~/server/utils/entitlements";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const entitlements = await getEntitlements(db, user.id);

  return ok({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    entitlements,
  });
});

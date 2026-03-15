import { getCurrentSubscription } from "~/server/db/repositories/billing";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const current = await getCurrentSubscription(db, user.id);

  return ok({
    subscription: current?.subscription ?? null,
    plan: current?.plan ?? null,
  });
});

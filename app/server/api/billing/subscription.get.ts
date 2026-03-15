import { getCurrentSubscription } from "~/server/db/repositories/billing";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "billing-subscription-user",
    maxRequests: 120,
    windowMs: 60_000,
    key: user.id,
  });

  const current = await getCurrentSubscription(db, user.id);

  return ok({
    subscription: current?.subscription ?? null,
    plan: current?.plan ?? null,
  });
});

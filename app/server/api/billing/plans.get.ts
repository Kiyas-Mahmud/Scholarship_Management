import { listActivePlans } from "~/server/db/repositories/billing";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "billing-plans-user",
    maxRequests: 120,
    windowMs: 60_000,
    key: user.id,
  });

  const items = await listActivePlans(db);

  return ok({ items });
});

import { listActivePlans } from "~/server/db/repositories/billing";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db } = await requireUser(event);
  const items = await listActivePlans(db);

  return ok({ items });
});

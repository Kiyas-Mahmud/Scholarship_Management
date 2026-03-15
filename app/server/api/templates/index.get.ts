import { listTemplates } from "~/server/db/repositories/templates";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const items = await listTemplates(db, user.id);

  return ok({ items });
});

import {
  getReminderById,
  markReminderDone,
} from "~/server/db/repositories/outreach";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "reminders-done-user",
    maxRequests: 60,
    windowMs: 60_000,
    key: user.id,
  });

  const reminderId = getRouterParam(event, "id");

  if (!reminderId) {
    return fail(400, {
      code: "BAD_REQUEST",
      message: "Reminder id is required.",
    });
  }

  const existing = await getReminderById(db, user.id, reminderId);

  if (!existing) {
    return fail(404, {
      code: "REMINDER_NOT_FOUND",
      message: "Reminder not found.",
    });
  }

  const updated = await markReminderDone(db, user.id, reminderId);

  return ok(updated);
});

import { z } from "zod";
import {
  getReminderById,
  snoozeReminder,
} from "~/server/db/repositories/outreach";
import { enforceRateLimit } from "~/server/utils/rateLimit";
import { requireUser } from "~/server/utils/requireUser";
import { fail, ok, withErrorHandling } from "~/server/utils/response";

const snoozeSchema = z.object({
  snoozedUntil: z.string().datetime(),
}).strict();

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);

  enforceRateLimit(event, {
    bucket: "reminders-snooze-user",
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

  const body = await readBody(event);
  const input = snoozeSchema.parse(body);

  if (new Date(input.snoozedUntil).getTime() <= Date.now()) {
    return fail(400, {
      code: "INVALID_SNOOZE_TIME",
      message: "snoozedUntil must be in the future.",
    });
  }

  const updated = await snoozeReminder(db, user.id, reminderId, input.snoozedUntil);

  return ok(updated);
});

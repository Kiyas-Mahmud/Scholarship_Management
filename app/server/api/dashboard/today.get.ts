import { z } from "zod";
import { getDashboardTodaySummary } from "~/server/db/repositories/outreach";
import { requireUser } from "~/server/utils/requireUser";
import { ok, withErrorHandling } from "~/server/utils/response";

const querySchema = z.object({
  timezoneOffsetMinutes: z.coerce.number().int().min(-840).max(840).default(0),
  tasksLimit: z.coerce.number().int().min(1).max(50).default(10),
}).strict();

const getDayRangeWithOffset = (timezoneOffsetMinutes: number) => {
  const now = new Date();
  const offsetMillis = timezoneOffsetMinutes * 60 * 1000;
  const localNow = new Date(now.getTime() - offsetMillis);

  const localStart = new Date(localNow);
  localStart.setUTCHours(0, 0, 0, 0);

  const localEnd = new Date(localNow);
  localEnd.setUTCHours(23, 59, 59, 999);

  return {
    dayStartIso: new Date(localStart.getTime() + offsetMillis).toISOString(),
    dayEndIso: new Date(localEnd.getTime() + offsetMillis).toISOString(),
  };
};

export default withErrorHandling(async (event) => {
  const { db, user } = await requireUser(event);
  const query = querySchema.parse(getQuery(event));
  const range = getDayRangeWithOffset(query.timezoneOffsetMinutes);

  const summary = await getDashboardTodaySummary(db, user.id, {
    dayStartIso: range.dayStartIso,
    dayEndIso: range.dayEndIso,
    tasksLimit: query.tasksLimit,
  });

  return ok({
    dateRange: range,
    ...summary,
  });
});

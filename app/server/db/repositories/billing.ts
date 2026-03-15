import { and, asc, desc, eq, gte } from "drizzle-orm";
import { plans, subscriptions } from "~/server/db/schema/billing";

type Db = NonNullable<
  ReturnType<typeof import("~/server/db/connection").getDb>
>;

export const listActivePlans = async (db: Db) => {
  return db
    .select()
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(asc(plans.priceBdt), asc(plans.name), asc(plans.billingPeriod));
};

export const getCurrentSubscription = async (db: Db, userId: string) => {
  const nowIso = new Date().toISOString();

  const rows = await db
    .select({
      subscription: subscriptions,
      plan: plans,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(plans.isActive, true),
        gte(subscriptions.endAt, nowIso),
      ),
    )
    .orderBy(desc(subscriptions.endAt), desc(subscriptions.updatedAt))
    .limit(1);

  return rows[0] ?? null;
};

import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const plans = sqliteTable(
  "plans",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    priceBdt: integer("price_bdt").notNull(),
    billingPeriod: text("billing_period").notNull(),
    limitsJson: text("limits_json").notNull(),
    isActive: integer("is_active", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    namePeriodUniqueIdx: index("plans_name_period_idx").on(
      table.name,
      table.billingPeriod,
    ),
    activeIdx: index("plans_active_idx").on(table.isActive),
  }),
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    planId: text("plan_id").notNull(),
    status: text("status").notNull(),
    startAt: text("start_at").notNull(),
    endAt: text("end_at").notNull(),
    cancelledAt: text("cancelled_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("subscriptions_user_idx").on(table.userId),
    statusEndIdx: index("subscriptions_status_end_idx").on(
      table.status,
      table.endAt,
    ),
  }),
);

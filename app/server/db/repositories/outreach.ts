import type { InferInsertModel } from "drizzle-orm";
import { and, asc, desc, eq, gte, lt, lte, sql } from "drizzle-orm";
import { outreachLogs, reminders } from "~/server/db/schema/outreach";

type Db = NonNullable<
  ReturnType<typeof import("~/server/db/connection").getDb>
>;

type NewOutreachLog = InferInsertModel<typeof outreachLogs>;
type NewReminder = InferInsertModel<typeof reminders>;
const nowIso = () => new Date().toISOString();

const getCount = async (db: Db, whereClause: ReturnType<typeof and>) => {
  const rows = await db
    .select({ total: sql<number>`count(*)` })
    .from(reminders)
    .where(whereClause);

  return rows[0]?.total ?? 0;
};

export const createOutreachLog = async (db: Db, input: NewOutreachLog) => {
  await db.insert(outreachLogs).values(input);

  const rows = await db
    .select()
    .from(outreachLogs)
    .where(eq(outreachLogs.id, input.id))
    .limit(1);

  return rows[0] ?? null;
};

export const listOutreachLogs = async (
  db: Db,
  userId: string,
  query: {
    professorId?: string;
    actionType?: string;
    page: number;
    limit: number;
  },
) => {
  const filters = [eq(outreachLogs.userId, userId)];

  if (query.professorId) {
    filters.push(eq(outreachLogs.professorId, query.professorId));
  }

  if (query.actionType) {
    filters.push(eq(outreachLogs.actionType, query.actionType));
  }

  const whereClause = and(...filters);

  const countRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(outreachLogs)
    .where(whereClause);

  const items = await db
    .select()
    .from(outreachLogs)
    .where(whereClause)
    .orderBy(desc(outreachLogs.createdAt), desc(outreachLogs.id))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total: countRows[0]?.total ?? 0,
  };
};

export const createReminder = async (db: Db, input: NewReminder) => {
  await db.insert(reminders).values(input);

  const rows = await db
    .select()
    .from(reminders)
    .where(eq(reminders.id, input.id))
    .limit(1);

  return rows[0] ?? null;
};

export const getReminderById = async (
  db: Db,
  userId: string,
  reminderId: string,
) => {
  const rows = await db
    .select()
    .from(reminders)
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)))
    .limit(1);

  return rows[0] ?? null;
};

export const markReminderDone = async (
  db: Db,
  userId: string,
  reminderId: string,
) => {
  await db
    .update(reminders)
    .set({
      status: "done",
      snoozedUntil: null,
      updatedAt: nowIso(),
    })
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));

  return getReminderById(db, userId, reminderId);
};

export const snoozeReminder = async (
  db: Db,
  userId: string,
  reminderId: string,
  snoozedUntilIso: string,
) => {
  await db
    .update(reminders)
    .set({
      status: "snoozed",
      snoozedUntil: snoozedUntilIso,
      updatedAt: nowIso(),
    })
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));

  return getReminderById(db, userId, reminderId);
};

export const listReminders = async (
  db: Db,
  userId: string,
  query: {
    status?: "pending" | "done" | "snoozed" | "cancelled";
    type?: "followup" | "deadline" | "subscription";
    dueBefore?: string;
    dueAfter?: string;
    page: number;
    limit: number;
  },
) => {
  const filters = [eq(reminders.userId, userId)];

  if (query.status) {
    filters.push(eq(reminders.status, query.status));
  }

  if (query.type) {
    filters.push(eq(reminders.type, query.type));
  }

  if (query.dueBefore) {
    filters.push(lte(reminders.dueAt, query.dueBefore));
  }

  if (query.dueAfter) {
    filters.push(gte(reminders.dueAt, query.dueAfter));
  }

  const whereClause = and(...filters);

  const countRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(reminders)
    .where(whereClause);

  const items = await db
    .select()
    .from(reminders)
    .where(whereClause)
    .orderBy(asc(reminders.dueAt), desc(reminders.createdAt), desc(reminders.id))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total: countRows[0]?.total ?? 0,
  };
};

export const getDashboardTodaySummary = async (
  db: Db,
  userId: string,
  input: {
    dayStartIso: string;
    dayEndIso: string;
    tasksLimit: number;
  },
) => {
  const pendingBase = and(eq(reminders.userId, userId), eq(reminders.status, "pending"));

  const dueTodayCount = await getCount(
    db,
    and(
      pendingBase,
      gte(reminders.dueAt, input.dayStartIso),
      lte(reminders.dueAt, input.dayEndIso),
    ),
  );

  const overdueCount = await getCount(
    db,
    and(pendingBase, lt(reminders.dueAt, input.dayStartIso)),
  );

  const tasks = await db
    .select()
    .from(reminders)
    .where(and(pendingBase, lte(reminders.dueAt, input.dayEndIso)))
    .orderBy(asc(reminders.dueAt), desc(reminders.createdAt), desc(reminders.id))
    .limit(input.tasksLimit);

  const sentRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(outreachLogs)
    .where(
      and(
        eq(outreachLogs.userId, userId),
        eq(outreachLogs.actionType, "sent"),
        gte(outreachLogs.sentAt, input.dayStartIso),
        lte(outreachLogs.sentAt, input.dayEndIso),
      ),
    );

  return {
    counts: {
      dueToday: dueTodayCount,
      overdue: overdueCount,
      sentToday: sentRows[0]?.total ?? 0,
      taskQueueSize: tasks.length,
    },
    tasks,
  };
};

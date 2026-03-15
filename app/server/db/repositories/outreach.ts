import type { InferInsertModel } from "drizzle-orm";
import { and, desc, eq, sql } from "drizzle-orm";
import { outreachLogs } from "~/server/db/schema/outreach";

type Db = NonNullable<
  ReturnType<typeof import("~/server/db/connection").getDb>
>;

type NewOutreachLog = InferInsertModel<typeof outreachLogs>;

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

import type { InferInsertModel } from "drizzle-orm";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { professorTags, professors, tags } from "~/server/db/schema/professors";

type Db = NonNullable<
  ReturnType<typeof import("~/server/db/connection").getDb>
>;

export type NewProfessor = InferInsertModel<typeof professors>;

const nowIso = () => new Date().toISOString();

export const createProfessor = async (db: Db, input: NewProfessor) => {
  await db.insert(professors).values(input);

  const rows = await db
    .select()
    .from(professors)
    .where(eq(professors.id, input.id))
    .limit(1);

  return rows[0] ?? null;
};

export const getProfessorById = async (
  db: Db,
  userId: string,
  professorId: string,
) => {
  const rows = await db
    .select()
    .from(professors)
    .where(
      and(
        eq(professors.id, professorId),
        eq(professors.userId, userId),
        isNull(professors.deletedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};

export const listProfessors = async (
  db: Db,
  userId: string,
  query: {
    status?: string;
    country?: string;
    q?: string;
    sort?: "deadline" | "last_contact";
    page: number;
    limit: number;
  },
) => {
  const filters = [eq(professors.userId, userId), isNull(professors.deletedAt)];

  if (query.status) {
    filters.push(eq(professors.status, query.status));
  }

  if (query.country) {
    filters.push(eq(professors.country, query.country));
  }

  if (query.q) {
    const term = `%${query.q}%`;
    filters.push(
      or(
        like(professors.professorName, term),
        like(professors.email, term),
        like(professors.universityName, term),
      )!,
    );
  }

  const whereClause = and(...filters);

  const countRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(professors)
    .where(whereClause);

  const orderBy =
    query.sort === "deadline"
      ? [
          asc(professors.deadlineAt),
          desc(professors.updatedAt),
          asc(professors.id),
        ]
      : [
          desc(professors.lastContactAt),
          desc(professors.updatedAt),
          asc(professors.id),
        ];

  const rows = await db
    .select()
    .from(professors)
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return {
    items: rows,
    page: query.page,
    limit: query.limit,
    total: countRows[0]?.total ?? 0,
  };
};

export const updateProfessor = async (
  db: Db,
  userId: string,
  professorId: string,
  input: Partial<NewProfessor>,
) => {
  await db
    .update(professors)
    .set({
      ...input,
      updatedAt: nowIso(),
    })
    .where(
      and(
        eq(professors.id, professorId),
        eq(professors.userId, userId),
        isNull(professors.deletedAt),
      ),
    );

  return getProfessorById(db, userId, professorId);
};

export const softDeleteProfessor = async (
  db: Db,
  userId: string,
  professorId: string,
) => {
  await db
    .update(professors)
    .set({
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    })
    .where(
      and(
        eq(professors.id, professorId),
        eq(professors.userId, userId),
        isNull(professors.deletedAt),
      ),
    );
};

export const attachOrDetachTags = async (
  db: Db,
  userId: string,
  professorId: string,
  add: string[],
  remove: string[],
) => {
  const normalize = (values: string[]) =>
    [...new Set(values.map((item) => item.trim().toLowerCase()).filter(Boolean))];

  const removeSet = new Set(normalize(remove));
  const addNames = normalize(add).filter((name) => !removeSet.has(name));

  if (addNames.length > 0) {
    for (const tagName of addNames) {
      const normalized = tagName.trim().toLowerCase();
      if (!normalized) continue;

      const existingTag = await db
        .select()
        .from(tags)
        .where(and(eq(tags.userId, userId), eq(tags.name, normalized)))
        .limit(1);

      const tagId = existingTag[0]?.id ?? crypto.randomUUID();

      if (!existingTag[0]) {
        await db.insert(tags).values({
          id: tagId,
          userId,
          name: normalized,
          createdAt: nowIso(),
        });
      }

      const existingJoin = await db
        .select()
        .from(professorTags)
        .where(
          and(
            eq(professorTags.professorId, professorId),
            eq(professorTags.tagId, tagId),
          ),
        )
        .limit(1);

      if (!existingJoin[0]) {
        await db.insert(professorTags).values({ professorId, tagId });
      }
    }
  }

  if (removeSet.size > 0) {
    const names = [...removeSet];

    if (names.length > 0) {
      const rows = await db
        .select({ id: tags.id })
        .from(tags)
        .where(and(eq(tags.userId, userId), inArray(tags.name, names)));

      for (const row of rows) {
        await db
          .delete(professorTags)
          .where(
            and(
              eq(professorTags.professorId, professorId),
              eq(professorTags.tagId, row.id),
            ),
          );
      }
    }
  }
};

export const listProfessorTagNames = async (db: Db, professorId: string) => {
  const rows = await db
    .select({ name: tags.name })
    .from(professorTags)
    .innerJoin(tags, eq(tags.id, professorTags.tagId))
    .where(eq(professorTags.professorId, professorId))
    .orderBy(asc(tags.name));

  return rows.map((row) => row.name);
};

export const listDeadlineWarnings = async (
  db: Db,
  userId: string,
  query: {
    dueBefore?: string;
    warningDays: number;
    page: number;
    limit: number;
  },
) => {
  const now = new Date();
  const nowIso = now.toISOString();
  const computedDueBefore = new Date(now.getTime());
  computedDueBefore.setUTCDate(computedDueBefore.getUTCDate() + query.warningDays);

  const dueBeforeIso = query.dueBefore ?? computedDueBefore.toISOString();

  const whereClause = and(
    eq(professors.userId, userId),
    isNull(professors.deletedAt),
    gte(professors.deadlineAt, nowIso),
    lte(professors.deadlineAt, dueBeforeIso),
  );

  const countRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(professors)
    .where(whereClause);

  const items = await db
    .select()
    .from(professors)
    .where(whereClause)
    .orderBy(asc(professors.deadlineAt), desc(professors.updatedAt), asc(professors.id))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total: countRows[0]?.total ?? 0,
    dueBefore: dueBeforeIso,
    warningWindowDays: query.warningDays,
  };
};

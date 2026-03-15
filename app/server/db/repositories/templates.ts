import type { InferInsertModel } from "drizzle-orm";
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { templates, templateVersions } from "~/server/db/schema/templates";

type Db = NonNullable<
  ReturnType<typeof import("~/server/db/connection").getDb>
>;

type NewTemplate = InferInsertModel<typeof templates>;
type NewTemplateVersion = InferInsertModel<typeof templateVersions>;

const nowIso = () => new Date().toISOString();

const createVersion = async (
  db: Db,
  input: NewTemplateVersion,
) => {
  await db.insert(templateVersions).values(input);
};

const nextVersionNumber = async (db: Db, templateId: string) => {
  const rows = await db
    .select({ maxVersion: sql<number>`max(${templateVersions.versionNumber})` })
    .from(templateVersions)
    .where(eq(templateVersions.templateId, templateId));

  return (rows[0]?.maxVersion ?? 0) + 1;
};

export const createTemplate = async (
  db: Db,
  input: NewTemplate,
  versionId: string,
) => {
  await db.insert(templates).values(input);

  await createVersion(db, {
    id: versionId,
    templateId: input.id,
    versionNumber: 1,
    subject: input.subject,
    body: input.body,
  });

  const rows = await db
    .select()
    .from(templates)
    .where(eq(templates.id, input.id))
    .limit(1);

  return rows[0] ?? null;
};

export const listTemplates = async (db: Db, userId: string) => {
  return db
    .select()
    .from(templates)
    .where(and(eq(templates.userId, userId), isNull(templates.deletedAt)))
    .orderBy(desc(templates.updatedAt), desc(templates.createdAt));
};

export const getTemplateById = async (
  db: Db,
  userId: string,
  templateId: string,
) => {
  const rows = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, templateId),
        eq(templates.userId, userId),
        isNull(templates.deletedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};

export const getTemplateByName = async (
  db: Db,
  userId: string,
  name: string,
  excludeTemplateId?: string,
) => {
  const filters = [
    eq(templates.userId, userId),
    eq(templates.name, name),
    isNull(templates.deletedAt),
  ];

  if (excludeTemplateId) {
    filters.push(ne(templates.id, excludeTemplateId));
  }

  const rows = await db
    .select()
    .from(templates)
    .where(and(...filters))
    .limit(1);

  return rows[0] ?? null;
};

export const getTemplateVersions = async (db: Db, templateId: string) => {
  return db
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.templateId, templateId))
    .orderBy(desc(templateVersions.versionNumber));
};

export const getLatestTemplateVersion = async (
  db: Db,
  templateId: string,
) => {
  const rows = await db
    .select()
    .from(templateVersions)
    .where(eq(templateVersions.templateId, templateId))
    .orderBy(desc(templateVersions.versionNumber))
    .limit(1);

  return rows[0] ?? null;
};

export const updateTemplate = async (
  db: Db,
  userId: string,
  templateId: string,
  input: Pick<NewTemplate, "name" | "subject" | "body" | "isDefault">,
  versionId: string,
) => {
  const existing = await getTemplateById(db, userId, templateId);

  if (!existing) {
    return null;
  }

  await db
    .update(templates)
    .set({
      name: input.name,
      subject: input.subject,
      body: input.body,
      isDefault: input.isDefault,
      updatedAt: nowIso(),
    })
    .where(and(eq(templates.id, templateId), eq(templates.userId, userId)));

  const hasContentChange =
    existing.subject !== input.subject || existing.body !== input.body;

  if (hasContentChange) {
    const versionNumber = await nextVersionNumber(db, templateId);

    await createVersion(db, {
      id: versionId,
      templateId,
      versionNumber,
      subject: input.subject,
      body: input.body,
    });
  }

  return getTemplateById(db, userId, templateId);
};

export const softDeleteTemplate = async (
  db: Db,
  userId: string,
  templateId: string,
) => {
  const timestamp = nowIso();

  await db
    .update(templates)
    .set({
      deletedAt: timestamp,
      updatedAt: timestamp,
    })
    .where(
      and(
        eq(templates.id, templateId),
        eq(templates.userId, userId),
        isNull(templates.deletedAt),
      ),
    );
};

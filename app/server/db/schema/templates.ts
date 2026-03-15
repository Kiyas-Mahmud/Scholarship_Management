import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const templates = sqliteTable(
  "templates",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    userNameIdx: index("templates_user_name_idx").on(table.userId, table.name),
    userUpdatedIdx: index("templates_user_updated_idx").on(
      table.userId,
      table.updatedAt,
    ),
  }),
);

export const templateVersions = sqliteTable(
  "template_versions",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    templateVersionIdx: index("template_versions_template_version_idx").on(
      table.templateId,
      table.versionNumber,
    ),
  }),
);

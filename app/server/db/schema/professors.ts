import { sql } from "drizzle-orm";
import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const professors = sqliteTable(
  "professors",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    professorName: text("professor_name").notNull(),
    email: text("email").notNull(),
    universityName: text("university_name").notNull(),
    department: text("department"),
    country: text("country"),
    researchArea: text("research_area"),
    status: text("status").notNull().default("draft"),
    lastContactAt: text("last_contact_at"),
    nextFollowupAt: text("next_followup_at"),
    deadlineAt: text("deadline_at"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    userStatusIdx: index("professors_user_status_idx").on(
      table.userId,
      table.status,
    ),
    userDeadlineIdx: index("professors_user_deadline_idx").on(
      table.userId,
      table.deadlineAt,
    ),
    userFollowupIdx: index("professors_user_followup_idx").on(
      table.userId,
      table.nextFollowupAt,
    ),
    userCountryIdx: index("professors_user_country_idx").on(
      table.userId,
      table.country,
    ),
  }),
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    name: text("name").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userNameIdx: index("tags_user_name_idx").on(table.userId, table.name),
  }),
);

export const professorTags = sqliteTable(
  "professor_tags",
  {
    professorId: text("professor_id").notNull(),
    tagId: text("tag_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.professorId, table.tagId] }),
    tagIdx: index("professor_tags_tag_idx").on(table.tagId),
  }),
);

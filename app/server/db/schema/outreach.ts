import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const outreachLogs = sqliteTable(
  "outreach_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    professorId: text("professor_id").notNull(),
    templateId: text("template_id"),
    templateVersionId: text("template_version_id"),
    actionType: text("action_type").notNull(),
    subjectFinal: text("subject_final"),
    bodyFinal: text("body_final"),
    sentAt: text("sent_at"),
    metaJson: text("meta_json"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userCreatedIdx: index("outreach_logs_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
    professorCreatedIdx: index("outreach_logs_professor_created_idx").on(
      table.professorId,
      table.createdAt,
    ),
    userActionIdx: index("outreach_logs_user_action_idx").on(
      table.userId,
      table.actionType,
    ),
  }),
);

export const reminders = sqliteTable(
  "reminders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    professorId: text("professor_id"),
    type: text("type").notNull(),
    dueAt: text("due_at").notNull(),
    status: text("status").notNull().default("pending"),
    snoozedUntil: text("snoozed_until"),
    payloadJson: text("payload_json"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userDueStatusIdx: index("reminders_user_due_status_idx").on(
      table.userId,
      table.dueAt,
      table.status,
    ),
    professorDueIdx: index("reminders_professor_due_idx").on(
      table.professorId,
      table.dueAt,
    ),
  }),
);

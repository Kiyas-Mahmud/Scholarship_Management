import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  authProvider: text("auth_provider").notNull().default("local"),
  role: text("role").notNull().default("student"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at"),
  isActive: integer("is_active").notNull().default(1),
});

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  fullName: text("full_name").notNull(),
  degreeTarget: text("degree_target").notNull().default("MS"),
  researchInterests: text("research_interests"),
  preferredCountries: text("preferred_countries"),
  signatureBlock: text("signature_block"),
  cvFileKey: text("cv_file_key"),
  cvFileUrl: text("cv_file_url"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

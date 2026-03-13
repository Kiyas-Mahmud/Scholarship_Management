# DATABASE_SCHEMA.md
# Scholarship Outreach SaaS — Database Schema (Cloudflare D1 + Drizzle)

This document describes the production database schema for Cloudflare D1 (SQLite) using Drizzle ORM.
Naming conventions:
- Tables: `snake_case`
- Primary keys: `id` (TEXT UUID recommended)
- Timestamps: ISO string or integer epoch (choose one consistently; this spec uses ISO TEXT)
- Soft delete: optional `deleted_at`

> Note: D1 is SQLite. Use indexes carefully and avoid overly complex joins in hot paths.

---

## 1) Core Identity

### `users`
Stores authentication identity.

**Fields**
- `id` TEXT (PK)
- `email` TEXT UNIQUE NOT NULL
- `password_hash` TEXT NULL (NULL if social auth)
- `auth_provider` TEXT NOT NULL DEFAULT 'local'  (e.g., local/google)
- `role` TEXT NOT NULL DEFAULT 'student'         (student/admin)
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL
- `last_login_at` TEXT NULL
- `is_active` INTEGER NOT NULL DEFAULT 1

**Indexes**
- UNIQUE(`email`)
- INDEX(`role`)

---

### `profiles`
User-facing profile for template personalization.

**Fields**
- `user_id` TEXT (PK, FK -> users.id)
- `full_name` TEXT NOT NULL
- `degree_target` TEXT NOT NULL                 (MS/PhD/RA)
- `research_interests` TEXT NULL                (comma-separated or JSON string)
- `preferred_countries` TEXT NULL               (comma-separated or JSON string)
- `signature_block` TEXT NULL
- `cv_file_key` TEXT NULL                       (R2 object key)
- `cv_file_url` TEXT NULL                       (optional, prefer signed URLs)
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

**Indexes**
- INDEX(`degree_target`)

---

## 2) Professor CRM

### `professors`
A professor contact belongs to one user.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `professor_name` TEXT NOT NULL
- `email` TEXT NOT NULL
- `university_name` TEXT NOT NULL
- `department` TEXT NULL
- `country` TEXT NULL
- `research_area` TEXT NULL                     (free text)
- `status` TEXT NOT NULL DEFAULT 'draft'        (draft/sent/replied/followup/interview/accepted/rejected)
- `last_contact_at` TEXT NULL
- `next_followup_at` TEXT NULL
- `deadline_at` TEXT NULL
- `notes` TEXT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL
- `deleted_at` TEXT NULL

**Indexes**
- INDEX(`user_id`, `status`)
- INDEX(`user_id`, `deadline_at`)
- INDEX(`user_id`, `next_followup_at`)
- INDEX(`user_id`, `country`)
- INDEX(`user_id`, `university_name`)
- (Optional) INDEX(`user_id`, `email`)

---

### `tags`
Global or user-scoped tags.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT NULL                           (NULL => global tag)
- `name` TEXT NOT NULL
- `created_at` TEXT NOT NULL

**Indexes**
- UNIQUE(`user_id`, `name`)

---

### `professor_tags`
Many-to-many between professors and tags.

**Fields**
- `professor_id` TEXT (FK -> professors.id) NOT NULL
- `tag_id` TEXT (FK -> tags.id) NOT NULL

**Constraints**
- PRIMARY KEY(`professor_id`, `tag_id`)

**Indexes**
- INDEX(`tag_id`)

---

## 3) Templates & Email Generation

### `templates`
User-defined templates with placeholders.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `name` TEXT NOT NULL
- `subject_template` TEXT NOT NULL
- `body_template` TEXT NOT NULL                 (supports {{variables}})
- `is_default` INTEGER NOT NULL DEFAULT 0
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL
- `deleted_at` TEXT NULL

**Indexes**
- INDEX(`user_id`)
- INDEX(`user_id`, `is_default`)

---

### `template_versions` (recommended)
Preserves history.

**Fields**
- `id` TEXT (PK)
- `template_id` TEXT (FK -> templates.id) NOT NULL
- `subject_template` TEXT NOT NULL
- `body_template` TEXT NOT NULL
- `created_at` TEXT NOT NULL

**Indexes**
- INDEX(`template_id`, `created_at`)

---

## 4) Outreach Tracking (Excel replacement)

### `outreach_logs`
Immutable log of outreach actions and email snapshots.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `professor_id` TEXT (FK -> professors.id) NOT NULL
- `template_id` TEXT NULL                      (FK -> templates.id)
- `template_version_id` TEXT NULL              (FK -> template_versions.id)
- `action_type` TEXT NOT NULL                  (generated/sent/followup_sent/note_added/interview_scheduled)
- `subject_final` TEXT NULL
- `body_final` TEXT NULL                       (snapshot of final email text)
- `sent_at` TEXT NULL
- `meta_json` TEXT NULL                        (JSON string for extra info)
- `created_at` TEXT NOT NULL

**Indexes**
- INDEX(`user_id`, `created_at`)
- INDEX(`professor_id`, `created_at`)
- INDEX(`user_id`, `action_type`)

---

### `reminders`
System tasks like follow-ups and deadlines.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `professor_id` TEXT NULL                     (FK -> professors.id)
- `type` TEXT NOT NULL                         (followup/deadline/subscription)
- `due_at` TEXT NOT NULL
- `status` TEXT NOT NULL DEFAULT 'pending'     (pending/done/snoozed/cancelled)
- `snoozed_until` TEXT NULL
- `payload_json` TEXT NULL                     (JSON string)
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

**Indexes**
- INDEX(`user_id`, `due_at`, `status`)
- INDEX(`professor_id`, `due_at`)

---

### `notifications`
In-app notifications.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `type` TEXT NOT NULL                          (reminder/payment/system)
- `title` TEXT NOT NULL
- `message` TEXT NOT NULL
- `is_read` INTEGER NOT NULL DEFAULT 0
- `created_at` TEXT NOT NULL
- `read_at` TEXT NULL

**Indexes**
- INDEX(`user_id`, `is_read`, `created_at`)

---

## 5) Billing & Subscriptions

### `plans`
Public plan catalog.

**Fields**
- `id` TEXT (PK)
- `name` TEXT NOT NULL                          (Free/Pro/Premium)
- `price_bdt` INTEGER NOT NULL                   (0 for Free)
- `billing_period` TEXT NOT NULL                 (monthly/yearly)
- `limits_json` TEXT NOT NULL                    (JSON: professor_limit, template_limit, export, analytics, etc.)
- `is_active` INTEGER NOT NULL DEFAULT 1
- `created_at` TEXT NOT NULL

**Indexes**
- UNIQUE(`name`, `billing_period`)
- INDEX(`is_active`)

---

### `subscriptions`
One active subscription per user recommended.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `plan_id` TEXT (FK -> plans.id) NOT NULL
- `status` TEXT NOT NULL                         (trial/active/expired/cancelled)
- `start_at` TEXT NOT NULL
- `end_at` TEXT NOT NULL
- `cancelled_at` TEXT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

**Indexes**
- UNIQUE(`user_id`)  (if enforcing one subscription record; else use partial logic)
- INDEX(`status`, `end_at`)

---

### `payment_intents`
Tracks payment lifecycle before becoming a transaction.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `plan_id` TEXT (FK -> plans.id) NOT NULL
- `provider` TEXT NOT NULL                       (bkash/nagad)
- `amount_bdt` INTEGER NOT NULL
- `status` TEXT NOT NULL                         (initiated/pending/paid/failed/refunded)
- `gateway_session_id` TEXT NULL
- `gateway_ref` TEXT NULL
- `created_at` TEXT NOT NULL
- `updated_at` TEXT NOT NULL

**Indexes**
- INDEX(`user_id`, `status`, `created_at`)
- INDEX(`provider`, `gateway_ref`)

---

### `transactions`
Confirmed payments.

**Fields**
- `id` TEXT (PK)
- `payment_intent_id` TEXT (FK -> payment_intents.id) NOT NULL
- `provider_txn_id` TEXT NOT NULL
- `amount_bdt` INTEGER NOT NULL
- `paid_at` TEXT NOT NULL
- `raw_payload_json` TEXT NULL                    (store masked gateway response)
- `created_at` TEXT NOT NULL

**Indexes**
- UNIQUE(`provider_txn_id`)
- INDEX(`payment_intent_id`)

---

### `invoices`
User billing records.

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT (FK -> users.id) NOT NULL
- `subscription_id` TEXT NULL                     (FK -> subscriptions.id)
- `transaction_id` TEXT NULL                      (FK -> transactions.id)
- `invoice_number` TEXT UNIQUE NOT NULL
- `amount_bdt` INTEGER NOT NULL
- `status` TEXT NOT NULL                          (issued/paid/void)
- `issued_at` TEXT NOT NULL
- `paid_at` TEXT NULL

**Indexes**
- UNIQUE(`invoice_number`)
- INDEX(`user_id`, `issued_at`)

---

## 6) Audit & Operational (recommended)

### `audit_logs`
Security and compliance trace (payments, login, deletes).

**Fields**
- `id` TEXT (PK)
- `user_id` TEXT NULL
- `event` TEXT NOT NULL
- `entity_type` TEXT NULL
- `entity_id` TEXT NULL
- `ip` TEXT NULL
- `user_agent` TEXT NULL
- `meta_json` TEXT NULL
- `created_at` TEXT NOT NULL

**Indexes**
- INDEX(`event`, `created_at`)
- INDEX(`user_id`, `created_at`)

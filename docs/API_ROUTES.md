# API_ROUTES.md
# Scholarship Outreach SaaS — API Routes (Nuxt 3 Server Routes)

Base path: `/api`

All routes should:
- Require auth unless explicitly public
- Validate input (Zod recommended)
- Enforce plan entitlements (feature gating)
- Return consistent JSON shape:
  - `{ ok: true, data: ... }` or `{ ok: false, error: { code, message } }`

---

## 1) Auth & User

### `POST /api/auth/signup`
Creates user + profile shell.

**Body**
- `email`, `password`, `fullName`

**Returns**
- session + user

---

### `POST /api/auth/login`
Email/password login.

---

### `POST /api/auth/logout`
Clears session.

---

### `GET /api/me`
Returns current user + subscription entitlements.

---

### `PUT /api/profile`
Updates profile fields:
- `degreeTarget`, `researchInterests`, `preferredCountries`, `signatureBlock`

---

### `POST /api/profile/cv/upload-url`
Returns signed upload URL (R2) and file key.
- Then client uploads directly to R2
- Client calls `/api/profile/cv/confirm`

---

### `POST /api/profile/cv/confirm`
Stores file key/url in DB.

---

## 2) Professor CRM

### `GET /api/professors`
Query params:
- `status`, `country`, `tag`, `q`, `sort=deadline|last_contact`, `page`, `limit`

---

### `POST /api/professors`
Create professor record.

**Body**
- name, email, universityName, department?, country?, researchArea?, deadlineAt?

---

### `GET /api/professors/:id`
Professor details + tags + last logs.

---

### `PUT /api/professors/:id`
Update fields.

---

### `DELETE /api/professors/:id`
Soft delete.

---

### `POST /api/professors/:id/status`
Updates status and optionally sets follow-up.

**Body**
- `status`
- `nextFollowupAt?`

---

### `POST /api/professors/:id/tags`
Attach/detach tags.

**Body**
- `add?: string[]`, `remove?: string[]`

---

## 3) Templates

### `GET /api/templates`
List user templates.

---

### `POST /api/templates`
Create template.

**Body**
- name, subjectTemplate, bodyTemplate, isDefault?

---

### `PUT /api/templates/:id`
Update template.

---

### `DELETE /api/templates/:id`
Soft delete.

---

### `POST /api/templates/:id/generate`
Generates final email for a specific professor.

**Body**
- `professorId`

**Returns**
- `subjectFinal`, `bodyFinal`, and the resolved variables map

Also writes an `outreach_logs` row with `action_type='generated'` (optional but recommended).

---

## 4) Outreach Logs

### `GET /api/outreach/logs`
Query params:
- `professorId?`, `actionType?`, `page`, `limit`

---

### `POST /api/outreach/mark-sent`
Marks an email as sent and auto-updates tracking.

**Body**
- `professorId`
- `subjectFinal`
- `bodyFinal`
- `templateId?`
- `templateVersionId?`
- `followupInDays?` (default 7)

**Server actions**
- create `outreach_logs` entry (action_type='sent', sent_at=now)
- update professor status -> `sent`
- update professor last_contact_at
- create `reminders` follow-up due date

---

### `POST /api/outreach/add-note`
Adds a note to log (optional separate note log).

**Body**
- `professorId`
- `note`

---

## 5) Reminders & Notifications

### `GET /api/reminders`
Query params:
- `status=pending|done`, `type`, `dueBefore`, `dueAfter`

---

### `POST /api/reminders/:id/done`
Mark reminder done.

---

### `POST /api/reminders/:id/snooze`
**Body**
- `snoozedUntil`

---

### `GET /api/notifications`
List notifications.

---

### `POST /api/notifications/:id/read`
Mark read.

---

## 6) Billing & Subscriptions

### `GET /api/billing/plans`
Public plans.

---

### `GET /api/billing/subscription`
Current subscription + entitlement limits.

---

### `POST /api/billing/intent`
Create payment intent.

**Body**
- `planId`
- `provider` (bkash|nagad)

**Returns**
- checkout/session info to redirect user

---

### `POST /api/billing/callback/bkash`
Gateway callback endpoint (server-to-server).
- Validate signature/token (if available)
- Verify payment with bKash
- Activate subscription
- Create invoice and transaction

---

### `POST /api/billing/callback/nagad`
Same logic for Nagad.

---

### `POST /api/billing/cancel`
Cancels auto-renew notion (if any) or sets `cancelled_at` but keeps access until `end_at`.

---

### `GET /api/billing/invoices`
Invoice history.

---

## 7) Admin (Optional MVP)

### `GET /api/admin/metrics`
Basic platform metrics.

### `GET /api/admin/payments`
Audit payment intents/transactions.

---

## Notes on Entitlements (Feature Gates)

Before executing certain actions, check active plan limits:
- max professors
- max templates
- export enabled
- analytics enabled

Implement a shared helper:
- `getEntitlements(userId)` -> `{ limits, features }`
- Enforce in server routes.

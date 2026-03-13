Phase 0 — Product decisions (1 day)

Define 3 plans (Free / Pro / Premium)

Decide limits: max professors, max templates, export yes/no, analytics yes/no

Define pipeline statuses

Draft, Sent, Replied, Follow-up Needed, Interview, Accepted, Rejected

Define MVP promise

“Write once templates + auto tracking + reminders + deadlines”

Deliverable: short Notion/Doc spec.

Phase 1 — Project setup (Day 1–2)

Create repo structure

/app (Nuxt)

/server (api)

/docs (your .md files)

Setup Nuxt 3 with Cloudflare preset (Pages/Workers)

Setup Drizzle ORM + D1 binding

Add environment setup

local dev + staging + production env variables

Add basic UI system

Tailwind or UI library, layout, sidebar, auth pages

Deliverable: App boots + connects to D1.

Phase 2 — Database + Auth (Day 3–6)

Implement Drizzle schema + migrations for:

users, profiles, subscriptions, plans

Build auth endpoints:

signup, login, logout, me

Build session handling (secure cookies)

Build profile page:

full name, degree target, interests, signature

Create middleware:

protect /dashboard routes

Deliverable: Users can register/login + update profile.

Phase 3 — Professor CRM (Week 2)

Tables + API:

professors, tags, professor_tags

UI:

add professor form

list view + search + filters

Professor detail page:

notes, deadline, country, tags

Status pipeline UI:

change status with one click

Deliverable: Full CRM works without templates.

Phase 4 — Template Engine (Week 3)

Tables + API:

templates + template_versions

Template editor UI:

subject + body

show available variables list (buttons to insert)

“Generate Email” endpoint:

combine profile + professor → final subject/body

Copy + Open Gmail button (mailto or copy)

Save “generated” log entry (optional but good)

Deliverable: Students generate personalized emails fast.

Phase 5 — Outreach Logging + Auto Tracking (Week 4)

Table + API:

outreach_logs

Implement “Mark as Sent”

saves sent timestamp

updates professor status to Sent

sets last_contact_at

auto creates follow-up reminder in 7 days

UI:

a “Mark Sent” button on generated email view

outreach history timeline on professor profile

Deliverable: No more Excel. Tracking becomes automatic.

Phase 6 — Reminders + Notifications (Week 5)

Tables + API:

reminders, notifications

UI:

“Today’s tasks” widget

reminders page + mark done/snooze

Cron triggers:

every hour: create notifications for due reminders

daily: deadline warnings (7/3/1 days)

Deliverable: App feels like an assistant.

Phase 7 — Billing system + Feature gating (Week 6)

Tables:

plans, subscriptions, payment_intents, transactions, invoices

Build entitlements checker:

getEntitlements(userId) returns allowed limits

Enforce limits:

professor limit, template limit

Billing UI:

pricing page, upgrade button, invoice history

Deliverable: Pro features locked + upgrade flow ready.

Phase 8 — bKash + Nagad integration (Week 7)

Do bKash first, then Nagad.

Create payment adapter layer:

BkashAdapter, NagadAdapter

Payment intent creation route:

creates intent in DB

starts checkout session

Callback endpoints:

verify server-to-server

set payment_intent paid

create transaction + invoice

activate subscription

Test sandbox thoroughly:

success, fail, callback replay (idempotency)

Deliverable: Students can pay and instantly unlock Pro.

Phase 9 — Production hardening (Week 8)

Security:

Cloudflare WAF + rate limits (auth + billing)

validation everywhere (Zod)

audit_logs for billing/auth

Performance:

indexes on key queries

caching entitlements in KV/Redis (optional)

UX polish:

onboarding checklist

empty states

export CSV

Deployment:

staging env

production env

backups plan

Deliverable: Launch-ready.

Phase 10 — Post-launch growth features (After MVP)

Pick based on user demand:

Gmail sync + auto reply detection

AI summarization of replies

Professor discovery search

Collaboration (mentor reviewing)
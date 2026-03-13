# Execution Tracker

Last updated: 2026-03-13

## Current Status Summary

- Project bootstrap is complete and runnable.
- Core auth and profile APIs are implemented and smoke-tested.
- UI shell and auth pages exist.
- Database and business features are still at early stage (only users/profiles schema file exists).

## What We Completed

### Phase 1 - Foundation and Setup (Mostly Done)

- [x] Nuxt 3 app initialized in app workspace.
- [x] Cloudflare-oriented Nuxt/Nitro config added.
- [x] Tailwind module configured.
- [x] Base component-based UI shell created:
  - layout
  - header
  - sidebar
  - base button
- [x] Route middleware for auth redirection created.
- [x] Drizzle config created.
- [x] Initial schema file for users/profiles created.
- [x] Scripts available for typecheck/build/migrations.
- [x] App runtime verified with successful dev start and production build.

### Phase 2 - Auth and Profile (MVP Baseline Done)

- [x] POST /api/auth/signup
- [x] POST /api/auth/login
- [x] POST /api/auth/logout
- [x] GET /api/me
- [x] GET /api/profile
- [x] PUT /api/profile
- [x] Cookie session utility and auth parsing helpers
- [x] API smoke tests run end-to-end:
  - signup -> me -> profile get/put -> logout -> unauthorized me
  - signup -> logout -> login -> me

### UI Baseline (Done)

- [x] Auth pages:
  - /auth/login
  - /auth/signup
- [x] Basic dashboard page
- [x] Default layout integration

## What Is Still Left

### Phase 1 Remaining (Small)

- [ ] Replace starter README with project-specific setup and architecture notes.
- [ ] Add eslint/prettier config files if missing and enforce in CI.
- [ ] Create wrangler config and environment documentation for local/staging/prod.

### Phase 2 Hardening (Important)

- [ ] Replace in-memory demo store with D1-backed persistence.
- [ ] Add password hashing (argon2/bcrypt) and never store raw passwords.
- [ ] Add robust session storage/revocation strategy.
- [ ] Standardize auth error handling and validation boundaries.

### Phase 3 - Professor CRM (Not Started)

- [ ] Database schema files for professors/tags/professor_tags.
- [ ] API endpoints:
  - GET /api/professors
  - POST /api/professors
  - GET /api/professors/:id
  - PUT /api/professors/:id
  - DELETE /api/professors/:id
  - POST /api/professors/:id/status
  - POST /api/professors/:id/tags
- [ ] Component-based CRM UI:
  - list
  - filters
  - form
  - details
  - status actions

### Phase 4 - Templates (Not Started)

- [ ] templates and template_versions schema.
- [ ] Template CRUD and generate endpoint.
- [ ] Variable resolver and parser utility.
- [ ] Template editor components and generation flow in UI.

### Phase 5 - Outreach Tracking (Not Started)

- [ ] outreach_logs and reminders schema.
- [ ] mark-sent automation endpoint.
- [ ] Outreach timeline UI.

### Phase 6 - Reminders and Notifications (Not Started)

- [ ] reminders and notifications APIs.
- [ ] Cron handlers and schedules.
- [ ] Notification UI and reminders dashboard widgets.

### Phase 7-9 - Billing, Payments, Storage (Not Started)

- [ ] plans/subscriptions/payment schema + APIs.
- [ ] Feature gating and entitlements.
- [ ] bKash and Nagad integrations with callback idempotency.
- [ ] R2 CV upload/download and export.

### Phase 10+ - Hardening and Launch (Not Started)

- [ ] Security hardening (rate limits, headers, WAF patterns, audit logs).
- [ ] Observability and health checks.
- [ ] Integration/E2E tests.
- [ ] Staging/production release workflow.

## Proper Plan From Here (Step-by-Step)

### Sprint A (Next 3 Working Days)

1. Move auth/profile from in-memory storage to D1:
   - implement db connection utility
   - wire users/profiles repository functions
   - hash passwords
   - verify auth/profile smoke tests
2. Complete schema coverage for CRM tables.
3. Add professor CRUD APIs with strict user ownership checks.

### Sprint B (Following 3 Working Days)

1. Build professor component set:
   - ProfessorList
   - ProfessorFilters
   - ProfessorForm
   - ProfessorDetails
2. Add search/filter/sort/pagination.
3. Add tags attach/detach flows.

### Sprint C (Following 4 Working Days)

1. Implement templates + generation API.
2. Build template editor components.
3. Implement mark-sent and reminder creation.
4. Add outreach timeline.

## Current Risks

- In-memory auth store is not production-safe and will lose data on restart.
- Raw-password comparison is temporary and must be replaced immediately with hashing.
- Most documented MVP modules are still pending, so this is foundation stage.

## Daily Tracking Format (Use This)

For each day, append:

- Date:
- Done:
- In progress:
- Blockers:
- Next day target:

Example:

- Date: 2026-03-14
- Done: D1 user/profile repositories + password hash integration
- In progress: Auth route refactor to DB service layer
- Blockers: none
- Next day target: Professor schema + GET/POST /api/professors

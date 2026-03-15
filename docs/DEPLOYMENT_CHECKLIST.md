# DEPLOYMENT_CHECKLIST.md
# Scholarship Outreach SaaS - Deployment Checklist

Use this checklist for both staging and production deployments.
Mark each item as completed during rollout.

---

## 1) Pre-Deploy (T-1 to T-0)

- [ ] Confirm target environment (`staging` or `prod`).
- [ ] Confirm latest code is merged to deployment branch.
- [ ] Confirm no unresolved incidents are open for this release.
- [ ] Confirm `app/drizzle/migrations` includes all required migration files.
- [ ] Confirm migration history is linear and committed.

### Environment and Binding Verification

- [ ] Cloudflare Pages project exists for target environment.
- [ ] D1 binding `DB` is configured in Pages for target environment.
- [ ] D1 database points to the correct environment database.
- [ ] R2 bucket binding is configured (if file flow is enabled).
- [ ] Cron triggers are configured for reminders and expiry jobs.

### Secret and Config Verification

- [ ] `APP_ENV` is set (`staging` or `production`).
- [ ] `APP_BASE_URL` matches target domain.
- [ ] `SESSION_SECRET` is set and strong.
- [ ] `COOKIE_SECURE=true` for production.
- [ ] Payment gateway secrets are present for target environment.
- [ ] Email provider settings are present if reminders by email are enabled.

---

## 2) Build and Test Gate

Run from `app/`:

```bash
npm ci
npm run typecheck
npm run build
npm run test:smoke:api
npm run test:regression:auth
npm run test:regression:status
```

- [ ] Typecheck passes.
- [ ] Build passes.
- [ ] Smoke API test passes.
- [ ] Auth regression test passes.
- [ ] Status transition regression test passes.

---

## 3) Database Migration Gate

From `app/`:

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

- [ ] Local migration passes.
- [ ] Remote migration passes.
- [ ] No manual SQL edits were needed.

---

## 4) Deploy Gate

- [ ] Trigger Cloudflare Pages deployment from the correct branch.
- [ ] Confirm deployment build logs are clean.
- [ ] Confirm deployment is marked successful.

---

## 5) Post-Deploy Smoke Checks

### Public/Auth
- [ ] Login works.
- [ ] Signup works.
- [ ] Session cookie is issued and secured.

### Core Product
- [ ] Professor creation works.
- [ ] Template creation works.
- [ ] Template generation works.
- [ ] Mark-as-sent writes outreach log and creates reminder.
- [ ] Dashboard today data loads.

### Billing Skeleton
- [ ] `/api/billing/plans` returns plans.
- [ ] `/api/billing/subscription` returns current state.
- [ ] Dashboard billing preview loads without client error.

### Security
- [ ] Rate limit can be observed on auth endpoints under rapid repeat calls.
- [ ] Rate limit can be observed on core mutation endpoints under rapid repeat calls.
- [ ] API failures return normalized `{ ok: false, error: ... }` responses.

---

## 6) Release Confirmation

- [ ] Deployment checklist completed and signed by operator.
- [ ] Product owner confirms acceptance checks.
- [ ] Release notes and rollout timestamp recorded.

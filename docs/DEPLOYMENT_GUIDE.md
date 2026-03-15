# DEPLOYMENT_GUIDE.md
# Scholarship Outreach SaaS — Deployment Guide (Cloudflare + Nuxt 3 + D1 + R2)

This guide describes a production deployment using Cloudflare Pages (Nuxt 3) with:
- Cloudflare D1 database
- Cloudflare R2 object storage
- Cron Triggers for reminders
- Environment secrets for gateway keys

---

## 1) Prerequisites

- Cloudflare account
- Wrangler CLI installed
- A GitHub repository connected to Cloudflare Pages
- bKash/Nagad merchant credentials (for production)
- An email provider (SMTP/Mailgun/SendGrid) for reminder emails (optional)

---

## 2) Create Cloudflare D1 Database

1. Create a D1 DB:
   - Name: `scholarship_outreach_prod`

2. Apply migrations:
   - Use Drizzle migrations (recommended)
   - Ensure schema matches `DATABASE_SCHEMA.md`

**Production notes**
- Keep a migration history in `./drizzle/migrations`
- Run migrations during CI/CD or via Wrangler command steps

---

## 3) Create Cloudflare R2 Bucket

1. Create bucket:
   - `scholarship-outreach-files-prod`

2. Set bucket to private.
3. Use signed URLs for upload and download.

Store only:
- CV PDFs
- exported CSVs
- (optional) attachments

---

## 4) Configure Nuxt for Cloudflare

- Use Nuxt 3 with Nitro preset for Cloudflare:
  - Deploy via Cloudflare Pages

**Key settings**
- Ensure `server/api/*` routes are used for backend endpoints
- Store secrets in Cloudflare Pages environment variables (never in repo)

---

## 5) Environment Variables (Production)

Set these in Cloudflare Pages project settings:

### App
- `APP_ENV=production`
- `APP_BASE_URL=https://your-domain.com`

### Database
- D1 binding configured in Pages settings (recommended)
- Or provide binding name, e.g. `DB_BINDING=D1_DB`

### R2
- `R2_BUCKET_NAME=scholarship-outreach-files-prod`

### Session/Auth
- `SESSION_SECRET=...` (strong random)
- `COOKIE_SECURE=true`

### Email (Optional)
- `SMTP_HOST=...`
- `SMTP_PORT=...`
- `SMTP_USER=...`
- `SMTP_PASS=...`
- `MAIL_FROM=no-reply@your-domain.com`

### Payments
- bKash:
  - `BKASH_APP_KEY=...`
  - `BKASH_APP_SECRET=...`
  - `BKASH_USERNAME=...`
  - `BKASH_PASSWORD=...`
  - `BKASH_CALLBACK_URL=https://your-domain.com/api/billing/callback/bkash`

- Nagad:
  - `NAGAD_MERCHANT_ID=...`
  - `NAGAD_MERCHANT_PRIVATE_KEY=...`
  - `NAGAD_CALLBACK_URL=https://your-domain.com/api/billing/callback/nagad`

### Pre-Deploy Verification Command

Run this from `app/` before production deployment:

```bash
npm run verify:env:production
```

This command validates:
- required runtime environment variables
- `APP_ENV` target consistency
- minimum session secret strength in production
- D1 binding configuration in `wrangler.toml`

---

## 6) Configure Cron Triggers (Reminders)

Create cron jobs (Cloudflare Workers Cron Triggers) for scheduled tasks.

Recommended schedules:

### Follow-up reminders (hourly)
- Every hour:
  - fetch reminders due in next 1 hour
  - create notifications
  - optionally send email reminders

### Deadline alerts (daily)
- Once daily:
  - check deadlines in 7/3/1 days
  - notify users

### Subscription expiry (daily)
- Once daily:
  - expire subscriptions past end date
  - downgrade entitlements

---

## 7) Observability (Production)

Minimum recommended:
- Log structured JSON in server routes
- Create an `audit_logs` entry for payment and auth events
- Track errors and timeouts:
  - request id
  - user id (if known)
  - route name
  - gateway responses masked

---

## 8) Security Checklist

- Enforce HTTPS-only cookies
- Rate limit:
  - `/api/auth/*`
  - `/api/billing/*`
- Validate all request bodies (Zod recommended)
- Verify payment callbacks server-to-server
- Use idempotency:
  - callback repeated should not double-activate subscription
- Do not store payment secrets in frontend
- Keep R2 private with signed URLs

---

## 9) Release Process (Recommended)

1. Merge to `main`
2. Cloudflare Pages auto builds and deploys
3. Run migrations (automated step)
4. Smoke test:
   - login
   - create professor
   - generate template
   - mark sent
   - verify reminder creation
   - test payment in sandbox

---

## 10) Rollback Strategy

- Keep previous deployments available in Cloudflare Pages
- If DB migration causes issues:
  - have reversible migrations
  - restore from backup (export snapshots if needed)

---

## 11) Environments

- `dev`: local SQLite or D1 dev
- `staging`: separate D1 + R2 bucket
- `prod`: production D1 + R2 bucket

Keep payment gateways in sandbox for staging.

---

## 12) Operator Docs

For release execution details, use:

- `DEPLOYMENT_CHECKLIST.md` for pre-deploy/deploy/post-deploy verification
- `RELEASE_RUNBOOK.md` for release roles, rollback, and hotfix procedures
- `V1_ACCEPTANCE_CHECKLIST.md` for final sign-off and release evidence

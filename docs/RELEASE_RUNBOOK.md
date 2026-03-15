# RELEASE_RUNBOOK.md
# Scholarship Outreach SaaS - Release Runbook

This runbook is the operator procedure for releasing Version 1 safely.

---

## 1) Roles

- Release Operator: executes commands and deployment steps.
- Reviewer: validates checklist and smoke results.
- Approver: signs off production release.

---

## 2) Standard Release Procedure

### Step 1: Prepare

1. Sync latest `version1` and confirm intended commit SHA.
2. Complete [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) sections 1 and 2.
3. Confirm no blocking incidents or unresolved migration issues.

### Step 2: Migrate

From `app/`:

```bash
npm run db:migrate:remote
```

Expected result:
- Migration command exits successfully.
- No pending migration drift.

### Step 3: Deploy

1. Trigger Cloudflare Pages deployment for target branch.
2. Watch build logs until deployment is complete.
3. Record deployment URL and timestamp.

### Step 4: Validate

1. Run [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) post-deploy checks.
2. Confirm health endpoint and critical APIs are responsive.
3. Confirm no spike in error logs for auth, outreach, and billing endpoints.

### Step 5: Approve

1. Reviewer confirms checks are complete.
2. Approver signs off release.
3. Capture sign-off in release notes.

---

## 3) Rollback Runbook

Use rollback if any critical path fails after deployment.

### Trigger Conditions

- Login/signup broken for valid users.
- Professor/template mutation flows fail consistently.
- Migration introduced blocking runtime failures.
- Error rate materially increases and remains elevated.

### Rollback Steps

1. In Cloudflare Pages, redeploy the last known stable deployment.
2. Confirm traffic serves the stable deployment.
3. If issue is data-related, evaluate DB restore plan before applying additional migrations.
4. Run post-rollback smoke checks (login, professor create, template create, mark sent).
5. Record incident details and rollback timestamp.

---

## 4) Hotfix Procedure

1. Create a hotfix branch from `version1`.
2. Keep scope minimal and isolated to the failing behavior.
3. Run full gate checks:
   - `npm run typecheck`
   - `npm run build`
   - relevant smoke/regression scripts
4. Merge hotfix into `version1`.
5. Repeat standard release procedure.

---

## 5) Evidence Log Template

Use this template in release notes or tracker:

- Environment:
- Commit SHA:
- Migration run result:
- Deployment URL:
- Smoke test summary:
- Rate-limit verification summary:
- Reviewer:
- Approver:
- Outcome:

# V1_ACCEPTANCE_CHECKLIST.md
# Version 1 Acceptance Checklist and Sign-Off

Use this document as the final release gate for Version 1.
All required sections must be completed before promoting `version1` to `main`.

---

## 1) Release Identity

- Release version: 
- Candidate commit SHA:
- Target environment:
- Release date:
- Release operator:
- Reviewer:
- Product approver:

---

## 2) Functional Acceptance

### Auth and Profile
- [ ] Signup succeeds with valid payload.
- [ ] Login succeeds and session cookie is set.
- [ ] Invalid login returns normalized error response.
- [ ] Profile read and update both succeed.

### Professor CRM
- [ ] Professor create/list/get/update/delete succeeds for owner.
- [ ] Status transitions enforce allowed transitions.
- [ ] Professor tagging and tag retrieval works.
- [ ] User cannot access another user's professor records.

### Templates and Outreach
- [ ] Template create/list/get/update/delete succeeds.
- [ ] Template generation interpolates supported variables.
- [ ] Mark-as-sent writes outreach log.
- [ ] Mark-as-sent creates follow-up reminder.

### Reminders and Dashboard
- [ ] Due reminders endpoint returns expected items.
- [ ] Reminder done action updates state.
- [ ] Reminder snooze action updates due date.
- [ ] Deadline warnings endpoint returns expected records.
- [ ] Dashboard today endpoint returns summary and task data.

### Billing Skeleton
- [ ] Plans endpoint returns active plans.
- [ ] Subscription endpoint returns current user state.
- [ ] Entitlement payload is visible in `/api/me`.
- [ ] Usage limits are enforced on professor/template creation.
- [ ] Dashboard billing preview loads correctly.

---

## 3) Security and Stability Acceptance

- [ ] Sensitive endpoints enforce baseline rate limits.
- [ ] Validation failures return normalized `VALIDATION_ERROR` payload.
- [ ] Unauthorized access returns normalized 401 payload.
- [ ] No unhandled 500 errors observed in smoke run.
- [ ] Typecheck passes.
- [ ] Production build passes.

---

## 4) Deployment and Environment Acceptance

- [ ] `npm run verify:env:production` passes.
- [ ] D1 binding `DB` verified for target environment.
- [ ] Migration command executed successfully.
- [ ] Deployment checklist in `DEPLOYMENT_CHECKLIST.md` completed.
- [ ] Runbook steps in `RELEASE_RUNBOOK.md` executed and recorded.

---

## 5) Residual Risks and Monitoring Focus

Capture any known risk that is accepted for V1:

- Risk 1:
  - Mitigation:
  - Owner:

- Risk 2:
  - Mitigation:
  - Owner:

Post-release watch metrics:
- auth failure rate
- 429 rate-limit responses
- 5xx error rate
- D1 query error count
- reminder processing backlog

---

## 6) Final Sign-Off

By signing below, the release stakeholders confirm V1 is ready for production promotion.

- Release Operator:
  - Name:
  - Date:
  - Signature:

- Reviewer:
  - Name:
  - Date:
  - Signature:

- Product Approver:
  - Name:
  - Date:
  - Signature:

- Decision:
  - [ ] Approved for merge `version1` -> `main`
  - [ ] Rejected (follow-up required)

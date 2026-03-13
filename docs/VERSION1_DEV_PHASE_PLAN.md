# VERSION1_DEV_PHASE_PLAN.md

## Goal

Use `version1` as the main development baseline for the Version 1 release.
All feature work will be done in short-lived sub-branches and merged back to `version1` through PRs.

## Branch Strategy

- `main`: stable/public branch
- `version1`: active V1 integration branch
- `v1/task-xx-<short-name>`: sub-branches for each small task

## Merge Rules

1. Create a sub-branch from `version1`.
2. Complete one task only.
3. Run checks before push:
   - `npm run typecheck`
   - `npm run build`
4. Push sub-branch and open PR into `version1`.
5. Merge only after checks pass.
6. When all V1 phases are complete and validated, merge `version1` into `main`.

## V1 Development Phases (Small Tasks)

### Phase A: Foundation Hardening

- A1: Finalize D1 and migration workflow
- A2: Add env validation and configuration guardrails (completed)
- A3: Add error response normalization for API routes (completed)
- A4: Add basic API smoke test script (completed)

### Phase B: Auth and Profile Stabilization

- B1: Signup/login validation hardening (completed)
- B2: Session lifecycle improvements (expiry and cleanup) (completed)
- B3: Profile update validation and sanitization (completed)
- B4: Auth regression test checklist

### Phase C: Professor CRM V1

- C1: Professor list filtering and sorting
- C2: Professor detail data consistency checks
- C3: Tag assignment reliability improvements
- C4: Status transition rules and tests

### Phase D: Template and Outreach Core

- D1: Template CRUD base implementation
- D2: Variable interpolation engine
- D3: Outreach log write path
- D4: Mark-as-sent flow with reminder creation

### Phase E: Reminder and Dashboard Essentials

- E1: Due reminder query endpoint
- E2: Dashboard today/tasks widget
- E3: Reminder done/snooze actions
- E4: Deadline warning query logic

### Phase F: Billing Skeleton

- F1: Plans and subscriptions read model
- F2: Entitlement guard middleware
- F3: Usage limit enforcement on core actions
- F4: Billing UI placeholders

### Phase G: Release Readiness

- G1: Security and rate-limit pass
- G2: Deployment checklist and runbook
- G3: Production env and binding verification
- G4: V1 acceptance checklist and sign-off

## First Task Plan (Start Now)

### Task ID

A1 - Finalize D1 and Migration Workflow

### Branch

`v1/task-a1-d1-migration-workflow`

### Scope

- Ensure `wrangler.toml` has correct D1 binding and IDs.
- Ensure migration files are tracked and reproducible.
- Verify local and remote migration scripts.
- Add concise operator steps in docs.

### Implementation Checklist

- [x] Confirm `wrangler.toml` uses binding `DB`
- [x] Confirm `drizzle/migrations` files are committed
- [x] Validate scripts:
  - [x] `npm run db:generate`
  - [x] `npm run db:migrate:local`
  - [x] `npm run db:migrate:remote`
- [x] Update deployment notes for Pages D1 binding
- [x] Run `npm run typecheck`
- [x] Run `npm run build`

### Definition of Done

- Database schema can be applied both locally and remotely without manual SQL edits.
- Pages deployment has clear D1 binding instructions.
- Build and typecheck pass on task branch.

## Working Sequence

1. Create task branch from `version1`.
2. Implement one checklist item group.
3. Run checks.
4. Commit with clear message.
5. Push and open PR to `version1`.
6. Repeat for next task.

## Next Task Plan

### Task ID

B4 - Auth Regression Test Checklist

### Branch

`v1/task-b4-auth-regression-checklist`

### Scope

- Create a repeatable auth regression checklist and execution script.
- Cover signup, login, me, profile update, logout, and invalid-session scenarios.
- Make it easy to run before each PR merge.

### Definition of Done

- Checklist covers all core auth and profile flows.
- Test run output clearly marks pass/fail per step.
- Process is documented in repository docs.
- Typecheck and build pass.

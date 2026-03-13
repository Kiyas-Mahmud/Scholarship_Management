# SECURITY_MODEL.md
# Scholarship Outreach SaaS — Security Model

This document defines the core security principles and controls for the platform.

---

## 1) Threat Model (What we protect against)

- Unauthorized access to user data (professor contacts, outreach history, CVs)
- Credential stuffing and brute-force login attempts
- Payment fraud and fake “payment success” messages from clients
- Data leaks via file storage misconfiguration
- Abuse (bots creating accounts, spamming system)
- Privilege escalation (student -> admin)
- Duplicate payment callbacks causing double activation

---

## 2) Authentication & Sessions

### Session approach
- Use secure, HTTPOnly cookies (recommended)
- `Secure` flag enabled in production
- `SameSite=Lax` (or Strict if feasible)
- Rotate session secret periodically

### Passwords
- Store only salted hashes (argon2/bcrypt)
- Enforce minimum password policy
- Rate limit login endpoints

### Account security
- Optional: email verification (good for production)
- Optional: password reset flow (token + expiry)

---

## 3) Authorization (Access Control)

### Roles
- `student` (default)
- `admin` (restricted)

### Rules
- Every query must filter by `user_id`
- Never return another user’s professor/contact/logs
- Admin routes must be protected at middleware level

---

## 4) Data Validation & Sanitization

- Validate all inputs server-side (Zod recommended)
- Normalize emails (lowercase)
- Prevent stored XSS:
  - sanitize template/body fields if rendering HTML
  - treat stored emails as plain text by default
- Avoid dynamic SQL (Drizzle ORM helps)

---

## 5) Rate Limiting & Abuse Prevention

At Cloudflare Edge (recommended):
- Rate limit `/api/auth/*` (login/signup)
- Rate limit `/api/billing/*` (callbacks & intent creation)
- Add bot protection rules for signup

In application:
- Add per-user limits (plan-based)
- Add IP-based throttle for repeated failures

---

## 6) Payment Security (bKash/Nagad)

### Non-negotiable rules
- Never trust client “payment success”
- Always verify payment server-to-server
- Log masked gateway responses for audit
- Enforce idempotency on callbacks:
  - if same `provider_txn_id` arrives twice, ignore the second

### Callback verification
- Validate any signature/token gateway provides
- Confirm:
  - amount matches intent
  - currency BDT
  - status “paid”
  - merchant id matches
- Only then activate subscription

---

## 7) File Storage Security (R2)

- Bucket must be private
- No public CV links
- Use signed URLs with short expiry for:
  - upload
  - download
- Store only file keys in DB
- Optional: file type restrictions (PDF only)
- Optional: malware scan pipeline (later)

---

## 8) Secrets Management

- Store secrets only in Cloudflare environment variables
- Never expose gateway keys to client
- Mask sensitive fields in logs:
  - tokens
  - secrets
  - gateway credentials

---

## 9) Logging & Audit

### Audit log events (recommended)
- login success/failure
- password reset requested/completed
- payment intent created
- payment verified/failed/refund
- subscription activated/expired
- admin actions (if any)

### Log format
- structured JSON
- include request id
- include user id when authenticated
- avoid storing full payment secrets or raw credentials

---

## 10) Privacy Controls

- Data export (CSV) only for the authenticated user
- Data deletion: soft delete professors, templates; optional “delete account” flow
- CV removal: remove from R2 and clear metadata in DB

---

## 11) Security Testing Checklist

Before production launch:
- Test authorization: ensure user cannot access others’ professor ids
- Test payment callback replay (idempotency)
- Test rate limits (login brute force)
- Test R2 access (no public objects)
- Test input validation (malformed payloads)
- Test session cookie flags in production

---

## 12) Future Hardening (Phase 2)

- 2FA for users
- Content Security Policy (CSP)
- Email domain allowlist for reminders
- Anomaly detection for payment attempts
- Device/session management dashboard

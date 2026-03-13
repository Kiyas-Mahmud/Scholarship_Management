# IMPLEMENTATION_PLAN.md

# Scholarship Outreach Management System — Production-Ready Implementation Plan

## Executive Summary

This document provides a comprehensive, step-by-step implementation plan to build a production-ready, optimized, and fast Scholarship Outreach Management System. The system will be built using **Nuxt 3**, **Cloudflare D1**, **Cloudflare R2**, with integrated payment gateways (bKash/Nagad) targeting Bangladesh market.

**Tech Stack:**

- **Frontend:** Nuxt 3 + Vue 3 + Tailwind CSS
- **Backend:** Nuxt Server Routes (Nitro)
- **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage:** Cloudflare R2
- **Deployment:** Cloudflare Pages
- **Payments:** bKash + Nagad integration
- **Validation:** Zod
- **Security:** Rate limiting, encryption, secure sessions

**Timeline:** 8-10 weeks to production-ready MVP

---

## Phase 1: Foundation & Infrastructure Setup (Days 1-3)

### 1.1 Project Initialization

**Duration:** 4 hours

- [ ] Initialize Git repository with proper `.gitignore`
- [ ] Create project structure:
  ```
  /
  ├── app/                    # Nuxt 3 application
  │   ├── components/
  │   ├── composables/
  │   ├── layouts/
  │   ├── middleware/
  │   ├── pages/
  │   └── utils/
  ├── server/                 # Nuxt server routes
  │   ├── api/
  │   ├── middleware/
  │   ├── utils/
  │   └── db/
  ├── drizzle/               # Database migrations
  │   ├── migrations/
  │   └── schema.ts
  ├── docs/                  # Documentation
  ├── tests/                 # Test suites
  └── public/                # Static assets
  ```
- [ ] Initialize package.json with dependencies
- [ ] Setup ESLint + Prettier for code quality
- [ ] Create README.md with setup instructions

**Deliverable:** Clean project structure ready for development

---

### 1.2 Nuxt 3 Configuration

**Duration:** 4 hours

- [ ] Install Nuxt 3: `npx nuxi@latest init`
- [ ] Configure `nuxt.config.ts`:
  ```typescript
  export default defineNuxtConfig({
    nitro: {
      preset: "cloudflare-pages",
      experimental: {
        database: true,
      },
    },
    modules: ["@nuxtjs/tailwindcss"],
    runtimeConfig: {
      sessionSecret: "",
      database: {},
      r2: {},
      bkash: {},
      nagad: {},
    },
  });
  ```
- [ ] Setup Tailwind CSS with custom theme
- [ ] Create base layout components (Header, Sidebar, Footer)
- [ ] Setup Vue Router configuration
- [ ] Configure auto-imports for composables

**Deliverable:** Nuxt 3 app running locally on `localhost:3000`

---

### 1.3 Cloudflare D1 Database Setup

**Duration:** 6 hours

- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Create D1 database:
  ```bash
  wrangler d1 create scholarship_outreach_dev
  wrangler d1 create scholarship_outreach_prod
  ```
- [ ] Install Drizzle ORM:
  ```bash
  npm install drizzle-orm better-sqlite3
  npm install -D drizzle-kit
  ```
- [ ] Configure `drizzle.config.ts`
- [ ] Setup D1 binding in `wrangler.toml`
- [ ] Create database connection utility in `server/db/index.ts`

**Deliverable:** Database connection working in development

---

### 1.4 Drizzle Schema Implementation

**Duration:** 8 hours

Implement all database tables as per `DATABASE_SCHEMA.md`:

- [ ] Create `server/db/schema/users.ts`:
  - users table
  - profiles table
  - Indexes and constraints
- [ ] Create `server/db/schema/professors.ts`:
  - professors table
  - tags table
  - professor_tags junction table
  - Indexes
- [ ] Create `server/db/schema/templates.ts`:
  - templates table
  - template_versions table
  - Indexes
- [ ] Create `server/db/schema/outreach.ts`:
  - outreach_logs table
  - reminders table
  - notifications table
  - Indexes
- [ ] Create `server/db/schema/billing.ts`:
  - plans table
  - subscriptions table
  - payment_intents table
  - transactions table
  - invoices table
  - Indexes
- [ ] Create `server/db/schema/audit.ts`:
  - audit_logs table

- [ ] Generate initial migration:
  ```bash
  npx drizzle-kit generate:sqlite
  ```
- [ ] Apply migration to D1:
  ```bash
  wrangler d1 migrations apply scholarship_outreach_dev
  ```

**Deliverable:** Complete database schema deployed to D1

---

### 1.5 Environment Configuration

**Duration:** 3 hours

- [ ] Create `.env.example` template
- [ ] Setup environment variables:

  ```bash
  # Application
  APP_ENV=development
  APP_BASE_URL=http://localhost:3000

  # Database
  DB_BINDING=D1_DB

  # Session
  SESSION_SECRET=generate-random-secret
  COOKIE_SECURE=false

  # R2
  R2_BUCKET_NAME=scholarship-dev
  R2_ACCESS_KEY_ID=
  R2_SECRET_ACCESS_KEY=

  # Email (optional)
  SMTP_HOST=
  SMTP_PORT=
  SMTP_USER=
  SMTP_PASS=
  MAIL_FROM=

  # Payments
  BKASH_APP_KEY=
  BKASH_APP_SECRET=
  BKASH_USERNAME=
  BKASH_PASSWORD=
  BKASH_CALLBACK_URL=

  NAGAD_MERCHANT_ID=
  NAGAD_MERCHANT_PRIVATE_KEY=
  NAGAD_CALLBACK_URL=
  ```

- [ ] Create development `.env` file
- [ ] Setup environment validation utility
- [ ] Document all environment variables

**Deliverable:** Environment configuration complete

---

## Phase 2: Authentication & User Management (Days 4-7)

### 2.1 Core Authentication System

**Duration:** 12 hours

- [ ] Install authentication dependencies:
  ```bash
  npm install argon2 zod nanoid
  ```
- [ ] Create password hashing utility (`server/utils/auth.ts`):
  - `hashPassword(password: string)`
  - `verifyPassword(hash: string, password: string)`
- [ ] Create JWT/Session utility (`server/utils/session.ts`):
  - `createSession(userId: string)`
  - `verifySession(token: string)`
  - `destroySession(token: string)`
- [ ] Implement session middleware (`server/middleware/auth.ts`):
  - Extract session from cookie
  - Verify session validity
  - Attach user to request context
- [ ] Create auth API endpoints:
  - [ ] `POST /api/auth/signup`
    - Validate input with Zod
    - Check email uniqueness
    - Hash password with argon2
    - Create user + profile record
    - Return session token
  - [ ] `POST /api/auth/login`
    - Validate credentials
    - Verify password
    - Create session
    - Update last_login_at
    - Return user + token
  - [ ] `POST /api/auth/logout`
    - Clear session cookie
    - Invalidate session in DB (if session table exists)
  - [ ] `GET /api/me`
    - Return current user
    - Include profile data
    - Include subscription entitlements

**Deliverable:** Complete authentication system with secure sessions

---

### 2.2 User Profile Management

**Duration:** 8 hours

- [ ] Create profile API endpoints:
  - [ ] `GET /api/profile`
    - Return full profile
  - [ ] `PUT /api/profile`
    - Validate input
    - Update profile fields
    - Fields: fullName, degreeTarget, researchInterests, preferredCountries, signatureBlock
- [ ] Create profile UI components:
  - [ ] ProfileForm component
  - [ ] Profile settings page
  - [ ] CV upload interface (placeholder for R2)
- [ ] Implement validation schemas with Zod:
  ```typescript
  const profileSchema = z.object({
    fullName: z.string().min(2).max(100),
    degreeTarget: z.enum(["MS", "PhD", "RA"]),
    researchInterests: z.string().optional(),
    preferredCountries: z.string().optional(),
    signatureBlock: z.string().max(500).optional(),
  });
  ```

**Deliverable:** Users can manage their profile

---

### 2.3 Authentication UI/UX

**Duration:** 8 hours

- [ ] Design and implement auth pages:
  - [ ] `/signup` - Registration form
  - [ ] `/login` - Login form
  - [ ] `/forgot-password` - Password reset (placeholder)
- [ ] Create auth components:
  - [ ] AuthCard wrapper
  - [ ] FormInput with validation
  - [ ] FormButton with loading states
  - [ ] ErrorMessage component
- [ ] Implement client-side validation
- [ ] Add loading states and error handling
- [ ] Implement redirect after login/signup
- [ ] Create protected route middleware

**Deliverable:** Polished authentication user experience

---

### 2.4 Authorization Middleware

**Duration:** 4 hours

- [ ] Create authorization middleware (`server/middleware/authorize.ts`):
  - Role-based access control
  - Feature gate checking
  - Plan limit enforcement
- [ ] Create authorization utilities:
  - `requireAuth()` - Ensure user is authenticated
  - `requireRole(role)` - Ensure user has role
  - `checkLimit(userId, feature)` - Verify plan limits
- [ ] Implement resource ownership checks:
  - Ensure users can only access their own data
  - Filter all queries by `user_id`

**Deliverable:** Robust authorization system

---

## Phase 3: Professor CRM System (Days 8-12)

### 3.1 Professor Data Model & API

**Duration:** 10 hours

- [ ] Create professor API endpoints:
  - [ ] `GET /api/professors`
    - Query parameters: status, country, tag, q (search), sort, page, limit
    - Implement pagination
    - Return professors with tags
  - [ ] `POST /api/professors`
    - Validate input
    - Create professor record
    - Associate with current user
    - Return created professor
  - [ ] `GET /api/professors/:id`
    - Fetch single professor
    - Include tags
    - Include recent outreach logs
    - Verify ownership
  - [ ] `PUT /api/professors/:id`
    - Update professor fields
    - Verify ownership
    - Return updated record
  - [ ] `DELETE /api/professors/:id`
    - Soft delete (set deleted_at)
    - Verify ownership
  - [ ] `POST /api/professors/:id/status`
    - Update status
    - Set next_followup_at if provided
    - Create status change log
- [ ] Create professor validation schemas:
  ```typescript
  const professorSchema = z.object({
    professorName: z.string().min(2).max(200),
    email: z.string().email(),
    universityName: z.string().min(2).max(300),
    department: z.string().max(200).optional(),
    country: z.string().max(100).optional(),
    researchArea: z.string().max(500).optional(),
    deadlineAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  });
  ```

**Deliverable:** Complete professor CRUD API

---

### 3.2 Tags System

**Duration:** 6 hours

- [ ] Create tags API endpoints:
  - [ ] `GET /api/tags`
    - Return user's tags
  - [ ] `POST /api/tags`
    - Create new tag
    - Ensure unique name per user
  - [ ] `POST /api/professors/:id/tags`
    - Add tags to professor
    - Remove tags from professor
    - Handle add/remove arrays

- [ ] Implement tag utilities:
  - Auto-create tags when adding
  - Prevent duplicate tags
  - Count professors per tag

**Deliverable:** Flexible tagging system

---

### 3.3 Professor CRM UI

**Duration:** 16 hours

- [ ] Create professor list view:
  - [ ] ProfessorList component
  - [ ] ProfessorCard component
  - [ ] Search and filter bar
  - [ ] Pagination controls
  - [ ] Status pipeline visualization
- [ ] Create professor detail view:
  - [ ] ProfessorDetail page
  - [ ] Edit mode toggle
  - [ ] Tag management UI
  - [ ] Notes section
  - [ ] Outreach history timeline
- [ ] Create professor forms:
  - [ ] AddProfessorModal
  - [ ] EditProfessorForm
  - [ ] Status change dropdown
- [ ] Implement search functionality:
  - Real-time search
  - Filter by status, country, tag
  - Sort by deadline, last contact
- [ ] Create empty states and loading skeletons

**Deliverable:** Full-featured professor management UI

---

### 3.4 Status Pipeline System

**Duration:** 6 hours

- [ ] Define status constants:
  ```typescript
  const PROFESSOR_STATUSES = {
    DRAFT: "draft",
    SENT: "sent",
    REPLIED: "replied",
    FOLLOWUP: "followup",
    INTERVIEW: "interview",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
  };
  ```
- [ ] Create status pipeline component:
  - Visual pipeline board (Kanban-style)
  - Drag-and-drop status changes
  - Status badges with colors
  - Quick status update buttons
- [ ] Implement status transition logic:
  - Validate allowed transitions
  - Auto-create follow-up reminders
  - Update timestamps

**Deliverable:** Visual status tracking system

---

## Phase 4: Email Template Engine (Days 13-17)

### 4.1 Template Data Model & API

**Duration:** 10 hours

- [ ] Create template API endpoints:
  - [ ] `GET /api/templates`
    - List user templates
    - Include default flag
  - [ ] `POST /api/templates`
    - Create new template
    - Validate placeholders
    - Create initial version
  - [ ] `GET /api/templates/:id`
    - Return template with versions
  - [ ] `PUT /api/templates/:id`
    - Update template
    - Create new version
    - Maintain version history
  - [ ] `DELETE /api/templates/:id`
    - Soft delete template
  - [ ] `POST /api/templates/:id/generate`
    - Accept professorId
    - Merge template with user profile + professor data
    - Return final subject and body
    - Create outreach log (action_type='generated')

**Deliverable:** Complete template management API

---

### 4.2 Template Variable System

**Duration:** 8 hours

- [ ] Define template variables:
  ```typescript
  const TEMPLATE_VARIABLES = {
    // Student variables
    "{{student.name}}": "profile.full_name",
    "{{student.degree}}": "profile.degree_target",
    "{{student.interests}}": "profile.research_interests",
    "{{student.signature}}": "profile.signature_block",

    // Professor variables
    "{{professor.name}}": "professor.professor_name",
    "{{professor.university}}": "professor.university_name",
    "{{professor.department}}": "professor.department",
    "{{professor.research}}": "professor.research_area",

    // Other
    "{{date}}": "current_date",
  };
  ```
- [ ] Create template parser:
  - `parseTemplate(template, variables)` - Replace placeholders
  - `extractVariables(template)` - List used variables
  - `validateTemplate(template)` - Check valid syntax
- [ ] Create variable resolver:
  - Fetch user profile
  - Fetch professor data
  - Build variable map
  - Handle missing values gracefully

**Deliverable:** Robust template variable system

---

### 4.3 Template UI Components

**Duration:** 12 hours

- [ ] Create template list view:
  - [ ] TemplateList component
  - [ ] TemplateCard component
  - [ ] Default template indicator
- [ ] Create template editor:
  - [ ] TemplateEditor component
  - [ ] Subject field
  - [ ] Body textarea with syntax highlighting
  - [ ] Variable insertion buttons
  - [ ] Preview mode
  - [ ] Live variable preview
- [ ] Create template selection UI:
  - Template picker in email generation
  - Quick template selection
- [ ] Create email generation interface:
  - [ ] Generate button in professor detail
  - [ ] Template selection modal
  - [ ] Generated email preview
  - [ ] Copy to clipboard button
  - [ ] Open in email client button (mailto:)
  - [ ] Mark as sent button

**Deliverable:** User-friendly template editor

---

### 4.4 Default Templates

**Duration:** 4 hours

- [ ] Create seed data for default templates:
  - PhD funding inquiry
  - MS scholarship request
  - Research assistant outreach
  - Follow-up email
  - Interview thank you
- [ ] Create template seeding script
- [ ] Add default templates to new user onboarding

**Deliverable:** Professional default templates

---

## Phase 5: Outreach Tracking & Automation (Days 18-22)

### 5.1 Outreach Logs System

**Duration:** 8 hours

- [ ] Create outreach log API endpoints:
  - [ ] `GET /api/outreach/logs`
    - Query parameters: professorId, actionType, page, limit
    - Return paginated logs
  - [ ] `POST /api/outreach/mark-sent`
    - Accept professorId, subject, body, templateId
    - Create outreach_logs entry (action_type='sent')
    - Update professor status to 'sent'
    - Update professor.last_contact_at
    - Create follow-up reminder
    - Return created log
  - [ ] `POST /api/outreach/add-note`
    - Create note log entry
    - Associate with professor

**Deliverable:** Complete outreach logging

---

### 5.2 Automated Tracking Logic

**Duration:** 10 hours

- [ ] Implement "Mark as Sent" automation:
  - Update professor status
  - Set last_contact_at timestamp
  - Calculate next_followup_at
  - Create reminder record
  - Log action in outreach_logs
- [ ] Create tracking utilities:
  - `createFollowupReminder(professorId, days)`
  - `updateProfessorStatus(professorId, status)`
  - `logOutreachAction(type, data)`
- [ ] Implement status-based automation:
  - Auto-update based on actions
  - Smart follow-up scheduling
  - Deadline warnings

**Deliverable:** Automated tracking system

---

### 5.3 Outreach History UI

**Duration:** 8 hours

- [ ] Create outreach log components:
  - [ ] OutreachTimeline component
  - [ ] OutreachLogItem component
  - [ ] Action type badges
  - [ ] Email preview in timeline
- [ ] Integrate timeline into professor detail:
  - Show all actions chronologically
  - Display email content
  - Show timestamps
  - Filter by action type
- [ ] Create outreach analytics:
  - Total emails sent
  - Response rate
  - Average response time

**Deliverable:** Visual outreach tracking

---

## Phase 6: Reminders & Notifications (Days 23-26)

### 6.1 Reminder System

**Duration:** 10 hours

- [ ] Create reminder API endpoints:
  - [ ] `GET /api/reminders`
    - Query: status, type, dueBefore, dueAfter
    - Return reminders with professor data
  - [ ] `POST /api/reminders/:id/done`
    - Mark reminder complete
    - Update professor if needed
  - [ ] `POST /api/reminders/:id/snooze`
    - Update snoozed_until
    - Set status to 'snoozed'
- [ ] Create reminder utilities:
  - `createReminder(userId, professorId, type, dueAt)`
  - `getDueReminders(userId)`
  - `getUpcomingReminders(userId, days)`

**Deliverable:** Reminder management system

---

### 6.2 Notification System

**Duration:** 8 hours

- [ ] Create notification API endpoints:
  - [ ] `GET /api/notifications`
    - Return user notifications
    - Filter by read status
  - [ ] `POST /api/notifications/:id/read`
    - Mark notification as read
    - Update read_at timestamp
  - [ ] `POST /api/notifications/read-all`
    - Mark all as read
- [ ] Create notification utilities:
  - `createNotification(userId, type, title, message)`
  - `notifyFollowupDue(reminder)`
  - `notifyDeadlineApproaching(professor, days)`

**Deliverable:** In-app notification system

---

### 6.3 Cron Jobs & Scheduled Tasks

**Duration:** 10 hours

- [ ] Create Cloudflare Workers cron triggers:
  - [ ] Hourly follow-up reminder processor:
    - Find reminders due in next hour
    - Create notifications
    - Optional: send email alerts
  - [ ] Daily deadline alerts:
    - Find deadlines in 7, 3, 1 days
    - Create notifications
    - Highlight urgent deadlines
  - [ ] Daily subscription expiry:
    - Find expired subscriptions
    - Update status to 'expired'
    - Downgrade to free plan
    - Create notification
- [ ] Create cron job handlers in `server/api/cron/`:
  - `/api/cron/process-reminders`
  - `/api/cron/check-deadlines`
  - `/api/cron/expire-subscriptions`
- [ ] Setup cron schedule in `wrangler.toml`:
  ```toml
  [triggers]
  crons = [
    "0 * * * *",    # Every hour
    "0 6 * * *"     # Daily at 6 AM
  ]
  ```

**Deliverable:** Automated reminder system

---

### 6.4 Notification UI

**Duration:** 6 hours

- [ ] Create notification components:
  - [ ] NotificationBell icon with badge
  - [ ] NotificationDropdown
  - [ ] NotificationList
  - [ ] NotificationItem
- [ ] Create reminder dashboard:
  - [ ] "Today's Tasks" widget
  - [ ] Upcoming reminders list
  - [ ] Overdue reminders
  - [ ] Snooze and complete actions
- [ ] Add notifications to main layout:
  - Header bell icon
  - Real-time badge count
  - Dropdown menu

**Deliverable:** Polished notification UX

---

## Phase 7: Billing & Subscription System (Days 27-33)

### 7.1 Plan Definition & Entitlements

**Duration:** 8 hours

- [ ] Define subscription plans:
  ```typescript
  const PLANS = {
    FREE: {
      name: "Free",
      priceBDT: 0,
      limits: {
        maxProfessors: 10,
        maxTemplates: 2,
        export: false,
        analytics: false,
      },
    },
    PRO: {
      name: "Pro",
      priceBDT: 500,
      billingPeriod: "monthly",
      limits: {
        maxProfessors: 100,
        maxTemplates: 10,
        export: true,
        analytics: true,
      },
    },
    PREMIUM: {
      name: "Premium",
      priceBDT: 1200,
      billingPeriod: "monthly",
      limits: {
        maxProfessors: -1, // unlimited
        maxTemplates: -1,
        export: true,
        analytics: true,
        aiAssist: true,
      },
    },
  };
  ```
- [ ] Seed plans in database
- [ ] Create entitlement checker utility:
  ```typescript
  async function getEntitlements(userId: string) {
    const subscription = await getActiveSubscription(userId);
    const plan = await getPlan(subscription.planId);
    return plan.limits_json;
  }
  ```
- [ ] Implement feature gates:
  - `checkProfessorLimit(userId)`
  - `checkTemplateLimit(userId)`
  - `checkFeatureAccess(userId, feature)`

**Deliverable:** Plan-based entitlement system

---

### 7.2 Subscription Management API

**Duration:** 10 hours

- [ ] Create billing API endpoints:
  - [ ] `GET /api/billing/plans`
    - Return all active plans
    - Public endpoint
  - [ ] `GET /api/billing/subscription`
    - Return current user subscription
    - Include entitlements
    - Include usage stats
  - [ ] `POST /api/billing/cancel`
    - Set cancelled_at
    - Keep access until end_at
    - Create notification
  - [ ] `GET /api/billing/invoices`
    - Return user invoice history
    - Include payment details

**Deliverable:** Subscription management API

---

### 7.3 Feature Gating Implementation

**Duration:** 8 hours

- [ ] Implement limit enforcement:
  - Check before creating professor
  - Check before creating template
  - Block export for free users
  - Block analytics for free users
- [ ] Create middleware for feature gates:
  ```typescript
  export async function requireFeature(feature: string) {
    const userId = await getUserId();
    const entitlements = await getEntitlements(userId);
    if (!entitlements[feature]) {
      throw createError({
        statusCode: 403,
        message: "Upgrade required",
      });
    }
  }
  ```
- [ ] Add upgrade prompts in UI:
  - Show limits in UI
  - Display upgrade CTAs
  - Block actions with modal

**Deliverable:** Enforced plan limits

---

### 7.4 Billing UI/UX

**Duration:** 12 hours

- [ ] Create pricing page:
  - [ ] Plan comparison table
  - [ ] Feature checklist per plan
  - [ ] CTA buttons
  - [ ] FAQ section
- [ ] Create subscription dashboard:
  - [ ] Current plan display
  - [ ] Usage meters (professors, templates)
  - [ ] Billing cycle info
  - [ ] Upgrade/cancel buttons
- [ ] Create invoice history:
  - [ ] Invoice list
  - [ ] Download PDF (future)
  - [ ] Payment status
- [ ] Create upgrade flow UI:
  - Plan selection
  - Payment gateway selection
  - Success/failure pages

**Deliverable:** Complete billing UX

---

## Phase 8: Payment Gateway Integration (Days 34-40)

### 8.1 Payment Intent System

**Duration:** 8 hours

- [ ] Create payment intent API:
  - [ ] `POST /api/billing/intent`
    - Validate planId and provider
    - Create payment_intent record
    - Return intent ID
- [ ] Create payment adapter interface:
  ```typescript
  interface PaymentAdapter {
    createCheckout(intent: PaymentIntent): Promise<CheckoutSession>;
    verifyPayment(reference: string): Promise<PaymentVerification>;
    processRefund(transactionId: string): Promise<RefundResult>;
  }
  ```

**Deliverable:** Payment intent foundation

---

### 8.2 bKash Integration

**Duration:** 16 hours

- [ ] Research bKash merchant API documentation
- [ ] Create bKash adapter (`server/utils/payment/bkash.ts`):
  - [ ] Authentication (grant token)
  - [ ] Create checkout session
  - [ ] Execute payment
  - [ ] Query payment status
  - [ ] Refund handling
- [ ] Create bKash API endpoints:
  - [ ] `POST /api/billing/bkash/create`
    - Create checkout session
    - Return redirect URL
  - [ ] `POST /api/billing/callback/bkash`
    - Verify payment server-to-server
    - Check signature/token
    - Validate amount, currency, status
    - Check idempotency (provider_txn_id)
    - Activate subscription
    - Create transaction record
    - Create invoice
    - Send confirmation notification
- [ ] Implement idempotency:
  - Check for existing transaction with same provider_txn_id
  - Return existing result if found
  - Prevent double activation
- [ ] Test in sandbox:
  - Success flow
  - Failure handling
  - Callback replay
  - Network errors

**Deliverable:** bKash payment integration

---

### 8.3 Nagad Integration

**Duration:** 16 hours

- [ ] Research Nagad merchant API documentation
- [ ] Create Nagad adapter (`server/utils/payment/nagad.ts`):
  - [ ] Authentication
  - [ ] Create payment
  - [ ] Verify payment
  - [ ] Callback handling
- [ ] Create Nagad API endpoints:
  - [ ] `POST /api/billing/nagad/create`
    - Initialize payment
    - Return checkout URL
  - [ ] `POST /api/billing/callback/nagad`
    - Verify callback signature
    - Validate payment
    - Activate subscription
    - Create records
- [ ] Implement same security measures as bKash:
  - Server-side verification
  - Idempotency
  - Amount validation
  - Status checking
- [ ] Test thoroughly in sandbox

**Deliverable:** Nagad payment integration

---

### 8.4 Payment Security & Audit

**Duration:** 8 hours

- [ ] Implement payment security:
  - Rate limit payment endpoints
  - Validate signatures
  - Mask sensitive data in logs
  - Audit all payment events
- [ ] Create audit logging:
  - Log payment intent creation
  - Log callback reception
  - Log verification results
  - Log subscription activation
  - Mask gateway credentials
- [ ] Create payment monitoring:
  - Failed payment alerts
  - Suspicious activity detection
  - Payment reconciliation helper
- [ ] Write payment security tests:
  - Invalid signature rejection
  - Amount mismatch detection
  - Duplicate callback handling
  - Expired intent handling

**Deliverable:** Secure payment system

---

## Phase 9: Cloudflare R2 File Storage (Days 41-43)

### 9.1 R2 Configuration

**Duration:** 4 hours

- [ ] Create R2 buckets:
  - `scholarship-dev`
  - `scholarship-prod`
- [ ] Configure R2 access:
  - Generate access keys
  - Set CORS policy
  - Configure bucket privacy
- [ ] Create R2 client utility (`server/utils/r2.ts`):
  - Initialize S3 client for R2
  - Generate signed upload URLs
  - Generate signed download URLs
  - Delete objects

**Deliverable:** R2 storage configured

---

### 9.2 CV Upload System

**Duration:** 10 hours

- [ ] Create CV upload API endpoints:
  - [ ] `POST /api/profile/cv/upload-url`
    - Generate unique file key
    - Create signed upload URL (15 min expiry)
    - Return URL and key
  - [ ] `POST /api/profile/cv/confirm`
    - Receive file key
    - Verify file exists in R2
    - Update profile.cv_file_key
    - Generate signed download URL
    - Return success
  - [ ] `GET /api/profile/cv/download-url`
    - Generate temporary download URL (1 hour expiry)
    - Return signed URL
  - [ ] `DELETE /api/profile/cv`
    - Delete file from R2
    - Clear profile.cv_file_key
- [ ] Implement file validation:
  - Accept only PDF files
  - Max file size: 5MB
  - Validate content type
- [ ] Create CV upload UI:
  - [ ] File drop zone
  - [ ] Upload progress bar
  - [ ] File preview link
  - [ ] Delete button
  - [ ] Error handling

**Deliverable:** CV upload/download system

---

### 9.3 Data Export Feature

**Duration:** 6 hours

- [ ] Create export API endpoint:
  - [ ] `POST /api/export/professors`
    - Generate CSV from professor data
    - Include all fields
    - Include tags
    - Upload to R2
    - Return signed download URL
- [ ] Create export UI:
  - Export button in professor list
  - Download progress indicator
  - Auto-download CSV
- [ ] Gate feature by plan:
  - Only Pro/Premium can export
  - Show upgrade prompt for Free users

**Deliverable:** Data export functionality

---

## Phase 10: Production Hardening (Days 44-50)

### 10.1 Performance Optimization

**Duration:** 12 hours

- [ ] Database optimization:
  - Review and add missing indexes
  - Optimize slow queries
  - Add query explain analysis
  - Implement query result caching
- [ ] API optimization:
  - Implement pagination everywhere
  - Add response caching headers
  - Compress responses
  - Optimize N+1 queries
- [ ] Frontend optimization:
  - Code splitting
  - Lazy loading components
  - Image optimization
  - Bundle size analysis
  - Tree shaking
- [ ] Caching strategy:
  - Cache plans in KV
  - Cache entitlements (5 min TTL)
  - Cache static assets
  - Setup CDN caching

**Deliverable:** Optimized performance

---

### 10.2 Security Hardening

**Duration:** 12 hours

- [ ] Implement rate limiting:
  - `/api/auth/*`: 5 requests/min per IP
  - `/api/billing/*`: 10 requests/min per user
  - `/api/*`: 100 requests/min per user
- [ ] Setup Cloudflare WAF:
  - Enable bot protection
  - Add custom rules
  - Block malicious IPs
  - Rate limiting rules
- [ ] Security headers:
  - CSP (Content Security Policy)
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
- [ ] Input validation:
  - Validate all API inputs with Zod
  - Sanitize HTML output
  - Prevent SQL injection (Drizzle helps)
  - XSS protection
- [ ] Session security:
  - HTTPOnly cookies
  - Secure flag in production
  - SameSite=Lax
  - Session expiry (7 days)
  - CSRF protection
- [ ] Run security audit:
  - Test authorization bypass
  - Test payment callback security
  - Test file upload vulnerabilities
  - Test XSS and injection

**Deliverable:** Hardened security

---

### 10.3 Error Handling & Logging

**Duration:** 8 hours

- [ ] Implement global error handler:
  - Catch all unhandled errors
  - Log with context
  - Return user-friendly messages
  - Hide sensitive details
- [ ] Create structured logging:
  - Use JSON format
  - Include request ID
  - Include user ID
  - Include timestamp
  - Log levels: info, warn, error
- [ ] Setup error tracking:
  - Log to Cloudflare Analytics
  - Optional: Sentry integration
  - Alert on critical errors
- [ ] Create error pages:
  - 404 Not Found
  - 500 Server Error
  - 403 Forbidden
  - 401 Unauthorized

**Deliverable:** Robust error handling

---

### 10.4 Monitoring & Observability

**Duration:** 8 hours

- [ ] Setup application monitoring:
  - Track API response times
  - Monitor error rates
  - Track payment success/failure
  - Monitor cron job execution
- [ ] Create admin dashboard:
  - [ ] `GET /api/admin/metrics`
    - Total users
    - Active subscriptions
    - Revenue metrics
    - System health
  - [ ] `GET /api/admin/payments`
    - Recent transactions
    - Failed payments
    - Refund requests
- [ ] Setup alerts:
  - High error rate
  - Payment failures spike
  - Database query slow
  - Cron job failures
- [ ] Create health check endpoint:
  - `/api/health`
  - Check database connection
  - Check R2 access
  - Return system status

**Deliverable:** Production monitoring

---

### 10.5 Testing & Quality Assurance

**Duration:** 12 hours

- [ ] Write unit tests:
  - Test utilities and helpers
  - Test validation schemas
  - Test template parser
  - Test entitlement checker
- [ ] Write integration tests:
  - Test API endpoints
  - Test authentication flow
  - Test payment flow
  - Test reminder creation
- [ ] Write E2E tests:
  - User registration → profile → add professor → generate email → mark sent
  - Payment flow → subscription activation → feature access
  - Reminder creation → notification
- [ ] Manual testing checklist:
  - [ ] User can register and login
  - [ ] User can update profile
  - [ ] User can add professors
  - [ ] User can create templates
  - [ ] User can generate emails
  - [ ] User can mark emails as sent
  - [ ] Reminders are created correctly
  - [ ] Notifications appear
  - [ ] Payment flow works (sandbox)
  - [ ] Subscription is activated
  - [ ] Feature gates work
  - [ ] Export works for Pro users
  - [ ] CV upload/download works
- [ ] Performance testing:
  - Load test API endpoints
  - Test with 1000+ professors
  - Test concurrent users
  - Test database under load

**Deliverable:** Comprehensive test coverage

---

### 10.6 Documentation

**Duration:** 8 hours

- [ ] Update technical documentation:
  - Architecture overview
  - Deployment guide
  - API documentation
  - Environment variables reference
- [ ] Create user documentation:
  - Getting started guide
  - Feature tutorials
  - FAQ section
  - Video demos (optional)
- [ ] Create admin documentation:
  - Payment reconciliation
  - User management
  - Troubleshooting guide
  - Backup/restore procedures
- [ ] Code documentation:
  - JSDoc comments
  - README in each major folder
  - Architecture decision records

**Deliverable:** Complete documentation

---

## Phase 11: Deployment & Launch (Days 51-56)

### 11.1 Staging Environment

**Duration:** 8 hours

- [ ] Create staging environment:
  - Staging D1 database
  - Staging R2 bucket
  - Staging Cloudflare Pages project
- [ ] Configure staging environment variables
- [ ] Deploy to staging
- [ ] Run migrations on staging
- [ ] Seed staging data:
  - Test users
  - Sample professors
  - Sample templates
  - Test plans
- [ ] Test staging thoroughly:
  - Full user journey
  - Payment flow (sandbox)
  - Cron jobs
  - Email generation
  - Export feature

**Deliverable:** Working staging environment

---

### 11.2 Production Deployment

**Duration:** 12 hours

- [ ] Create production environment:
  - Production D1 database
  - Production R2 bucket
  - Production Cloudflare Pages project
- [ ] Configure production environment variables:
  - Secure secrets
  - Production payment credentials
  - Production SMTP settings
  - Production domain
- [ ] Setup custom domain:
  - Configure DNS
  - Enable SSL/TLS
  - Redirect www to apex
- [ ] Deploy to production:
  - Connect GitHub repository
  - Configure build settings
  - Setup auto-deployment
- [ ] Run production migrations
- [ ] Seed production plans
- [ ] Setup cron triggers in production
- [ ] Configure Cloudflare WAF rules
- [ ] Enable analytics

**Deliverable:** Live production environment

---

### 11.3 Launch Checklist

**Duration:** 4 hours

- [ ] Pre-launch verification:
  - [ ] All API endpoints working
  - [ ] Authentication flow tested
  - [ ] Payment flow tested (real transaction)
  - [ ] Email sending works
  - [ ] Reminders working
  - [ ] File upload/download works
  - [ ] All pages load correctly
  - [ ] Mobile responsive
  - [ ] SSL certificate valid
  - [ ] DNS configured
  - [ ] Analytics tracking
  - [ ] Error monitoring active
  - [ ] Backups configured
- [ ] Legal compliance:
  - [ ] Terms of service page
  - [ ] Privacy policy page
  - [ ] Refund policy page
  - [ ] Cookie consent (if needed)
- [ ] Marketing preparation:
  - [ ] Landing page ready
  - [ ] Pricing page finalized
  - [ ] Demo video created
  - [ ] Screenshots prepared
  - [ ] Social media accounts
- [ ] Support preparation:
  - [ ] Help documentation
  - [ ] Contact form
  - [ ] Support email setup
  - [ ] FAQ prepared

**Deliverable:** Production-ready application

---

### 11.4 Monitoring & Rollback Plan

**Duration:** 4 hours

- [ ] Setup monitoring dashboard:
  - Real-time traffic
  - Error rates
  - Payment conversions
  - User signups
- [ ] Create rollback procedure:
  - Document rollback steps
  - Test rollback in staging
  - Keep previous deployment available
  - Database migration rollback scripts
- [ ] Setup on-call alerts:
  - Critical errors
  - Database failures
  - Payment gateway issues
  - High error rate
- [ ] Create incident response plan

**Deliverable:** Production monitoring and safety net

---

## Phase 12: Post-Launch Optimization (Days 57-60)

### 12.1 User Feedback & Analytics

**Duration:** Ongoing

- [ ] Setup analytics tracking:
  - User behavior
  - Feature usage
  - Conversion funnels
  - Drop-off points
- [ ] Collect user feedback:
  - In-app feedback form
  - User surveys
  - Support tickets
  - Feature requests
- [ ] Analyze metrics:
  - Signup conversion rate
  - Payment conversion rate
  - Feature adoption
  - User retention

**Deliverable:** Data-driven insights

---

### 12.2 Performance Tuning

**Duration:** Ongoing

- [ ] Monitor and optimize:
  - Slow API endpoints
  - Database query performance
  - Page load times
  - Bundle sizes
- [ ] Implement improvements:
  - Add caching where beneficial
  - Optimize database indexes
  - Reduce API payload sizes
  - Implement lazy loading

**Deliverable:** Continuously improved performance

---

### 12.3 Bug Fixes & Stability

**Duration:** Ongoing

- [ ] Track and fix bugs:
  - Monitor error logs
  - Reproduce issues
  - Fix and test
  - Deploy fixes
- [ ] Improve stability:
  - Add error handling
  - Improve validation
  - Add resilience patterns
  - Enhance monitoring

**Deliverable:** Stable production system

---

## Future Enhancements (Post-MVP)

### Planned Features (Priority Order)

1. **Gmail Integration**
   - OAuth integration
   - Auto-detect replies
   - Sync sent emails
   - Reply detection

2. **AI-Powered Features**
   - Email content suggestions
   - Reply summarization
   - Professor research discovery
   - Smart follow-up timing

3. **Advanced Analytics**
   - Response rate trends
   - Best performing templates
   - Optimal outreach timing
   - Success predictions

4. **Collaboration Features**
   - Share templates with mentors
   - Mentor review workflow
   - Team accounts
   - Feedback system

5. **Mobile Applications**
   - iOS app
   - Android app
   - Push notifications

6. **Professor Discovery**
   - Search database of professors
   - Research area matching
   - Funding availability info
   - University rankings

7. **Document Management**
   - SOP versions
   - Multiple CV formats
   - Research proposals
   - Recommendation letter tracking

8. **Interview Preparation**
   - Interview checklist
   - Common questions bank
   - Preparation resources
   - Mock interview tracker

---

## Success Metrics

### Technical Metrics

- API response time < 200ms (p95)
- Page load time < 2s
- Database query time < 50ms (p95)
- 99.9% uptime
- Zero data loss

### Business Metrics

- User signup rate
- Free to Pro conversion > 5%
- Payment success rate > 95%
- User retention > 60% (30 days)
- Feature adoption rate

### User Experience Metrics

- User satisfaction score > 4.5/5
- Support ticket resolution < 24h
- Feature request implementation rate
- NPS score > 50

---

## Risk Mitigation

### Technical Risks

- **Database performance**: Add indexes, implement caching
- **Payment gateway downtime**: Graceful fallback, retry logic
- **R2 availability**: Backup storage option
- **API rate limits**: Request queuing, user feedback

### Business Risks

- **Low conversion**: A/B test pricing, add trial period
- **Payment fraud**: Enhanced verification, manual review
- **Competition**: Focus on unique features, fast iteration
- **User churn**: Improve onboarding, add value

### Security Risks

- **Data breach**: Encryption, access controls, audits
- **Payment fraud**: Server verification, idempotency
- **Account takeover**: 2FA, session management
- **DDoS attacks**: Cloudflare protection, rate limiting

---

## Development Best Practices

### Code Quality

- Use TypeScript for type safety
- Follow consistent naming conventions
- Write self-documenting code
- Add comments for complex logic
- Use ESLint and Prettier

### Version Control

- Feature branch workflow
- Meaningful commit messages
- Pull request reviews
- Semantic versioning
- Changelog maintenance

### Testing Strategy

- Unit tests for utilities
- Integration tests for API
- E2E tests for critical flows
- Manual testing checklist
- Regression testing

### Deployment

- CI/CD pipeline
- Automated testing
- Staged rollouts
- Blue-green deployments
- Instant rollback capability

### Documentation

- Code comments
- API documentation
- Architecture diagrams
- Deployment guides
- User manuals

---

## Resource Requirements

### Development Team

- 1 Full-stack Developer (primary)
- 1 UI/UX Designer (part-time)
- 1 DevOps/Infrastructure (part-time)
- 1 QA Tester (part-time)

### Infrastructure Costs (Monthly Estimates)

- Cloudflare Pages: $0-20
- Cloudflare D1: $5-15
- Cloudflare R2: $5-10
- Domain: $1-2
- Email service: $0-10
- Total: ~$15-60/month initially

### Third-Party Services

- Payment gateways: bKash, Nagad (transaction fees)
- Email provider: SMTP/SendGrid (optional)
- Monitoring: Cloudflare Analytics (free tier)
- Error tracking: Sentry (optional)

---

## Conclusion

This implementation plan provides a comprehensive, production-ready roadmap for building the Scholarship Outreach Management System. By following these phases systematically, you will create a secure, scalable, optimized, and user-friendly application that helps students efficiently manage their scholarship outreach.

**Key Success Factors:**

- Follow the phases in order
- Don't skip testing and security
- Optimize early and continuously
- Listen to user feedback
- Iterate based on data
- Maintain high code quality
- Document everything
- Plan for scale from day one

**Timeline Summary:**

- Weeks 1-4: Foundation, Auth, CRM, Templates
- Weeks 5-7: Tracking, Reminders, Billing
- Weeks 8-9: Payment Integration, R2 Storage
- Weeks 9-10: Hardening, Testing, Launch

**Next Steps:**

1. Review this plan with your team
2. Set up development environment
3. Start Phase 1: Foundation setup
4. Track progress using project management tools
5. Adjust timeline based on actual velocity

Good luck with your build! 🚀

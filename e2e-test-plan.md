# E2E Testing Plan — Nestlancer Backend API

> **AI Prompt & Logs**: See [`docs/ai-prompts/RUN-TESTS.md`](docs/ai-prompts/RUN-TESTS.md) for AI prompts to run tests and instructions to check Docker logs when tests fail.

## 1. Overview

This document defines the comprehensive End-to-End (E2E) testing strategy for the Nestlancer backend API. Unit and integration tests are already complete. E2E tests will validate **full user-facing workflows** by sending HTTP requests through the **API Gateway** (port `3000`) to downstream microservices, verifying real responses against the API spec.

### Scope

| Layer | What's Tested |
|-------|---------------|
| **API Gateway** | Routing, reverse proxy, request/response pass-through |
| **16 Microservices** | Full CRUD, business logic, status transitions, validations |
| **8 Async Workers** | Event publish → queue consume → side-effect (DB write, email, media, etc.) |
| **WebSocket Gateway** | Real-time messaging & notifications via `ws-gateway` |
| **Cross-Service Flows** | Multi-step workflows spanning multiple services (e.g., request → quote → project → payment) |
| **Infrastructure** | Rate limiting, CORS, auth guards, error handling, pagination |

### Out of Scope
- Third-party API live calls (Razorpay, SMTP, Turnstile) — these will be mocked
- Frontend testing
- Load/performance testing (separate initiative)
- Infrastructure deployment testing

---

## 2. Test Infrastructure

### 2.1 Docker Compose for E2E Tests

Extend the existing `docker-compose.test.yml` to spin up all required infrastructure:

```yaml
# docker-compose.e2e.yml
services:
  postgres:
    image: postgres:15-alpine
    container_name: nestlancer-e2e-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: nestlancer_e2e
    ports:
      - "5433:5432"
    tmpfs: /var/lib/postgresql/data   # RAM-disk for speed
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 3s
      timeout: 3s
      retries: 10

  redis-cache:
    image: redis:7-alpine
    container_name: nestlancer-e2e-redis-cache
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 3s
      retries: 5

  redis-pubsub:
    image: redis:7-alpine
    container_name: nestlancer-e2e-redis-pubsub
    ports:
      - "6381:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 3s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: nestlancer-e2e-rabbitmq
    ports:
      - "5673:5672"
      - "15673:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 3s
      retries: 10

  minio:
    image: minio/minio:latest
    container_name: nestlancer-e2e-minio
    ports:
      - "9002:9000"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data
    tmpfs: /data

  mailhog:
    image: mailhog/mailhog:latest
    container_name: nestlancer-e2e-mailhog
    ports:
      - "1026:1025"
      - "8026:8025"
```

### 2.2 Test Environment Configuration

Create `.env.e2e` with all services pointed at E2E infrastructure:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/nestlancer_e2e` |
| `REDIS_CACHE_URL` | `redis://localhost:6380` |
| `REDIS_PUBSUB_URL` | `redis://localhost:6381` |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5673` |
| `STORAGE_ENDPOINT` | `http://localhost:9002` |
| `SMTP_HOST` | `localhost` / `SMTP_PORT=1026` |
| `NODE_ENV` | `test` |
| `RAZORPAY_*` | Mock/test keys |
| `TURNSTILE_SECRET` | Test bypass key |

### 2.3 Database Setup & Teardown

```
Before all tests:
  1. docker-compose -f docker-compose.e2e.yml up -d
  2. Wait for all healthchecks to pass
  3. Run Prisma migrations: prisma migrate deploy
  4. Run seed data: prisma db seed
  5. Start all services + gateway + workers
  6. Wait for gateway /api/v1/health → 200

After all tests:
  1. Gracefully shut down all services
  2. docker-compose -f docker-compose.e2e.yml down -v
```

### 2.4 Seeded Test Data

| Entity | Seed Details |
|--------|-------------|
| **Admin User** | `admin@nestlancer.dev` / `Admin123!` — role `ADMIN` |
| **Client User** | `client@nestlancer.dev` / `Client123!` — role `USER` |
| **Categories** | Web Development, Mobile Development, Design, Other |
| **Email Templates** | Welcome, Password Reset, Quote Sent, Payment Receipt |
| **Feature Flags** | All enabled for E2E env |
| **System Config** | Default maintenance=off, rate limits relaxed for E2E |

---

## 3. Tooling & Conventions

### 3.1 Test Framework

| Tool | Purpose |
|------|---------|
| **Jest** | Test runner (existing config, `testPathPattern=tests/e2e`) |
| **Supertest** or **axios** | HTTP client for gateway requests |
| **ws** | WebSocket client for WS gateway tests |
| **@nestjs/testing** | App bootstrapping for setup/teardown |

### 3.2 File Structure

```
tests/
└── e2e/
    ├── setup/
    │   ├── global-setup.ts          # Start infra + services
    │   ├── global-teardown.ts       # Stop everything
    │   ├── test-helpers.ts          # Auth helpers, HTTP client
    │   └── seed-data.ts             # Test data constants
    ├── suites/
    │   ├── 01-health.e2e-spec.ts
    │   ├── 02-auth.e2e-spec.ts
    │   ├── 03-users.e2e-spec.ts
    │   ├── 04-requests.e2e-spec.ts
    │   ├── 05-quotes.e2e-spec.ts
    │   ├── 06-projects.e2e-spec.ts
    │   ├── 07-progress.e2e-spec.ts
    │   ├── 08-payments.e2e-spec.ts
    │   ├── 09-messaging.e2e-spec.ts
    │   ├── 10-notifications.e2e-spec.ts
    │   ├── 11-media.e2e-spec.ts
    │   ├── 12-portfolio.e2e-spec.ts
    │   ├── 13-blog.e2e-spec.ts
    │   ├── 14-contact.e2e-spec.ts
    │   ├── 15-admin.e2e-spec.ts
    │   ├── 16-webhooks.e2e-spec.ts
    │   ├── 17-cross-service-flows.e2e-spec.ts
    │   └── 18-error-handling.e2e-spec.ts
    └── jest.e2e.config.ts
```

### 3.3 Jest E2E Configuration

```typescript
// jest.e2e.config.ts
import type { Config } from 'jest';
import baseConfig from '../../jest.config.base';

const config: Config = {
  ...baseConfig,
  testMatch: ['**/tests/e2e/**/*.e2e-spec.ts'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/tests/e2e/setup/global-setup.ts',
  globalTeardown: '<rootDir>/tests/e2e/setup/global-teardown.ts',
  maxWorkers: 1,  // Sequential — tests have state dependencies
  setupFilesAfterSetup: ['<rootDir>/tests/e2e/setup/test-helpers.ts'],
};

export default config;
```

### 3.4 Naming Conventions

| Convention | Example |
|-----------|---------|
| E2E test file | `*.e2e-spec.ts` |
| Describe block | `describe('POST /api/v1/auth/login', ...)` |
| Test name | `it('should return 200 and JWT tokens for valid credentials')` |
| Shared state | Use `let` variables scoped to `describe`, pass IDs between tests |

### 3.5 Test Helper Utilities

```typescript
// test-helpers.ts — key utilities

loginAsAdmin(): Promise<string>       // Returns admin JWT
loginAsClient(): Promise<string>      // Returns client JWT
registerNewUser(data): Promise<{token, user}>
apiGet(path, token?): Promise<Response>
apiPost(path, body, token?): Promise<Response>
apiPatch(path, body, token?): Promise<Response>
apiDelete(path, token?): Promise<Response>
waitForQueueProcessing(ms): Promise<void>  // Wait for async workers
expectStandardResponse(res, statusCode): void
expectPaginatedResponse(res): void
expectErrorResponse(res, code, httpStatus): void
```

---

## 4. Test Suites — Detailed Breakdown

### Priority Tiers

| Tier | Description | Suites |
|------|-------------|--------|
| **P0 — Critical** | Core business flow, must pass for any release | Auth, Payments, Projects, Cross-Service Flows |
| **P1 — High** | Key features, important for user experience | Users, Requests, Quotes, Messaging, Notifications, Media |
| **P2 — Medium** | Public-facing content, admin operations | Portfolio, Blog, Contact, Admin, Webhooks |
| **P3 — Low** | Infrastructure & edge cases | Health, Error Handling, Rate Limiting |

---

### Suite 01: Health Service (`01-health.e2e-spec.ts`) — P3

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Gateway health check returns 200 | `GET /api/v1/health` | `200` with `status: "success"` |
| 2 | Detailed health shows all service statuses | `GET /api/v1/health/detailed` | Each service shows `up` |
| 3 | Individual service health via gateway | `GET /api/v1/auth/health` | `200` |
| 4 | Response contains standard metadata | All health responses | Has `timestamp`, `requestId`, `version` |

---

### Suite 02: Auth Service (`02-auth.e2e-spec.ts`) — P0

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| **Registration** | | | |
| 1 | Register new user with valid data | `POST /api/v1/auth/register` | `201` with user data (no password hash exposed) |
| 2 | Reject duplicate email registration | `POST /api/v1/auth/register` | `409` with `AUTH_003` |
| 3 | Reject invalid email format | `POST /api/v1/auth/register` | `422` validation error |
| 4 | Reject weak password | `POST /api/v1/auth/register` | `422` validation error |
| **Login** | | | |
| 5 | Login with valid credentials → get JWT tokens | `POST /api/v1/auth/login` | `200` with `accessToken`, `refreshToken` |
| 6 | Reject invalid credentials | `POST /api/v1/auth/login` | `401` with `AUTH_001` |
| 7 | Reject login for suspended user | `POST /api/v1/auth/login` | `403` with `AUTH_011` |
| **Token Management** | | | |
| 8 | Refresh access token with valid refresh token | `POST /api/v1/auth/refresh` | `200` with new `accessToken` |
| 9 | Reject expired/invalid refresh token | `POST /api/v1/auth/refresh` | `401` with `AUTH_002` |
| 10 | Logout invalidates session | `POST /api/v1/auth/logout` | `200`, subsequent requests fail with `401` |
| **Password Management** | | | |
| 11 | Request password reset sends email | `POST /api/v1/auth/forgot-password` | `200` (check MailHog for email) |
| 12 | Reset password with valid token | `POST /api/v1/auth/reset-password` | `200` |
| 13 | Change password with correct old password | `POST /api/v1/auth/change-password` | `200` |
| **Email Check** | | | |
| 14 | Check email availability (available) | `POST /api/v1/auth/check-email` | `200` with `available: true` |
| 15 | Check email availability (taken) | `POST /api/v1/auth/check-email` | `200` with `available: false` |
| **Protected Route Access** | | | |
| 16 | Access protected route without token → 401 | `GET /api/v1/users/me` | `401` |
| 17 | Access protected route with valid token → 200 | `GET /api/v1/users/me` | `200` |
| 18 | Access admin route with user token → 403 | `GET /api/v1/admin/dashboard/overview` | `403` |
| 19 | Access admin route with admin token → 200 | `GET /api/v1/admin/dashboard/overview` | `200` |

---

### Suite 03: Users Service (`03-users.e2e-spec.ts`) — P1

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Get current user profile | `GET /api/v1/users/me` | `200` with user data |
| 2 | Update user profile | `PATCH /api/v1/users/me` | `200` with updated fields |
| 3 | Get user preferences | `GET /api/v1/users/me/preferences` | `200` |
| 4 | Update user preferences (timezone, theme) | `PATCH /api/v1/users/me/preferences` | `200` |
| 5 | List active sessions | `GET /api/v1/users/me/sessions` | `200` with session array |
| 6 | Revoke a specific session | `DELETE /api/v1/users/me/sessions/{id}` | `200` |
| 7 | Admin: List all users with pagination | `GET /api/v1/admin/users?page=1&limit=10` | `200` with paginated response |
| 8 | Admin: Get user by ID | `GET /api/v1/admin/users/{id}` | `200` |
| 9 | Admin: Suspend a user | `PATCH /api/v1/admin/users/{id}/status` | `200`, user status = `suspended` |
| 10 | Admin: Reactivate a suspended user | `PATCH /api/v1/admin/users/{id}/status` | `200`, user status = `active` |

---

### Suite 04: Requests Service (`04-requests.e2e-spec.ts`) — P1

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Create a draft request | `POST /api/v1/requests` | `201` with request data, status=`draft` |
| 2 | List user's requests with pagination | `GET /api/v1/requests?page=1` | `200` paginated |
| 3 | Get request by ID | `GET /api/v1/requests/{id}` | `200` |
| 4 | Update request (title, description) | `PATCH /api/v1/requests/{id}` | `200` |
| 5 | Submit request for review | `POST /api/v1/requests/{id}/submit` | `200`, status=`submitted` |
| 6 | Cannot edit a submitted request | `PATCH /api/v1/requests/{id}` | `400` with `REQUEST_007` |
| 7 | Cancel a request | `POST /api/v1/requests/{id}/cancel` | `200`, status=`cancelled` |
| 8 | Admin: List all requests | `GET /api/v1/admin/requests` | `200` |
| 9 | Admin: Update request status to under_review | `PATCH /api/v1/admin/requests/{id}/status` | `200` |
| 10 | Reject invalid status transition | `PATCH /api/v1/admin/requests/{id}/status` | `400` |

---

### Suite 05: Quotes Service (`05-quotes.e2e-spec.ts`) — P1

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Admin: Create quote for a request | `POST /api/v1/admin/quotes` | `201` with quote data |
| 2 | Admin: Send quote to client | `POST /api/v1/admin/quotes/{id}/send` | `200`, status=`sent` |
| 3 | Client views the quote | `GET /api/v1/quotes/{id}` | `200`, status → `viewed` |
| 4 | Client accepts the quote | `POST /api/v1/quotes/{id}/accept` | `200`, status=`accepted` |
| 5 | Accepting quote creates a project | Verify `GET /api/v1/projects` | New project with `quoteId` |
| 6 | Client declines the quote | `POST /api/v1/quotes/{id}/decline` | `200`, status=`declined` |
| 7 | Admin: Revise an expired quote | `POST /api/v1/admin/quotes/{id}/revise` | `200`, new version |
| 8 | Cannot accept an already accepted quote | `POST /api/v1/quotes/{id}/accept` | `400` |

---

### Suite 06: Projects Service (`06-projects.e2e-spec.ts`) — P0

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | List user's projects | `GET /api/v1/projects` | `200` paginated |
| 2 | Get project details with milestones | `GET /api/v1/projects/{id}` | `200` with milestones, payments |
| 3 | Public: Get project by slug (if public) | `GET /api/v1/projects/public/{slug}` | `200` |
| 4 | Admin: Update project status to in_progress | `PATCH /api/v1/admin/projects/{id}/status` | `200` |
| 5 | Admin: Add milestone to project | `POST /api/v1/admin/projects/{id}/milestones` | `201` |
| 6 | Admin: Update milestone status | `PATCH /api/v1/admin/milestones/{id}/status` | `200` |
| 7 | Admin: Add deliverable to milestone | `POST /api/v1/admin/milestones/{id}/deliverables` | `201` |
| 8 | Completing all milestones updates project progress | Verify computed progress | `overallProgress` updated |
| 9 | Admin: Mark project as completed | `PATCH /api/v1/admin/projects/{id}/status` | `200`, status=`completed` |
| 10 | Cannot set invalid status transition | `PATCH /api/v1/admin/projects/{id}/status` | `400` |

---

### Suite 07: Progress Service (`07-progress.e2e-spec.ts`) — P1

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Admin: Add progress entry to project | `POST /api/v1/admin/progress` | `201` |
| 2 | Client views progress entries | `GET /api/v1/progress/projects/{id}` | `200` (only `client`-visible entries) |
| 3 | Admin: Add milestone-level progress | `POST /api/v1/admin/progress` | `201` with `milestoneId` |
| 4 | Admin: Add deliverable-level progress | `POST /api/v1/admin/progress` | `201` with `deliverableId` |
| 5 | Progress entries respect visibility | Compare admin vs client views | Admin sees `internal` entries |
| 6 | Get project timeline | `GET /api/v1/progress/projects/{id}/timeline` | `200` ordered by date |

---

### Suite 08: Payments Service (`08-payments.e2e-spec.ts`) — P0

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Initiate payment for a project | `POST /api/v1/payments/initiate` | `201` with `intentId`, status=`created` |
| 2 | Idempotency: same `Idempotency-Key` returns same result | `POST /api/v1/payments/initiate` (repeated) | Same `intentId` |
| 3 | Get payment details | `GET /api/v1/payments/{id}` | `200` |
| 4 | List user's payments with pagination | `GET /api/v1/payments` | `200` paginated |
| 5 | Confirm payment (mock gateway success) | `POST /api/v1/payments/confirm` | `200`, status=`completed` |
| 6 | Admin: View all payments | `GET /api/v1/admin/payments` | `200` |
| 7 | Admin: Process refund | `POST /api/v1/admin/payments/{id}/refund` | `200` |
| 8 | Download receipt (PDF) | `GET /api/v1/payments/{id}/receipt` | `200` with PDF content-type |
| 9 | Download invoice (PDF) | `GET /api/v1/payments/{id}/invoice` | `200` with PDF content-type |
| 10 | Payment failure handling | Simulate failed payment | Status=`failed`, error recorded |
| 11 | Cannot pay for a project not in `pending_payment` status | `POST /api/v1/payments/initiate` | `400` |

---

### Suite 09: Messaging Service (`09-messaging.e2e-spec.ts`) — P1

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Send message to project thread | `POST /api/v1/messages/projects/{id}` | `201` |
| 2 | List messages in project thread | `GET /api/v1/messages/projects/{id}` | `200` paginated |
| 3 | Reply to a message | `POST /api/v1/messages/projects/{id}` with `replyToId` | `201` |
| 4 | Edit message (within time window) | `PATCH /api/v1/messages/{id}` | `200` |
| 5 | Delete own message (soft) | `DELETE /api/v1/messages/{id}` | `200` |
| 6 | Cannot edit another user's message | `PATCH /api/v1/messages/{id}` | `403` |
| 7 | Admin: List all messages for a project | `GET /api/v1/admin/messages/projects/{id}` | `200` |

---

### Suite 10: Notifications Service (`10-notifications.e2e-spec.ts`) — P1

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | List user notifications | `GET /api/v1/notifications` | `200` paginated |
| 2 | Get unread count | `GET /api/v1/notifications/unread-count` | `200` with `count` |
| 3 | Mark notification as read | `PATCH /api/v1/notifications/{id}/read` | `200` |
| 4 | Mark all as read | `POST /api/v1/notifications/mark-all-read` | `200` |
| 5 | Get notification preferences | `GET /api/v1/notifications/preferences` | `200` |
| 6 | Update notification preferences | `PATCH /api/v1/notifications/preferences` | `200` |
| 7 | Admin: Send system notification | `POST /api/v1/admin/notifications/send` | `201` |
| 8 | Verify notification created after project action | Trigger action → check notifications | Notification exists |

---

### Suite 11: Media Service (`11-media.e2e-spec.ts`) — P1

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Get presigned upload URL | `POST /api/v1/media/presign` | `200` with `uploadUrl` |
| 2 | Upload file (small) | Upload to presigned URL → confirm | `200`, status=`processing` |
| 3 | Get media details | `GET /api/v1/media/{id}` | `200` with URLs, metadata |
| 4 | List user's media | `GET /api/v1/media` | `200` paginated |
| 5 | Delete media | `DELETE /api/v1/media/{id}` | `200` (soft delete) |
| 6 | Reject unsupported file type | Upload `.exe` | `422` with `MEDIA_003` |
| 7 | Reject file exceeding size limit | Upload 100MB file | `413` with `MEDIA_004` |
| 8 | Admin: List all media | `GET /api/v1/admin/media` | `200` |
| 9 | Worker processes uploaded media (thumbnails) | Upload → wait → verify `status=ready` | Media has `urls.thumbnail` |

---

### Suite 12: Portfolio Service (`12-portfolio.e2e-spec.ts`) — P2

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Public: List published portfolio items | `GET /api/v1/portfolio` | `200` paginated |
| 2 | Public: Get item by slug | `GET /api/v1/portfolio/{slug}` | `200` with full details |
| 3 | Public: Get featured items | `GET /api/v1/portfolio/featured` | `200` |
| 4 | Public: List categories | `GET /api/v1/portfolio/categories` | `200` |
| 5 | Public: Search portfolio | `GET /api/v1/portfolio/search?q=ecommerce` | `200` |
| 6 | Public: Like an item (anonymous) | `POST /api/v1/portfolio/{id}/like` | `200` |
| 7 | Admin: Create portfolio item (draft) | `POST /api/v1/admin/portfolio` | `201` |
| 8 | Admin: Publish portfolio item | `POST /api/v1/admin/portfolio/{id}/publish` | `200` |
| 9 | Admin: Cannot publish without thumbnail | Publish without thumbnail | `400` with `PORTFOLIO_005` |
| 10 | Admin: Toggle featured status | `POST /api/v1/admin/portfolio/{id}/toggle-featured` | `200` |
| 11 | Admin: Archive item | `POST /api/v1/admin/portfolio/{id}/archive` | `200` |
| 12 | Admin: Get analytics | `GET /api/v1/admin/portfolio/analytics` | `200` |

---

### Suite 13: Blog Service (`13-blog.e2e-spec.ts`) — P2

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Public: List published posts | `GET /api/v1/blog/posts` | `200` paginated |
| 2 | Public: Get post by slug | `GET /api/v1/blog/posts/{slug}` | `200` with full content |
| 3 | Public: Get categories | `GET /api/v1/blog/categories` | `200` |
| 4 | Public: Get tags | `GET /api/v1/blog/tags` | `200` |
| 5 | Public: Search posts | `GET /api/v1/blog/search?q=nodejs` | `200` |
| 6 | Public: RSS feed | `GET /api/v1/blog/feed/rss` | `200` with XML content-type |
| 7 | User: Like/unlike a post | `POST /api/v1/blog/posts/{slug}/like` | `200` toggle |
| 8 | User: Add comment | `POST /api/v1/blog/posts/{slug}/comments` | `201`, status=`pending` |
| 9 | User: Edit comment (within 15 min) | `PATCH /api/v1/blog/comments/{id}` | `200` |
| 10 | User: Bookmark a post | `POST /api/v1/blog/posts/{slug}/bookmark` | `200` |
| 11 | Admin: Create blog post (draft) | `POST /api/v1/admin/blog/posts` | `201` |
| 12 | Admin: Publish post | `POST /api/v1/admin/blog/posts/{id}/publish` | `200` |
| 13 | Admin: Approve pending comment | `POST /api/v1/admin/blog/comments/{id}/approve` | `200` |
| 14 | Admin: Reject comment | `POST /api/v1/admin/blog/comments/{id}/reject` | `200` |

---

### Suite 14: Contact Service (`14-contact.e2e-spec.ts`) — P2

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Submit contact form (public) | `POST /api/v1/contact` | `201` with `ticketId` |
| 2 | Reject contact without required fields | `POST /api/v1/contact` (empty body) | `422` |
| 3 | Reject invalid email format | `POST /api/v1/contact` (bad email) | `422` with `CONTACT_002` |
| 4 | Admin: List contact messages | `GET /api/v1/admin/contact` | `200` paginated |
| 5 | Admin: Get message details (marks as read) | `GET /api/v1/admin/contact/{id}` | `200`, status=`read` |
| 6 | Admin: Respond to message | `POST /api/v1/admin/contact/{id}/respond` | `200` |
| 7 | Admin: Mark as spam | `POST /api/v1/admin/contact/{id}/spam` | `200` |

---

### Suite 15: Admin Service (`15-admin.e2e-spec.ts`) — P2

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| 1 | Admin dashboard overview | `GET /api/v1/admin/dashboard/overview` | `200` with metrics |
| 2 | Admin revenue analytics | `GET /api/v1/admin/dashboard/revenue` | `200` |
| 3 | Admin: Get system config | `GET /api/v1/admin/system/config` | `200` |
| 4 | Admin: Update system config | `PATCH /api/v1/admin/system/config` | `200` |
| 5 | Admin: List email templates | `GET /api/v1/admin/system/email-templates` | `200` |
| 6 | Admin: List audit logs | `GET /api/v1/admin/audit` | `200` paginated |
| 7 | Admin: Get user audit trail | `GET /api/v1/admin/audit/user/{id}` | `200` |
| 8 | Admin: Impersonate user | `POST /api/v1/admin/users/{id}/impersonate` | `200` with impersonation token |
| 9 | Admin: Cannot impersonate admin | `POST /api/v1/admin/users/{adminId}/impersonate` | `403` with `ADMIN_008` |
| 10 | Admin: End impersonation | `POST /api/v1/admin/impersonate/end` | `200` |
| 11 | Admin: List feature flags | `GET /api/v1/admin/system/features` | `200` |
| 12 | Admin: Toggle feature flag | `PATCH /api/v1/admin/system/features/{flag}` | `200` |
| 13 | Admin: List background jobs | `GET /api/v1/admin/system/jobs` | `200` |

---

### Suite 16: Webhooks Service (`16-webhooks.e2e-spec.ts`) — P2

| # | Test Case | Method & Path | Expected |
|---|-----------|---------------|----------|
| **Outbound (Admin)** | | | |
| 1 | Admin: Create webhook subscription | `POST /api/v1/admin/webhooks` | `201` |
| 2 | Admin: List webhooks | `GET /api/v1/admin/webhooks` | `200` |
| 3 | Admin: Send test event | `POST /api/v1/admin/webhooks/{id}/test` | `200` |
| 4 | Admin: View delivery history | `GET /api/v1/admin/webhooks/{id}/deliveries` | `200` |
| 5 | Admin: Disable webhook | `POST /api/v1/admin/webhooks/{id}/disable` | `200` |
| **Inbound** | | | |
| 6 | Receive Razorpay webhook with valid signature | `POST /api/v1/webhooks/razorpay` | `200` |
| 7 | Reject webhook with invalid signature | `POST /api/v1/webhooks/razorpay` | `401` with `WEBHOOK_001` |
| 8 | Reject webhook without signature | `POST /api/v1/webhooks/razorpay` | `400` with `WEBHOOK_002` |

---

### Suite 17: Cross-Service Flows (`17-cross-service-flows.e2e-spec.ts`) — P0

These tests validate **full business workflows** spanning multiple services:

#### Flow 1: Complete Client Journey

```
Register → Login → Create Request → Admin Creates Quote →
Client Accepts Quote → Project Created → Admin Adds Milestones →
Payment Initiated → Payment Confirmed → Progress Updates →
Deliverables Approved → Project Completed → Portfolio Item Created
```

**Steps & Assertions:**
1. `POST /auth/register` → 201
2. `POST /auth/login` → 200, save token
3. `POST /requests` → 201, save `requestId`
4. `POST /requests/{id}/submit` → 200
5. Admin: `PATCH /admin/requests/{id}/status` → under_review
6. Admin: `POST /admin/quotes` → 201, save `quoteId`
7. Admin: `POST /admin/quotes/{id}/send` → 200
8. Client: `POST /quotes/{id}/accept` → 200
9. Verify: `GET /projects` → new project exists
10. Admin: `POST /admin/projects/{id}/milestones` → 201
11. Client: `POST /payments/initiate` → 201
12. Client: `POST /payments/confirm` → 200
13. Admin: `POST /admin/progress` → 201 (several progress entries)
14. Admin: Complete milestones → project status=`completed`
15. Admin: `POST /admin/portfolio` → 201, referencing project
16. Admin: `POST /admin/portfolio/{id}/publish` → 200
17. Public: `GET /portfolio/{slug}` → 200

#### Flow 2: Communication Within Project

```
Client sends message → Admin replies → Notification created →
Notification visible via API → Mark as read
```

#### Flow 3: Payment with Refund

```
Initiate payment → Confirm → Admin refunds → Payment status updated
→ Refund appears in history
```

#### Flow 4: Blog Publishing Lifecycle

```
Admin creates post → Publishes → User comments → Comment awaits
moderation → Admin approves → Comment visible publicly
```

#### Flow 5: Media Upload and Portfolio Sync

```
Upload media → Worker processes → Media status=ready →
Admin creates portfolio item with media → Publishes →
Portfolio sync worker copies to public bucket
```

---

### Suite 18: Error Handling & Edge Cases (`18-error-handling.e2e-spec.ts`) — P3

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Invalid JSON body | `400` with `GLOBAL_017` |
| 2 | Missing required fields | `422` with `GLOBAL_002` |
| 3 | Invalid UUID format in path | `400` with `GLOBAL_012` |
| 4 | Resource not found | `404` with `GLOBAL_004` |
| 5 | Unsupported content type | `415` with `GLOBAL_016` |
| 6 | Invalid pagination parameters (page=-1) | `422` with `GLOBAL_010` |
| 7 | Standard error response format follows spec | All errors have `status`, `error.code`, `error.message`, `metadata` |
| 8 | Rate limiting returns 429 with `Retry-After` header | `429` with `GLOBAL_007` |
| 9 | CORS preflight returns correct headers | `OPTIONS` → 200 with CORS headers |
| 10 | API versioning: `/api/v1/*` routes work | `200` |
| 11 | Unknown route returns 404 | `GET /api/v1/nonexistent` → `404` |
| 12 | Request ID propagated in response headers | `X-Request-ID` present |
| 13 | API version header present | `X-API-Version: v1` present |

---

## 5. WebSocket E2E Tests

### Real-Time Messaging Tests

| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Connect to `wss://localhost:3000/ws/messages` with valid JWT | Connection established |
| 2 | Reject WS connection without token | Connection rejected |
| 3 | Send message via REST → receive via WebSocket in same project room | Message received |
| 4 | Typing indicator sent → received by other participant | Typing event received |
| 5 | Reconnection after disconnect | New connection established |

### Real-Time Notification Tests

| # | Test Case | Expected |
|---|-----------|----------|
| 6 | Connect to `wss://localhost:3000/ws/notifications` | Connection established |
| 7 | Trigger notification-causing action → receive via WebSocket | Notification received |
| 8 | Heartbeat/ping-pong keeps connection alive | No disconnect after 60s |

---

## 6. Async Worker Verification

Workers consume RabbitMQ messages and produce side effects. E2E tests verify the end-to-end effect:

| Worker | Trigger | Verification Method |
|--------|---------|-------------------|
| **Email Worker** | Registration, password reset, quote sent | Check MailHog API: `GET http://localhost:8026/api/v2/messages` |
| **Notification Worker** | Project status change, payment received | Check `GET /api/v1/notifications` for new notification |
| **Media Worker** | File uploaded | Poll `GET /api/v1/media/{id}` until `status=ready`, verify thumbnails |
| **Portfolio Sync Worker** | Portfolio item published | Verify public URL accessible via MinIO public bucket |
| **Analytics Worker** | Various user actions | Check admin analytics endpoint for updated stats |
| **Audit Worker** | Admin actions | Check `GET /api/v1/admin/audit` for new log entry |
| **Webhook Worker** | Inbound Razorpay webhook | Check webhook log status changes to `PROCESSED` |
| **CDN Worker** | Media processed, blog published | CDN invalidation recorded in logs |

**Wait Strategy**: Use polling with timeout (max 10s, poll every 500ms) to wait for async worker effects.

---

## 7. Execution

### 7.1 Running E2E Tests

```bash
# 1. Start test infrastructure
docker compose -f docker-compose.e2e.yml up -d

# 2. Wait for infrastructure to be healthy
./scripts/test/wait-for-services.sh

# 3. Run migrations & seed
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/nestlancer_e2e" \
  npx prisma migrate deploy && npx prisma db seed

# 4. Start all services in E2E mode (background)
NODE_ENV=test pnpm turbo dev &

# 5. Wait for gateway health
until curl -sf http://localhost:3000/api/v1/health; do sleep 1; done

# 6. Run E2E tests
npx jest --config tests/e2e/jest.e2e.config.ts --runInBand

# 7. Cleanup
docker compose -f docker-compose.e2e.yml down -v
```

### 7.2 CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: nestlancer_e2e
        ports: ["5433:5432"]
        options: --health-cmd="pg_isready" ...
      redis-cache:
        image: redis:7-alpine
        ports: ["6380:6379"]
      redis-pubsub:
        image: redis:7-alpine
        ports: ["6381:6379"]
      rabbitmq:
        image: rabbitmq:3-management-alpine
        ports: ["5673:5672"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install
      - run: npx prisma migrate deploy
      - run: npx prisma db seed
      - run: pnpm turbo dev &
      - run: ./scripts/test/wait-for-gateway.sh
      - run: npx jest --config tests/e2e/jest.e2e.config.ts --runInBand
```

### 7.3 Total Test Count Summary

| Suite | Estimated Test Count |
|-------|---------------------|
| Health | 4 |
| Auth | 19 |
| Users | 10 |
| Requests | 10 |
| Quotes | 8 |
| Projects | 10 |
| Progress | 6 |
| Payments | 11 |
| Messaging | 7 |
| Notifications | 8 |
| Media | 9 |
| Portfolio | 12 |
| Blog | 14 |
| Contact | 7 |
| Admin | 13 |
| Webhooks | 8 |
| Cross-Service Flows | ~20 (5 flows × 4 avg) |
| Error Handling | 13 |
| WebSocket | 8 |
| **Total** | **~197** |

---

## 8. Success Criteria

- [ ] All 197+ E2E tests pass consistently
- [ ] Full client journey (request → payment → completion) automated
- [ ] All 16 service endpoints covered via gateway proxy
- [ ] WebSocket real-time workflows verified
- [ ] Async worker side effects verified (email, notifications, media processing)
- [ ] Standard error handling validated across all services
- [ ] CI pipeline runs E2E tests on every PR to `main`
- [ ] Test execution time < 5 minutes (target)

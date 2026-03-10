# E2E Testing Plan – Nestlancer Backend API

## 1. Executive Summary

This document outlines a comprehensive plan for implementing end-to-end (E2E) tests for the Nestlancer backend monorepo. E2E tests validate complete request lifecycles across the full stack: API Gateway → microservices → database → workers → external systems.

**Current State:**

- Unit and integration tests exist; E2E tests are **not yet implemented**
- `pnpm test:e2e` and `turbo test:e2e` are configured but no e2e specs exist
- `jest.e2e.config.ts` is referenced but not present
- `docker-compose.test.yml` is referenced in docs but does not exist
- `run-e2e.sh` is documented but not present (only `run-unit.sh` and `run-integration.sh` exist)

**Target State:**

- Full E2E test suite covering critical user journeys
- Isolated test environment (Docker Compose)
- CI/CD integration
- Clear separation from integration tests

---

## 2. Architecture Context

### 2.1 Request Flow

```
Client → API Gateway (3000) → HTTP Proxy → Microservice (3001–3016)
                                    ↓
                              PostgreSQL / Redis
                                    ↓
                              Outbox → RabbitMQ → Workers
```

### 2.2 Components to Test

| Layer        | Components                         | E2E Focus                          |
| ------------ | ---------------------------------- | ---------------------------------- |
| **Entry**    | API Gateway, WS Gateway            | Routing, auth, middleware pipeline |
| **Services** | 16 NestJS microservices            | Full request→response via gateway  |
| **Workers**  | 8 RabbitMQ workers                 | Event consumption, side effects    |
| **Infra**    | PostgreSQL, Redis, RabbitMQ, MinIO | Real dependencies in test env      |

---

## 3. E2E vs Integration Test Boundaries

| Aspect           | Integration Tests                              | E2E Tests                                    |
| ---------------- | ---------------------------------------------- | -------------------------------------------- |
| **Scope**        | Single service/module with real DB/Redis       | Full stack: gateway + all services + workers |
| **Mocks**        | May mock HTTP proxy, external APIs             | No mocks; real services                      |
| **Startup**      | `Test.createTestingModule()` in-process        | Docker Compose stack running                 |
| **Request path** | Direct service call or supertest to single app | HTTP to gateway → proxy → service            |
| **Speed**        | ~30s timeout per test                          | 60–120s timeout; suite can take 10–30 min    |
| **When to run**  | Every PR, local dev                            | Pre-merge, nightly, release                  |

---

## 4. Infrastructure Plan

### 4.1 Docker Compose for E2E

Create `docker-compose.test.yml` that extends base compose:

**Required services:**

- PostgreSQL (test DB, e.g. `nestlancer_test`)
- Redis (cache + pub/sub)
- RabbitMQ
- MinIO (S3-compatible storage)
- MailHog (email capture)
- Meilisearch (optional; can mock for initial phase)

**Application services (all required for full E2E):**

- Gateway, WS Gateway
- All 16 microservices (auth, users, payments, webhooks, admin, requests, quotes, projects, progress, messaging, notifications, media, portfolio, blog, contact, health)
- **Critical workers:** outbox-poller, email-worker, notification-worker, webhook-worker, audit-worker, media-worker, analytics-worker, cdn-worker

**Environment:**

- `.env.e2e` or `.env.test` with test-specific values
- Separate `DATABASE_URL` for test DB
- Turnstile/Razorpay in test/sandbox mode where possible

### 4.2 Test Database Strategy

- **Isolated DB:** Use `nestlancer_test` or `nestlancer_e2e`
- **Migrations:** Run `prisma migrate deploy` before E2E suite
- **Seeding:** Optional minimal seed (e.g. admin user, system config)
- **Cleanup:** Truncate/delete test data between suites or use transactions where feasible
- **Parallelism:** Consider separate DBs per parallel worker if running tests in parallel

### 4.3 Health Checks Before Tests

- Wait for all services to be healthy before starting tests
- Use `docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --wait`
- Poll gateway `/api/v1/health` and WS gateway `/health` until 200

---

## 5. Test Configuration

### 5.1 Jest E2E Config

Create `tests/e2e/jest.e2e.config.ts`:

```ts
// Key settings:
// - testMatch: **/*.e2e-spec.ts
// - testTimeout: 60000 (or 120000 for long flows)
// - maxWorkers: 1 (sequential to avoid resource contention)
// - setupFilesAfterEnv: ['./setup.e2e.ts']
// - testEnvironment: 'node'
```

### 5.2 E2E Setup File

Create `tests/e2e/setup.e2e.ts`:

- Load `.env.e2e`
- Verify `GATEWAY_URL` (e.g. `http://localhost:3000`) is reachable
- Optional: Create test user, obtain JWT for authenticated tests
- Global `beforeAll` / `afterAll` for suite-level setup

### 5.3 Directory Structure

```
tests/
├── e2e/
│   ├── jest.e2e.config.ts
│   ├── setup.e2e.ts
│   ├── helpers/
│   │   ├── http-client.ts      # Axios/supertest wrapper for gateway
│   │   ├── auth-helper.ts      # Register, login, get JWT
│   │   └── fixtures.ts         # Shared test data
│   ├── flows/                   # Multi-step user journeys
│   │   ├── auth-flow.e2e-spec.ts
│   │   ├── request-to-payment.e2e-spec.ts
│   │   └── messaging-flow.e2e-spec.ts
│   ├── gateway/
│   │   ├── gateway-routing.e2e-spec.ts
│   │   └── middleware-pipeline.e2e-spec.ts
│   ├── ws/
│   │   ├── messages.gateway.e2e-spec.ts
│   │   └── notifications.gateway.e2e-spec.ts
│   └── workers/
│       └── outbox-poller.e2e-spec.ts
```

---

## 6. Test Scenarios (Prioritized)

### Phase 1: Foundation (Weeks 1–2)

| #   | Scenario                   | Description                                                                  | Priority |
| --- | -------------------------- | ---------------------------------------------------------------------------- | -------- |
| 1   | **Health & Readiness**     | `GET /api/v1/health`, `/ready`, `/live` return 200 when stack is up          | P0       |
| 2   | **Gateway Routing**        | Unauthenticated → 401 on protected routes; public routes (e.g. health) → 200 | P0       |
| 3   | **Auth: Register → Login** | Register user → verify (or bypass in test) → login → receive JWT             | P0       |
| 4   | **Auth: Token Refresh**    | Valid refresh token → new access token                                       | P0       |
| 5   | **Auth: Protected Route**  | Valid JWT → access user profile                                              | P0       |

### Phase 2: Core User Journeys (Weeks 3–4)

| #   | Scenario                  | Description                                                                             | Priority |
| --- | ------------------------- | --------------------------------------------------------------------------------------- | -------- |
| 6   | **Request Submission**    | Authenticated user creates request → stored in DB                                       | P0       |
| 7   | **Quote Flow**            | Lancer submits quote → client sees quote                                                | P0       |
| 8   | **Project Creation**      | Accept quote → project created                                                          | P0       |
| 9   | **Progress & Milestones** | Add milestone, update progress                                                          | P1       |
| 10  | **Payment Flow**          | Create order → Razorpay (sandbox) → webhook → payment captured                          | P0       |
| 11  | **Messaging**             | Create conversation, send message                                                       | P1       |
| 12  | **Media Upload**          | Upload file to MinIO via media service; verify processing (thumbnails) via media-worker | P1       |

### Phase 3: WebSocket & Workers (Weeks 5–6)

| #   | Scenario                 | Description                                                               | Priority |
| --- | ------------------------ | ------------------------------------------------------------------------- | -------- |
| 13  | **WS: Connect with JWT** | Socket.IO client connects with valid token → success                      | P0       |
| 14  | **WS: Notifications**    | Publish to Redis channel → client receives notification                   | P1       |
| 15  | **WS: Messages**         | Send message via WS → received in room                                    | P1       |
| 16  | **Outbox Poller**        | Insert outbox event → poller publishes to RabbitMQ → worker consumes      | P1       |
| 17  | **Webhook Receive**      | POST to webhooks endpoint (Razorpay payload) → verify signature → process | P0       |
| 18  | **Search Indexing**      | Create entity → verify indexed in Meilisearch → search via API            | P1       |
| 19  | **Audit Logging**        | Perform critical action → verify log entry in audit-service               | P1       |

### Phase 4: Admin & Edge Cases (Weeks 7–8)

| #   | Scenario                 | Description                                                | Priority |
| --- | ------------------------ | ---------------------------------------------------------- | -------- |
| 20  | **Admin: Dashboard**     | Admin JWT → access admin endpoints                         | P1       |
| 21  | **Admin: Impersonation** | Admin impersonates user                                    | P2       |
| 22  | **Rate Limiting**        | Exceed limit → 429                                         | P2       |
| 23  | **Maintenance Mode**     | When enabled, non-exempt routes return 503                 | P2       |
| 24  | **Correlation ID**       | Request includes X-Correlation-Id → propagated in response | P2       |
| 25  | **Circuit Breaker**      | Downstream service failure → gateway returns 503/fallback  | P2       |

---

## 7. Implementation Approach

### 7.1 HTTP E2E Tests

- Use **Axios** or **supertest** against `GATEWAY_URL` (e.g. `http://localhost:3000`)
- Base path: `/api/v1`
- All requests go through gateway; no direct service calls
- Reuse `createTestJwt` from `@nestlancer/testing` for fast auth in tests that don’t need full registration

### 7.2 WebSocket E2E Tests

- Use **socket.io-client** to connect to `WS_GATEWAY_URL` (e.g. `http://localhost:3100`)
- Authenticate via `auth: { token: accessToken }` or query param
- Test: connect, join room, send event, assert received event
- Use separate Redis for test to avoid polluting dev

### 7.3 Worker E2E Tests

- Publish event to RabbitMQ (or insert into outbox and wait for poller)
- Assert side effects: DB record created, email in MailHog, file in MinIO
- May require polling with timeout (e.g. check MailHog API for new messages)

### 7.4 Test Data & Isolation

- **Option A:** Fresh DB per run; migrations + optional seed
- **Option B:** Transactions with rollback (if Prisma supports it for E2E)
- **Option C:** Unique identifiers (UUIDs, timestamps) to avoid collisions when running in parallel
- Prefer **Option A** for simplicity; ensure tests don’t depend on shared mutable state

### 7.5 External Services

| Service           | E2E Strategy                                                     |
| ----------------- | ---------------------------------------------------------------- |
| **Razorpay**      | Use test/sandbox keys; mock webhook signatures with known secret |
| **Turnstile**     | Disable or use test key for registration flow                    |
| **ZeptoMail/SES** | MailHog captures all emails; assert via MailHog API              |
| **S3/MinIO**      | Use MinIO in Docker; real uploads                                |
| **Meilisearch**   | **Required:** Run in Docker; verify indexing flows               |

---

## 8. CI/CD Integration

### 8.1 When to Run E2E

- **Pre-merge:** Optional (can be slow); consider only on `main` or release branches
- **Nightly:** Full E2E suite
- **Release:** Mandatory before deployment

### 8.2 CI Pipeline Steps

1. Build all packages (`pnpm build`)
2. Start Docker Compose test stack
3. Wait for health checks
4. Run migrations on test DB
5. Run `pnpm test:e2e` (or `./scripts/test/run-e2e.sh`)
6. Tear down stack
7. Publish test results (JUnit XML, coverage if applicable)

### 8.3 GitHub Actions Example (Conceptual)

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - run: pnpm install
    - run: pnpm build
    - run: docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --wait
    - run: pnpm prisma migrate deploy
    - run: pnpm test:e2e
    - run: docker compose -f docker-compose.yml -f docker-compose.test.yml down
```

---

## 9. Scripts & Commands

### 9.1 New Scripts to Create

| Script                         | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `scripts/test/run-e2e.sh`      | Start stack, run migrations, execute E2E, teardown  |
| `docker-compose.test.yml`      | Test-specific overrides (env, ports, health checks) |
| `tests/e2e/jest.e2e.config.ts` | Jest config for E2E                                 |
| `tests/e2e/setup.e2e.ts`       | Global setup, env loading, health check             |

### 9.2 Package.json Updates

- Ensure `test:e2e` runs `jest --config tests/e2e/jest.e2e.config.ts`
- Add `test:e2e:docker` to start stack + run E2E in one command
- Add `test:e2e:suite` for running a subset (e.g. `pnpm test:e2e:suite auth`)

### 9.3 Makefile Updates

- `make test-e2e` → `pnpm test:e2e` (assumes stack is up)
- `make test-e2e-full` → start stack, run E2E, teardown

---

## 10. Risks & Mitigations

| Risk                    | Mitigation                                                         |
| ----------------------- | ------------------------------------------------------------------ |
| **Flaky tests**         | Retries for network-dependent assertions; avoid sleep, use polling |
| **Slow feedback**       | Phase 1 first; run only critical E2E in PR; full suite nightly     |
| **Resource contention** | `maxWorkers: 1`; sufficient CI resources                           |
| **Test pollution**      | Isolated DB; unique IDs; cleanup in `afterEach`/`afterAll`         |
| **External API limits** | Sandbox/test keys; mock where necessary                            |
| **Docker instability**  | Health checks; retry startup; document local requirements          |

---

## 11. Success Criteria

- [ ] `docker-compose.test.yml` exists and brings up full stack (including all 8 workers)
- [ ] `tests/e2e/jest.e2e.config.ts` and setup file exist
- [ ] `run-e2e.sh` (or equivalent) runs full E2E suite
- [ ] Phase 1 scenarios (health, auth) pass consistently
- [ ] Core user journeys (request → payment, search indexing, audit logs) pass
- [ ] E2E runs in CI (nightly or pre-merge)
- [ ] Documentation updated (`testing-strategy.md`, README)

---

## 12. Appendix: Reference Files

- `docs/guides/testing-strategy.md` – Testing pyramid, unit/integration conventions
- `reference-docs/301-dir-structure.md` – Proposed e2e directory layout
- `reference-docs/401-project-tracker.md` – E2E-related checklist items
- `gateway/tests/integration/gateway.integration.spec.ts` – Integration test patterns (mocked proxy)
- `libs/testing/` – Factories, `createTestJwt`, test helpers

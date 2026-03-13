# AI Prompt: Create or Update Service-Level E2E Tests

Use this prompt when asking an AI (or following it yourself) to **create** or **update** E2E test files for a microservice in this monorepo. The goal is **correct service-level E2E testing**, not only dry runs or smoke tests.

---

## Your Task

Create or update E2E test files for the microservice **`services/<service-name>`** so that:

- Tests run against the **real service app** (NestJS `AppModule`, in-process, no gateway).
- Tests are **correct E2E**: they verify **expected status codes** and **response shape/behavior**, not just "any 2xx/4xx".
- **Smoke tests** (health, routing, auth rejection) are explicit and minimal; **behavioral E2E tests** cover success paths, validation errors, and auth/authorization with **strict assertions**.

If the service already has e2e specs, **update** them to follow the rules below. If not, **create** `e2e/setup.ts`, `e2e/jest.e2e.config.ts`, and one or more `e2e/*.e2e-spec.ts` files.

---

## Rules (Must Follow)

### 1. Test Types: Smoke vs Proper E2E

- **Smoke test**: Confirms the service starts and an endpoint responds (e.g. health returns 200). Use **only** for health/readiness or "does the route exist?" checks. Keep smoke tests in a small, clearly named block (e.g. `describe('Health (smoke)', …)`).
- **Proper E2E**: Every other test must assert **exact expected outcome** for the scenario (success, validation error, not found, forbidden). Do **not** use loose assertions like "status is one of 200, 404, 422, 500" for a known scenario—use the **single** status code that the API contract guarantees for that case.

**Bad (dry/smoke-style):**
```ts
expect([200, 404, 422, 500]).toContain(res.status);
```

**Good (proper E2E):**
```ts
expect(res.status).toBe(201);
expect(res.body?.data?.id).toBeDefined();
expect(res.body?.data?.title).toBe(payload.title);
```

For **known error cases** (e.g. unauthenticated, invalid body), assert the **exact** status (401, 403, 400, 404, 422) and optionally error shape.

---

### 2. Assertions

- **Success paths**: Assert `res.status` is the exact success code (200, 201, 204) and that the response body matches the contract (e.g. created resource id, updated fields, list shape).
- **Error paths**: Assert the exact HTTP status (401, 403, 400, 404, 409, 422) and, if the API returns a structured error, at least one field (e.g. `message` or `error`).
- **No silent skips**: Do not write `if (res.status !== 201) return;` and then continue the suite—either fail the test or use a proper setup/seed so the success path is guaranteed for that test.

---

### 3. Structure and Layout

- **Location**: All service E2E live under `services/<service-name>/e2e/`.
- **Files**:
  - `setup.ts`: Bootstraps the Nest app (load `.env.e2e`, `Test.createTestingModule`, `AppModule`, global prefix, pipes, filters, interceptors), exports `setupApp`, `teardownApp`, `getApp`, `getAppUrl`, `getGlobalPrefix`.
  - `jest.e2e.config.ts`: Jest config for e2e (displayName, testRegex `e2e/.*\\.e2e-spec\\.ts$`, testTimeout, maxWorkers: 1).
  - `*.e2e-spec.ts`: Test files; use `beforeAll(setupApp)` and `afterAll(teardownApp)`.
- **Naming**: Use `describe('ServiceName - Feature (E2E)', …)` and clear `it('…')` descriptions that state the scenario and expected result (e.g. "POST /resource returns 201 and body with id when payload is valid").

---

### 4. Auth and Roles

- Use a **test JWT helper** (e.g. from `libs/testing` or a local helper) to build `Authorization: Bearer <token>` with the right `sub` and `role` (USER, ADMIN, etc.).
- **Unauthenticated**: For protected routes, always have a test that calls without a token and assert **401**.
- **Wrong role**: For admin-only routes, have a test with a non-admin token and assert **403**.
- **Authenticated success**: Use a dedicated test user id/role and assert **exact** success status and response body; avoid accepting both 200 and 404 in the same test.

---

### 5. Data and Environment

- Prefer **deterministic data**: Use fixed UUIDs or seeded data where the service supports it, so success-path tests can assert exact status and body.
- If the service requires DB state (e.g. "user must exist"), either:
  - Document that e2e expects a seeded DB (e.g. via `.env.e2e` and migrations/seed), and assert exact outcomes, or
  - Create the entity in the test (or in a `beforeAll`) and then assert on that entity—do not silently skip assertions when create fails.
- Load env from **`.env.e2e`** (e.g. in `setup.ts` with `dotenv` and `path.resolve(__dirname, '../../../.env.e2e')`). Set `NODE_ENV=e2e` for the test run.

---

### 6. HTTP Client and Prefix

- Use **supertest** with `request(getApp().getHttpServer())` or `request(getAppUrl())` so requests hit the in-process app.
- Use the **global prefix** from setup (e.g. `api/v1`) in every URL: `get(`${getGlobalPrefix()}/users/profile`)` or equivalent. Do not hardcode prefixes that differ from the app.

---

### 7. Response Shape

- Respect the app’s **response envelope** (e.g. `{ status: 'success', data: { … } }` from `TransformResponseInterceptor`). When asserting success, read from `res.body?.data` or `res.body` consistently with how the service actually returns data.
- For lists, assert that the result is an array (or has `items`/`data` array) and, when relevant, assert length or at least one item’s shape.

---

### 8. What to Avoid

- **No loose status sets** for a specific scenario: e.g. do not use `expect([200, 404, 500]).toContain(res.status)` when the scenario has a single correct outcome.
- **No silent skips** in the middle of a flow: do not `if (res.status !== 201) return;` without failing; either fail the test or ensure preconditions so the test can assert the success path.
- **No smoke-only suites**: If the only checks are "returns some 2xx/4xx", add proper tests with exact status and body assertions for at least the main success and main error cases.
- **No gateway or cross-service calls** in service E2E: service E2E hits **one** service only; cross-service flows belong in system E2E (see reference-docs/601-e2e-test-plan.md).

---

## Reference

- **E2E strategy and structure**: `reference-docs/601-e2e-test-plan.md`
- **API contracts (endpoints, payloads, errors)**: `reference-docs/10x-*-endpoints.md` and `reference-docs/100-api-standards-endpoints.md`
- **Existing examples in repo**: `services/auth/e2e/`, `services/users/e2e/`, `services/requests/e2e/` — align structure with these, but **tighten assertions** to match this prompt’s rules.

---

## Checklist Before Finishing

- [ ] Smoke tests are limited to health/routing and clearly described.
- [ ] Success paths assert exact status (200/201/204) and response body (id, fields, list shape).
- [ ] Error paths assert exact status (401, 403, 400, 404, 422, etc.) and optionally error body.
- [ ] No use of "status in [200, 404, 500]" for a scenario with one correct outcome.
- [ ] Auth: unauthenticated → 401; wrong role → 403; authenticated success → exact status + body.
- [ ] Setup uses `.env.e2e` and global prefix; URLs use `getGlobalPrefix()`.
- [ ] No silent skips; tests either fail or have preconditions that allow strict assertions.

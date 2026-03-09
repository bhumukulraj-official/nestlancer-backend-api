# AI Prompt: Run Tests

Use this prompt when you need to run tests for the Nestlancer backend API.

---

## Quick Commands (from `package.json`)

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all unit tests (turbo) |
| `pnpm test:unit` | Run unit tests only |
| `pnpm test:integration` | Run integration tests |
| `pnpm test:e2e` | Run E2E tests (requires full stack) |
| `pnpm test:cov` | Run tests with coverage |

---

## E2E Tests — Prerequisites

E2E tests hit the **API Gateway** at `http://localhost:3000`. All services must be running.

> **Docker already running?** If the Docker stack is already up, skip step 1 and go straight to step 2 (verify gateway) and step 3 (run tests). Do not build or start Docker when services are already running.

### 1. Start Docker stack (watch mode) — only if not already running

```bash
pnpm docker:dev
# or
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This starts all services in watch mode. Wait until the gateway and services report they are ready.

### 2. Verify gateway is up

```bash
curl -s http://localhost:3000/api/v1/health | jq
# or
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health
# Expected: 200
```

### 3. Run E2E tests

```bash
pnpm test:e2e
# or via script
./scripts/test/run-e2e.sh
```

**Quick start when Docker is already running:** Skip step 1. Verify gateway (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health` → 200), then run `pnpm test:e2e` or a specific suite. Do not build or start Docker.

### 4. Run specific E2E test files

**By suite name (pattern):**

```bash
pnpm test:e2e:suite 01-health
pnpm test:e2e:suite 02-auth
pnpm test:e2e:suite 04-requests
pnpm test:e2e:suite 18-error-handling
# Or with full pattern:
pnpm test:e2e:suite "18-error-handling"
```

**By file path (direct):**

```bash
# Single file
pnpm jest --config tests/e2e/jest.e2e.config.ts tests/e2e/suites/01-health.e2e-spec.ts

# Multiple files
pnpm jest --config tests/e2e/jest.e2e.config.ts tests/e2e/suites/01-health.e2e-spec.ts tests/e2e/suites/02-auth.e2e-spec.ts
```

**By test name (within a file):**

```bash
# Run only tests whose name matches the pattern
pnpm jest --config tests/e2e/jest.e2e.config.ts tests/e2e/suites/02-auth.e2e-spec.ts -t "login"
```

**Available E2E suite files:**

| File | Description |
|------|-------------|
| `01-health.e2e-spec.ts` | Health checks |
| `02-auth.e2e-spec.ts` | Authentication |
| `03-users.e2e-spec.ts` | Users service |
| `04-requests.e2e-spec.ts` | Requests |
| `05-quotes.e2e-spec.ts` | Quotes |
| `06-projects.e2e-spec.ts` | Projects |
| `07-progress.e2e-spec.ts` | Progress |
| `08-payments.e2e-spec.ts` | Payments |
| `09-messaging.e2e-spec.ts` | Messaging |
| `10-notifications.e2e-spec.ts` | Notifications |
| `11-media.e2e-spec.ts` | Media |
| `12-portfolio.e2e-spec.ts` | Portfolio |
| `13-blog.e2e-spec.ts` | Blog |
| `14-contact.e2e-spec.ts` | Contact |
| `15-admin.e2e-spec.ts` | Admin |
| `16-webhooks.e2e-spec.ts` | Webhooks |
| `17-cross-service-flows.e2e-spec.ts` | Cross-service flows |
| `18-error-handling.e2e-spec.ts` | Error handling |

---

## Checking Logs When Tests Fail (Docker Local)

When E2E tests fail and services run in Docker watch mode, inspect logs to debug.

### All logs (follow mode)

```bash
pnpm logs
# or
docker compose logs -f
```

### Per-service logs (follow, last 100 lines)

| Service | Command |
|---------|---------|
| Gateway | `pnpm logs:gateway` |
| Auth | `pnpm logs:auth` |
| Users | `pnpm logs:users` |
| Payments | `pnpm logs:payments` |
| Projects | `pnpm logs:projects` |
| Requests | `pnpm logs:requests` |
| Quotes | `pnpm logs:quotes` |
| Progress | `pnpm logs:progress` |
| Messaging | `pnpm logs:messaging` |
| Notifications | `pnpm logs:notifications` |
| Media | `pnpm logs:media` |
| Portfolio | `pnpm logs:portfolio` |
| Blog | `pnpm logs:blog` |
| Contact | `pnpm logs:contact` |
| Admin | `pnpm logs:admin` |
| Webhooks | `pnpm logs:webhooks` |
| Health | `pnpm logs:health` |
| WebSocket Gateway | `pnpm logs:ws-gateway` |

### Error-only logs

```bash
pnpm logs:errors
# or
docker compose logs --tail=200 2>&1 | grep -i error
```

### Direct `docker logs` (any container)

```bash
docker logs nestlancer-gateway -f --tail=100
docker logs nestlancer-auth -f --tail=100
# etc.
```

### Debugging a failing E2E test

1. **Identify the failing suite** (e.g. `04-requests`, `08-payments`).
2. **Map suite → services**:
   - `01-health` → gateway, health
   - `02-auth` → auth
   - `03-users` → users
   - `04-requests` → requests
   - `05-quotes` → quotes
   - `06-projects` → projects
   - `07-progress` → progress
   - `08-payments` → payments
   - `09-messaging` → messaging
   - `10-notifications` → notifications
   - `11-media` → media
   - `12-portfolio` → portfolio
   - `13-blog` → blog
   - `14-contact` → contact
   - `15-admin` → admin
   - `16-webhooks` → webhooks
   - `17-cross-service-flows` → multiple services
   - `18-error-handling` → gateway, auth
3. **Tail logs for those services** in separate terminals:
   ```bash
   pnpm logs:gateway    # Terminal 1
   pnpm logs:requests   # Terminal 2 (for 04-requests)
   ```
4. **Re-run the failing suite** and watch logs for errors, stack traces, or 4xx/5xx responses.

---

## Docker Compose Reference

| Script | Description |
|--------|-------------|
| `pnpm docker:dev` | Start full stack in watch mode |
| `pnpm docker:dev:build` | Build and start |
| `pnpm docker:dev:down` | Stop stack |
| `pnpm docker:dev:clean` | Stop and remove volumes |
| `pnpm docker:test` | Start test infra (postgres, redis, rabbitmq) |
| `pnpm docker:up` | Production-like start |
| `pnpm docker:down` | Stop production stack |

---

## Environment for E2E

- **Base URL**: `http://localhost:3000` (or `E2E_BASE_URL`)
- **API prefix**: `/api/v1`
- **Seed data**: `tests/e2e/setup/seed-data.ts` (admin@nestlancer.dev, client@nestlancer.dev)
- **Test suites**: `tests/e2e/suites/*.e2e-spec.ts`

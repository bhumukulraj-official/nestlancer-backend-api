# E2E Tests – Nestlancer Backend API

End-to-end tests validate complete request lifecycles across the full stack:
**API Gateway → Microservices → Database → Workers → External Systems**.

## Prerequisites

- Docker & Docker Compose
- Node.js ≥ 20, pnpm ≥ 9
- Access to infrastructure (PostgreSQL, Redis, RabbitMQ on VPS)

## Quick Start

```bash
# Full lifecycle: start stack → migrate → test → teardown
make test-e2e-full

# Or via pnpm
pnpm test:e2e:docker
```

## Manual Steps

```bash
# 1. Start the E2E Docker stack
make docker-test-up

# 2. Run migrations on the E2E database
export $(grep -v '^#' .env.e2e | grep DATABASE_URL | xargs)
pnpm prisma migrate deploy

# 3. Run E2E tests (all)
make test-e2e

# 4. Run a specific suite
pnpm test:e2e:suite auth

# 5. Teardown
make docker-test-down
```

## Directory Structure

```
tests/e2e/
├── jest.e2e.config.ts        # Jest configuration (60s timeout, sequential)
├── setup.e2e.ts              # Global setup: env loading, health checks
├── tsconfig.e2e.json         # TypeScript config for E2E
├── helpers/                  # Shared utilities
│   ├── http-client.ts        # Axios wrapper for gateway requests
│   ├── auth-helper.ts        # Register, login, JWT utilities
│   ├── ws-client.ts          # Socket.IO test client
│   ├── fixtures.ts           # Shared test data & factory functions
│   ├── mailhog-client.ts     # MailHog API for email assertions
│   ├── rabbitmq-helper.ts    # RabbitMQ publish/consume helpers
│   ├── minio-helper.ts       # MinIO/S3 object assertions
│   ├── wait-for.ts           # Polling, retry & delay utilities
│   └── cleanup.ts            # Test data cleanup (DB, MailHog)
├── gateway/                  # Gateway-level tests
│   ├── gateway-routing.e2e-spec.ts
│   └── middleware-pipeline.e2e-spec.ts
├── flows/                    # Multi-step user journey tests
│   ├── auth-flow.e2e-spec.ts
│   ├── request-to-payment.e2e-spec.ts
│   ├── messaging-flow.e2e-spec.ts
│   ├── media-upload.e2e-spec.ts
│   ├── project-lifecycle.e2e-spec.ts
│   ├── blog-portfolio.e2e-spec.ts
│   └── admin-flow.e2e-spec.ts
├── ws/                       # WebSocket tests
│   ├── messages.gateway.e2e-spec.ts
│   └── notifications.gateway.e2e-spec.ts
└── workers/                  # Worker/event tests
    ├── outbox-poller.e2e-spec.ts
    ├── email-worker.e2e-spec.ts
    ├── notification-worker.e2e-spec.ts
    └── webhook-worker.e2e-spec.ts
```

## How E2E Tests Work

1. **Docker Compose** brings up the full stack (gateway, 16 services, 8 workers, infra)
2. **`setup.e2e.ts`** loads `.env.e2e` and waits for the gateway health check
3. Tests make HTTP requests to `http://localhost:3000/api/v1` (the gateway)
4. Requests are proxied to downstream services — **no mocks, real services**
5. Side effects (emails, queue messages, storage) are asserted via helper clients

## E2E vs Integration Tests

| Aspect | Integration | E2E |
|--------|-------------|-----|
| **Scope** | Single service + real DB | Full stack via gateway |
| **Mocks** | May mock HTTP proxy | No mocks |
| **Startup** | `Test.createTestingModule()` | Full Docker Compose stack |
| **Speed** | ~30s per test | ~60s per test |
| **When** | Every PR | Pre-merge / nightly |

## Environment

E2E tests use `.env.e2e` which differs from `.env.development`:

- **Database**: `nestlancer_e2e` (separate from dev)
- **Redis**: Databases 2/3/4 (isolated from dev DB 0/1)
- **Turnstile**: Always-pass test keys
- **S3 Buckets**: Suffixed with `-test`
- **Logging**: `warn` level (reduced noise)
- **Tracing/Metrics**: Disabled

## Key Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| `testTimeout` | 60,000ms | Network requests through full stack |
| `maxWorkers` | 1 | Sequential to avoid resource contention |
| `forceExit` | true | Clean up open handles (HTTP/WS) |
| `validateStatus` | `() => true` | Let tests assert status codes |

## Writing New Tests

1. Create a `*.e2e-spec.ts` file in the appropriate directory
2. Import helpers from `../helpers/`
3. Use `createHttpClient()` for HTTP requests to the gateway
4. Use `createTestAuthHeaders()` for synthetic JWT (fast, no auth service call)
5. Use `registerAndLogin()` for real auth flow through the service

```typescript
import { createHttpClient, E2EHttpClient } from '../helpers/http-client';
import { createTestAuthHeaders } from '../helpers/auth-helper';

describe('My Feature (E2E)', () => {
    let client: E2EHttpClient;

    beforeAll(() => {
        client = createHttpClient();
    });

    it('should do something', async () => {
        const headers = createTestAuthHeaders('test-user');
        const response = await client.get('/my-endpoint', { headers });
        expect(response.status).toBe(200);
    });
});
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Gateway not healthy | Check `docker compose logs gateway` |
| DB migration fails | Ensure `nestlancer_e2e` database exists |
| Tests timeout | Increase `testTimeout` or check service logs |
| Port conflicts | Ensure dev stack is stopped before E2E |
| MailHog not receiving | Verify SMTP_HOST points to `nestlancer-mailhog` |

## Related Docs

- [E2E Testing Plan](../../docs/guides/e2e-testing-plan.md)
- [Testing Strategy](../../docs/guides/testing-strategy.md)
- [Docker Compose Test](../../docker-compose.test.yml)

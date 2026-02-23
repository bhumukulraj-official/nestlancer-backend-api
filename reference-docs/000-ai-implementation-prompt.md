# 🤖 Nestlancer – Master AI Implementation Prompt

> **How to use this prompt:**
> 1. Copy everything inside the `---START PROMPT---` / `---END PROMPT---` markers below.
> 2. Replace the placeholder `{{TARGET_SECTION}}` with the **exact section heading** you want to implement (see the Section Reference Table).
> 3. Attach the documentation files listed in the **Required Context Files** column for that section.
> 4. Paste into your AI coding assistant and let it implement the section.

---

## Section Reference Table

Use this table to identify which section to target and which files to attach as context.

| # | Section Name (use as `{{TARGET_SECTION}}`) | Required Context Files |
|---|---|---|
| 1 | `1. Project Setup & Configuration (Root)` | `401-project-tracker.md`, `301-dir-structure.md`, `901-tech-stack.md`, `env-details.md` |
| 2 | `2. GitHub CI/CD & Templates` | `401-project-tracker.md`, `301-dir-structure.md`, `901-tech-stack.md` |
| 3 | `3. Documentation (docs/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `100-api-standards-endpoints.md` |
| 4 | `4. Scripts (scripts/)` | `401-project-tracker.md`, `301-dir-structure.md`, `901-tech-stack.md`, `env-details.md` |
| 5 | `5. Docker Configuration (docker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `901-tech-stack.md`, `env-details-extended.md` |
| 6 | `6. Deployment Manifests (deploy/)` | `401-project-tracker.md`, `301-dir-structure.md`, `901-tech-stack.md`, `env-details.md`, `env-details-extended.md` |
| 7 | `7. Database & Prisma (prisma/)` | `401-project-tracker.md`, `301-dir-structure.md`, `501-database.md`, `100-api-standards-endpoints.md` |
| 8 | `8. Shared Libraries (libs/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `901-tech-stack.md`, `501-database.md` |
| 9 | `9. API Gateway (gateway/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `101-health-endpoints.md` |
| 10 | `10. WebSocket Gateway (ws-gateway/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `109-messaging-endpoints.md`, `110-notifications-endpoints.md` |
| 11.1 | `11.1 Health Service (services/health/)` | `401-project-tracker.md`, `301-dir-structure.md`, `101-health-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md` |
| 11.2 | `11.2 Auth Service (services/auth/)` | `401-project-tracker.md`, `301-dir-structure.md`, `102-auth-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.3 | `11.3 Users Service (services/users/)` | `401-project-tracker.md`, `301-dir-structure.md`, `103-users-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.4 | `11.4 Requests Service (services/requests/)` | `401-project-tracker.md`, `301-dir-structure.md`, `104-requests-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.5 | `11.5 Quotes Service (services/quotes/)` | `401-project-tracker.md`, `301-dir-structure.md`, `105-quotes-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.6 | `11.6 Projects Service (services/projects/)` | `401-project-tracker.md`, `301-dir-structure.md`, `106-projects-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.7 | `11.7 Progress Service (services/progress/)` | `401-project-tracker.md`, `301-dir-structure.md`, `107-progress-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.8 | `11.8 Payments Service (services/payments/)` | `401-project-tracker.md`, `301-dir-structure.md`, `108-payments-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md`, `120-webhooks-inbound-endpoints.md` |
| 11.9 | `11.9 Messaging Service (services/messaging/)` | `401-project-tracker.md`, `301-dir-structure.md`, `109-messaging-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.10 | `11.10 Notifications Service (services/notifications/)` | `401-project-tracker.md`, `301-dir-structure.md`, `110-notifications-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.11 | `11.11 Media Service (services/media/)` | `401-project-tracker.md`, `301-dir-structure.md`, `111-media-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.12 | `11.12 Portfolio Service (services/portfolio/)` | `401-project-tracker.md`, `301-dir-structure.md`, `112-portfolio-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.13 | `11.13 Blog Service (services/blog/)` | `401-project-tracker.md`, `301-dir-structure.md`, `113-blog-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.14 | `11.14 Contact Service (services/contact/)` | `401-project-tracker.md`, `301-dir-structure.md`, `114-contact-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.15 | `11.15 Admin Service (services/admin/)` | `401-project-tracker.md`, `301-dir-structure.md`, `115-admin-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 11.16 | `11.16 Webhooks Ingestion Service (services/webhooks/)` | `401-project-tracker.md`, `301-dir-structure.md`, `116-webhooks-endpoints.md`, `120-webhooks-inbound-endpoints.md`, `100-api-standards-endpoints.md`, `117-error-codes-endpoints.md`, `501-database.md` |
| 12.1 | `12.1 Email Worker (workers/email-worker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `901-tech-stack.md` |
| 12.2 | `12.2 Notification Worker (workers/notification-worker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `110-notifications-endpoints.md` |
| 12.3 | `12.3 Audit Worker (workers/audit-worker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `115-admin-endpoints.md` |
| 12.4 | `12.4 Media Worker (workers/media-worker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `111-media-endpoints.md` |
| 12.5 | `12.5 Analytics Worker (workers/analytics-worker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md` |
| 12.6 | `12.6 Webhook Worker (workers/webhook-worker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `116-webhooks-endpoints.md`, `120-webhooks-inbound-endpoints.md` |
| 12.7 | `12.7 CDN Worker (workers/cdn-worker/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md` |
| 12.8 | `12.8 Outbox Poller Worker (workers/outbox-poller/)` | `401-project-tracker.md`, `301-dir-structure.md`, `201-architecture.md`, `501-database.md` |

---

## ---START PROMPT---

You are a senior NestJS backend engineer implementing the **Nestlancer** freelancing platform backend. Nestlancer is a pnpm + Turborepo monorepo with 16 NestJS microservices, 8 RabbitMQ workers, 24 shared libraries, an API Gateway, and a WebSocket Gateway.

### Your Task

Implement **all files and code** described under section **`{{TARGET_SECTION}}`** from the attached `401-project-tracker.md`.

### Critical Rules

1. **Follow the project tracker exactly.** Every `- [ ]` checklist item under the target section must be implemented. Each item contains detailed specifications — read them carefully and implement accordingly.
2. **Follow the directory structure exactly.** Reference `301-dir-structure.md` for the exact file paths and folder hierarchy. Do NOT invent new directories or rename files.
3. **Follow API standards strictly.** All endpoints, request/response formats, error codes, status codes, pagination, filtering, and security patterns must match `100-api-standards-endpoints.md`.
4. **Follow the database schema.** All Prisma model interactions must match the models defined in `501-database.md`. Use the correct field names, types, enums, relations, and indexes.
5. **Follow the endpoint documentation.** If the target section is a service (11.x), implement every endpoint exactly as documented in the corresponding endpoint file (e.g., `102-auth-endpoints.md` for Auth Service). Match the exact HTTP methods, paths, request bodies, response shapes, status codes, and error codes.
6. **Use shared libraries.** Import from `@nestlancer/*` packages (common, config, database, cache, queue, auth-lib, logger, metrics, etc.) rather than reimplementing utilities. Assume these libraries are already built and available.
7. **TypeScript only.** Use strict TypeScript with proper types, interfaces, enums, and decorators. No `any` types unless absolutely necessary.
8. **NestJS patterns.** Use standard NestJS architecture: modules, controllers, services, repositories, DTOs, guards, interceptors, pipes, filters. Each service should follow the Controller → Service → Repository pattern.
9. **Error handling.** Throw typed exceptions from `@nestlancer/common/exceptions` (e.g., `ResourceNotFoundException`, `BusinessLogicException`). Never throw raw `Error` objects.
10. **Validation.** All DTOs must use `class-validator` decorators. All inputs validated and sanitized.
11. **Testing.** Create unit tests for all services and controllers in the corresponding `tests/unit/` directory. Use Jest with mocks from `@nestlancer/testing`.

### Architecture Context

The system follows this request flow:
```
Client → Cloudflare (CDN/Turnstile) → Nginx (TLS/Rate-limit)
  → API Gateway (Auth/RBAC/Validation) → [Service] → PostgreSQL/Redis
  → Outbox Event → RabbitMQ → [Worker]
```

**Key architectural decisions:**
- **Read/Write Split (ADR-005):** Use `PrismaWriteService` for mutations, `PrismaReadService` for queries. Annotate read methods with `@ReadOnly()`.
- **Transactional Outbox (ADR-004):** All domain events published via outbox table within the same DB transaction. Never publish directly to RabbitMQ from services.
- **Idempotency (ADR-007):** Payment and quote operations require `Idempotency-Key` header. Use `@Idempotent()` decorator.
- **Caching (ADR-008):** Use `@Cacheable()` and `@CacheInvalidate()` decorators with tag-based invalidation via Redis.
- **Auth (ADR-003):** JWT access tokens (15min) + refresh tokens (7 days). `@Public()` for unauthenticated routes, `@Roles(UserRole.ADMIN)` for admin-only.

### Tech Stack Reference

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 (LTS) |
| Framework | NestJS 10.x |
| Language | TypeScript 5.x |
| ORM | Prisma 5.x |
| Database | PostgreSQL 16 (primary + read replicas) |
| Cache | Redis 7 (two instances: cache + pub/sub) |
| Queue | RabbitMQ 3.13 |
| Auth | JWT (RS256/HS256), bcrypt, TOTP 2FA |
| Storage | S3-compatible (dual-bucket: private + public) |
| CDN | Cloudflare / CloudFront |
| Payments | Razorpay (INR, amounts in paise) |
| Email | ZeptoMail (transactional), AWS SES (bulk) |
| Validation | class-validator + class-transformer |
| Testing | Jest 29.x |
| Monorepo | pnpm workspaces + Turborepo |

### Coding Standards

- **Files:** `kebab-case.type.ts` (e.g., `create-request.dto.ts`, `auth.service.ts`)
- **Classes:** `PascalCase` (e.g., `AuthService`, `CreateRequestDto`)
- **Methods:** `camelCase` (e.g., `findById`, `createPaymentIntent`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGINATION_LIMIT`)
- **Enums:** `PascalCase` name, `UPPER_SNAKE_CASE` values
- **Barrel exports:** Every module has an `index.ts` exporting all public symbols
- **Currency:** INR only, amounts stored as integers (paise). Use `money.util.ts` for conversions.
- **Dates:** ISO 8601 UTC. Default timezone `Asia/Kolkata` for display.
- **IDs:** UUID v4 via `cuid()` or `crypto.randomUUID()`

### Response Format

All API responses must follow this envelope:

```typescript
// Success
{
  "status": "success",
  "data": { ... },
  "metadata": {
    "timestamp": "2026-01-15T10:30:00.000Z",
    "requestId": "corr-uuid",
    "version": "v1"
  }
}

// Paginated
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "metadata": { ... }
}

// Error
{
  "status": "error",
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": [],
    "timestamp": "2026-01-15T10:30:00.000Z",
    "requestId": "corr-uuid",
    "path": "/api/v1/auth/login"
  }
}
```

### Output Requirements

1. Output the **complete file contents** for every file specified in the target section.
2. Show the **full file path** from the project root before each file.
3. Include all imports, decorators, types, and implementations — no placeholders or `// TODO` comments.
4. Include `package.json` for each package with accurate dependencies.
5. Include unit test files with at minimum happy-path and error-case coverage.

### Pre-Implementation Checklist

Before writing code, mentally verify:
- [ ] Have I read every `- [ ]` item in the target section of `401-project-tracker.md`?
- [ ] Do I know the exact directory structure from `301-dir-structure.md`?
- [ ] Do I know all endpoints, request/response formats, and error codes from the endpoint docs?
- [ ] Do I know the Prisma models and relations from `501-database.md`?
- [ ] Am I importing from `@nestlancer/*` shared libraries instead of reimplementing?
- [ ] Am I using the standard response envelope, error format, and pagination format?
- [ ] Am I following all coding standards (naming, file structure, TypeScript strictness)?

Now implement **`{{TARGET_SECTION}}`**.

## ---END PROMPT---

# 🚧 Project Tracker – Complete Implementation Checklist

This tracker covers every file, module, and component defined in the project structure (`dir-structure.md`), architecture diagrams (`architecture-v2.md`), and API specifications (`endpoints-v2.md`).  
Each entry includes a brief description of what to implement inside the file. Use it to monitor progress and ensure nothing is missed.

---

## 1. Project Setup & Configuration (Root)

### 1.1 Root Configuration Files
- [x] `package.json` – Root monorepo manifest. Define `pnpm` workspaces covering `services/*`, `workers/*`, `libs/*`, `gateway/`, and `ws-gateway/`. Register shared scripts: `dev` (Turborepo parallel dev), `build` (topological build order), `test` (unit + integration + e2e via Jest), `lint` (ESLint + Prettier), `format`, `db:migrate`, `db:seed`, `docker:up`, `docker:down`. Pin shared devDependencies (TypeScript 5.x, ESLint 8.x, Prettier 3.x, Jest 29.x). Set `engines` to Node ≥20 and pnpm ≥9. Include `packageManager` field for Corepack.
- [x] `pnpm-workspace.yaml` – Declare workspace packages: `services/*` (16 NestJS microservices), `workers/*` (8 RabbitMQ workers), `libs/*` (24 shared libraries), `gateway/` (API gateway), `ws-gateway/` (WebSocket gateway). Enables pnpm's workspace protocol for inter-package dependencies (e.g., `"@nestlancer/common": "workspace:*"`).
- [x] `turbo.json` – Turborepo pipeline configuration. Define task dependencies: `build` depends on `^build` (topological), `test` depends on `build`, `lint` has no deps. Configure `dev` as persistent task. Set output directories per task (`dist/**`, `coverage/**`). Enable remote caching for CI. Define environment variable passthrough for `NODE_ENV`, `DATABASE_URL`, etc.
- [x] `tsconfig.base.json` – Base TypeScript config inherited by all packages. Enable `strict: true`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`. Set `module: "commonjs"`, `target: "ES2021"`, `moduleResolution: "node"`. Define path aliases for shared libs: `@nestlancer/common`, `@nestlancer/config`, `@nestlancer/database`, `@nestlancer/cache`, `@nestlancer/queue`, etc. Set `declaration: true` and `declarationMap: true` for library packages.
- [x] `.gitignore` – Standard Node.js ignores (`node_modules/`, `dist/`, `.turbo/`, `coverage/`), plus build artifacts, environment files (`infisical.json`, `.env*`), log files (`*.log`), IDE files (`.vscode/`, `.idea/`), Docker volumes, Prisma generated client (`prisma/generated/`), SSL certificates (`docker/nginx/certs/`).
- [x] `.gitattributes` – Set line endings (`* text=auto`), linguist overrides to exclude generated files from stats (e.g., `*.generated.ts linguist-generated=true`, `prisma/migrations/** linguist-generated=true`). Mark lockfiles as generated.
- [x] `.nvmrc` – Pin Node.js version to `v20.10.0` (LTS). Used by `nvm use` and CI runners. Matches the base Docker image version used in `docker/service-base/Dockerfile.base`.
- [x] `.editorconfig` – Cross-editor consistency: `indent_style = space`, `indent_size = 2` (matches Prettier), `charset = utf-8`, `end_of_line = lf`, `trim_trailing_whitespace = true`, `insert_final_newline = true`. Override for `*.md` to allow trailing whitespace (Markdown line breaks).
- [x] `infisical.json` – Infisical SDK configuration template. Points to the Infisical project/environment for secrets. Covers all env var categories: database (`DATABASE_URL`, `DATABASE_READ_REPLICA_URLS`), cache (`REDIS_CACHE_URL`, `REDIS_PUBSUB_URL`), queue (`RABBITMQ_URL`), auth (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`), payment (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`), storage (`AWS_S3_BUCKET`, `AWS_S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDINARY_URL`), mail (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SES_REGION`), CDN (`CLOUDFRONT_DISTRIBUTION_ID`, `CLOUDFRONT_DOMAIN`), Turnstile (`TURNSTILE_SECRET_KEY`), VAPID keys, and service URLs.
- [x] `infisical.json` (dev) – Development defaults pointing to local Docker services: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestlancer_dev`, `REDIS_CACHE_URL=redis://localhost:6379/0`, `REDIS_PUBSUB_URL=redis://localhost:6379/1`, `RABBITMQ_URL=amqp://guest:guest@localhost:5672`, `SMTP_HOST=localhost` (MailHog on port 1025). Uses test Razorpay keys, debug logging, relaxed rate limits, and CORS `*`.
- [x] `infisical.json` (test) – Test defaults with isolated resources: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestlancer_test` (separate DB to avoid dev data interference), in-memory Redis mock or separate Redis DB index, `LOG_LEVEL=error` (quiet test output), disabled email sending, mock payment provider.
- [x] `.eslintrc.js` – ESLint config using `@typescript-eslint/recommended`, `plugin:prettier/recommended` for auto-formatting. Add NestJS-specific rules. Configure import ordering (`import/order`), no unused vars (warning), explicit return types for services. Extend with custom rules for consistent error handling patterns. Set `parserOptions.project` to `tsconfig.json`.
- [x] `.prettierrc` – Prettier config: `singleQuote: true`, `trailingComma: "all"`, `tabWidth: 2`, `semi: true`, `printWidth: 100`, `arrowParens: "always"`, `endOfLine: "lf"`. Consistent formatting across all packages.
- [x] `.prettierignore` – Skip formatting for: `dist/`, `coverage/`, `node_modules/`, `*.min.js`, `prisma/migrations/`, `docker/`, `deploy/`, `*.hbs` (Handlebars templates), generated files.
- [x] `.lintstagedrc` – Lint-staged config: run `eslint --fix` on `*.ts` files and `prettier --write` on `*.{ts,json,md,yaml,yml}` for staged files only. Ensures code quality before every commit without full-repo scans.
- [x] `.husky/` – Git hooks via Husky
  - [x] `pre-commit` – Execute lint-staged to auto-fix and validate staged files. Prevents committing code that fails lint or format checks.
  - [x] `commit-msg` – Run commitlint against the commit message to enforce Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `perf:`). Ensures clean changelog generation.
- [x] `commitlint.config.js` – Extends `@commitlint/config-conventional`. Enforce types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `build`, `revert`. Set `subject-case` to lower-case, `header-max-length` to 100. Supports scopes matching service/lib names (e.g., `feat(auth): add 2FA`).
- [x] `jest.config.ts` – Root Jest config with `preset: ts-jest`, `testEnvironment: "node"`. Define `projects` pointing to each package's own jest config. Set global coverage thresholds: `branches: 80`, `functions: 80`, `lines: 80`, `statements: 80`. Configure `moduleNameMapper` for path aliases (`@nestlancer/*`). Set `collectCoverageFrom` to exclude `*.module.ts`, `main.ts`, and `*.interface.ts`.
- [x] `docker-compose.yml` – Main Docker Compose defining infrastructure services: PostgreSQL 16 (port 5432, named volume `pgdata`), Redis 7 for cache (port 6379), Redis 7 for pub/sub (port 6380), RabbitMQ 3.13 with management plugin (ports 5672/15672), MailHog for local email testing (ports 1025/8025). Defines a shared `nestlancer-network` bridge network.
- [x] `docker-compose.dev.yml` – Development overrides: bind-mount source code for hot-reload (`./services:/app/services`), expose debug ports (9229 for Node inspector), set `NODE_ENV=development`, enable verbose logging, add healthchecks per service. Optionally includes MinIO (S3 mock, ports 9000/9001) and Jaeger (ports 16686/14268) for local observability.
- [x] `docker-compose.test.yml` – Test overrides: use separate PostgreSQL database (`nestlancer_test`), set `NODE_ENV=test`, run `prisma migrate deploy` on startup, disable email/push workers, reduce Redis memory limits, add `--forceExit` and `--detectOpenHandles` to Jest. Services are ephemeral – containers removed after test runs.
- [x] `docker-compose.prod.yml` – Production overrides (if using Compose): set `restart: unless-stopped`, define resource limits (`mem_limit`, `cpus`), disable debug ports, set `NODE_ENV=production`, configure log drivers (e.g., `json-file` with max-size/max-file), use named volumes with backup-friendly paths.
- [x] `Makefile` – Developer convenience targets: `make install` (pnpm install + Prisma generate), `make dev` (docker-compose up -d + turbo dev), `make test` (run full test suite), `make test-unit` / `make test-e2e`, `make build` (turbo build), `make lint` (turbo lint), `make db-migrate` (Prisma migrate dev), `make db-seed`, `make db-reset`, `make docker-build` (build all images), `make docker-push`, `make clean` (remove dist, coverage, node_modules).
- [x] `LICENSE` – Project license file (MIT, Apache-2.0, or proprietary). Include copyright year and holder name.
- [x] `README.md` – Project overview: Nestlancer – a freelancing platform backend built as a NestJS monorepo. Include badges (CI status, coverage, license). Sections: quick start (prerequisites, clone, install, run), architecture overview (link to `docs/architecture/`), tech stack summary (Node.js, NestJS, PostgreSQL, Redis, RabbitMQ, Prisma), API documentation link, contributing guide, license.

---

## 2. GitHub CI/CD & Templates

### 2.1 Workflows (`.github/workflows/`)
- [ ] `ci.yml` – Continuous integration pipeline. Triggers on push to `main`/`develop` and all PRs. Steps: checkout → pnpm install (cached) → Turborepo lint → Turborepo test (unit + integration with PostgreSQL/Redis service containers) → Turborepo build. Uses matrix strategy for Node 20.x. Uploads coverage reports as artifacts. Fails fast on lint errors. Runs Prisma migrations against test DB before integration tests.
- [ ] `cd-staging.yml` – Staging deployment pipeline. Triggers on push to `main` branch. Steps: run CI checks → build Docker images for gateway, ws-gateway, all services, and workers → tag with `staging-<sha>` → push to container registry (ECR/GHCR) → run `prisma migrate deploy` against staging DB → apply Kubernetes manifests via `kubectl apply -k deploy/kubernetes/overlays/staging` → run smoke tests against staging API → notify Slack on success/failure.
- [ ] `cd-production.yml` – Production deployment pipeline. Triggers on GitHub release creation (tag `v*`). Steps: pull staging-validated images → retag with version and `latest` → push to registry → apply `deploy/kubernetes/overlays/production` → run canary deployment (rolling update with readiness probes) → run production smoke tests → create deployment record in admin service. Requires manual approval via GitHub environment protection rules.
- [ ] `codeql-analysis.yml` – GitHub CodeQL security scanning. Runs on schedule (weekly) and on PRs. Analyze `javascript-typescript` language. Scans for common vulnerabilities: SQL injection, XSS, path traversal, insecure deserialization. Reports findings as GitHub Security alerts.
- [ ] `dependency-review.yml` – Runs on PRs to check new/updated dependencies for known vulnerabilities using GitHub's dependency review action. Fails PR if any critical/high severity CVEs are found. Checks license compatibility.
- [ ] `release.yml` – Automated release process. Triggers on manual dispatch or version tag. Steps: generate changelog from conventional commits (using `conventional-changelog`), create GitHub release with release notes, bump version in `package.json`, optionally publish shared libs to npm registry.

### 2.2 Issue Templates (`.github/ISSUE_TEMPLATE/`)
- [ ] `bug_report.md` – Structured bug report template with fields: summary, steps to reproduce, expected vs actual behavior, environment (OS, Node version, browser), service affected (dropdown: auth, users, payments, etc.), severity (critical/high/medium/low), screenshots/logs, and a checkbox for "I have searched existing issues".
- [ ] `feature_request.md` – Feature request template with fields: problem statement ("As a [user/admin], I want..."), proposed solution, alternative approaches considered, acceptance criteria, affected services, estimated complexity (small/medium/large), and mockups/diagrams if applicable.
- [ ] `config.yml` – Issue template chooser config. Disable blank issues to enforce template usage. Add contact links: Discord server, documentation site, Stack Overflow tag. List available templates with descriptions.

### 2.3 Pull Request & Community Files
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` – PR template with sections: description of changes, type of change (feature/bugfix/refactor/docs/chore), related issue number, checklist (tests added, docs updated, migrations included, no breaking changes), testing done (unit/integration/manual), screenshots for UI-related changes, deployment notes.
- [ ] `.github/CODEOWNERS` – Code ownership mapping: `services/auth/` → @backend-lead, `services/payments/` → @backend-lead, `libs/*` → @platform-team, `prisma/` → @backend-lead, `deploy/` → @devops-team, `docker/` → @devops-team, `.github/` → @admin. Ensures relevant reviewers are auto-assigned on PRs.
- [ ] `.github/dependabot.yml` – Dependabot config for automated dependency updates. Configure `npm` ecosystem (weekly schedule, `/` directory, group minor/patch updates, target `main` branch, max 10 open PRs). Configure `docker` ecosystem for Dockerfile base image updates. Configure `github-actions` ecosystem for workflow action updates. Set version update labels and reviewers.

---

## 3. Documentation (`docs/`)

### 3.1 API Documentation (`docs/api/`)
- [ ] `openapi.yaml` – Complete OpenAPI 3.0 specification covering all 428+ endpoints across 16 services. Define schemas for all request/response DTOs, common components (pagination, error responses, standard headers). Include security schemes (JWT Bearer, API Key, Webhook Signature). Document rate limiting per endpoint, Turnstile requirements, and idempotency keys. Organize by tags matching service names (Auth, Users, Requests, Quotes, Projects, Progress, Payments, Messaging, Notifications, Media, Portfolio, Blog, Contact, Admin, Webhooks).
- [ ] `openapi-v1.json` – JSON version of the OpenAPI spec, auto-generated from `openapi.yaml` via build step. Used by Swagger UI, code generators, and API testing tools. Kept in sync with YAML source.
- [ ] `postman-collection.json` – Postman collection with pre-configured requests for all endpoints. Organize in folders by service. Include environment variables for `baseUrl`, `accessToken`, `refreshToken`, `adminToken`. Add pre-request scripts for auto-authentication and test scripts for response validation. Include example payloads for common flows: registration → login → create request → receive quote → accept → project tracking → payment.
- [ ] `endpoints-reference.md` – Human-readable endpoint reference listing all routes, methods, descriptions, authentication requirements, and rate limits in tabular format. Can be auto-generated from OpenAPI spec. Quick reference for developers without needing Swagger UI.

### 3.2 Architecture (`docs/architecture/`)
- [ ] `overview.md` – High-level system overview: NestJS monorepo with API Gateway + WebSocket Gateway routing to 16 microservices (health, auth, users, requests, quotes, projects, progress, payments, messaging, notifications, media, portfolio, blog, contact, admin, webhooks). 8 async workers (email, notification, audit, media, analytics, webhook, CDN, outbox-poller). Infrastructure: PostgreSQL (primary + read replicas via Patroni), Redis (cache + pub/sub), RabbitMQ (event bus), S3 + CloudFront (media + CDN). Request flow: Client → Cloudflare (CDN/Turnstile) → Nginx (SSL/rate-limit) → API Gateway (auth/RBAC/validation) → Service → DB.
- [ ] `system-diagram.mmd` – Mermaid diagram visualizing the full architecture from `201-architecture.md`: external systems layer (Cloudflare, Razorpay, GitHub, SMTP), entry layer (Nginx, API Gateway, WS Gateway), middleware pipeline (CORS → tracer → auth → rate-limit → validation → CSRF), feature modules (16 services), admin domain, webhook ingestion, core infrastructure (PostgreSQL R/W split, Redis cache/pubsub, RabbitMQ exchanges), async workers, realtime layer, and dead-letter queue.
- [ ] `data-flow.md` – End-to-end data flow documentation covering key business flows: (1) Client Registration: register → verify email → complete profile. (2) Project Lifecycle: submit request → admin reviews → send quote → client accepts → project created → milestones tracked → deliverables uploaded → client approves → payment released. (3) Payment Flow: create intent → Razorpay order → client pays → webhook confirms → payment recorded → receipt generated. (4) Real-time Messaging: REST send → DB persist → RabbitMQ event → notification worker → Redis pub/sub → WS gateway → client receives.
- [ ] `database-schema.md` – ER diagram description covering all Prisma models grouped by domain: User (User, UserPreference, UserSession), Auth (LoginAttempt, RefreshToken, EmailVerificationToken, PasswordResetToken), Project (Project, ProjectFeedback), Request (Request, RequestAttachment, RequestNote), Quote (Quote, QuoteLineItem, QuotePaymentBreakdown), Progress (ProgressEntry, Milestone, Deliverable), Payment (Payment, PaymentIntent, PaymentMethod, PaymentMilestone, Refund, PaymentDispute), Message (Message, Conversation, MessageReaction, MessageReadReceipt), Notification (Notification, NotificationPreference, PushSubscription), Media (Media, MediaVersion, MediaShareLink), Portfolio (PortfolioItem, PortfolioCategory, PortfolioTag), Blog (Post, Comment, BlogCategory, BlogTag, Bookmark), Contact (ContactMessage), Admin (SystemConfig, EmailTemplate, FeatureFlag, AuditLog, Webhook, Backup), and infrastructure models (OutboxEvent, IdempotencyKey).
- [ ] `event-catalog.md` – Complete catalog of all domain events published to RabbitMQ via the transactional outbox pattern. Organized by service: `user.registered`, `user.verified`, `auth.login.success`, `auth.login.failed`, `request.submitted`, `request.status_changed`, `quote.sent`, `quote.accepted`, `quote.declined`, `project.created`, `project.status_changed`, `milestone.completed`, `deliverable.uploaded`, `deliverable.approved`, `payment.initiated`, `payment.completed`, `payment.failed`, `payment.refunded`, `message.sent`, `notification.created`, `media.uploaded`, `media.processed`, `portfolio.published`, `blog.post.published`, `contact.received`, `webhook.delivery.failed`. Include event payload schemas and routing keys.
- [ ] `queue-topology.md` – RabbitMQ topology documentation. Exchanges: `nestlancer.events` (topic exchange for domain events), `nestlancer.webhooks` (direct exchange for outbound webhook deliveries), `nestlancer.dlx` (dead-letter exchange). Queues with routing keys: `email.queue` (binds `email.*`), `notification.queue` (binds `notification.*`), `audit.queue` (binds `audit.*`), `media.queue` (binds `media.*`), `analytics.queue` (binds `analytics.*`), `webhook.queue` (binds `webhook.*`), `cdn.queue` (binds `cdn.*`). DLQ configuration with TTL and max retry counts. Consumer prefetch settings per worker type.
- [ ] `websocket-protocol.md` – WebSocket protocol specification. Connection: `wss://api.nestlancer.com/ws/messages` and `wss://api.nestlancer.com/ws/notifications`. Authentication via JWT token in connection query params or first message. Room model: project-based rooms (e.g., `project:projAbc123`). Events: `message:new`, `message:edited`, `message:deleted`, `typing:start`, `typing:stop`, `presence:online`, `presence:offline`, `notification:new`, `notification:read`. Heartbeat via ping/pong every 30s. Reconnection strategy with exponential backoff. Redis pub/sub adapter for multi-instance scaling.

### 3.3 ADRs (`docs/adr/`)
- [ ] `001-monorepo-structure.md` – Decision to use pnpm workspaces + Turborepo for the monorepo. Rationale: shared code via `libs/*`, consistent tooling, single CI pipeline, atomic refactors across services. Alternatives considered: Nx (too opinionated), Lerna (deprecated for new projects), polyrepo (too much overhead for a single team). Trade-offs: larger repo, need for build caching.
- [ ] `002-database-choice.md` – Decision to use PostgreSQL with read replicas. Rationale: ACID compliance for payments, JSONB for flexible metadata, full-text search via `tsvector`, mature ecosystem, Prisma ORM support. Read replicas via Patroni for scaling reads (portfolio, blog, analytics). Alternative considered: MongoDB (rejected for lack of transactions across collections).
- [ ] `003-auth-strategy.md` – Decision on JWT with refresh tokens and dual delivery (httpOnly cookies for web, Bearer header for mobile/API). Access token: 15min expiry, RS256 signed. Refresh token: 7 day expiry, stored in DB, rotated on use. CSRF protection via double-submit cookie pattern for cookie-based auth. 2FA via TOTP (speakeasy library). Account lockout after 5 failed attempts.
- [ ] `004-outbox-pattern.md` – Decision to use transactional outbox for reliable event publishing. Pattern: write event to `OutboxEvent` table in the same transaction as the business operation → outbox-poller worker polls and publishes to RabbitMQ → marks as published. Guarantees at-least-once delivery. Avoids dual-write problem between DB and queue.
- [ ] `005-read-write-split.md` – Decision to use separate Prisma clients for reads and writes. `PrismaWriteService` connects to primary PostgreSQL. `PrismaReadService` connects to read replica(s). Services annotate methods with `@ReadOnly()` or `@WriteOnly()` decorators. Default is write client for safety. Read replica lag tolerance: 100ms for most endpoints.
- [ ] `006-queue-topology.md` – Decision on RabbitMQ exchange and queue architecture. Topic exchange for domain events (flexible routing), direct exchange for webhooks (targeted delivery). Persistent messages with publisher confirms. Consumer acknowledgment with manual ack. Dead-letter exchange for failed messages after 3 retries with exponential backoff (1s, 5s, 30s).
- [ ] `007-idempotency-strategy.md` – Decision on idempotency key implementation using Redis (fast check, 24h TTL) + PostgreSQL (durable store). Required for: payment initiation, payment confirmation, quote acceptance, request submission, milestone release. Client provides `Idempotency-Key` header (UUID v4). Server returns cached response for duplicate keys within 24h window. Guard + interceptor pattern in NestJS.
- [ ] `008-caching-strategy.md` – Decision on Redis caching with tag-based invalidation. Cache layers: HTTP response cache (ETag/If-None-Match via interceptor), application cache (Redis with TTL per entity type), database query cache (Prisma query results). TTLs: health checks 30s, portfolio/blog public pages 1h, user profiles 5min, system config 24h. Invalidation: tag-based (e.g., invalidate all `portfolio:*` on portfolio update). Cache-aside pattern for reads.

### 3.4 Runbooks (`docs/runbooks/`)
- [ ] `incident-response.md` – Incident response playbook: (1) Detection via Grafana alerts or PagerDuty. (2) Triage: determine severity (P1-P4) based on user impact. (3) Mitigation: enable maintenance mode via admin API, scale affected services, failover DB if needed. (4) Communication: update status page, notify affected users. (5) Resolution: deploy fix or rollback. (6) Post-mortem: blameless review within 48h, document timeline, root cause, action items.
- [ ] `database-failover.md` – PostgreSQL failover procedure: (1) Detect primary failure via Patroni health checks. (2) Patroni auto-promotes replica to primary. (3) Update connection strings in Infisical/K8s secrets. (4) Restart affected services to pick up new primary. (5) Verify write operations. (6) Rebuild old primary as new replica. (7) Validate replication lag is zero.
- [ ] `queue-recovery.md` – RabbitMQ recovery: (1) Check queue depths via management UI (port 15672). (2) If consumers are down: restart worker deployments. (3) If queue is backed up: scale worker replicas horizontally. (4) If RabbitMQ node is down: failover to cluster member (if clustered) or restart. (5) Verify no messages lost by checking outbox table for unpublished events.
- [ ] `dlq-processing.md` – Dead-letter queue processing guide: (1) Monitor DLQ depth via Grafana dashboard. (2) Inspect failed messages: `rabbitmqadmin get queue=dlq`. (3) Categorize failures: transient (retry), permanent (log and discard), bug (fix and replay). (4) Replay messages using admin API endpoint. (5) For bulk replay: use `scripts/db/replay-dlq.sh`. (6) Set up alerts when DLQ depth exceeds threshold.
- [ ] `scaling-guide.md` – Horizontal scaling guide. Services: scale via K8s HPA based on CPU (70% threshold) or custom metrics (request latency p99). Workers: scale based on queue depth (RabbitMQ queue length metric). Database: add read replicas for read-heavy loads, upgrade instance class for write-heavy. Redis: increase memory limit, consider Redis Cluster for >64GB. Queue: add RabbitMQ cluster nodes. Identify bottlenecks using Prometheus metrics and Grafana dashboards.
- [ ] `deployment-checklist.md` – Pre-deployment verification: (1) All CI checks pass. (2) Database migrations reviewed and tested. (3) Environment variables updated in Infisical for target environment. (4) Feature flags configured for gradual rollout. (5) Rollback plan documented. (6) Monitoring dashboards open. (7) On-call engineer notified. (8) Changelog updated. (9) API version compatibility verified (no breaking changes in v1).

### 3.5 Developer Guides (`docs/guides/`)
- [ ] `getting-started.md` – Quick start guide: prerequisites (Node.js 20+, pnpm 9+, Docker Desktop), clone repo, `pnpm install`, copy `infisical.json.example` → `infisical.json`, `make dev` (starts Docker services + all apps). Verify: `curl http://localhost:3000/api/v1/health`. Access RabbitMQ management at `localhost:15672`, MailHog at `localhost:8025`.
- [ ] `local-development.md` – Detailed dev setup: Docker service management, running individual services (`pnpm --filter @nestlancer/auth dev`), debugging with VS Code (attach to port 9229), hot-reload configuration, database seeding (`pnpm db:seed`), viewing logs (`make watch-logs`), running Prisma Studio (`pnpm prisma studio`), testing WebSocket connections with `wscat`.
- [ ] `testing-strategy.md` – Testing pyramid: unit tests (Jest, mock dependencies, fast, 80%+ coverage target), integration tests (test with real DB via test containers, test API endpoints, test queue publishing), e2e tests (full request lifecycle from HTTP to DB, use supertest). How to run: `pnpm test` (unit), `pnpm test:integration` (needs Docker), `pnpm test:e2e` (full stack). Fixtures and factories pattern using `@nestlancer/testing` lib.
- [ ] `coding-standards.md` – Naming conventions: files (`kebab-case.type.ts`), classes (`PascalCase`), methods (`camelCase`), constants (`UPPER_SNAKE_CASE`), enums (`PascalCase` with `UPPER_SNAKE_CASE` values). Error handling: always throw custom exceptions from `@nestlancer/common/exceptions`. Response format: always use `TransformResponseInterceptor`. DTOs: use `class-validator` decorators, all inputs validated. Services: single responsibility, inject dependencies via constructor.
- [ ] `adding-new-service.md` – Step-by-step: (1) Create `services/<name>/` directory with NestJS scaffold. (2) Add to `pnpm-workspace.yaml`. (3) Create Dockerfile extending `service-base`. (4) Add K8s manifests in `deploy/kubernetes/services/<name>/`. (5) Add route in gateway `routes.config.ts`. (6) Create Prisma models in `prisma/schema/<name>.prisma`. (7) Add health endpoint. (8) Register with service registry. (9) Update `401-project-tracker.md`.
- [ ] `adding-new-worker.md` – Step-by-step: (1) Create `workers/<name>-worker/` directory. (2) Import `QueueModule` from `@nestlancer/queue`. (3) Define consumer class extending base consumer with queue name and routing key binding. (4) Implement processor for each event type. (5) Create Dockerfile extending `worker-base`. (6) Add K8s deployment in `deploy/kubernetes/workers/<name>-worker/` with HPA based on queue depth. (7) Add routing key constants in `libs/queue/`. (8) Test with mock messages.
- [ ] `environment-variables.md` – Complete environment variable reference organized by category. For each variable: name, description, required/optional, default value, example, which services use it. Categories: App (NODE_ENV, PORT, LOG_LEVEL), Database (DATABASE_URL, DATABASE_READ_REPLICA_URLS), Redis (REDIS_CACHE_URL, REDIS_PUBSUB_URL), RabbitMQ (RABBITMQ_URL), JWT (secrets, expiry), Payment (Razorpay keys), Storage (S3/Cloudinary), Mail (SMTP/SES), CDN (CloudFront), Security (Turnstile, CORS, CSRF), VAPID (web push keys), Frontend (FRONTEND_URL).

### 3.6 Changelog (`docs/changelog/`)
- [ ] `CHANGELOG.md` – Release notes following [Keep a Changelog](https://keepachangelog.com/) format. Sections per version: Added, Changed, Deprecated, Removed, Fixed, Security. Auto-generated from conventional commit messages via `conventional-changelog`. Current version: v1.1.0 with 428 endpoints across 15 services.
- [ ] `MIGRATION_GUIDE.md` – Breaking changes documentation for major version upgrades. For each breaking change: what changed, why, migration steps with code examples, compatibility notes. Currently empty (v1 is initial release). Will be critical for v2.0.0 planned changes.

---

## 4. Scripts (`scripts/`)

### 4.1 Setup Scripts (`scripts/setup/`)
- [ ] `init-project.sh` – One-time project initialization. Steps: check prerequisites (Node.js 20+, pnpm 9+, Docker), run `pnpm install`, copy `infisical.json.example` to `infisical.json` for dev/staging/prod, call `generate-secrets.sh` to populate JWT secrets and API keys, run `prisma generate` to create Prisma client, display next steps to developer.
- [ ] `install-dependencies.sh` – Runs `pnpm install --frozen-lockfile` for CI or `pnpm install` for dev. Handles Prisma client generation post-install via `postinstall` hook. Validates pnpm and Node versions match `.nvmrc` and `package.json` engines.
- [ ] `setup-local-env.sh` – Automated local environment setup: start Docker services (`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`), wait for PostgreSQL/Redis/RabbitMQ healthchecks, run `prisma migrate dev` to apply all migrations, run `prisma db seed` to populate base + dev data, display service URLs (API, RabbitMQ management, MailHog, Prisma Studio).
- [ ] `generate-secrets.sh` – Generate cryptographically secure random values using `openssl rand` or Node.js `crypto.randomBytes`. Outputs: `JWT_ACCESS_SECRET` (RS256 keypair or 64-char hex), `JWT_REFRESH_SECRET` (separate 64-char hex), `CSRF_SECRET` (32-char hex), `RAZORPAY_WEBHOOK_SECRET` (for dev/test), `WEBHOOK_SIGNING_SECRET`. Writes values to `infisical.json` or outputs to stdout for manual copy.

### 4.2 Database Scripts (`scripts/db/`)
- [ ] `migrate.sh` – Run Prisma migrations on the primary PostgreSQL database. Accepts environment argument (`dev`, `staging`, `production`). Dev mode: `prisma migrate dev` (generates migration files). Staging/Prod: `prisma migrate deploy` (applies pending migrations only). Includes pre-migration backup prompt for production. Validates `DATABASE_URL` is set.
- [ ] `seed.sh` – Execute seed scripts in order: `01-roles` → `02-admin-user` → `03-categories` → `04-tags` → `05-email-templates` → `06-notification-templates` → `08-feature-flags` → `09-system-config`. In dev mode, also runs `dev/10-test-users` through `dev/13-test-blog-posts`. Uses `prisma db seed` with `ts-node` runner. Idempotent – checks for existing data before inserting.
- [ ] `reset.sh` – Full database reset: drop all tables (`prisma migrate reset --force`), recreate schema, apply all migrations, run seeds. Prompts for confirmation unless `--force` flag is passed. Used during development when schema changes significantly. Never run in production.
- [ ] `backup.sh` – PostgreSQL backup using `pg_dump`: creates timestamped compressed backup (`nestlancer_YYYY-MM-DD_HH-MM.sql.gz`). Supports full backup or schema-only (`--schema-only`). Optionally uploads to S3 bucket. Accepts `DATABASE_URL` from environment or `infisical.json`. Outputs backup file path and size.
- [ ] `restore.sh` – Restore from backup: decompress and replay SQL via `psql`. Accepts backup file path as argument. Drops existing data before restore (`--clean` flag). Validates backup format before proceeding. Runs post-restore migration check to ensure schema is current.

### 4.3 Docker Scripts (`scripts/docker/`)
- [ ] `build-all.sh` – Build Docker images for all deployable components: `nestlancer-gateway`, `nestlancer-ws-gateway`, `nestlancer-<service>` (16 services), `nestlancer-<worker>` (8 workers). Uses multi-stage builds from respective Dockerfiles. Tags with git SHA and `latest`. Leverages Docker BuildKit for layer caching. Accepts `--parallel` flag for concurrent builds.
- [ ] `push-all.sh` – Tag and push all built images to container registry (AWS ECR or GitHub Container Registry). Tags: `<registry>/<image>:<version>`, `<registry>/<image>:latest`, `<registry>/<image>:<git-sha>`. Requires `docker login` or AWS ECR `get-login-password`. Validates all images exist locally before pushing.
- [ ] `clean.sh` – Docker cleanup: remove stopped containers (`docker container prune`), dangling images (`docker image prune`), unused volumes (`docker volume prune --filter label!=persist`), unused networks. Optionally remove all project images (`docker images nestlancer-* -q | xargs docker rmi`). Reclaims disk space after heavy development.

### 4.4 Deploy Scripts (`scripts/deploy/`)
- [ ] `deploy-staging.sh` – Deploy to staging Kubernetes cluster: authenticate with kubectl context, run `kubectl apply -k deploy/kubernetes/overlays/staging`, wait for rollout (`kubectl rollout status`), run health check against staging URL (`/api/v1/health`), output deployment summary (pod count, image versions). Includes rollback on health check failure.
- [ ] `deploy-production.sh` – Production deployment with safety checks: verify staging health first, confirm deployment with prompt, apply `deploy/kubernetes/overlays/production`, monitor rolling update progress, run smoke tests against production health and critical endpoints (auth, payments), notify team via Slack webhook on completion. Supports canary deployments with `--canary` flag.
- [ ] `rollback.sh` – Rollback to previous deployment: `kubectl rollout undo deployment/<service-name>`. Accepts service name or `--all` to rollback everything. Shows current and previous revision details before rollback. Verifies health after rollback. Logs rollback event to audit service.

### 4.5 Development Scripts (`scripts/dev/`)
- [ ] `start-services.sh` – Start infrastructure services via Docker Compose: PostgreSQL, Redis (cache + pubsub), RabbitMQ, MailHog. Uses `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`. Waits for all services to pass healthchecks before returning. Optionally starts MinIO and Jaeger with `--full` flag.
- [ ] `start-workers.sh` – Start all 8 RabbitMQ workers in dev mode with hot-reload: email-worker, notification-worker, audit-worker, media-worker, analytics-worker, webhook-worker, cdn-worker, outbox-poller. Uses `concurrently` or Turborepo to run in parallel. Each worker connects to local RabbitMQ and watches for file changes.
- [ ] `start-gateway.sh` – Start API Gateway in dev mode on port 3000 (default) with NestJS hot-reload (`nest start --watch`). Configures routes to all local services. Enables Swagger UI at `/api/docs`. Sets debug port 9229 for VS Code attach.
- [ ] `start-all.sh` – Start the complete development stack: (1) infrastructure via `start-services.sh`, (2) run migrations, (3) start all 16 services, (4) start gateway and ws-gateway, (5) start all workers. Uses Turborepo `turbo dev` for parallel execution with dependency awareness. Outputs all service URLs on completion.
- [ ] `watch-logs.sh` – Tail logs from all running Docker containers: `docker-compose logs -f --tail=100`. Supports filtering by service name (`--service=auth`). Color-coded output per service. Optionally saves to file with `--output=logs/dev.log`.
- [ ] `generate-types.sh` – Generate Prisma client types (`prisma generate`), export shared TypeScript types from `libs/common` for potential frontend consumption. Validates all type exports compile correctly. Used after schema changes to propagate types across the monorepo.

### 4.6 Test Scripts (`scripts/test/`)
- [ ] `run-unit.sh` – Run unit tests across all packages: `turbo test --filter=!*e2e*`. Uses Jest with `--passWithNoTests` for packages without tests yet. Generates coverage report (text + lcov). Fails if coverage drops below thresholds (80% lines/branches/functions). Runs in parallel via Turborepo.
- [ ] `run-e2e.sh` – Run end-to-end tests: ensures Docker services are running, applies test migrations, seeds test data, runs `jest --config jest.e2e.config.ts` against full API. Tests complete request flows (registration → project → payment). Cleans up test data after run. Requires `docker-compose.test.yml` stack.
- [ ] `run-integration.sh` – Run integration tests with real database: spins up test PostgreSQL container (or uses `docker-compose.test.yml`), applies migrations, runs tests tagged with `@integration`. Tests: Prisma queries, repository methods, queue publishing, cache operations. Resets DB between test suites for isolation.
- [ ] `coverage-report.sh` – Generate consolidated coverage report across all packages: merge individual `coverage/lcov.info` files, generate HTML report via `istanbul report html`, open in browser (`open coverage/index.html`). Optionally upload to Codecov or Coveralls for PR badge reporting.

---

## 5. Docker Configuration (`docker/`)

### 5.1 Service Dockerfiles
- [ ] `gateway/Dockerfile` – Multi-stage build for API Gateway. Stage 1 (`builder`): `FROM node:20-alpine`, install pnpm, copy workspace root + gateway source + shared libs, `pnpm install --frozen-lockfile`, `pnpm build --filter=@nestlancer/gateway`. Stage 2 (`runner`): `FROM node:20-alpine`, copy only `dist/` and `node_modules/` (pruned production deps), set `NODE_ENV=production`, expose port 3000, `CMD ["node", "dist/main.js"]`. Add healthcheck: `HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/api/v1/health || exit 1`.
- [ ] `ws-gateway/Dockerfile` – Multi-stage build for WebSocket Gateway, same pattern as gateway. Expose port 3001 (WS default). Healthcheck via WebSocket ping or HTTP health endpoint. Include Redis adapter dependencies for multi-instance scaling.
- [ ] `service-base/Dockerfile.base` – Shared base image for all 16 NestJS microservices. Stage 1: install pnpm, copy shared libs (`libs/common`, `libs/config`, `libs/database`, etc.), install base dependencies. Services extend this with `FROM nestlancer/service-base:latest`, copy their specific source, and build. Reduces build time and image size by sharing common layers across all services.
- [ ] `worker-base/Dockerfile.base` – Shared base image for all 8 RabbitMQ workers. Similar to service-base but includes worker-specific dependencies (amqplib, queue utilities). Workers extend this, copy their processors/consumers, and build. No HTTP port exposed (workers are consumers only). Healthcheck via RabbitMQ connection status.

### 5.2 Nginx (`docker/nginx/`)
- [ ] `nginx.conf` – Main Nginx config: `worker_processes auto`, `worker_connections 1024`, `keepalive_timeout 65`, `client_max_body_size 50m` (for file uploads per media service limits), gzip compression for JSON/text responses, logging format with `$request_id` for correlation, include `conf.d/*.conf`.
- [ ] `conf.d/` – Virtual host configurations
  - [ ] `api-gateway.conf` – Reverse proxy to API Gateway on port 3000. Route `/api/v1/*` to gateway upstream. Set proxy headers: `X-Forwarded-For`, `X-Real-IP`, `X-Request-ID` (generate UUID if not present). Configure upstream with keepalive connections. Add `proxy_read_timeout 60s` for standard requests, `proxy_read_timeout 300s` for file upload endpoints.
  - [ ] `ws-gateway.conf` – WebSocket proxy to WS Gateway on port 3001. Route `/ws/*` to ws-gateway upstream. Set `proxy_http_version 1.1`, `proxy_set_header Upgrade $http_upgrade`, `proxy_set_header Connection "upgrade"`. Configure `proxy_read_timeout 3600s` for long-lived WebSocket connections. Enable sticky sessions for Socket.IO compatibility.
  - [ ] `rate-limiting.conf` – Nginx rate limiting zones: `limit_req_zone $binary_remote_addr zone=general:10m rate=100r/s`, `limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/s` (strict for login/register), `limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/s`. Apply per-location: `limit_req zone=auth burst=5 nodelay`. Return 429 with `Retry-After` header on limit exceeded.
  - [ ] `ssl.conf` – SSL/TLS configuration: `ssl_protocols TLSv1.2 TLSv1.3`, `ssl_prefer_server_ciphers on`, `ssl_ciphers` with modern cipher suite, `ssl_session_timeout 1d`, `ssl_session_cache shared:SSL:50m`, HSTS header (`max-age=31536000; includeSubDomains`), OCSP stapling enabled, certificate paths from `certs/` directory.
- [ ] `certs/.gitkeep` – Placeholder directory for SSL certificates and private keys. Never commit actual certs – use certbot or cloud provider certificates. In development, use self-signed certs or skip SSL (connect directly to gateway).

### 5.3 Monitoring Stack (`docker/monitoring/`)
- [ ] `prometheus/`
  - [ ] `prometheus.yml` – Prometheus scrape configuration. Targets: API Gateway (`:3000/metrics`), WS Gateway (`:3001/metrics`), each service (`:PORT/metrics`), PostgreSQL exporter (`:9187`), Redis exporter (`:9121`), RabbitMQ exporter (`:9419`), Node exporter (`:9100`). Scrape interval: 15s for services, 30s for infrastructure. Global evaluation interval: 15s. Remote write to long-term storage (optional).
  - [ ] `alert-rules.yml` – Prometheus alerting rules. Critical: `ServiceDown` (instance unreachable for 5m), `HighErrorRate` (5xx rate >5% for 5m), `DatabaseConnectionPoolExhausted`, `QueueBacklog` (queue depth >1000 for 10m), `DiskSpaceLow` (<10% free), `HighMemoryUsage` (>90% for 10m). Warning: `SlowResponseTime` (p99 >2s), `CacheHitRateLow` (<80%), `ReplicationLag` (>1s).
- [ ] `grafana/`
  - [ ] `provisioning/dashboards/`
    - [ ] `dashboard.yml` – Grafana dashboard provisioning config. Auto-load dashboards from JSON files on startup. Set default organization and folder.
    - [ ] `api-overview.json` – API metrics dashboard: request rate (RPM), latency percentiles (p50/p95/p99), error rate by status code, top endpoints by traffic, active connections, response size distribution. Filterable by service and time range.
    - [ ] `service-health.json` – Service health dashboard: up/down status for all 16 services + 2 gateways + 8 workers, CPU/memory usage per pod, restart count, readiness/liveness probe status, pod count vs HPA target.
    - [ ] `queue-metrics.json` – RabbitMQ dashboard: queue depths per queue (email, notification, audit, media, analytics, webhook, cdn), consumer count, message publish/consume rates, unacked messages, DLQ depth, connection count.
    - [ ] `database-metrics.json` – PostgreSQL dashboard: active connections, connection pool utilization, query duration histograms, replication lag, transactions per second, table sizes, index usage, slow query log.
    - [ ] `worker-metrics.json` – Worker performance dashboard: jobs processed per minute per worker, average processing time, failure rate, retry count, DLQ messages per worker type, consumer lag.
  - [ ] `provisioning/datasources/datasource.yml` – Grafana datasource provisioning: Prometheus (default, URL `http://prometheus:9090`), optional Jaeger for traces. Set as default datasource for all dashboards.
  - [ ] `grafana.ini` – Grafana server config: `http_port = 3200`, anonymous access enabled for dev (read-only), admin credentials from environment variables, disable user signup, configure email notification channel for alerts.
- [ ] `jaeger/`
  - [ ] `jaeger-config.yml` – Jaeger all-in-one configuration for distributed tracing. Collector endpoint for OpenTelemetry traces from services. Storage: in-memory for dev, Elasticsearch/Cassandra for production. Sampling strategy: probabilistic 1% in production, 100% in development. UI port: 16686. Collector port: 14268 (HTTP) / 14250 (gRPC).
- [ ] `alertmanager/`
  - [ ] `alertmanager.yml` – Alertmanager config for routing Prometheus alerts. Receivers: `slack-critical` (immediate Slack notification for P1), `slack-warning` (batched warnings), `pagerduty` (P1 incidents), `email-admin` (daily digest). Route tree: critical alerts → PagerDuty + Slack, warnings → Slack only, info → email digest. Inhibition rules: suppress warnings when critical alert is active for same service. Repeat interval: 4h for unresolved alerts.

---

## 6. Deployment Manifests (`deploy/`)

### 6.1 Kubernetes (`deploy/kubernetes/`)

#### 6.1.1 Base (`deploy/kubernetes/base/`)
- [ ] `namespace.yaml` – Create Kubernetes namespace `nestlancer` for all project resources. Apply resource quotas (max CPU, memory per namespace) and limit ranges (default container limits). Add labels for organization and monitoring.
- [ ] `configmap.yaml` – Common ConfigMap shared across services: `LOG_LEVEL` (info/debug), `NODE_ENV` (staging/production), `API_VERSION` (v1), `CORS_ORIGINS`, `RATE_LIMIT_ENABLED` (true), feature flag defaults, base URLs for internal service communication. Non-sensitive configuration only.
- [ ] `secrets.yaml` – Kubernetes Secret manifest (template). Actual values injected via sealed-secrets or External Secrets Operator syncing from Infisical. Contains: `DATABASE_URL`, `DATABASE_READ_REPLICA_URLS`, `REDIS_CACHE_URL`, `REDIS_PUBSUB_URL`, `RABBITMQ_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SMTP_*`, `TURNSTILE_SECRET_KEY`, VAPID keys. Base64-encoded.
- [ ] `network-policy.yaml` – NetworkPolicy restricting pod-to-pod traffic. Rules: only gateway pods can reach service pods, only worker pods can reach RabbitMQ, only services can reach PostgreSQL/Redis, deny all ingress by default, allow egress to external services (Razorpay, SMTP, S3, Cloudflare). Labeled by service tier (entry, service, worker, infrastructure).
- [ ] `ingress.yaml` – Kubernetes Ingress resource. Route `api.nestlancer.com/api/*` to gateway service, `api.nestlancer.com/ws/*` to ws-gateway service. Configure TLS with cert-manager annotations, rate limiting annotations, CORS headers. Use nginx ingress controller class.
- [ ] `hpa.yaml` – Base HorizontalPodAutoscaler template. Scale on CPU utilization (target 70%) and memory (target 80%). Min replicas: 2 (production), 1 (staging). Max replicas: 10 (production), 3 (staging). Scale-up stabilization: 60s, scale-down: 300s. Custom metrics support for request-rate-based scaling.
- [ ] `pdb.yaml` – PodDisruptionBudget for critical services. `minAvailable: 1` for gateway, auth, payments (ensure availability during rolling updates and node drains). Prevents all pods from being evicted simultaneously during cluster maintenance.
- [ ] `service-account.yaml` – Kubernetes ServiceAccount for pods. Annotations for IAM role association (AWS IRSA) to access S3, SES, CloudFront without storing AWS credentials in secrets. Disable auto-mounting of default service account token for security.
- [ ] `kustomization.yaml` – Kustomize base configuration. List all resources (namespace, configmap, secrets, network-policy, ingress, hpa, pdb, service-account). Define common labels (`app.kubernetes.io/part-of: nestlancer`). Set namespace transformer. Referenced by overlays.

#### 6.1.2 Services (`deploy/kubernetes/services/`)
Each service gets its own folder with deployment, service, hpa, and kustomization.

- [ ] `gateway/`
  - [ ] `deployment.yaml` – Gateway Deployment: 2-3 replicas, container image `nestlancer-gateway:latest`, ports [3000], env from ConfigMap + Secrets, readiness probe (`GET /api/v1/health/ready` every 10s, initial delay 15s), liveness probe (`GET /api/v1/health/live` every 30s), resource requests (250m CPU, 256Mi memory), resource limits (500m CPU, 512Mi memory), rolling update strategy (maxSurge: 1, maxUnavailable: 0).
  - [ ] `service.yaml` – ClusterIP Service exposing port 3000, selector matching gateway pods. Used by Ingress for routing. Named port `http` for Prometheus service monitor.
  - [ ] `hpa.yaml` – Gateway-specific HPA: min 2, max 8 replicas. Scale on CPU (70%), custom metric `http_requests_per_second` (target 200 RPS per pod). Gateway handles all incoming traffic so should scale aggressively.
  - [ ] `kustomization.yaml` – References base, patches with gateway-specific resource limits and environment variables.
- [ ] `ws-gateway/` – Same structure as gateway. Deployment exposes port 3001, readiness probe via WebSocket health check, resource limits slightly higher (for persistent connections), HPA based on active WebSocket connections, session affinity enabled in Service for sticky sessions.
- [ ] `auth/` – Auth service deployment. Requires access to PostgreSQL (write), Redis (session/rate-limit), SMTP (via queue). No direct external traffic – only gateway proxies requests. Lower resource requirements than gateway.
- [ ] `users/` – Users service deployment. Requires PostgreSQL (R/W split), Redis (session cache), S3 (avatar storage). Moderate resource requirements.
- [ ] `requests/` – Requests service deployment. Requires PostgreSQL, Redis cache, RabbitMQ (publish events on status changes). Moderate traffic.
- [ ] ... (repeat for each service: quotes, projects, progress, payments, messaging, notifications, media, portfolio, blog, contact, admin, webhooks – each with deployment, service, hpa, kustomization following the same pattern with service-specific ports, probes, and resource limits)

#### 6.1.3 Workers (`deploy/kubernetes/workers/`)
- [ ] `email-worker/`
  - [ ] `deployment.yaml` – Email worker Deployment: 1-3 replicas, connects to RabbitMQ (consumes `email.queue`), SMTP provider for sending. No service port exposed (consumer only). Restart policy: Always. Resource requests: 100m CPU, 128Mi memory. Liveness: RabbitMQ connection health.
  - [ ] `hpa.yaml` – Scale based on RabbitMQ queue depth metric (`rabbitmq_queue_messages{queue="email.queue"}`). Target: keep queue depth below 100. Min: 1, Max: 5.
  - [ ] `kustomization.yaml` – Worker-specific patches.
- [ ] `notification-worker/` – Consumes `notification.queue`. Sends push notifications via FCM/APNS, SMS via Twilio, publishes to Redis pub/sub for WebSocket delivery. Scale based on notification queue depth.
- [ ] `audit-worker/` – Consumes `audit.queue`. Batch-inserts audit logs to PostgreSQL. Low resource, high throughput. Scale based on queue depth, batch size 100 records.
- [ ] `media-worker/` – Consumes `media.queue`. CPU-intensive (image resize via Sharp, video transcode via FFmpeg). Higher resource limits (1 CPU, 1Gi memory). Scale based on queue depth. Needs S3 access for upload/download.
- [ ] `analytics-worker/` – Consumes `analytics.queue`. Aggregates statistics in PostgreSQL. Low priority, can tolerate some queue backlog. Schedule-based processing for some tasks (daily/weekly reports).
- [ ] `webhook-worker/` – Consumes `webhook.queue`. Processes inbound webhooks from Razorpay, GitHub, Stripe. Dispatches to event-specific handlers. Needs access to PostgreSQL for updating payment/deployment records. Moderate resource needs.
- [ ] `cdn-worker/` – Consumes `cdn.queue`. Batches CloudFront/Cloudflare cache invalidation requests (max 1000 paths per invalidation for CloudFront). Low traffic worker. Min 1 replica.

#### 6.1.4 Infrastructure (`deploy/kubernetes/infrastructure/`)
- [ ] `postgresql/`
  - [ ] `primary-statefulset.yaml` – PostgreSQL 16 primary StatefulSet with Patroni for HA. 1 replica, persistent volume (50Gi SSD), resource limits (2 CPU, 4Gi memory for production). Init container runs schema setup. `shared_buffers`, `work_mem`, `max_connections` tuned for workload. WAL archiving enabled for point-in-time recovery.
  - [ ] `replica-statefulset.yaml` – PostgreSQL read replicas: 1-2 replicas streaming from primary. Read-only connection pooling. Used by services for read queries (portfolio, blog, analytics, admin dashboard). Same PVC size as primary.
  - [ ] `service.yaml` – Headless Service (`clusterIP: None`) for StatefulSet DNS discovery. Separate Services for primary (read-write, port 5432) and replicas (read-only, port 5432) to enable R/W split at connection string level.
  - [ ] `pvc.yaml` – PersistentVolumeClaim templates: `storage: 50Gi`, `storageClassName: gp3` (AWS EBS SSD), `accessModes: ReadWriteOnce`. Retain policy to prevent data loss on pod deletion.
  - [ ] `patroni-config.yaml` – Patroni HA configuration: DCS (distributed config store) via Kubernetes API or etcd. Automatic failover with configurable thresholds. Synchronous commit for critical transactions. Bootstrap from backup for new replicas.
  - [ ] `kustomization.yaml` – PostgreSQL infrastructure kustomization.
- [ ] `redis-cache/`
  - [ ] `statefulset.yaml` – Redis 7 for caching. Standalone mode (or Sentinel for HA). Persistent volume for AOF/RDB persistence. Resource limits: 512Mi-2Gi memory. `maxmemory-policy: allkeys-lru` for cache eviction. Port 6379.
  - [ ] `service.yaml` – ClusterIP Service for Redis cache on port 6379.
  - [ ] `config.yaml` – Redis configuration: `maxmemory 1gb`, `maxmemory-policy allkeys-lru`, `save 900 1` (RDB), `appendonly yes` (AOF), `bind 0.0.0.0`, disable dangerous commands (`FLUSHALL`, `FLUSHDB`, `KEYS`) in production.
  - [ ] `kustomization.yaml` – Redis cache kustomization.
- [ ] `redis-pubsub/` – Separate Redis instance for pub/sub (WebSocket cross-instance communication and real-time events). No persistence needed (ephemeral messages). Lower memory requirements. Port 6380 to avoid conflict with cache instance. `maxmemory-policy noeviction` (pub/sub messages should not be evicted).
- [ ] `rabbitmq/`
  - [ ] `statefulset.yaml` – RabbitMQ 3.13 StatefulSet with management plugin enabled. Persistent volume (10Gi) for message durability. Resource limits: 1 CPU, 1Gi memory. Ports: 5672 (AMQP), 15672 (management UI). Erlang cookie for clustering.
  - [ ] `service.yaml` – Service exposing AMQP port 5672 to services/workers and management port 15672 for monitoring. Headless service for cluster node discovery.
  - [ ] `config.yaml` – RabbitMQ configuration: `vm_memory_high_watermark.relative = 0.6`, `disk_free_limit.relative = 1.0`, `consumer_timeout = 1800000` (30min), `channel_max = 128`, management plugin enabled, Prometheus plugin enabled for metrics export.
  - [ ] `definitions.json` – Pre-define RabbitMQ topology on startup: exchanges (`nestlancer.events` topic, `nestlancer.webhooks` direct, `nestlancer.dlx` fanout), queues (`email.queue`, `notification.queue`, `audit.queue`, `media.queue`, `analytics.queue`, `webhook.queue`, `cdn.queue`, each with DLQ), bindings (routing keys per queue), vhost, admin user. Loaded via management API on container start.
  - [ ] `kustomization.yaml` – RabbitMQ infrastructure kustomization.
- [ ] `monitoring/`
  - [ ] `prometheus-deployment.yaml` – Prometheus server Deployment: 1 replica, persistent volume (50Gi) for metrics history, resource limits (1 CPU, 2Gi memory), mount `prometheus.yml` and `alert-rules.yml` from ConfigMap. Scrape all service metrics endpoints. Retention: 15 days.
  - [ ] `grafana-deployment.yaml` – Grafana Deployment: 1 replica, persistent volume (5Gi) for dashboard state, mount provisioning configs for auto-loading dashboards and datasources. Port 3200. Admin credentials from Secret.
  - [ ] `jaeger-deployment.yaml` – Jaeger all-in-one or collector+query Deployment. Receives OpenTelemetry traces via gRPC (port 14250). UI on port 16686. In-memory storage for dev, Elasticsearch for production. Sampling configuration from ConfigMap.
  - [ ] `kustomization.yaml` – Monitoring stack kustomization.

#### 6.1.5 Overlays (`deploy/kubernetes/overlays/`)
- [ ] `development/`
  - [ ] `kustomization.yaml` – Development overlay: references base, sets namespace `nestlancer-dev`, applies development patches. Uses development container images (`:dev` tag).
  - [ ] `patches/replicas.yaml` – Reduce all replicas to 1 for development. Minimize resource consumption on local/dev k8s cluster.
  - [ ] `patches/resources.yaml` – Lower resource limits: CPU 100m→250m, memory 128Mi→256Mi per container. Allows running full stack on dev machine with limited resources.
- [ ] `staging/` – Staging overlay: 2 replicas for gateway/critical services, 1 for others. Uses staging container images (`:staging-<sha>`). Staging-specific ConfigMap values (staging DB, staging Razorpay keys). Resource limits at 50% of production.
- [ ] `production/` – Production overlay: min 2 replicas for all services, max defined per HPA. Uses versioned images (`:v1.x.x`). Production ConfigMap/Secrets from Infisical. Full resource limits. PDB enforced. Network policies strict. Monitoring enabled for all components.

### 6.2 Terraform (`deploy/terraform/`)

#### 6.2.1 Environments
- [ ] `environments/staging/`
  - [ ] `main.tf` – Staging environment entrypoint. Calls all infrastructure modules (VPC, RDS, ElastiCache, S3, CloudFront, SES, EKS, MQ, Secrets Manager) with staging-specific parameters. Sets provider `aws` with staging region and profile.
  - [ ] `variables.tf` – Staging-specific variables: region (`ap-south-1` for India), instance sizes (smaller for cost savings: `db.t3.medium` for RDS, `cache.t3.small` for Redis), cluster size (2 nodes for EKS), domain name (`staging-api.nestlancer.com`).
  - [ ] `outputs.tf` – Staging outputs: EKS cluster endpoint, RDS endpoint, ElastiCache endpoint, S3 bucket names, CloudFront distribution ID, SES verified domain, load balancer DNS name. Used by CI/CD for deployment configuration.
  - [ ] `terraform.tfvars` – Actual values for staging variables. Not committed to git (or encrypted). Contains AWS account ID, VPC CIDR, subnet CIDRs, key pair name, domain name.
  - [ ] `backend.tf` – Remote state backend: S3 bucket (`nestlancer-terraform-state`) with DynamoDB table (`terraform-locks`) for state locking. Prevents concurrent modifications. Workspaces for environment separation.
- [ ] `environments/production/` – Same structure as staging with production-sized resources: `db.r6g.xlarge` for RDS (multi-AZ), `cache.r6g.large` for Redis, 3+ node EKS cluster, production domain, stricter security groups, enhanced monitoring enabled.

#### 6.2.2 Modules
- [ ] `modules/vpc/`
  - [ ] `main.tf` – AWS VPC with public subnets (for ALB/NAT), private subnets (for EKS/RDS/Redis), NAT Gateway for outbound internet from private subnets. Multi-AZ (2-3 AZs). Internet Gateway, route tables, VPC flow logs to CloudWatch.
  - [ ] `variables.tf` – Input: VPC CIDR (e.g., `10.0.0.0/16`), AZ count, public/private subnet CIDRs, enable NAT gateway, tags.
  - [ ] `outputs.tf` – Output: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`, `nat_gateway_ids`, `default_security_group_id`.
- [ ] `modules/rds/` – AWS RDS PostgreSQL 16 module. Multi-AZ deployment, automated backups (7-day retention), read replicas in same region, parameter group with tuned settings (`shared_buffers`, `max_connections`), security group allowing access only from EKS nodes, encryption at rest (KMS), Performance Insights enabled, CloudWatch alarms for CPU/storage/connections.
- [ ] `modules/elasticache/` – AWS ElastiCache Redis 7 module. Two instances: one for caching (with eviction), one for pub/sub (no eviction). Subnet group in private subnets, security group allowing access from EKS, encryption in transit, automatic failover (multi-AZ), parameter group with appropriate `maxmemory-policy`.
- [ ] `modules/s3/` – AWS S3 buckets for media storage. Two buckets: `nestlancer-private-deliverables` (project files, restricted access via presigned URLs) and `nestlancer-public-assets` (portfolio/blog images, CloudFront origin). Versioning enabled, lifecycle rules (transition to IA after 90d, Glacier after 365d), CORS config for direct uploads, server-side encryption (AES-256), bucket policy denying public access on private bucket.
- [ ] `modules/cloudfront/` – AWS CloudFront CDN distribution. Origin: `nestlancer-public-assets` S3 bucket. Custom domain (`cdn.nestlancer.com`), ACM certificate for HTTPS. Cache behaviors: portfolio images (TTL 24h), blog images (TTL 7d), user avatars (TTL 1h). Origin Access Identity for S3 (no direct S3 access). Lambda@Edge for image optimization (optional). Invalidation API access for cdn-worker.
- [ ] `modules/ses/` – AWS SES for transactional emails. Verified domain (`nestlancer.com`), DKIM signing, SPF records, MAIL FROM domain, production access (out of sandbox), dedicated IP (optional for deliverability), suppression list management, bounce/complaint SNS notifications, configuration set for tracking open/click rates.
- [ ] `modules/eks/` – AWS EKS cluster module. Kubernetes 1.28+, managed node groups (2-5 `t3.large` instances), cluster autoscaler, VPC CNI plugin, CoreDNS, kube-proxy, EBS CSI driver for persistent volumes, OIDC provider for IRSA (IAM Roles for Service Accounts), cluster logging to CloudWatch, private API endpoint with VPN/bastion access.
- [ ] `modules/rabbitmq/` – AWS Amazon MQ for RabbitMQ (managed) or self-hosted on EC2. Broker type: `mq.m5.large`, multi-AZ deployment, persistent storage, management console access, security group allowing AMQP (5672) from EKS. Alternative: deploy RabbitMQ on EKS using operator (saves cost, more control).
- [ ] `modules/secrets-manager/` – AWS Secrets Manager for storing sensitive configuration. Secret per environment (staging/production) containing all Infisical equivalents. Automatic rotation for database passwords (Lambda rotation function). Integration with EKS via External Secrets Operator to sync secrets into K8s Secrets. Encryption via KMS customer-managed key.

---

## 7. Database & Prisma (`prisma/`)

### 7.1 Schema (`prisma/schema/`)
- [ ] `schema.prisma` – Main Prisma schema file. Set `provider = "postgresql"`, `previewFeatures = ["multiSchema"]` if using schemas. Configure `datasource db` with `DATABASE_URL` from env. Import all domain-specific `.prisma` files via `prisma-import` or Prisma's native multi-file support. Generate Prisma Client with custom output path to `prisma/generated/`.
- [ ] `user.prisma` – **User domain models.** `User` (id UUID, email unique, firstName, lastName, phone?, avatarUrl?, timezone default "Asia/Kolkata", language default "en", role enum USER/ADMIN, status enum ACTIVE/SUSPENDED/DELETED, emailVerified boolean, twoFactorEnabled boolean, createdAt, updatedAt, deletedAt? soft-delete). `UserPreference` (userId FK unique, notifications JSONB, privacy JSONB, theme). `UserSession` (id, userId FK, ipAddress, userAgent, lastActiveAt, expiresAt, isActive). `UserActivity` (id, userId FK, action enum, metadata JSONB, ipAddress, createdAt). Indexes: `User.email` unique, `User.status`, `UserSession.userId`.
- [ ] `auth.prisma` – **Authentication models.** `LoginAttempt` (id, email, ipAddress, userAgent, success boolean, failureReason?, createdAt – for account lockout after 5 failures). `RefreshToken` (id, userId FK, token unique hashed, expiresAt, revokedAt?, family UUID for rotation detection, createdAt). `EmailVerificationToken` (id, userId FK, token unique, expiresAt, usedAt?, createdAt – 24h expiry). `PasswordResetToken` (id, userId FK, token unique, expiresAt, usedAt?, createdAt – 1h expiry). Indexes: `LoginAttempt.email + createdAt`, `RefreshToken.token`, cleanup jobs for expired tokens.
- [ ] `project.prisma` – **Project domain models.** `Project` (id, userId FK, requestId FK?, quoteId FK?, title, description, status enum ACTIVE/ON_HOLD/IN_REVIEW/REVISION_REQUESTED/COMPLETED/CANCELLED/ARCHIVED, startDate, estimatedEndDate, actualEndDate?, completionPercentage default 0, totalAmount Decimal, currency "INR", adminNotes?, publicVisible boolean, metadata JSONB, createdAt, updatedAt). `ProjectFeedback` (id, projectId FK unique, userId FK, rating 1-5, testimonial?, isPublic boolean, approvedByAdmin boolean, createdAt). `ProjectTemplate` (id, name, description, defaultMilestones JSONB, createdAt). Indexes: `Project.userId`, `Project.status`.
- [ ] `request.prisma` – **Service request models.** `Request` (id, userId FK, title, description text, category enum WEB_DEVELOPMENT/MOBILE_APP/UI_UX_DESIGN/BRANDING/SEO/CUSTOM, budgetRange JSONB {min, max, currency}, timeline enum URGENT/STANDARD/FLEXIBLE, requirements text[], status enum DRAFT/SUBMITTED/UNDER_REVIEW/QUOTED/ACCEPTED/REJECTED/CANCELLED/COMPLETED, priority enum LOW/MEDIUM/HIGH, metadata JSONB, createdAt, updatedAt). `RequestAttachment` (id, requestId FK, mediaId FK, createdAt). `RequestNote` (id, requestId FK, content text, createdBy admin, createdAt). `RequestStatusHistory` (id, requestId FK, fromStatus, toStatus, changedBy, note?, createdAt). Indexes: `Request.userId + status`, `Request.status`.
- [ ] `quote.prisma` – **Quote/proposal models.** `Quote` (id, requestId FK, title, totalAmount Decimal, currency "INR", validUntil DateTime, status enum DRAFT/SENT/VIEWED/ACCEPTED/DECLINED/REVISION_REQUESTED/EXPIRED/CANCELLED, scope text, technicalDetails text?, timeline JSONB, terms text, acceptedAt?, declinedAt?, declineReason?, clientSignature?, expiryNotificationSent boolean, version int default 1, createdAt, updatedAt). `QuoteLineItem` (id, quoteId FK, description, quantity, unitPrice Decimal, total Decimal, order int). `QuotePaymentBreakdown` (id, quoteId FK, type enum UPFRONT/MILESTONE/COMPLETION/CUSTOM, name, amount Decimal, percentage?, dueDate?, description, order int). `QuoteTemplate` (id, name, defaultItems JSONB, defaultTerms text, createdAt). Indexes: `Quote.requestId`, `Quote.status + validUntil` for expiry checks.
- [ ] `progress.prisma` – **Progress tracking models.** `ProgressEntry` (id, projectId FK, type enum STATUS_CHANGE/MILESTONE_UPDATE/DELIVERABLE/NOTE/GENERAL_UPDATE, title, description?, milestone?, deliverables JSONB?, attachments JSONB?, notifyClient boolean, visibility enum PUBLIC/PRIVATE, createdBy, createdAt, updatedAt). `Milestone` (id, projectId FK, name, description?, startDate, endDate, status enum PENDING/IN_PROGRESS/COMPLETED/APPROVED/REVISION_REQUESTED, completedAt?, approvedAt?, approvalFeedback?, order int, createdAt, updatedAt). `Deliverable` (id, projectId FK, milestoneId FK?, title, description, fileUrl?, mediaId FK?, status enum PENDING/UPLOADED/UNDER_REVIEW/APPROVED/REJECTED/REVISION_REQUESTED, reviewFeedback?, rejectionReason?, rating int?, version int default 1, createdAt, updatedAt). Indexes: `Milestone.projectId + order`, `Deliverable.milestoneId`.
- [ ] `payment.prisma` – **Payment domain models.** `Payment` (id, projectId FK, milestoneId FK?, userId FK, amount Decimal, currency "INR", status enum PENDING/PROCESSING/COMPLETED/FAILED/REFUNDED/PARTIALLY_REFUNDED/DISPUTED, type enum UPFRONT/MILESTONE/FINAL/CUSTOM, razorpayPaymentId?, razorpayOrderId?, razorpaySignature?, method enum CARD/UPI/NET_BANKING/WALLET, receiptUrl?, invoiceUrl?, metadata JSONB, paidAt?, failedAt?, failureReason?, createdAt, updatedAt). `PaymentIntent` (id, projectId FK, milestoneId FK?, amount Decimal, currency, razorpayOrderId unique, status enum CREATED/PROCESSING/COMPLETED/FAILED/CANCELLED, expiresAt, idempotencyKey unique, createdAt). `PaymentMethod` (id, userId FK, type, last4, brand?, isDefault boolean, razorpayTokenId, createdAt). `PaymentMilestone` (id, projectId FK, type enum UPFRONT/MILESTONE/FINAL, name, amount Decimal, dueDate?, status enum PENDING/PAYMENT_REQUESTED/PAID/OVERDUE, deliverables String[], paidAt?, order int). `PaymentDispute` (id, paymentId FK, reason, status enum OPEN/UNDER_REVIEW/RESOLVED/ESCALATED, resolution?, resolvedAt?, evidence JSONB, createdAt). `Refund` (id, paymentId FK, amount Decimal, reason, status enum PENDING/PROCESSED/FAILED, razorpayRefundId?, processedAt?, createdAt). Indexes: `Payment.projectId + status`, `Payment.razorpayPaymentId` unique, `PaymentIntent.razorpayOrderId` unique, `PaymentIntent.idempotencyKey` unique.
- [ ] `message.prisma` – **Messaging domain models.** `Message` (id, conversationId FK, senderId FK, content text encrypted, type enum TEXT/SYSTEM/FILE/IMAGE, replyToId FK? self-reference, editedAt?, deletedAt? soft-delete, createdAt). `Conversation` (id, projectId FK unique, participants userId[], lastMessageAt, createdAt). `MessageReaction` (id, messageId FK, userId FK, emoji, createdAt – unique on messageId+userId+emoji). `MessageReadReceipt` (id, messageId FK, userId FK, readAt – unique on messageId+userId). `MessageFlag` (id, messageId FK, flaggedBy FK, reason, status enum PENDING/REVIEWED/DISMISSED, resolvedAt?, createdAt). Indexes: `Message.conversationId + createdAt` for cursor pagination, `Conversation.projectId` unique.
- [ ] `notification.prisma` – **Notification domain models.** `Notification` (id, userId FK, type enum INFO/SUCCESS/WARNING/ERROR, category enum AUTH/PROJECT/PAYMENT/MESSAGE/SYSTEM/ADMIN, title, message, data JSONB? {link, entityType, entityId}, priority enum LOW/MEDIUM/HIGH/URGENT, readAt?, channels String[] enum IN_APP/EMAIL/PUSH/SMS, scheduledFor?, sentAt?, createdAt). `NotificationPreference` (id, userId FK unique, channels JSONB {email: bool, push: bool, sms: bool per category}, quietHoursStart?, quietHoursEnd?, timezone). `PushSubscription` (id, userId FK, endpoint, p256dh, auth, deviceInfo JSONB, createdAt). `NotificationTemplate` (id, name unique, subject, body with {{variables}}, channels String[], createdAt, updatedAt). `NotificationDeliveryLog` (id, notificationId FK, channel, status enum SENT/FAILED/BOUNCED, error?, sentAt, createdAt). Indexes: `Notification.userId + readAt` for unread count, `Notification.userId + createdAt` for listing.
- [ ] `media.prisma` – **Media storage models.** `Media` (id, uploaderId FK, filename, originalFilename, mimeType, size BigInt bytes, context enum AVATAR/PROJECT_DELIVERABLE/REQUEST_ATTACHMENT/PORTFOLIO/BLOG/MESSAGE, bucket enum PRIVATE/PUBLIC, storageKey (S3 key), url?, thumbnailUrl?, status enum UPLOADING/PROCESSING/READY/QUARANTINED/FAILED, metadata JSONB {width, height, duration, exif}, checksum?, virusScanStatus enum PENDING/CLEAN/INFECTED, createdAt, updatedAt). `MediaVersion` (id, mediaId FK, version int, storageKey, size, createdAt). `MediaShareLink` (id, mediaId FK, token unique, expiresAt?, password? hashed, maxDownloads?, currentDownloads default 0, allowedEmails String[]?, createdAt). `ChunkedUploadSession` (id, userId FK, filename, totalChunks, uploadedChunks int default 0, totalSize BigInt, chunkSize, status enum IN_PROGRESS/COMPLETED/ABORTED/EXPIRED, expiresAt, createdAt). `QuarantinedFile` (id, mediaId FK, reason, quarantinedAt, reviewedAt?, reviewedBy?). Indexes: `Media.uploaderId + context`, `Media.status`, `MediaShareLink.token` unique.
- [ ] `portfolio.prisma` – **Portfolio domain models.** `PortfolioItem` (id, title, slug unique, shortDescription, fullDescription text, contentFormat enum MARKDOWN/HTML, categoryId FK?, tags String[], thumbnailMediaId FK?, client JSONB {name, industry, website?}, projectDetails JSONB {duration, role, technologies[]}, links JSONB {live?, github?, figma?}, seo JSONB {title, description, keywords[]}, status enum DRAFT/PUBLISHED/ARCHIVED, featured boolean, displayOrder int, viewCount default 0, likeCount default 0, publishedAt?, createdAt, updatedAt). `PortfolioCategory` (id, name, slug unique, description?, displayOrder int, itemCount default 0, createdAt). `PortfolioTag` (id, name unique, slug unique, itemCount default 0). `PortfolioImage` (id, portfolioItemId FK, mediaId FK, caption?, altText?, displayOrder int). `PortfolioLike` (id, portfolioItemId FK, visitorIp or userId?, sessionId?, createdAt – unique on item+session to prevent duplicates). Indexes: `PortfolioItem.slug` unique, `PortfolioItem.status + featured + displayOrder`, `PortfolioCategory.slug` unique.
- [ ] `blog.prisma` – **Blog domain models.** `Post` (id, title, slug unique, excerpt, content text, contentFormat enum MARKDOWN/HTML, featuredImageMediaId FK?, categoryId FK, tags String[], authorId FK, series JSONB?, seo JSONB {title, description, keywords[]}, status enum DRAFT/PUBLISHED/SCHEDULED/ARCHIVED, commentsEnabled boolean default true, viewCount default 0, likeCount default 0, readingTimeMinutes int?, scheduledAt?, publishedAt?, createdAt, updatedAt). `PostRevision` (id, postId FK, title, content, changedBy, changeDescription?, version int, createdAt). `PostView` (id, postId FK, visitorIp?, userId?, sessionId, referrer?, createdAt). `PostLike` (id, postId FK, userId FK unique per post). `Comment` (id, postId FK, userId FK, parentId FK? self-ref for threading, content, status enum PENDING/APPROVED/REJECTED/SPAM, isPinned boolean, likeCount default 0, editedAt?, deletedAt? soft-delete, createdAt). `CommentLike` (id, commentId FK, userId FK unique per comment). `CommentReport` (id, commentId FK, reportedBy FK, reason, status enum PENDING/REVIEWED/DISMISSED, resolvedAt?, createdAt). `BlogCategory` (id, name, slug unique, description?, postCount default 0, createdAt). `BlogTag` (id, name, slug unique, postCount default 0). `Bookmark` (id, userId FK, postId FK, createdAt – unique on userId+postId). Indexes: `Post.slug` unique, `Post.status + publishedAt`, `Post.categoryId`, `Comment.postId + status + createdAt`, `Bookmark.userId + postId` unique.
- [ ] `contact.prisma` – **Contact form models.** `ContactMessage` (id, name, email, subject enum GENERAL_INQUIRY/PROJECT_DISCUSSION/PARTNERSHIP/SUPPORT/FEEDBACK/OTHER, message text, status enum NEW/READ/RESPONDED/SPAM/ARCHIVED, ipAddress, turnstileVerified boolean, respondedAt?, spamScore float?, createdAt). `ContactResponseLog` (id, contactMessageId FK, subject, message text, sentBy admin, sentAt). Indexes: `ContactMessage.status + createdAt`.
- [ ] `admin.prisma` – **Admin domain models.** `SystemConfig` (id, key unique, value JSONB, description?, category, updatedAt, updatedBy). `EmailTemplate` (id, name unique, subject, htmlBody, textBody?, variables String[], active boolean, updatedAt). `FeatureFlag` (id, flag unique, enabled boolean, description?, rolloutPercentage? int, metadata JSONB?, updatedAt). `AuditLog` (id, userId FK?, action, resourceType, resourceId?, changes JSONB? {before, after}, ipAddress?, userAgent?, metadata JSONB?, createdAt – append-only, never updated). `Webhook` (id, name, url, events String[], headers JSONB?, secret, enabled boolean, retryPolicy JSONB {maxRetries, backoffMs}, createdAt, updatedAt). `WebhookDelivery` (id, webhookId FK, event, payload JSONB, status enum PENDING/DELIVERED/FAILED, httpStatus int?, responseBody?, attempts int default 0, lastAttemptAt?, nextRetryAt?, deliveredAt?, error?, createdAt). `WebhookEvent` (id, name unique, description, payload schema JSONB). `ImpersonationSession` (id, adminId FK, targetUserId FK, reason, ticketId?, startedAt, endedAt?, ipAddress). `Backup` (id, description?, type enum FULL/SCHEMA/DATA, status enum IN_PROGRESS/COMPLETED/FAILED, filePath?, fileSize BigInt?, checksum?, startedAt, completedAt?, initiatedBy, error?). `BackupSchedule` (id, cronExpression, retention int days, enabled boolean, lastRunAt?, nextRunAt?, updatedAt). `BackgroundJob` (id, type, payload JSONB?, status enum PENDING/RUNNING/COMPLETED/FAILED, result JSONB?, startedAt?, completedAt?, error?, retryCount int default 0, createdAt). `Announcement` (id, title, message, channels String[], scheduledFor?, sentAt?, createdBy, createdAt). Indexes: `AuditLog.userId + createdAt`, `AuditLog.resourceType + resourceId`, `FeatureFlag.flag` unique, `Webhook.enabled`, `WebhookDelivery.webhookId + status`.
- [ ] `audit.prisma` – Audit-specific indexes and queries. `AuditLog` model may be shared with `admin.prisma` or kept separate for modularity. Ensure partitioning by `createdAt` for large-scale audit log tables (PostgreSQL table partitioning by month). Archive old audit logs to cold storage after retention period.
- [ ] `webhook.prisma` – Webhook models may be part of `admin.prisma`. If separated: `IncomingWebhook` (id, provider enum RAZORPAY/GITHUB/STRIPE, event, rawPayload JSONB, signature, verified boolean, processedAt?, status enum RECEIVED/PROCESSING/PROCESSED/FAILED, error?, idempotencyKey unique, createdAt). Ensures duplicate webhook deliveries are detected and skipped.
- [ ] `outbox.prisma` – **Transactional outbox model.** `OutboxEvent` (id, aggregateType e.g. "Project", aggregateId, eventType e.g. "project.created", payload JSONB with full event data, status enum PENDING/PUBLISHED/FAILED, publishedAt?, retryCount int default 0, lastRetryAt?, error?, createdAt). Polled by `outbox-poller` worker every 1-5 seconds. Published events marked as PUBLISHED. Failed events retried with exponential backoff up to 5 attempts. Indexes: `OutboxEvent.status + createdAt` for efficient polling, cleanup job deletes PUBLISHED events older than 7 days.
- [ ] `idempotency.prisma` – **Idempotency key model.** `IdempotencyKey` (id, key unique UUID v4, httpMethod, httpPath, requestHash, responseStatusCode int, responseBody JSONB, expiresAt DateTime default 24h from creation, createdAt). Redis used for fast lookup (24h TTL), PostgreSQL as durable fallback. Prevents duplicate payment processing, quote acceptance, and other non-idempotent operations. Cleanup job purges expired keys daily.

### 7.2 Migrations (`prisma/migrations/`)
- [ ] `00001_initial_schema/migration.sql` – Create core tables: `User` with UUID primary key (`gen_random_uuid()`), enum types (UserRole, UserStatus), timestamps with `DEFAULT NOW()`, unique constraint on email, GIN index on `searchVector` tsvector column for full-text user search. Enable UUID extension (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).
- [ ] `00002_auth_tables/migration.sql` – Create authentication tables: `LoginAttempt` with composite index on (email, createdAt DESC) for lockout queries, `RefreshToken` with unique index on hashed token, `EmailVerificationToken` and `PasswordResetToken` with expiry columns. Add foreign keys to User table with CASCADE DELETE.
- [ ] `00003_user_tables/migration.sql` – Create `UserPreference` (one-to-one with User via unique FK), `UserSession` (one-to-many), `UserActivity` (one-to-many, partitioned by month for high-volume inserts). Add JSONB columns for flexible preference storage.
- [ ] `00004_project_tables/migration.sql` – Create `Project` with status enum, decimal columns for amounts (NUMERIC(12,2)), foreign keys to User. `ProjectFeedback` one-to-one with Project. `ProjectTemplate` for admin project templates. Add check constraint: `completionPercentage BETWEEN 0 AND 100`.
- [ ] `00005_request_tables/migration.sql` – Create `Request` with category and status enums, JSONB `budgetRange` with CHECK constraint validation, text array for requirements. `RequestAttachment` junction table to Media. `RequestNote` for internal admin notes. `RequestStatusHistory` for audit trail of status changes.
- [ ] `00006_quote_tables/migration.sql` – Create `Quote` with status enum and decimal amount columns. `QuoteLineItem` with ordered line items (position column). `QuotePaymentBreakdown` defining payment schedule. `QuoteTemplate` for reusable templates. Add trigger to auto-update `totalAmount` from line items.
- [ ] `00007_progress_tables/migration.sql` – Create `ProgressEntry` with type enum, `Milestone` with ordered milestones per project, `Deliverable` linked to milestones and optionally to Media. Add composite indexes for timeline queries (projectId + createdAt).
- [ ] `00008_payment_tables/migration.sql` – Create payment tables with Razorpay integration fields. `Payment` with unique index on `razorpayPaymentId`. `PaymentIntent` with unique `razorpayOrderId` and `idempotencyKey`. `PaymentMilestone` with ordered payment schedule. `PaymentDispute` and `Refund` tables. All monetary columns use `NUMERIC(12,2)` with CHECK `amount > 0`.
- [ ] `00009_messaging_tables/migration.sql` – Create `Conversation` (one per project via unique FK), `Message` with cursor-based pagination index (conversationId + createdAt + id), `MessageReaction` with unique constraint (messageId, userId, emoji), `MessageReadReceipt`, `MessageFlag`. Add self-referential FK on Message for `replyToId`.
- [ ] `00010_notification_tables/migration.sql` – Create `Notification` with category and priority enums, JSONB `data` for flexible linking. `NotificationPreference` one-to-one with User. `PushSubscription` for Web Push (VAPID). `NotificationTemplate` for admin-managed templates. `NotificationDeliveryLog` for tracking delivery across channels. Index on (userId, readAt IS NULL) for efficient unread count.
- [ ] `00011_media_tables/migration.sql` – Create `Media` with context and bucket enums (private for deliverables, public for portfolio/blog). `MediaVersion` for version history. `MediaShareLink` with unique token for temporary sharing. `ChunkedUploadSession` for large file uploads with expiry. `QuarantinedFile` for virus-infected files. All size columns use BigInt for files >2GB.
- [ ] `00012_portfolio_tables/migration.sql` – Create `PortfolioItem` with unique slug, JSONB columns for client/project details/links/SEO. `PortfolioCategory` and `PortfolioTag` with unique slugs. `PortfolioImage` junction to Media with display ordering. `PortfolioLike` with rate limiting (unique on item + session/IP). Add composite index on (status, featured, displayOrder) for sorted public queries.
- [ ] `00013_blog_tables/migration.sql` – Create `Post` with unique slug, scheduled publishing (scheduledAt), content format support. `PostRevision` for version history. `PostView` for analytics (partitioned by month). `PostLike` and `Bookmark` with unique constraints per user. `Comment` with self-referential threading (parentId). `CommentLike`, `CommentReport`. `BlogCategory`, `BlogTag` with unique slugs and denormalized `postCount`. Triggers to update counts on insert/delete.
- [ ] `00014_contact_tables/migration.sql` – Create `ContactMessage` with subject enum, spam score column (float), Turnstile verification flag. `ContactResponseLog` for tracking admin responses. Simple schema with minimal foreign keys (anonymous submissions).
- [ ] `00015_admin_tables/migration.sql` – Create admin configuration tables: `SystemConfig` (key-value with JSONB values), `EmailTemplate` (Handlebars templates), `FeatureFlag` (with rollout percentage), `ImpersonationSession` (audit trail for admin impersonation), `Announcement` (broadcast messages). All admin tables restricted at app level to admin role.
- [ ] `00016_audit_tables/migration.sql` – Create `AuditLog` table optimized for high-volume append-only writes. Consider partitioning by `createdAt` (monthly partitions) for tables expected to grow to millions of rows. Index on (resourceType, resourceId) for entity-specific audit trails. BRIN index on createdAt for time-range queries (more efficient than B-tree for append-only data).
- [ ] `00017_webhook_tables/migration.sql` – Create `Webhook` (outbound subscriptions), `WebhookDelivery` (delivery attempts with retry tracking), `WebhookEvent` (event catalog). `IncomingWebhook` for inbound webhook logging (Razorpay, GitHub). Unique constraints on idempotency keys for duplicate detection. Index on (webhookId, status) for retry queries.
- [ ] `00018_outbox_table/migration.sql` – Create `OutboxEvent` table for transactional outbox pattern. Critical performance indexes: (status, createdAt) for the poller's `SELECT ... WHERE status = 'PENDING' ORDER BY createdAt LIMIT 100 FOR UPDATE SKIP LOCKED`. `SKIP LOCKED` enables concurrent pollers without contention. Add cleanup function to delete published events older than 7 days.
- [ ] `00019_idempotency_table/migration.sql` – Create `IdempotencyKey` table with unique constraint on `key`. TTL-based expiry (24h). Index on `expiresAt` for efficient cleanup. Used alongside Redis cache for fast idempotency checks (Redis first, PostgreSQL fallback).
- [ ] `migration_lock.toml` – Prisma migration lock file. Prevents concurrent migration runs from corrupting the database. Automatically managed by `prisma migrate` commands. Contains provider information and lock status.

### 7.3 Seeds (`prisma/seeds/`)
- [ ] `index.ts` – Main seed runner orchestrating all seed functions in dependency order using `prisma db seed`. Imports and executes each seed file sequentially. Handles errors per seed (log and continue vs halt). Accepts `--env` flag for environment-specific seeding (dev includes test data, production only includes base data). Uses `prisma.$transaction` for atomic seeding per file.
- [ ] `01-roles.seed.ts` – Seed user roles: `USER` and `ADMIN`. Upsert to ensure idempotency. Sets role descriptions and default permissions for each role.
- [ ] `02-admin-user.seed.ts` – Create initial admin user with email from `ADMIN_EMAIL` env var, bcrypt-hashed password from `ADMIN_PASSWORD` env var, `emailVerified: true`, `role: ADMIN`, `status: ACTIVE`. Skip if admin already exists (upsert on email).
- [ ] `03-categories.seed.ts` – Seed portfolio categories (Web Development, Mobile App, UI/UX Design, Branding, SEO, E-commerce, Custom) and blog categories (Technology, Design, Business, Tutorial, Case Study, Industry News). Create with slugs, descriptions, and display order.
- [ ] `04-tags.seed.ts` – Seed common tags for portfolio (React, Next.js, Node.js, TypeScript, PostgreSQL, AWS, etc.) and blog (JavaScript, Web Development, Career, Freelancing, etc.). Create with unique slugs.
- [ ] `05-email-templates.seed.ts` – Seed email templates for: verification email, welcome email, password reset, quote sent, quote accepted, payment received, payment failed, payment reminder, project update, project completed, contact response, announcement. Each template includes subject line, HTML body (Handlebars), and list of required variables.
- [ ] `06-notification-templates.seed.ts` – Seed notification templates mapped to event types: `request.submitted` → "New request received", `quote.sent` → "You received a new proposal", `payment.completed` → "Payment confirmed", `milestone.completed` → "Milestone completed", `message.received` → "New message". Include channel routing (in-app + email for payments, in-app only for messages).

- [ ] `08-feature-flags.seed.ts` – Seed initial feature flags: `MAINTENANCE_MODE` (false), `REGISTRATION_ENABLED` (true), `TWO_FACTOR_REQUIRED` (false), `FILE_UPLOAD_ENABLED` (true), `BLOG_COMMENTS_ENABLED` (true), `PORTFOLIO_LIKES_ENABLED` (true), `WEBHOOK_OUTBOUND_ENABLED` (true), `RATE_LIMITING_ENABLED` (true), `VIRUS_SCANNING_ENABLED` (true). Each with description and default rollout percentage.
- [ ] `09-system-config.seed.ts` – Seed system configuration key-value pairs: `site.name` = "Nestlancer", `site.description`, `site.url`, `pagination.defaultLimit` = 20, `pagination.maxLimit` = 100, `upload.maxFileSize` = 52428800 (50MB), `upload.allowedMimeTypes` = [...], `quote.defaultValidityDays` = 30, `payment.currency` = "INR", `session.maxConcurrent` = 5, `email.fromName` = "Nestlancer", `email.fromAddress`.
- [ ] `dev/` – Development-only seed data (skipped in production)
  - [ ] `10-test-users.seed.ts` – Create 5-10 test users with predictable credentials: `user1@test.com` through `user5@test.com` (password: `Test@12345`), `admin@test.com` (admin role). Set `emailVerified: true` for all. Include varied profiles (different timezones, languages, preferences, avatars).
  - [ ] `11-test-projects.seed.ts` – Create 3-5 sample projects in various statuses (active, completed, on-hold) with full data: linked requests, quotes, milestones, deliverables, progress entries, payment milestones. Provides realistic data for development testing and UI prototyping.
  - [ ] `12-test-portfolio.seed.ts` – Create 6-10 portfolio items across different categories with images, descriptions, client details, technology tags, and varied statuses (published, draft, featured). Include realistic project descriptions for portfolio page development.
  - [ ] `13-test-blog-posts.seed.ts` – Create 5-8 blog posts with different statuses (published, draft, scheduled), categories, tags, comments, and view counts. Include realistic content for blog page development and testing comment threading.

### 7.4 Config
- [ ] `prisma.config.ts` – Prisma client configuration: set binary targets (`native`, `linux-musl-openssl-3.0.x` for Alpine Docker), configure client output directory, enable query logging in development (`LOG_LEVEL=query`), set connection pool size (`connection_limit` in DATABASE_URL, default 10 per service). Configure Prisma Accelerate if using connection pooling. Set `errorFormat: 'pretty'` for dev, `'minimal'` for production.

---

## 8. Shared Libraries (`libs/`)

### 8.1 `libs/common/`
- [ ] `src/index.ts` – Barrel export file. Re-exports all constants, enums, types, interfaces, decorators, DTOs, exceptions, filters, interceptors, pipes, and utilities. Consumed by every service and library via `import { ... } from '@nestlancer/common'`.
- [ ] `src/constants/`
  - [ ] `app.constants.ts` – `APP_NAME = 'Nestlancer'`, `API_VERSION = 'v1'`, `API_PREFIX = '/api/v1'`, `DEFAULT_PAGINATION_LIMIT = 20`, `MAX_PAGINATION_LIMIT = 100`, `DEFAULT_TIMEZONE = 'Asia/Kolkata'`, `DEFAULT_LANGUAGE = 'en'`, `DEFAULT_CURRENCY = 'INR'`. Referenced globally by pagination DTOs, response transformers, and config modules.
  - [ ] `error-codes.constants.ts` – Comprehensive error code registry matching `117-error-codes-endpoints.md`. Global codes: `VALIDATION_ERROR = 'ERR_VALIDATION'`, `UNAUTHORIZED = 'ERR_UNAUTHORIZED'`, `RATE_LIMIT_EXCEEDED = 'ERR_RATE_LIMIT'`. Service-specific: `AUTH_INVALID_CREDENTIALS = 'AUTH_001'`, `AUTH_EMAIL_NOT_VERIFIED = 'AUTH_002'`, `AUTH_ACCOUNT_LOCKED = 'AUTH_003'`, `PAYMENT_INTENT_EXPIRED = 'PAY_001'`, etc. Each code maps to an HTTP status and default message.
  - [ ] `regex.constants.ts` – Validation patterns: `EMAIL_REGEX` (RFC 5322 compliant), `PASSWORD_REGEX` (min 8 chars, uppercase, lowercase, digit, special char per `100-api-standards`), `SLUG_REGEX` (lowercase alphanumeric with hyphens), `PHONE_REGEX` (E.164 format for Indian numbers), `URL_REGEX`, `UUID_REGEX` (v4), `HEX_COLOR_REGEX`.
  - [ ] `mime-types.constants.ts` – Allowed MIME types grouped by context: images (`image/jpeg`, `image/png`, `image/webp`, `image/gif` – max 10MB), documents (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.*` – max 25MB), videos (`video/mp4`, `video/webm` – max 100MB), archives (`application/zip`, `application/x-rar` – max 50MB). Used by media upload validation.
  - [ ] `file-limits.constants.ts` – `MAX_FILE_SIZE_IMAGE = 10 * 1024 * 1024` (10MB), `MAX_FILE_SIZE_DOCUMENT = 25 * 1024 * 1024` (25MB), `MAX_FILE_SIZE_VIDEO = 100 * 1024 * 1024` (100MB), `MAX_FILE_SIZE_AVATAR = 5 * 1024 * 1024` (5MB), `MAX_ATTACHMENTS_PER_REQUEST = 10`, `MAX_CHUNK_SIZE = 5 * 1024 * 1024` (5MB for chunked uploads). Per media service endpoint docs.
  - [ ] `pagination.constants.ts` – `DEFAULT_PAGE = 1`, `DEFAULT_LIMIT = 20`, `MAX_LIMIT = 100`, `DEFAULT_SORT_BY = 'createdAt'`, `DEFAULT_SORT_ORDER = 'desc'`. Used by `PaginationQueryDto` and `pagination.util.ts` across all list endpoints.
  - [ ] `currency.constants.ts` – `SUPPORTED_CURRENCIES = ['INR']` (primary), `DEFAULT_CURRENCY = 'INR'`, `CURRENCY_SYMBOLS = { INR: '₹' }`, `CURRENCY_DECIMAL_PLACES = { INR: 2 }`. Razorpay amounts in paise (smallest unit). Used by payment and quote services.
- [ ] `src/enums/`
  - [ ] `role.enum.ts` – `UserRole { USER = 'user', ADMIN = 'admin' }`. Only two roles as per standardized RBAC. Used by `@Roles()` decorator and auth guards across all services.
  - [ ] `user-status.enum.ts` – `UserStatus { ACTIVE = 'active', SUSPENDED = 'suspended', DELETED = 'deleted' }`. `SUSPENDED` blocks login, `DELETED` is soft-delete (30-day retention per account deletion flow in `103-users-endpoints`).
  - [ ] `project-status.enum.ts` – `ProjectStatus { ACTIVE, ON_HOLD, IN_REVIEW, REVISION_REQUESTED, COMPLETED, CANCELLED, ARCHIVED }`. Status flow defined in `106-projects-endpoints`: ACTIVE → ON_HOLD/IN_REVIEW → REVISION_REQUESTED → COMPLETED → ARCHIVED. Admin can CANCEL at any stage.
  - [ ] `request-status.enum.ts` – `RequestStatus { DRAFT, SUBMITTED, UNDER_REVIEW, QUOTED, ACCEPTED, REJECTED, CANCELLED, COMPLETED }`. Flow per `104-requests-endpoints`: DRAFT → SUBMITTED → UNDER_REVIEW → QUOTED → ACCEPTED/REJECTED. ACCEPTED triggers quote creation.
  - [ ] `quote-status.enum.ts` – `QuoteStatus { DRAFT, SENT, VIEWED, ACCEPTED, DECLINED, REVISION_REQUESTED, EXPIRED, CANCELLED }`. Flow per `105-quotes-endpoints`: DRAFT → SENT → VIEWED → ACCEPTED/DECLINED/REVISION_REQUESTED. Auto-EXPIRED after `validUntil` date.
  - [ ] `payment-status.enum.ts` – `PaymentStatus { PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED, DISPUTED }`. Integrates with Razorpay webhook events per `108-payments-endpoints`.
  - [ ] `payment-method.enum.ts` – `PaymentMethod { CARD, UPI, NET_BANKING, WALLET }`. Razorpay-supported methods for Indian payments. UPI is primary for domestic transactions.
  - [ ] `milestone-status.enum.ts` – `MilestoneStatus { PENDING, IN_PROGRESS, COMPLETED, APPROVED, REVISION_REQUESTED }`. Per `107-progress-endpoints`: admin marks COMPLETED → client APPROVES or requests REVISION.
  - [ ] `deliverable-status.enum.ts` – `DeliverableStatus { PENDING, UPLOADED, UNDER_REVIEW, APPROVED, REJECTED, REVISION_REQUESTED }`. Client reviews uploaded deliverables per `107-progress-endpoints`.
  - [ ] `progress-type.enum.ts` – `ProgressType { STATUS_CHANGE, MILESTONE_UPDATE, DELIVERABLE, NOTE, GENERAL_UPDATE }`. Entry types for project timeline per `107-progress-endpoints`. Each creates a timeline entry visible to client.
  - [ ] `message-type.enum.ts` – `MessageType { TEXT, SYSTEM, FILE, IMAGE }`. Per `109-messaging-endpoints`: TEXT (user messages), SYSTEM (auto-generated status updates), FILE/IMAGE (with media attachments).
  - [ ] `notification-type.enum.ts` – `NotificationType { INFO, SUCCESS, WARNING, ERROR }`. Combined with `NotificationCategory` per `110-notifications-endpoints` for routing and display.
  - [ ] `notification-priority.enum.ts` – `NotificationPriority { LOW, MEDIUM, HIGH, URGENT }`. URGENT bypasses quiet hours per `110-notifications-endpoints`. Used for payment failures, security alerts.
  - [ ] `notification-channel.enum.ts` – `NotificationChannel { IN_APP, EMAIL, PUSH, SMS }`. Per `110-notifications-endpoints`: IN_APP always, EMAIL for important events, PUSH for subscribed users, SMS for urgent/security only.
  - [ ] `media-type.enum.ts` – `MediaType { IMAGE, DOCUMENT, VIDEO, ARCHIVE }`. Determines processing pipeline in media-worker: IMAGE → resize/thumbnail, VIDEO → transcode, DOCUMENT → PDF thumbnail.
  - [ ] `media-status.enum.ts` – `MediaStatus { UPLOADING, PROCESSING, READY, QUARANTINED, FAILED }`. Per `111-media-endpoints`: UPLOADING → PROCESSING (worker) → READY or QUARANTINED (virus detected) or FAILED.
  - [ ] `portfolio-status.enum.ts` – `PortfolioStatus { DRAFT, PUBLISHED, ARCHIVED }`. Per `112-portfolio-endpoints`: only PUBLISHED items visible on public portfolio page.
  - [ ] `blog-status.enum.ts` – `PostStatus { DRAFT, SCHEDULED, PUBLISHED, ARCHIVED }`. Per `113-blog-endpoints`: SCHEDULED auto-publishes at `scheduledAt` datetime via cron job.
  - [ ] `comment-status.enum.ts` – `CommentStatus { PENDING, APPROVED, REJECTED, SPAM }`. Per `113-blog-endpoints`: moderation queue for admin approval before public display.
  - [ ] `contact-status.enum.ts` – `ContactStatus { NEW, READ, RESPONDED, SPAM, ARCHIVED }`. Per `114-contact-endpoints`: admin workflow for managing anonymous contact submissions.
  - [ ] `contact-subject.enum.ts` – `ContactSubject { GENERAL_INQUIRY, PROJECT_DISCUSSION, PARTNERSHIP, SUPPORT, FEEDBACK, OTHER }`. Per `114-contact-endpoints`: categorizes contact form submissions.
  - [ ] `webhook-status.enum.ts` – `WebhookStatus { ACTIVE, INACTIVE, FAILED }`. Per `116-webhooks-endpoints`: FAILED after exceeding retry limit, admin can re-enable.
  - [ ] `currency.enum.ts` – `Currency { INR = 'INR' }`. Primary currency. Extensible for future multi-currency support.
  - [ ] `sort-order.enum.ts` – `SortOrder { ASC = 'asc', DESC = 'desc' }`. Used by all paginated list endpoints.
  - [ ] `request-category.enum.ts` – `RequestCategory { WEB_DEVELOPMENT, MOBILE_APP, UI_UX_DESIGN, BRANDING, SEO, E_COMMERCE, CUSTOM }`. Per `104-requests-endpoints`: categorizes service requests for admin routing.
- [ ] `src/types/`
  - [ ] `api-response.type.ts` – `ApiResponse<T> { status: 'success', data: T, metadata?: { timestamp, requestId, version } }`. Standard success envelope per `100-api-standards`. All endpoints return this format via `TransformResponseInterceptor`.
  - [ ] `paginated-response.type.ts` – `PaginatedResponse<T> extends ApiResponse<T[]> { pagination: { page, limit, totalItems, totalPages, hasNextPage, hasPreviousPage } }`. Per `100-api-standards` pagination spec.
  - [ ] `error-response.type.ts` – `ErrorResponse { status: 'error', error: { code, message, details?: any[], timestamp, requestId, path } }`. Per `100-api-standards` error format. `details` array for validation errors.
  - [ ] `pagination-params.type.ts` – `PaginationParams { page: number, limit: number, sortBy?: string, order?: SortOrder, cursor?: string }`. Supports both offset and cursor-based pagination.
  - [ ] `filter-params.type.ts` – `FilterParams { [field: string]: { eq?, ne?, gt?, gte?, lt?, lte?, in?, notIn?, contains?, startsWith? } }`. Per `100-api-standards` filtering syntax: `?filter[status]=active&filter[createdAt][gte]=2026-01-01`.
  - [ ] `sort-params.type.ts` – `SortParams { field: string, order: SortOrder }`. Parsed from `?sort=createdAt:desc` query parameter format.
  - [ ] `date-range.type.ts` – `DateRange { from: Date, to: Date }`. ISO 8601 format per `100-api-standards`. Used by analytics, audit, and reporting endpoints.
  - [ ] `money.type.ts` – `Money { amount: number, currency: Currency }`. Amount in smallest unit (paise for INR). `formatMoney()` converts to display string (e.g., `₹1,500.00`).
  - [ ] `jwt-payload.type.ts` – `JwtPayload { sub: string (userId), email: string, role: UserRole, iat: number, exp: number, jti: string }`. Decoded from JWT access token. `sub` is UUID.
- [ ] `src/interfaces/`
  - [ ] `service-health.interface.ts` – `ServiceHealth { status: 'healthy' | 'degraded' | 'unhealthy', checks: HealthCheck[], version: string, uptime: number }`. Per `101-health-endpoints` response format.
  - [ ] `audit-context.interface.ts` – `AuditContext { userId?: string, ipAddress: string, userAgent: string, correlationId: string, action: string, resourceType: string, resourceId?: string }`. Attached to every auditable operation.
  - [ ] `request-context.interface.ts` – `RequestContext { correlationId: string, userId?: string, role?: UserRole, ipAddress: string, userAgent: string, startTime: number }`. Set by `request-tracer.middleware` for logging and tracing.
  - [ ] `pagination.interface.ts` – `PaginationMeta { page: number, limit: number, totalItems: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean }`. Computed by `pagination.util.ts`.
  - [ ] `base-entity.interface.ts` – `BaseEntity { id: string (UUID), createdAt: Date, updatedAt: Date }`. Common fields for all Prisma models. Extended by `SoftDeletableEntity` adding `deletedAt?: Date`.
- [ ] `src/decorators/`
  - [ ] `public.decorator.ts` – `@Public()` custom decorator using `SetMetadata('isPublic', true)`. Checked by `JwtAuthGuard` to skip authentication. Applied to: health endpoints, public portfolio/blog, contact form, auth register/login.
  - [ ] `roles.decorator.ts` – `@Roles(UserRole.ADMIN)` decorator using `SetMetadata('roles', [...])`. Checked by `RolesGuard`. Only `USER` and `ADMIN` roles. Admin-only endpoints use `@Roles(UserRole.ADMIN)`.
  - [ ] `current-user.decorator.ts` – `@CurrentUser()` parameter decorator extracting `request.user` set by `JwtAuthGuard`. Returns `AuthenticatedUser` (userId, email, role). Usage: `@CurrentUser() user: AuthenticatedUser`.
  - [ ] `idempotency-key.decorator.ts` – `@IdempotencyKey()` parameter decorator extracting `Idempotency-Key` header (UUID v4). Used by payment and quote endpoints per `100-api-standards` idempotency spec.
  - [ ] `api-paginated.decorator.ts` – `@ApiPaginatedResponse(DtoClass)` composite Swagger decorator. Applies `@ApiOkResponse` with paginated wrapper schema. Generates accurate OpenAPI docs for all list endpoints.
  - [ ] `api-standard-response.decorator.ts` – `@ApiStandardResponse(DtoClass)` composite Swagger decorator. Wraps DTO in standard `{ status, data, metadata }` envelope for OpenAPI docs.
  - [ ] `trim.decorator.ts` – `@Trim()` property decorator using `class-transformer`'s `@Transform(({ value }) => value?.trim())`. Applied to string DTO fields to strip leading/trailing whitespace before validation.
- [ ] `src/dto/`
  - [ ] `pagination-query.dto.ts` – `PaginationQueryDto { @IsOptional() @IsInt() @Min(1) page = 1; @IsOptional() @IsInt() @Min(1) @Max(100) limit = 20; @IsOptional() @IsString() sortBy = 'createdAt'; @IsOptional() @IsEnum(SortOrder) order = SortOrder.DESC }`. Base DTO extended by all list endpoints.
  - [ ] `date-range-query.dto.ts` – `DateRangeQueryDto { @IsOptional() @IsISO8601() from?: string; @IsOptional() @IsISO8601() to?: string }`. Validates ISO 8601 dates per `100-api-standards`. Used by analytics, audit, and report endpoints.
  - [ ] `id-param.dto.ts` – `IdParamDto { @IsUUID('4') id: string }`. Validates route parameter `:id` as UUID v4. Used by all `GET /:id`, `PATCH /:id`, `DELETE /:id` endpoints.
  - [ ] `bulk-operation.dto.ts` – `BulkOperationDto { @IsArray() @IsUUID('4', { each: true }) @ArrayMinSize(1) @ArrayMaxSize(100) ids: string[]; @IsEnum(BulkAction) action: BulkAction }`. For bulk update/delete operations in admin endpoints.
- [ ] `src/exceptions/`
  - [ ] `base.exception.ts` – `BaseException extends HttpException` with structured error: `code` (from error-codes constants), `message`, `details` (optional array for validation), `timestamp`, `path`. All custom exceptions extend this. Caught by `AllExceptionsFilter`.
  - [ ] `business-logic.exception.ts` – HTTP 400. For business rule violations: `QuoteExpiredException`, `InsufficientBalanceException`, `InvalidStatusTransitionException`. Includes error code and human-readable message.
  - [ ] `not-found.exception.ts` – HTTP 404. `ResourceNotFoundException(resourceType, resourceId)`. Message: "User with id xyz not found". Used across all services for missing entities.
  - [ ] `conflict.exception.ts` – HTTP 409. For duplicate resources: `EmailAlreadyExistsException`, `SlugAlreadyExistsException`, `DuplicateReactionException`.
  - [ ] `forbidden.exception.ts` – HTTP 403. For authorization failures: `InsufficientRoleException`, `ResourceOwnershipException` (user trying to access another user's project).
  - [ ] `validation.exception.ts` – HTTP 422. For input validation failures. Wraps `class-validator` errors into structured `details` array with `field`, `constraints`, and `value`.
  - [ ] `rate-limit.exception.ts` – HTTP 429. Includes `Retry-After` header (seconds). Per `100-api-standards` rate limiting: different tiers for anonymous (30/min), authenticated (100/min), admin (300/min).
  - [ ] `external-service.exception.ts` – HTTP 502. For external service failures: Razorpay API errors, S3 upload failures, SMTP connection errors. Wraps original error with service name and fallback message.
  - [ ] `idempotency-conflict.exception.ts` – HTTP 409. Thrown when idempotency key exists but request hash doesn't match (different request body with same key). Per `100-api-standards` idempotency spec.
- [ ] `src/filters/`
  - [ ] `all-exceptions.filter.ts` – Global exception filter catching all errors. Formats response per `100-api-standards` error format: `{ status: 'error', error: { code, message, details, timestamp, requestId, path } }`. Logs error with correlation ID to structured logger. Sanitizes stack traces in production. Publishes error metrics to Prometheus.
  - [ ] `http-exception.filter.ts` – Handles NestJS built-in `HttpException` and subclasses. Maps to standard error format. Handles `BadRequestException` (validation), `UnauthorizedException` (JWT), `ForbiddenException` (RBAC), `NotFoundException` (route not found).
- [ ] `src/interceptors/`
  - [ ] `logging.interceptor.ts` – Logs request start (method, URL, body size, user ID) and response end (status code, duration in ms). Uses structured logger with correlation ID. Skips logging for health check endpoints to reduce noise. Masks sensitive fields (password, token, secret) in request body logs.
  - [ ] `transform-response.interceptor.ts` – Wraps all successful responses in standard envelope: `{ status: 'success', data: <handler result>, metadata: { timestamp, requestId, version: 'v1' } }`. Per `100-api-standards` response format. Skips transformation for streaming responses (file downloads, SSE).
  - [ ] `timeout.interceptor.ts` – Aborts requests exceeding timeout threshold using RxJS `timeout()`. Default: 30s for standard requests, 120s for file uploads, 300s for exports/reports. Returns HTTP 504 Gateway Timeout with error code `ERR_TIMEOUT`.
  - [ ] `etag.interceptor.ts` – Generates ETag from MD5 hash of response body for GET requests. Checks `If-None-Match` header and returns 304 Not Modified if ETag matches. Per `100-api-standards` caching strategy. Reduces bandwidth for frequently polled endpoints (notifications, messages).
- [ ] `src/pipes/`
  - [ ] `validation.pipe.ts` – Global validation pipe using `class-validator` + `class-transformer`. Config: `whitelist: true` (strip unknown properties), `forbidNonWhitelisted: true` (throw on unknown), `transform: true` (auto-transform types), `transformOptions: { enableImplicitConversion: true }`. Throws `ValidationException` with detailed field errors.
  - [ ] `parse-uuid.pipe.ts` – Validates route/query parameter as UUID v4 format. Throws `BadRequestException` with message "Invalid UUID format" if validation fails. Used on all `:id` route parameters.
  - [ ] `parse-pagination.pipe.ts` – Transforms raw query parameters into `PaginationQueryDto`. Applies defaults (page=1, limit=20), clamps limit to MAX_LIMIT (100), validates sortBy against allowed fields for the entity.
  - [ ] `sanitize.pipe.ts` – XSS prevention pipe. Strips HTML tags using `sanitize-html` library. Applied to user-generated content fields (message content, blog comments, contact form messages, descriptions). Preserves safe HTML in Markdown content (`contentFormat: 'markdown'` fields).
- [ ] `src/utils/`
  - [ ] `slug.util.ts` – `generateSlug(title: string): string` – converts string to URL-safe slug (lowercase, hyphens, no special chars, trimmed to 100 chars). `generateUniqueSlug(title, existingCheck)` – appends random suffix if slug exists. Used by portfolio items and blog posts.
  - [ ] `date.util.ts` – Date utilities: `formatISO(date)`, `addDays(date, days)`, `diffInDays(a, b)`, `isExpired(date)`, `toTimezone(date, timezone)` for user timezone conversion (per `Asia/Kolkata` default). Uses `date-fns` or native `Intl.DateTimeFormat`. All outputs ISO 8601 per `100-api-standards`.
  - [ ] `money.util.ts` – `toPaise(amount: number): number` (multiply by 100 for Razorpay), `fromPaise(paise: number): number`, `formatINR(amount: number): string` (e.g., "₹1,500.00" with Indian number formatting). Per `100-api-standards` currency handling.
  - [ ] `pagination.util.ts` – `createPaginationMeta(page, limit, totalItems): PaginationMeta` – computes `totalPages`, `hasNextPage`, `hasPreviousPage`. `buildPrismaSkipTake(page, limit): { skip, take }` for Prisma queries. `buildCursorPagination(cursor, limit)` for cursor-based (messages).
  - [ ] `hash.util.ts` – `hashPassword(password: string): Promise<string>` using bcrypt with 12 salt rounds. `comparePassword(plain, hashed): Promise<boolean>`. `hashToken(token: string): string` using SHA-256 for refresh/verification tokens (stored hashed, not plaintext).
  - [ ] `retry.util.ts` – `retryWithBackoff<T>(fn: () => Promise<T>, options: { maxRetries: 3, initialDelay: 1000, backoffFactor: 2, maxDelay: 30000 }): Promise<T>`. Implements exponential backoff with jitter. Used for external service calls (Razorpay, S3, SMTP). Per `117-error-codes` retry strategies.
  - [ ] `sanitize.util.ts` – `stripHtml(input: string): string` using `sanitize-html`. `escapeHtml(input)` for preventing XSS in user-generated content. Default allowed tags: none for plain text fields, basic formatting (`<p>`, `<strong>`, `<em>`, `<a>`, `<code>`) for rich text.
  - [ ] `uuid.util.ts` – `generateUUID(): string` using `crypto.randomUUID()` (Node.js native). `isValidUUID(value: string): boolean` using regex validation. `generateShortId(length: number): string` for human-readable IDs (e.g., `REQ-A1B2C3`).
- [ ] `package.json`, `tsconfig.json`, `README.md` – Package manifest with name `@nestlancer/common`, peer dependencies on `class-validator`, `class-transformer`, `@nestjs/common`. TypeScript config extending `tsconfig.base.json`. README documenting all exports and usage examples.

### 8.2 `libs/config/`
- [ ] `src/index.ts` – Barrel exports for `ConfigModule`, `ConfigService`, and all schema types. Used by every service: `import { ConfigService } from '@nestlancer/config'`.
- [ ] `src/config.module.ts` – NestJS `@Global()` dynamic module. `forRoot()` loads environment variables from Infisical JSON + process.env, validates against Zod/Joi schemas, and registers `ConfigService` as global provider. Called once in each service's `AppModule`. Supports environment-specific loading (dev reads from `infisical.json`, production reads from process.env/Secrets Manager).
- [ ] `src/config.service.ts` – Strongly-typed config accessor. Methods: `get<T>(key: string): T`, `getOrThrow<T>(key: string): T`. Nested accessors: `config.database.url`, `config.redis.cacheUrl`, `config.jwt.accessSecret`, `config.razorpay.keyId`. Validates all required values are present at startup – fails fast with descriptive error listing missing variables.
- [ ] `src/schemas/`
  - [ ] `app.schema.ts` – Validate: `NODE_ENV` (enum: development/test/staging/production), `PORT` (number, default 3000), `LOG_LEVEL` (enum: debug/info/warn/error, default 'info'), `API_PREFIX` (default '/api/v1'), `FRONTEND_URL` (required URL).
  - [ ] `database.schema.ts` – Validate: `DATABASE_URL` (required PostgreSQL connection string with `connection_limit=10`), `DATABASE_READ_REPLICA_URLS` (optional comma-separated connection strings for R/W split). Per ADR-005.
  - [ ] `redis.schema.ts` – Validate: `REDIS_CACHE_URL` (required Redis URL for caching, default port 6379), `REDIS_PUBSUB_URL` (required separate Redis URL for pub/sub, port 6380). Two separate instances per architecture.
  - [ ] `rabbitmq.schema.ts` – Validate: `RABBITMQ_URL` (required AMQP URL, default `amqp://localhost:5672`), `RABBITMQ_MANAGEMENT_URL` (optional, for health checks and queue depth monitoring).
  - [ ] `jwt.schema.ts` – Validate: `JWT_ACCESS_SECRET` (required, min 32 chars), `JWT_REFRESH_SECRET` (required, separate from access), `JWT_ACCESS_EXPIRY` (default '15m'), `JWT_REFRESH_EXPIRY` (default '7d'). Per ADR-003 auth strategy.
  - [ ] `storage.schema.ts` – Validate: `STORAGE_PROVIDER` (enum: s3/cloudinary/local), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_PRIVATE`, `AWS_S3_BUCKET_PUBLIC`, `AWS_S3_REGION`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Conditional: S3 vars required when provider is 's3'.
  - [ ] `smtp.schema.ts` – Validate: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME` (default 'Nestlancer'), `SMTP_FROM_EMAIL`. Alternative: `MAIL_PROVIDER = 'ses'` for AWS SES with `AWS_SES_REGION`.
  - [ ] `razorpay.schema.ts` – Validate: `RAZORPAY_KEY_ID` (starts with `rzp_test_` for test mode, `rzp_live_` for production), `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (for webhook signature verification per `120-webhooks-inbound-endpoints`).
  - [ ] `cors.schema.ts` – Validate: `CORS_ORIGINS` (comma-separated URLs or `*` for dev), `CORS_METHODS` (default 'GET,POST,PUT,PATCH,DELETE,OPTIONS'), `CORS_CREDENTIALS` (boolean, default true for cookie-based auth).
  - [ ] `rate-limit.schema.ts` – Validate: `RATE_LIMIT_ENABLED` (boolean, default true), `RATE_LIMIT_ANONYMOUS` (default 30/min), `RATE_LIMIT_AUTHENTICATED` (default 100/min), `RATE_LIMIT_ADMIN` (default 300/min). Per `100-api-standards` rate limiting tiers.
- [ ] `src/loaders/`
  - [ ] `env.loader.ts` – Load environment variables from `infisical.json` files (dev/test/staging). Reads JSON, flattens nested keys, merges with `process.env` (process.env takes precedence). Supports `.env` file fallback via `dotenv`. Used in local development.
  - [ ] `secrets.loader.ts` – Load secrets from AWS Secrets Manager or HashiCorp Vault at runtime. Used in production/staging K8s pods. Integrates with External Secrets Operator for K8s secret synchronization. Caches loaded secrets in memory to avoid repeated API calls.
- [ ] package files – `@nestlancer/config` package with deps: `@nestjs/config`, `joi` or `zod` for schema validation, `dotenv`.

### 8.3 `libs/database/`
- [ ] `src/index.ts` – Barrel exports: `DatabaseModule`, `PrismaService`, `PrismaWriteService`, `PrismaReadService`, `BaseRepository`, decorators, and interfaces.
- [ ] `src/database.module.ts` – `@Global()` NestJS module providing both Prisma clients. `forRoot()` accepts config for primary and replica connection strings. Registers `PrismaWriteService` and `PrismaReadService` as global providers. Handles graceful shutdown (`$disconnect()` on app close).
- [ ] `src/prisma/`
  - [ ] `prisma.service.ts` – Base Prisma client extending `PrismaClient` with `onModuleInit()` (connect on startup), `onModuleDestroy()` (disconnect gracefully), and `enableShutdownHooks()`. Configures query logging (log: ['query', 'info', 'warn', 'error'] in dev). Connection pool managed via `connection_limit` in DATABASE_URL.
  - [ ] `prisma-write.service.ts` – Prisma client connecting to primary PostgreSQL (read-write). Used for all INSERT, UPDATE, DELETE operations. Wraps transactional operations via `$transaction()`. Default client when no `@ReadOnly()` decorator is present. Per ADR-005 read-write split.
  - [ ] `prisma-read.service.ts` – Prisma client connecting to PostgreSQL read replica(s). Used for SELECT queries on read-heavy endpoints (portfolio listing, blog listing, analytics, admin dashboard). Methods annotated with `@ReadOnly()` use this client. Fallback to write client if no replica configured.
  - [ ] `prisma.module.ts` – Module registering both `PrismaWriteService` and `PrismaReadService`. Exports both for injection into service repositories. Conditionally creates read service only if `DATABASE_READ_REPLICA_URLS` is configured.
- [ ] `src/repositories/`
  - [ ] `base.repository.ts` – Generic abstract repository with typed CRUD: `findById(id): Promise<T | null>`, `findMany(filter, pagination): Promise<Paginated<T>>`, `create(data): Promise<T>`, `update(id, data): Promise<T>`, `softDelete(id): Promise<void>`, `hardDelete(id): Promise<void>`. Accepts Prisma model delegate. Automatically applies soft-delete filter (`where: { deletedAt: null }`). Subclassed by each service's repository.
- [ ] `src/interfaces/`
  - [ ] `repository.interface.ts` – `IRepository<T>` interface defining CRUD contract. Generic type parameter for entity type. Ensures consistent repository API across all services.
  - [ ] `transaction.interface.ts` – `ITransactionManager { execute<T>(fn: (tx: PrismaTransaction) => Promise<T>): Promise<T> }`. Wraps `prisma.$transaction()` with configurable timeout and isolation level. Used for multi-table operations (e.g., create payment + update milestone + publish outbox event atomically).
- [ ] `src/decorators/`
  - [ ] `read-only.decorator.ts` – `@ReadOnly()` method decorator. Sets metadata to route the query through `PrismaReadService` (replica). Applied to service methods that only read data. Per ADR-005.
  - [ ] `write-only.decorator.ts` – `@WriteOnly()` method decorator. Explicitly routes through `PrismaWriteService` (primary). Default behavior, but useful for clarity in services that mix reads and writes.
  - [ ] `transactional.decorator.ts` – `@Transactional()` method decorator. Wraps the entire method in a `prisma.$transaction()`. Ensures atomicity for business operations that span multiple DB writes (e.g., accept quote → create project → create milestones → publish events to outbox).
- [ ] `src/utils/`
  - [ ] `query-builder.util.ts` – `buildWhereClause(filters: FilterParams): Prisma.XXXWhereInput` – converts API filter format (`?filter[status]=active&filter[createdAt][gte]=2026-01-01`) to Prisma `where` clause. Supports operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `notIn`, `contains`, `startsWith`. Validates field names against allowed list to prevent injection.
  - [ ] `soft-delete.util.ts` – `applySoftDeleteFilter(where): where` – adds `{ deletedAt: null }` to where clause. `softDelete(prisma, model, id): Promise<void>` – sets `deletedAt = new Date()`. `restore(prisma, model, id)` – sets `deletedAt = null`. Used by User and Message models that support soft delete.
- [ ] package files – `@nestlancer/database` with deps: `@prisma/client`, `prisma` (dev).

### 8.4 `libs/cache/`
- [ ] `src/index.ts` – Barrel exports: `CacheModule`, `CacheService`, decorators, and interfaces.
- [ ] `src/cache.module.ts` – NestJS module providing `CacheService` backed by Redis. `forRoot({ url, prefix, defaultTtl })` configures Redis connection using `ioredis`. Registers as global module for cross-service caching.
- [ ] `src/cache.service.ts` – Abstract cache service defining contract: `get<T>(key): Promise<T | null>`, `set(key, value, ttl?): Promise<void>`, `del(key): Promise<void>`, `delByPattern(pattern): Promise<void>`, `delByTag(tag): Promise<void>`, `exists(key): Promise<boolean>`, `ttl(key): Promise<number>`, `increment(key): Promise<number>`. All keys prefixed with `nestlancer:`.
- [ ] `src/redis-cache.service.ts` – Redis implementation of `CacheService` using `ioredis`. JSON serialization for complex objects. Tag-based invalidation: stores tag→key mappings in Redis Sets, `delByTag('portfolio')` deletes all keys in the set. Supports key patterns via `SCAN` (not `KEYS` to avoid blocking). Connection health check for readiness probe.
- [ ] `src/strategies/`
  - [ ] `ttl.strategy.ts` – Compute TTL per entity type: health checks 30s, user profiles 5min, portfolio/blog public pages 1h, system config 24h, API responses 5min default. Per ADR-008 caching strategy. Returns TTL in seconds.
  - [ ] `lru.strategy.ts` – LRU eviction strategy configuration. Maps to Redis `maxmemory-policy: allkeys-lru`. Ensures most recently accessed data stays in cache when memory limit is reached. No application-level implementation needed (handled by Redis server config).
  - [ ] `tag-based-invalidation.strategy.ts` – Tag management: `tagKey(key, tags[])` associates a cache key with one or more tags (stored as Redis Sets `tag:<name>`). `invalidateTag(tag)` retrieves all keys from the Set and deletes them. Example: updating a portfolio item invalidates tags `['portfolio', 'portfolio:item:123']`.
- [ ] `src/decorators/`
  - [ ] `cacheable.decorator.ts` – `@Cacheable({ key: 'portfolio:list', ttl: 3600, tags: ['portfolio'] })` method decorator. Intercepts method call, checks cache first, returns cached value if hit, otherwise executes method, caches result, and returns. Key supports dynamic interpolation: `'portfolio:item:${args[0]}'`.
  - [ ] `cache-invalidate.decorator.ts` – `@CacheInvalidate({ tags: ['portfolio'] })` method decorator. After method execution, invalidates all cache entries with specified tags. Applied to create/update/delete operations.
- [ ] `src/interfaces/`
  - [ ] `cache.interface.ts` – `ICache` interface defining all cache operations. Allows swapping Redis for in-memory cache in tests. Methods: `get`, `set`, `del`, `delByPattern`, `delByTag`, `exists`, `ttl`, `increment`, `decrement`.
- [ ] package files – `@nestlancer/cache` with deps: `ioredis`, `@nestjs/common`.

### 8.5 `libs/queue/`
- [ ] `src/index.ts` – Barrel exports: `QueueModule`, `QueuePublisherService`, `QueueConsumerService`, exchange constants, routing keys, decorators, and interfaces.
- [ ] `src/queue.module.ts` – NestJS module for RabbitMQ integration. `forRoot({ url })` creates AMQP connection and channel using `amqplib`. `forConsumer({ queue, exchange, routingKey, prefetch })` configures a consumer. Sets up connection recovery (auto-reconnect on failure). Asserts exchanges and queues on startup.
- [ ] `src/queue-publisher.service.ts` – `publish(exchange, routingKey, message, options?): Promise<void>`. Serializes message to JSON, wraps in standard envelope (messageId UUID, timestamp, correlationId, payload). Uses publisher confirms (`channel.waitForConfirms()`) for reliable delivery. Persistent messages (`deliveryMode: 2`). Used by services to publish domain events after outbox polling.
- [ ] `src/queue-consumer.service.ts` – Base consumer class. `consume(queue, handler, options): void`. Manages channel lifecycle, prefetch count (default: 10), manual ack/nack. On success: `channel.ack(msg)`. On failure: `channel.nack(msg, false, false)` (reject to DLQ). Connection recovery with exponential backoff. Health check via connection status.
- [ ] `src/exchanges/`
  - [ ] `events.exchange.ts` – `EVENTS_EXCHANGE = 'nestlancer.events'` (topic exchange). All domain events published here. Routing key format: `<service>.<entity>.<action>` (e.g., `project.project.created`, `payment.payment.completed`). Consumers bind with patterns (e.g., `email.queue` binds `*.*.created` + `payment.*.*`).
  - [ ] `webhooks.exchange.ts` – `WEBHOOKS_EXCHANGE = 'nestlancer.webhooks'` (direct exchange). Outbound webhook deliveries. Routing key: `webhook.<webhookId>`. Webhook-worker binds to all with pattern `webhook.*`.
- [ ] `src/routing-keys/`
  - [ ] `email.routing-keys.ts` – Constants: `EMAIL_VERIFICATION = 'email.verification'`, `EMAIL_PASSWORD_RESET = 'email.password-reset'`, `EMAIL_WELCOME = 'email.welcome'`, `EMAIL_QUOTE_SENT = 'email.quote-sent'`, `EMAIL_PAYMENT_RECEIPT = 'email.payment-receipt'`, `EMAIL_PROJECT_UPDATE = 'email.project-update'`, `EMAIL_CONTACT_RESPONSE = 'email.contact-response'`. Bound to `email.queue`.
  - [ ] `notification.routing-keys.ts` – Constants for in-app and push notification events: `NOTIFICATION_REQUEST_STATUS = 'notification.request.status'`, `NOTIFICATION_QUOTE_RECEIVED = 'notification.quote.received'`, `NOTIFICATION_PAYMENT = 'notification.payment.*'`, `NOTIFICATION_MESSAGE = 'notification.message.new'`, `NOTIFICATION_MILESTONE = 'notification.milestone.*'`.
  - [ ] `audit.routing-keys.ts` – Constants: `AUDIT_USER_ACTION = 'audit.user.*'`, `AUDIT_ADMIN_ACTION = 'audit.admin.*'`, `AUDIT_SYSTEM_ACTION = 'audit.system.*'`. All auditable events routed to `audit.queue` for batch insert by audit-worker.
  - [ ] `media.routing-keys.ts` – Constants: `MEDIA_UPLOADED = 'media.uploaded'`, `MEDIA_PROCESS_IMAGE = 'media.process.image'`, `MEDIA_PROCESS_VIDEO = 'media.process.video'`, `MEDIA_VIRUS_SCAN = 'media.virus-scan'`. Bound to `media.queue` consumed by media-worker.
  - [ ] `analytics.routing-keys.ts` – Constants: `ANALYTICS_PAGE_VIEW = 'analytics.view.page'`, `ANALYTICS_PORTFOLIO_VIEW = 'analytics.view.portfolio'`, `ANALYTICS_BLOG_VIEW = 'analytics.view.blog'`, `ANALYTICS_API_USAGE = 'analytics.api.usage'`. Low-priority events for analytics-worker.
  - [ ] `webhook.routing-keys.ts` – Constants: `WEBHOOK_OUTBOUND_DELIVERY = 'webhook.outbound.delivery'`, `WEBHOOK_INBOUND_RAZORPAY = 'webhook.inbound.razorpay'`, `WEBHOOK_INBOUND_GITHUB = 'webhook.inbound.github'`. Outbound bound to `webhook.queue`, inbound processed by webhook-worker.
  - [ ] `cdn.routing-keys.ts` – Constants: `CDN_INVALIDATE_PATH = 'cdn.invalidate.path'`, `CDN_INVALIDATE_TAG = 'cdn.invalidate.tag'`, `CDN_PURGE_ALL = 'cdn.purge.all'`. Bound to `cdn.queue` consumed by cdn-worker for CloudFront/Cloudflare cache invalidation.
- [ ] `src/interfaces/`
  - [ ] `message-envelope.interface.ts` – `MessageEnvelope<T> { messageId: string (UUID), correlationId: string, timestamp: string (ISO 8601), source: string (service name), eventType: string (routing key), payload: T, metadata?: Record<string, any> }`. Standard wrapper for all messages published to RabbitMQ.
  - [ ] `queue-options.interface.ts` – `PublishOptions { persistent: boolean (default true), priority?: number (0-9), expiration?: string (ms), headers?: Record<string, string> }`. Passed to `QueuePublisherService.publish()`.
  - [ ] `consumer-options.interface.ts` – `ConsumerOptions { prefetch: number (default 10), noAck: boolean (default false), exclusive?: boolean, consumerTag?: string }`. Configures consumer behavior per queue.
- [ ] `src/decorators/`
  - [ ] `consume.decorator.ts` – `@Consume({ queue: 'email.queue', routingKey: 'email.*' })` method decorator. Registers method as RabbitMQ consumer handler. Auto-asserts queue binding on module init. Handler receives deserialized `MessageEnvelope<T>`.
- [ ] `src/dlq/`
  - [ ] `dlq.service.ts` – Dead-letter queue management. `inspectDlq(queueName): Promise<DlqMessage[]>` – peek at failed messages. `replayMessage(messageId): Promise<void>` – re-publish to original exchange. `replayAll(queueName): Promise<number>` – batch replay. `discardMessage(messageId): Promise<void>` – acknowledge and discard. Used by admin API for DLQ processing per `dlq-processing.md` runbook.
  - [ ] `dlq.interface.ts` – `DlqMessage { messageId, originalQueue, originalRoutingKey, failureReason, failedAt, retryCount, payload, headers }`. Metadata added by RabbitMQ's `x-death` header on dead-letter routing.
- [ ] package files – `@nestlancer/queue` with deps: `amqplib`, `@types/amqplib`, `uuid`.

### 8.6 `libs/outbox/`
- [ ] `src/index.ts` – Barrel exports: `OutboxModule`, `OutboxService`, `OutboxPollerService`, interfaces.
- [ ] `src/outbox.module.ts` – NestJS module providing `OutboxService` (for services to create outbox entries) and `OutboxPollerService` (for the outbox-poller worker). `forRoot()` configures poll interval and batch size. Per ADR-004 transactional outbox pattern.
- [ ] `src/outbox.service.ts` – `createEvent(tx: PrismaTransaction, { aggregateType, aggregateId, eventType, payload }): Promise<void>`. Creates `OutboxEvent` record within the same database transaction as the business operation. Guarantees event is persisted atomically with business data. Called by services: `outboxService.createEvent(tx, { aggregateType: 'Project', aggregateId: project.id, eventType: 'project.created', payload: projectData })`.
- [ ] `src/outbox-poller.service.ts` – Polls `OutboxEvent` table every 1-5 seconds (configurable). Query: `SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED`. For each event: publish to RabbitMQ via `QueuePublisherService` → update status to `PUBLISHED` with `publishedAt` timestamp. On publish failure: increment `retryCount`, set `lastRetryAt`, mark `FAILED` after 5 retries. Cleanup: delete `PUBLISHED` events older than 7 days.
- [ ] `src/outbox.repository.ts` – Database operations: `findPendingEvents(batchSize): Promise<OutboxEvent[]>`, `markPublished(id): Promise<void>`, `markFailed(id, error): Promise<void>`, `incrementRetry(id): Promise<void>`, `cleanupOldEvents(retentionDays): Promise<number>`. Uses `PrismaWriteService` exclusively.
- [ ] `src/interfaces/`
  - [ ] `outbox-event.interface.ts` – `OutboxEvent { id, aggregateType, aggregateId, eventType, payload: Record<string, any>, status: 'PENDING' | 'PUBLISHED' | 'FAILED', publishedAt?, retryCount, lastRetryAt?, error?, createdAt }`. Maps to `OutboxEvent` Prisma model.
  - [ ] `outbox-options.interface.ts` – `OutboxPollerOptions { pollIntervalMs: number (default 2000), batchSize: number (default 100), maxRetries: number (default 5), cleanupRetentionDays: number (default 7) }`. Passed to `OutboxModule.forRoot()`.
- [ ] package files – `@nestlancer/outbox` with deps: `@nestlancer/database`, `@nestlancer/queue`.

### 8.7 `libs/auth-lib/`
- [ ] `src/index.ts` – Barrel exports: `AuthLibModule`, all guards, strategies, decorators, and interfaces. Every service imports this for authentication and authorization.
- [ ] `src/auth-lib.module.ts` – NestJS module exporting all guards and strategies. Registers `JwtStrategy` and `JwtRefreshStrategy` with `@nestjs/passport`. Imports `ConfigModule` for JWT secret access. Sets `JwtAuthGuard` as global guard (all routes protected by default, opt-out via `@Public()`).
- [ ] `src/guards/`
  - [ ] `jwt-auth.guard.ts` – Extends `AuthGuard('jwt')`. Checks `@Public()` metadata – skips auth if set. Extracts JWT from `Authorization: Bearer <token>` header or `access_token` httpOnly cookie. On success: attaches `AuthenticatedUser` to `request.user`. On failure: throws `UnauthorizedException` with `AUTH_001` error code. Per ADR-003.
  - [ ] `roles.guard.ts` – Checks `@Roles()` metadata against `request.user.role`. If user role is not in allowed roles, throws `ForbiddenException` with `AUTH_INSUFFICIENT_ROLE`. ADMIN role has access to all endpoints by default.
  - [ ] `permissions.guard.ts` – Fine-grained permission check. Checks `@Permissions()` metadata against user's permission set. Currently maps directly from role (ADMIN = all permissions, USER = standard permissions). Extensible for future role-permission matrix.
  - [ ] `webhook-auth.guard.ts` – Validates inbound webhook signatures. For Razorpay: verifies `X-Razorpay-Signature` using HMAC SHA256 with `RAZORPAY_WEBHOOK_SECRET`. For GitHub: verifies `X-Hub-Signature-256` using HMAC SHA256 with `GITHUB_WEBHOOK_SECRET`. Per `120-webhooks-inbound-endpoints`.
  - [ ] `csrf.guard.ts` – Validates CSRF token via double-submit cookie pattern. Extracts `X-CSRF-Token` header and compares with `csrf_token` cookie. Required for cookie-based auth (web clients). Skipped for Bearer token auth (mobile/API). Per `100-api-standards` CSRF protection.
  - [ ] `api-key.guard.ts` – Validates API key from `X-API-Key` header. Used for service-to-service communication and SDK/API integrations. Looks up key in database, validates not expired/revoked, attaches associated user/service context.
- [ ] `src/strategies/`
  - [ ] `jwt.strategy.ts` – Passport JWT strategy for access tokens. Extracts token from Bearer header or cookie. Verifies with `JWT_ACCESS_SECRET` (RS256 or HS256). Validates `exp` (15min TTL), `sub` (userId exists in DB), user status (ACTIVE). Returns `JwtPayload` to guard.
  - [ ] `jwt-refresh.strategy.ts` – Passport strategy for refresh tokens. Extracts from `refresh_token` cookie or request body. Verifies with `JWT_REFRESH_SECRET`. Validates token exists in DB (`RefreshToken` table), not revoked, not expired (7 days). Implements token family rotation per ADR-003.
  - [ ] `api-key.strategy.ts` – Custom Passport strategy for API key extraction. Reads `X-API-Key` header, hashes the key, looks up in database, validates scope and expiry. Returns service context for downstream authorization.
- [ ] `src/decorators/`
  - [ ] `auth.decorator.ts` – `@Auth(...roles?)` composite decorator combining `@UseGuards(JwtAuthGuard, RolesGuard)` and optionally `@Roles(...)`. Shorthand: `@Auth()` = authenticated user, `@Auth(UserRole.ADMIN)` = admin only. Replaces verbose guard stacking.
  - [ ] `roles.decorator.ts` – `@Roles(UserRole.ADMIN, UserRole.USER)` decorator using `SetMetadata('roles', roles)`. Read by `RolesGuard`.
  - [ ] `permissions.decorator.ts` – `@Permissions('projects:write', 'payments:read')` decorator. Sets required permissions checked by `PermissionsGuard`.
  - [ ] `current-user.decorator.ts` – `@CurrentUser(field?: string)` parameter decorator. Returns full `AuthenticatedUser` or specific field: `@CurrentUser('id')` returns just userId string.
- [ ] `src/interfaces/`
  - [ ] `jwt-payload.interface.ts` – `JwtPayload { sub: string, email: string, role: UserRole, iat: number, exp: number, jti: string }`. Decoded JWT token payload structure.
  - [ ] `authenticated-user.interface.ts` – `AuthenticatedUser { id: string, email: string, role: UserRole, emailVerified: boolean, twoFactorEnabled: boolean }`. Attached to `request.user` by `JwtAuthGuard`. Available via `@CurrentUser()`.
  - [ ] `permission.interface.ts` – `Permission { resource: string, action: 'read' | 'write' | 'delete' | 'admin', scope?: 'own' | 'all' }`. For future fine-grained RBAC expansion.
- [ ] `src/utils/`
  - [ ] `token.util.ts` – `generateAccessToken(payload: JwtPayload): string` using `jsonwebtoken.sign()` with `JWT_ACCESS_SECRET`, expiry 15min. `generateRefreshToken(payload): string` with `JWT_REFRESH_SECRET`, expiry 7d. `verifyToken(token, secret): JwtPayload`. `generateRandomToken(bytes: number = 32): string` for email verification and password reset tokens (crypto-random, hex-encoded).
  - [ ] `password.util.ts` – `hashPassword(password: string): Promise<string>` using bcrypt with 12 salt rounds. `comparePassword(plain, hash): Promise<boolean>`. Wrapper around `@nestlancer/crypto` hashing service for auth-specific usage.
- [ ] package files – `@nestlancer/auth-lib` with deps: `@nestjs/passport`, `passport`, `passport-jwt`, `jsonwebtoken`, `@nestlancer/common`, `@nestlancer/config`.

### 8.8 `libs/logger/`
- [ ] `src/index.ts` – Barrel exports: `LoggerModule`, `LoggerService`, formatters, transports, and middleware.
- [ ] `src/logger.module.ts` – `@Global()` module providing `LoggerService`. `forRoot({ level, format, transports })` configures based on environment. Dev: pretty format + console. Production: JSON format + console (collected by K8s log driver) + optional aggregator.
- [ ] `src/logger.service.ts` – Structured logger built on `pino` (preferred for performance) or `winston`. Methods: `log(message, context?)`, `error(message, trace?, context?)`, `warn(message, context?)`, `debug(message, context?)`. Automatically includes: `timestamp` (ISO 8601), `correlationId` (from AsyncLocalStorage), `service` (from config), `level`, `pid`. Implements NestJS `LoggerService` interface for framework integration.
- [ ] `src/formatters/`
  - [ ] `json.formatter.ts` – Production log format: single-line JSON per log entry. Fields: `timestamp`, `level`, `message`, `service`, `correlationId`, `userId`, `ip`, `method`, `url`, `statusCode`, `duration`, `error` (with stack trace). Parseable by ELK Stack, Datadog, CloudWatch Logs Insights.
  - [ ] `pretty.formatter.ts` – Development log format: colorized, multi-line, human-readable. Color by level (red=error, yellow=warn, green=info, blue=debug). Includes timestamp, service name, correlation ID. Stack traces formatted with source maps for debugging.
- [ ] `src/transports/`
  - [ ] `console.transport.ts` – Default transport writing to stdout/stderr. stdout for info/debug, stderr for warn/error. Used in all environments. K8s collects stdout via container log driver.
  - [ ] `file.transport.ts` – Write logs to rotating files using `pino-roll` or `winston-daily-rotate-file`. Max file size 50MB, max files 14 days retention. Used in non-containerized deployments or for persistent debug logs.
  - [ ] `aggregator.transport.ts` – Send logs to external aggregator: Datadog (`pino-datadog`), Loki (for Grafana), or CloudWatch Logs. Batches log entries for efficient network usage. Includes service metadata tags for filtering in aggregator UI.
- [ ] `src/middleware/`
  - [ ] `request-logger.middleware.ts` – NestJS middleware logging every HTTP request. On request start: `{ method, url, ip, userAgent, correlationId }`. On response: `{ statusCode, duration: Date.now() - startTime, contentLength }`. Excludes health check endpoints (`/health/*`) from logging to reduce noise. Masks sensitive headers (`Authorization`, `Cookie`).
- [ ] `src/interfaces/`
  - [ ] `log-context.interface.ts` – `LogContext { correlationId?: string, userId?: string, service?: string, method?: string, url?: string, ip?: string, [key: string]: any }`. Passed as second argument to logger methods for structured context.
- [ ] package files – `@nestlancer/logger` with deps: `pino`, `pino-pretty` (dev), `pino-http`, `cls-hooked` or `AsyncLocalStorage`.

### 8.9 `libs/metrics/`
- [ ] `src/index.ts` – Barrel exports: `MetricsModule`, `MetricsService`, collectors, interceptors, and interfaces.
- [ ] `src/metrics.module.ts` – NestJS module providing `MetricsService` and all collectors. Exposes `/metrics` endpoint (Prometheus-compatible) via dedicated controller. Registers default Node.js metrics (memory, CPU, event loop lag, GC stats) via `prom-client` `collectDefaultMetrics()`.
- [ ] `src/metrics.service.ts` – Abstract metrics service: `incrementCounter(name, labels?)`, `observeHistogram(name, value, labels?)`, `setGauge(name, value, labels?)`, `startTimer(name, labels?): () => void`. Wraps `prom-client` primitives. Provides service-specific metric naming with `nestlancer_` prefix.
- [ ] `src/prometheus.service.ts` – Prometheus implementation using `prom-client`. Registers metrics registry, creates counters/histograms/gauges on first use. Serializes all metrics via `register.metrics()` for the `/metrics` endpoint. Labels include `service`, `method`, `status_code`, `path`.
- [ ] `src/collectors/`
  - [ ] `http-metrics.collector.ts` – Records HTTP metrics: `nestlancer_http_requests_total` (counter, labels: method, path, status_code), `nestlancer_http_request_duration_seconds` (histogram, buckets: 0.01, 0.05, 0.1, 0.5, 1, 5, 10), `nestlancer_http_request_size_bytes`, `nestlancer_http_response_size_bytes`. Auto-collected via `MetricsInterceptor`.
  - [ ] `queue-metrics.collector.ts` – Records RabbitMQ metrics: `nestlancer_queue_messages_total` (counter, labels: queue, action=published/consumed/failed), `nestlancer_queue_depth` (gauge per queue), `nestlancer_queue_consumer_count` (gauge), `nestlancer_queue_processing_duration_seconds` (histogram). Collected by workers.
  - [ ] `db-metrics.collector.ts` – Records PostgreSQL metrics: `nestlancer_db_query_duration_seconds` (histogram, labels: operation=select/insert/update/delete), `nestlancer_db_connection_pool_active` (gauge), `nestlancer_db_connection_pool_idle` (gauge), `nestlancer_db_errors_total` (counter). Collected via Prisma middleware or event hooks.
  - [ ] `cache-metrics.collector.ts` – Records Redis cache metrics: `nestlancer_cache_hits_total` (counter), `nestlancer_cache_misses_total` (counter), `nestlancer_cache_hit_ratio` (gauge, computed), `nestlancer_cache_operation_duration_seconds` (histogram, labels: operation=get/set/del). Collected by `CacheService`.
  - [ ] `custom-metrics.collector.ts` – Business-specific metrics: `nestlancer_users_registered_total`, `nestlancer_projects_created_total`, `nestlancer_payments_processed_total` (counter, labels: status, method), `nestlancer_active_websocket_connections` (gauge), `nestlancer_active_projects` (gauge). For Grafana business dashboards.
- [ ] `src/interceptors/`
  - [ ] `metrics.interceptor.ts` – NestJS interceptor recording HTTP request metrics. Starts timer on request, records duration and labels on response. Applied globally via `APP_INTERCEPTOR`. Excludes `/metrics` endpoint to avoid self-measurement. Labels: method, route (parameterized path, not actual URL to avoid cardinality explosion), status_code.
- [ ] `src/interfaces/`
  - [ ] `metric.interface.ts` – `MetricDefinition { name: string, type: 'counter' | 'histogram' | 'gauge', help: string, labelNames?: string[], buckets?: number[] }`. For registering custom metrics.
- [ ] package files – `@nestlancer/metrics` with deps: `prom-client`.

### 8.10 `libs/tracing/`
- [ ] `src/index.ts` – Barrel exports: `TracingModule`, `TracingService`, middleware, interceptors, and interfaces.
- [ ] `src/tracing.module.ts` – NestJS module configuring OpenTelemetry distributed tracing. `forRoot({ serviceName, jaegerEndpoint, samplingRate })`. Initializes OTel SDK on module init. Registers span processors and exporters. Enables auto-instrumentation for HTTP, Prisma, and amqplib.
- [ ] `src/tracing.service.ts` – Service for manual span management: `startSpan(name, attributes?): Span`, `endSpan(span, status?)`, `setSpanAttributes(span, attributes)`, `recordException(span, error)`, `getActiveSpan(): Span | undefined`. Used for custom business logic tracing beyond auto-instrumentation.
- [ ] `src/otel-setup.ts` – OpenTelemetry Node.js SDK setup. Configure: `JaegerExporter` endpoint (default `http://jaeger:14268/api/traces`), `BatchSpanProcessor` (batch size 512, flush interval 5s), `W3CTraceContextPropagator` for cross-service trace correlation. Sampling: `TraceIdRatioBasedSampler(1.0)` in dev (trace all), `TraceIdRatioBasedSampler(0.01)` in production (1%).
- [ ] `src/propagators/`
  - [ ] `context-propagator.ts` – Extract/inject trace context from/to HTTP headers (`traceparent`, `tracestate` per W3C TraceContext spec). Also propagates via RabbitMQ message headers for async trace continuity. Enables end-to-end trace from API request through queue to worker processing.
- [ ] `src/interceptors/`
  - [ ] `tracing.interceptor.ts` – NestJS interceptor creating a span for each HTTP request. Span name: `HTTP ${method} ${route}`. Attributes: `http.method`, `http.url`, `http.status_code`, `user.id`, `http.request_content_length`, `http.response_content_length`. Records exception on error. Applied globally or per-controller.
- [ ] `src/middleware/`
  - [ ] `correlation-id.middleware.ts` – Generates `X-Correlation-ID` header (UUID v4) if not present in request. Forwards existing correlation ID for cross-service requests. Stores in `AsyncLocalStorage` for access throughout the request lifecycle (logger, tracing, audit). Adds to response headers for client correlation.
- [ ] `src/interfaces/`
  - [ ] `span-context.interface.ts` – `SpanContext { traceId: string (32 hex chars), spanId: string (16 hex chars), traceFlags: number, traceState?: string }`. Represents W3C trace context for cross-service propagation.
- [ ] package files – `@nestlancer/tracing` with deps: `@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/exporter-jaeger`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-nestjs-core`.

### 8.11 `libs/health-lib/`
- [ ] `src/index.ts` – Barrel exports: `HealthLibModule`, all health indicators, and interfaces.
- [ ] `src/health-lib.module.ts` – NestJS module providing all health indicator services. Imported by each service and gateway to compose their health check endpoint (`/api/v1/health`). Uses `@nestjs/terminus` framework for standardized health check responses.
- [ ] `src/indicators/`
  - [ ] `database.indicator.ts` – `DatabaseHealthIndicator` extending `HealthIndicator`. Executes `SELECT 1` on primary PostgreSQL via Prisma. Checks connection pool availability. Reports: connection status, pool size (active/idle), response time in ms. Used by readiness probe. Per `101-health-endpoints`: degraded if response >500ms, unhealthy if connection fails.
  - [ ] `redis.indicator.ts` – `RedisHealthIndicator`. Executes `PING` on both Redis instances (cache + pub/sub). Reports: connection status, used memory, uptime, connected clients. Separate checks: `redis-cache` and `redis-pubsub`. Per `101-health-endpoints`.
  - [ ] `rabbitmq.indicator.ts` – `RabbitMQHealthIndicator`. Checks AMQP connection status via `amqplib` connection heartbeat. Reports: connection status, queue count, consumer count. Per `101-health-endpoints`.
  - [ ] `storage.indicator.ts` – `StorageHealthIndicator`. For S3: `HeadBucket` API call to verify bucket access. For Cloudinary: `api.ping()`. Reports: provider type, bucket/cloud name, connection status. Per `101-health-endpoints`.
  - [ ] `smtp.indicator.ts` – `SmtpHealthIndicator`. Verifies SMTP connection via `nodemailer.createTransport().verify()`. Reports: host, port, connection status. Does not send actual email. Per `101-health-endpoints`.
  - [ ] `memory.indicator.ts` – `MemoryHealthIndicator`. Checks `process.memoryUsage()`. Reports: heapUsed, heapTotal, rss, external. Degraded if heapUsed >80% of heapTotal. Unhealthy if RSS >512MB (configurable per service).
  - [ ] `disk.indicator.ts` – `DiskHealthIndicator`. Checks available disk space via `check-disk-space` package. Reports: free space, total space, percentage used. Degraded if <20% free, unhealthy if <10%. Important for services writing logs or temp files.
- [ ] `src/interfaces/`
  - [ ] `health-indicator.interface.ts` – `IHealthIndicator { name: string, check(): Promise<HealthCheckResult> }`. `HealthCheckResult { status: 'healthy' | 'degraded' | 'unhealthy', details?: Record<string, any>, responseTime?: number }`. Standard interface implemented by all indicators.
- [ ] package files – `@nestlancer/health-lib` with deps: `@nestjs/terminus`, `@nestjs/common`.

### 8.12 `libs/idempotency/`
- [ ] `src/index.ts` – Barrel exports: `IdempotencyModule`, `IdempotencyService`, guard, interceptor, decorators, stores, and interfaces.
- [ ] `src/idempotency.module.ts` – NestJS module providing idempotency key management. `forRoot({ redisUrl, ttl: 86400 })` configures Redis store with 24h TTL and PostgreSQL fallback. Per ADR-007 idempotency strategy.
- [ ] `src/idempotency.service.ts` – `checkKey(key: string, requestHash: string): Promise<CachedResponse | null>` – checks Redis first (fast, O(1)), falls back to PostgreSQL. `storeResult(key, requestHash, response): Promise<void>` – stores in both Redis (with TTL) and PostgreSQL (durable). `isProcessing(key): Promise<boolean>` – distributed lock to prevent concurrent processing of same key.
- [ ] `src/idempotency.guard.ts` – NestJS guard applied to `@Idempotent()` decorated endpoints. (1) Extracts `Idempotency-Key` header. (2) Validates UUID v4 format. (3) Checks if key exists → returns cached response if found with matching hash. (4) If key exists but hash differs → throws `IdempotencyConflictException`. (5) If new key → allows request to proceed. Per `100-api-standards` idempotency spec.
- [ ] `src/idempotency.interceptor.ts` – NestJS interceptor capturing response after handler execution. Stores response body and status code in idempotency store keyed by `Idempotency-Key`. Works in conjunction with `IdempotencyGuard`: guard checks before, interceptor stores after.
- [ ] `src/stores/`
  - [ ] `redis-idempotency.store.ts` – Fast Redis-based store. Key format: `idempotency:<key>`. Value: JSON `{ requestHash, responseStatusCode, responseBody, createdAt }`. TTL: 24h (configurable). Used as primary lookup for performance. O(1) GET operation.
  - [ ] `db-idempotency.store.ts` – Durable PostgreSQL-based store using `IdempotencyKey` Prisma model. Fallback when Redis is unavailable. Also serves as source of truth (Redis may evict under memory pressure). Cleanup cron job purges expired keys daily.
- [ ] `src/decorators/`
  - [ ] `idempotent.decorator.ts` – `@Idempotent()` method decorator. Sets metadata for `IdempotencyGuard` and `IdempotencyInterceptor` to activate. Applied to: `POST /payments/intents`, `POST /payments/confirm`, `POST /quotes/:id/accept`, `POST /requests`, `POST /milestones/:id/release-payment`. Any endpoint where duplicate execution has side effects.
- [ ] `src/interfaces/`
  - [ ] `idempotency-store.interface.ts` – `IIdempotencyStore { get(key): Promise<StoredResponse | null>, set(key, data, ttl): Promise<void>, delete(key): Promise<void>, acquireLock(key, ttl): Promise<boolean>, releaseLock(key): Promise<void> }`. Interface for both Redis and DB stores.
- [ ] package files – `@nestlancer/idempotency` with deps: `ioredis`, `@nestlancer/database`, `@nestlancer/common`.

### 8.13 `libs/audit/`
- [ ] `src/index.ts` – Barrel exports: `AuditModule`, `AuditWriterService`, decorators, and interfaces.
- [ ] `src/audit.module.ts` – NestJS module providing `AuditWriterService`. Configurable: `forRoot({ mode: 'queue' | 'direct' })`. In `queue` mode (default, production): publishes audit events to `audit.queue` via RabbitMQ for async batch processing by audit-worker. In `direct` mode (dev/test): writes directly to PostgreSQL `AuditLog` table. Per `115-admin-endpoints` audit trail requirements.
- [ ] `src/audit-writer.service.ts` – `writeAuditLog(entry: AuditEntry): Promise<void>`. Creates structured audit log entries for: user login/logout, password changes, profile updates, role changes, project status changes, payment operations, admin impersonation start/end, system config changes, feature flag toggles. In queue mode: publishes to `audit.queue`. In direct mode: calls `AuditRepository.create()`. Attaches correlation ID, IP address, and user agent from request context.
- [ ] `src/audit.repository.ts` – `create(entry: AuditEntry): Promise<void>`, `findByUserId(userId, pagination): Promise<Paginated<AuditLog>>`, `findByResource(resourceType, resourceId): Promise<AuditLog[]>`, `findByDateRange(from, to, filters): Promise<Paginated<AuditLog>>`. Uses `PrismaWriteService` for inserts. Read queries use `PrismaReadService` for admin dashboard. BRIN index on `createdAt` for efficient time-range queries.
- [ ] `src/decorators/`
  - [ ] `auditable.decorator.ts` – `@Auditable({ action: 'user.profile_updated', resourceType: 'User' })` method decorator. AOP-style: after method execution, calls `AuditWriterService.writeAuditLog()` with action, resource info, and diff of changes (before/after). Extracts context from `@CurrentUser()` and request object.
- [ ] `src/interfaces/`
  - [ ] `audit-entry.interface.ts` – `AuditEntry { action: string, resourceType: string, resourceId?: string, userId?: string, changes?: { before: any, after: any }, metadata?: Record<string, any> }`. Serialized to JSONB `changes` column for before/after comparison in admin audit viewer.
  - [ ] `audit-context.interface.ts` – `AuditContextData { userId: string, ipAddress: string, userAgent: string, correlationId: string, sessionId?: string }`. Populated from request context, passed to audit writer. Enables tracking who did what from where.
- [ ] package files – `@nestlancer/audit` with deps: `@nestlancer/database`, `@nestlancer/queue`, `@nestlancer/common`.

### 8.14 `libs/alerts/`
- [ ] `src/index.ts` – Barrel exports: `AlertsModule`, `AlertsService`, channels, rules, and interfaces.
- [ ] `src/alerts.module.ts` – NestJS module providing `AlertsService`. `forRoot({ channels: ['slack', 'email'], defaultSeverity })` configures active alert channels. Imported by services and workers that need to trigger operational alerts (distinct from user notifications).
- [ ] `src/alerts.service.ts` – `sendAlert(alert: Alert): Promise<void>`. Routes alert to configured channels based on severity: CRITICAL → all channels (PagerDuty + Slack + email), HIGH → Slack + email, MEDIUM → Slack only, LOW → logged only. Deduplicates alerts within a 5-minute window to prevent alert storms. Includes alert metadata: service name, environment, timestamp, correlation ID.
- [ ] `src/channels/`
  - [ ] `pagerduty.channel.ts` – PagerDuty integration via Events API v2. Creates incidents for CRITICAL alerts. Resolves incidents when service recovers. Includes: service name, severity, description, custom details (error stack, affected component). Requires `PAGERDUTY_ROUTING_KEY` env var.
  - [ ] `slack.channel.ts` – Slack webhook integration. Sends formatted alert messages to `#ops-alerts` channel via incoming webhook URL. Message format: color-coded by severity (red=critical, orange=high, yellow=medium), includes service name, timestamp, alert message, and link to relevant runbook/dashboard. Requires `SLACK_WEBHOOK_URL` env var.
  - [ ] `email-alert.channel.ts` – Email alerts to ops team via `@nestlancer/mail`. Sends to distribution list from `ALERT_EMAIL_RECIPIENTS` env var. HTML template with severity badge, alert details, timestamp, and quick links to Grafana dashboard and service logs.
- [ ] `src/rules/`
  - [ ] `alert-rules.config.ts` – Alert trigger definitions: `DB_CONNECTION_POOL_EXHAUSTED` (CRITICAL, >90% pool used), `QUEUE_DEPTH_HIGH` (HIGH, >1000 messages in DLQ), `ERROR_RATE_SPIKE` (HIGH, >5% error rate in 5min), `PAYMENT_FAILURE_RATE` (CRITICAL, >10% payment failures in 15min), `MEMORY_THRESHOLD` (HIGH, RSS >80%), `CERTIFICATE_EXPIRY` (MEDIUM, SSL cert expires in <30 days), `DISK_SPACE_LOW` (HIGH, <10% free). Each rule defines severity, cooldown period, and escalation path.
- [ ] `src/interfaces/`
  - [ ] `alert.interface.ts` – `Alert { title: string, message: string, severity: 'critical' | 'high' | 'medium' | 'low', source: string (service name), metadata?: Record<string, any>, deduplicationKey?: string }`. `AlertChannel` interface: `{ send(alert: Alert): Promise<void> }`.
- [ ] package files – `@nestlancer/alerts` with deps: `@nestlancer/mail`, `axios` (for PagerDuty/Slack webhooks).

### 8.15 `libs/middleware/`
- [ ] `src/index.ts` – Barrel exports: `MiddlewareModule`, all middleware classes, guards, and interfaces.
- [ ] `src/middleware.module.ts` – NestJS module exporting all common middleware. Applied globally in `main.ts` via `app.use()` in specific order: helmet → cors → request-tracer → maintenance-mode → rate-limiter → feature-flags → request-logger.
- [ ] `src/cors.middleware.ts` – CORS configuration middleware. Reads `CORS_ORIGINS` from config (comma-separated URLs or `*`). Sets: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` (GET, POST, PUT, PATCH, DELETE, OPTIONS), `Access-Control-Allow-Headers` (Content-Type, Authorization, X-Correlation-ID, X-Idempotency-Key, X-CSRF-Token), `Access-Control-Allow-Credentials: true`, `Access-Control-Max-Age: 86400`. Per `100-api-standards` CORS policy.
- [ ] `src/request-tracer.middleware.ts` – Assigns `X-Correlation-ID` (UUID v4) if not present in request headers. Stores in `AsyncLocalStorage` for access by logger, tracer, and audit throughout the request lifecycle. Adds correlation ID to response headers. Same implementation as `libs/tracing` correlation middleware but standalone for services not using full tracing.
- [ ] `src/maintenance-mode.middleware.ts` – Checks `MAINTENANCE_MODE` feature flag (via Redis or DB `SystemConfig`). If enabled: returns HTTP 503 with `{ status: 'error', error: { code: 'SYS_MAINTENANCE', message: 'System is under maintenance' } }` and `Retry-After` header. Exempts: `/health/*` endpoints (for K8s probes), admin endpoints (for admin access during maintenance). Per `115-admin-endpoints` maintenance mode.
- [ ] `src/rate-limiter.middleware.ts` – Redis-based sliding window rate limiter. Tiered limits per `100-api-standards`: anonymous (30 req/min by IP), authenticated (100 req/min by userId), admin (300 req/min by userId). Key format: `rate:<tier>:<identifier>:<window>`. Uses Redis `INCR` + `EXPIRE` for atomic counter. Returns `429 Too Many Requests` with `Retry-After` and `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.
- [ ] `src/rate-limiter.guard.ts` – NestJS guard-based alternative to middleware rate limiter. Supports per-endpoint rate limits via `@RateLimit({ limit: 5, window: 3600 })` decorator. Used for sensitive endpoints: login (5/hour by IP), registration (3/hour by IP), password reset (3/hour by email), contact form (10/day by IP). More granular than global middleware.
- [ ] `src/helmet.middleware.ts` – Security headers via `helmet` npm package. Sets: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0` (modern CSP preferred), `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `Content-Security-Policy: default-src 'self'`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- [ ] `src/feature-flags.middleware.ts` – Checks feature flags from Redis-cached `FeatureFlag` table. `isFeatureEnabled(flag: string, userId?: string): boolean`. Supports rollout percentages (hash userId % 100 < rolloutPercentage). Used to gate features: two-factor enforcement, webhook outbound, virus scanning. Caches flags in Redis with 60s TTL, refreshed from DB on cache miss.
- [ ] `src/interfaces/`
  - [ ] `rate-limit-tier.interface.ts` – `RateLimitTier { name: 'anonymous' | 'authenticated' | 'admin', limit: number, windowSeconds: number }`. Configurable per environment.
  - [ ] `maintenance-config.interface.ts` – `MaintenanceConfig { enabled: boolean, message?: string, estimatedEndTime?: string, exemptPaths: string[], exemptRoles: UserRole[] }`.
  - [ ] `feature-flag.interface.ts` – `FeatureFlagConfig { flag: string, enabled: boolean, rolloutPercentage: number, description?: string, metadata?: any }`.
- [ ] package files – `@nestlancer/middleware` with deps: `helmet`, `ioredis`, `@nestlancer/config`, `@nestlancer/cache`.

### 8.16 `libs/storage/`
- [ ] `src/index.ts` – Barrel exports: `StorageModule`, `StorageService`, providers, utilities, and interfaces.
- [ ] `src/storage.module.ts` – NestJS module providing `StorageService`. `forRoot({ provider: 's3' | 'cloudinary' | 'local' })` selects implementation based on `STORAGE_PROVIDER` env var. S3 for production, local for development. Dual-bucket setup: private bucket for project deliverables, public bucket for portfolio/blog assets.
- [ ] `src/storage.service.ts` – Abstract storage operations: `upload(file, options): Promise<StorageFile>`, `download(key): Promise<Buffer>`, `delete(key): Promise<void>`, `getUrl(key, expiresIn?): Promise<string>`, `generatePresignedUploadUrl(key, contentType, expiresIn): Promise<{ url, fields }>`, `generatePresignedDownloadUrl(key, expiresIn): Promise<string>`, `copy(sourceKey, destKey): Promise<void>`, `listFiles(prefix): Promise<StorageFile[]>`. Routes to appropriate bucket (private/public) based on `context` parameter.
- [ ] `src/providers/`
  - [ ] `s3.provider.ts` – AWS S3 implementation using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`. Configures: region from `AWS_S3_REGION`, credentials from `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`. Private bucket (`AWS_S3_BUCKET_PRIVATE`): no public access, presigned URLs for downloads (1h expiry). Public bucket (`AWS_S3_BUCKET_PUBLIC`): fronted by CloudFront CDN, public-read ACL. Upload: `PutObjectCommand` with content-type detection, checksum validation. Per architecture dual-bucket design.
  - [ ] `cloudinary.provider.ts` – Cloudinary implementation for image/video optimization. Uses Cloudinary Node.js SDK. Upload with transformations: auto-format (WebP), auto-quality, responsive breakpoints. Folder structure: `nestlancer/<context>/<year>/<month>/`. Used for portfolio/blog images where transformation is needed. Returns transformation URLs with width/height parameters.
  - [ ] `local.provider.ts` – Local filesystem provider for development only. Stores files in `./uploads/<context>/` directory. Serves via static file middleware. Simulates presigned URLs as local paths. No production use. Auto-creates directories on first upload. Useful for offline development.
- [ ] `src/utils/`
  - [ ] `presigned-url.util.ts` – `generatePresignedUpload(bucket, key, contentType, expiresIn: 3600): Promise<{ url, fields }>` using `createPresignedPost`. `generatePresignedDownload(bucket, key, expiresIn: 3600): Promise<string>` using `getSignedUrl`. Validates content-type against allowed MIME types. Sets max file size in presigned policy. Per `111-media-endpoints` upload flow.
  - [ ] `content-type.util.ts` – `detectMimeType(file: Buffer | string): string` using `file-type` package (magic bytes detection, not extension-based). `validateMimeType(mimeType, allowedTypes): boolean`. `getExtensionFromMimeType(mimeType): string`. Used for security: prevents uploading executable files disguised as images.
- [ ] `src/interfaces/`
  - [ ] `storage-provider.interface.ts` – `IStorageProvider { upload(key, data, options): Promise<StorageFile>, download(key): Promise<Buffer>, delete(key): Promise<void>, getUrl(key, expiresIn?): Promise<string>, generatePresignedUploadUrl(key, contentType, expiresIn): Promise<PresignedUrlResponse> }`. Implemented by all providers.
  - [ ] `upload-options.interface.ts` – `UploadOptions { contentType: string, bucket: 'private' | 'public', metadata?: Record<string, string>, acl?: 'private' | 'public-read', checksumSHA256?: string }`. Per `111-media-endpoints`: private for deliverables, public for portfolio/blog.
  - [ ] `storage-file.interface.ts` – `StorageFile { key: string, url: string, bucket: string, contentType: string, size: number, etag?: string, lastModified?: Date }`. Returned by upload and list operations.
- [ ] package files – `@nestlancer/storage` with deps: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `cloudinary`, `file-type`.

### 8.17 `libs/mail/`
- [ ] `src/index.ts` – Barrel exports: `MailModule`, `MailService`, providers, template engine, and interfaces.
- [ ] `src/mail.module.ts` – NestJS module providing `MailService`. `forRoot({ provider: 'ses' | 'smtp' | 'sendgrid' })` selects email provider. Production: AWS SES (cost-effective for transactional email). Dev: SMTP (Ethereal/Mailtrap for testing). Imports `ConfigModule` for SMTP/SES credentials.
- [ ] `src/mail.service.ts` – `sendEmail(options: MailOptions): Promise<void>`. Renders template (if templateName provided), sends via configured provider. Supports: plain text, HTML, attachments (invoices, receipts). Retry on failure (3 attempts with exponential backoff). Publishes `email.sent` or `email.failed` metrics. Called by email-worker upon consuming from `email.queue`. Queue-based: services never send emails directly, always via RabbitMQ.
- [ ] `src/providers/`
  - [ ] `ses.provider.ts` – AWS SES implementation using `@aws-sdk/client-ses`. Configures region from `AWS_SES_REGION`. Sends via `SendEmailCommand` (single) or `SendBulkTemplatedEmailCommand` (batch). Handles SES bounce/complaint notifications via SNS webhook. Rate limiting: SES sandbox limit 1/sec, production 14/sec. Tracks delivery statistics.
  - [ ] `smtp.provider.ts` – SMTP implementation using `nodemailer`. Configures: host (`SMTP_HOST`), port (`SMTP_PORT`, default 587), auth (`SMTP_USER`, `SMTP_PASS`), TLS. Connection pooling (max 5 connections). Used for development with Ethereal (free fake SMTP) or Mailtrap. Verifies connection on startup via `transporter.verify()`.
  - [ ] `sendgrid.provider.ts` – SendGrid implementation using `@sendgrid/mail`. Alternative to SES for Sendgrid users. API key from `SENDGRID_API_KEY`. Supports dynamic templates, email analytics, and bounce handling. Optional: not included in default setup.
- [ ] `src/templates/`
  - [ ] `template-engine.service.ts` – Handlebars template rendering engine. `render(templateName: string, variables: Record<string, any>): Promise<{ html, text }>`. Loads templates from `EmailTemplate` DB table (seeded via `05-email-templates.seed.ts`). Compiles and caches compiled templates in memory. Supports partials for header/footer. Variables: `{{userName}}`, `{{projectTitle}}`, `{{amount}}`, `{{link}}`, `{{year}}`.
  - [ ] `compiled/.gitkeep` – Placeholder directory for pre-compiled Handlebars templates (performance optimization). Templates compiled on first use and cached in memory. Filesystem cache for persistence across restarts in non-container deployments.
- [ ] `src/interfaces/`
  - [ ] `mail-provider.interface.ts` – `IMailProvider { send(options: MailOptions): Promise<MailResult>, verify(): Promise<boolean> }`. `MailResult { messageId: string, accepted: string[], rejected: string[] }`. Implemented by all providers.
  - [ ] `mail-options.interface.ts` – `MailOptions { to: string | string[], subject: string, html?: string, text?: string, templateName?: string, templateVariables?: Record<string, any>, from?: string, replyTo?: string, attachments?: MailAttachment[], headers?: Record<string, string> }`. `MailAttachment { filename, content: Buffer | string, contentType }`.
- [ ] package files – `@nestlancer/mail` with deps: `nodemailer`, `@aws-sdk/client-ses`, `handlebars`, `@types/nodemailer`.

### 8.18 `libs/crypto/`
- [ ] `src/index.ts` – Barrel exports: `CryptoModule`, `HashingService`, `EncryptionService`, `HmacService`, `TotpService`, and interfaces.
- [ ] `src/crypto.module.ts` – NestJS `@Global()` module providing all cryptographic services. No external dependencies on init. All services use Node.js native `crypto` module plus `bcrypt` for password hashing.
- [ ] `src/hashing.service.ts` – `hash(data: string, rounds: number = 12): Promise<string>` using `bcrypt.hash()`. `compare(data, hash): Promise<boolean>` using `bcrypt.compare()`. `hashSHA256(data: string): string` using `crypto.createHash('sha256')` for token hashing (refresh tokens, verification tokens stored as SHA-256 hashes). 12 salt rounds balances security and performance (~250ms per hash).
- [ ] `src/encryption.service.ts` – AES-256-GCM symmetric encryption for sensitive data at rest. `encrypt(plaintext: string): string` (returns `iv:authTag:ciphertext` base64-encoded). `decrypt(encrypted: string): string`. Uses `ENCRYPTION_KEY` (32-byte key from env). Applied to: message content (end-to-end encryption), payment metadata, sensitive user data. Key rotation support via key versioning prefix.
- [ ] `src/hmac.service.ts` – HMAC signature generation and verification. `sign(payload: string, secret: string): string` using `crypto.createHmac('sha256', secret)`. `verify(payload, signature, secret): boolean` using timing-safe comparison (`crypto.timingSafeEqual()`) to prevent timing attacks. Used for: Razorpay webhook signature verification, outbound webhook signatures, CSRF token generation.
- [ ] `src/totp.service.ts` – Time-based One-Time Password for 2FA. `generateSecret(): { secret, otpauthUrl, qrCodeDataUrl }` using `speakeasy` or `otpauth`. `verifyToken(secret, token): boolean` with ±1 window tolerance (30 seconds before/after). `generateBackupCodes(count: number = 10): string[]` – 10 single-use recovery codes, bcrypt-hashed before storage. Per `102-auth-endpoints` 2FA setup flow.
- [ ] `src/interfaces/`
  - [ ] `crypto.interface.ts` – `IHashingService`, `IEncryptionService`, `IHmacService`, `ITotpService` interfaces. `TotpSecret { secret: string, otpauthUrl: string, qrCodeDataUrl: string }`. `EncryptedData { iv: string, authTag: string, ciphertext: string }`.
- [ ] package files – `@nestlancer/crypto` with deps: `bcrypt`, `@types/bcrypt`, `speakeasy` or `otpauth`, `qrcode`.

### 8.19 `libs/websocket/`
- [ ] `src/index.ts` – Barrel exports: `WebSocketModule`, `WsAdapter`, `WsAuthService`, `RoomManagerService`, `PresenceService`, `HeartbeatService`, decorators, and interfaces.
- [ ] `src/websocket.module.ts` – NestJS module providing WebSocket infrastructure for the WS Gateway. `forRoot({ redisUrl, heartbeatInterval, maxConnectionsPerUser })` configures Redis adapter for horizontal scaling. Per WebSocket protocol doc.
- [ ] `src/ws-adapter.ts` – Custom WebSocket adapter using `socket.io` with `@socket.io/redis-adapter` for horizontal scaling across multiple WS Gateway pods. Redis pub/sub channel: `nestlancer:ws:<event>`. Configures: connection timeout (30s), max connections per user (5), binary serialization (msgpack for performance). CORS: same origins as HTTP API.
- [ ] `src/ws-auth.service.ts` – JWT authentication for WebSocket connections. Validates JWT from handshake auth token (`socket.handshake.auth.token`) or query parameter. Same `JWT_ACCESS_SECRET` as HTTP auth. On auth failure: emits `auth:error` and disconnects. On token expiry during active connection: emits `auth:token_expired` for client-side refresh. Per `109-messaging-endpoints` WebSocket auth flow.
- [ ] `src/room-manager.service.ts` – Manages Socket.IO rooms. `joinRoom(socket, roomName): void`. `leaveRoom(socket, roomName): void`. `emitToRoom(roomName, event, data): void`. Room naming convention: `project:<projectId>` for project-scoped messaging, `user:<userId>` for user-specific notifications. Auto-joins user to their personal room on connection. Validates user has access to project room before joining.
- [ ] `src/presence.service.ts` – Tracks online/offline status of users. Stores in Redis: `presence:<userId> = { socketId, lastSeen, device }` with TTL (heartbeat interval + grace). `getOnlineUsers(userIds): Promise<Map<string, boolean>>`. `getUserStatus(userId): Promise<'online' | 'away' | 'offline'>`. Emits `presence:update` to relevant rooms when status changes. Per `109-messaging-endpoints` online indicators.
- [ ] `src/heartbeat.service.ts` – WebSocket keepalive via Socket.IO ping/pong (built-in, interval 25s, timeout 20s). Updates `presence:<userId>` TTL on each pong. Disconnects stale connections after 60s of no heartbeat. Publishes `nestlancer_active_websocket_connections` gauge metric.
- [ ] `src/decorators/`
  - [ ] `ws-auth.decorator.ts` – `@WsAuth()` decorator for WebSocket gateway event handlers. Validates that `socket.data.user` exists (set by `WsAuthService` during handshake). Returns `WsUnauthorizedException` if not authenticated.
  - [ ] `ws-room.decorator.ts` – `@WsRoom('project')` parameter decorator. Injects room name from event payload or socket data. Validates user membership in the room before handler execution.
- [ ] `src/interfaces/`
  - [ ] `ws-client.interface.ts` – `WsClient { socketId: string, userId: string, role: UserRole, connectedAt: Date, rooms: string[], device?: string }`. Attached to `socket.data` after authentication.
  - [ ] `ws-event.interface.ts` – `WsEvent<T> { event: string, data: T, room?: string, timestamp: string, correlationId?: string }`. Standard WebSocket event envelope. Per WebSocket protocol doc.
  - [ ] `ws-room.interface.ts` – `WsRoomInfo { name: string, type: 'project' | 'user' | 'admin', members: string[], createdAt: Date }`. Room metadata stored in Redis.
- [ ] package files – `@nestlancer/websocket` with deps: `socket.io`, `@socket.io/redis-adapter`, `ioredis`, `@nestlancer/auth-lib`.

### 8.20 `libs/pdf/`
- [ ] `src/index.ts` – Barrel exports: `PdfModule`, `PdfService`, templates, and interfaces.
- [ ] `src/pdf.module.ts` – NestJS module providing `PdfService`. Imports `StorageModule` for saving generated PDFs. Configures Puppeteer/Playwright headless browser instance pool (reuse browsers across requests for performance).
- [ ] `src/pdf.service.ts` – `generatePdf(template: string, data: any, options?: PdfOptions): Promise<Buffer>`. Renders HTML template with Handlebars, converts to PDF using Puppeteer (`page.pdf()`). Features: header/footer with page numbers, custom fonts (Inter), A4 size default, landscape option. Uploads to S3 private bucket via `StorageService`. Returns PDF buffer and S3 URL. Used by quote, invoice, and receipt generation.
- [ ] `src/templates/`
  - [ ] `quote.template.ts` – HTML/CSS template for quote PDF. Includes: Nestlancer logo, quote number, client details, line items table (description, quantity, unit price, total), payment breakdown (upfront %, milestones, final), terms and conditions, validity period, digital signature placeholder. Styled with inline CSS for PDF rendering. All amounts formatted in INR (₹).
  - [ ] `invoice.template.ts` – HTML/CSS template for payment invoice. Includes: invoice number, project details, payment summary, amount in INR with GST breakdown (CGST/SGST/IGST if applicable), payment method, payment date, receipt URL QR code. Generated on `payment.completed` event by pdf-worker.
  - [ ] `receipt.template.ts` – HTML/CSS template for payment receipt. Simplified version of invoice: transaction ID, amount paid, payment method, date, project reference. Generated alongside invoice. Downloadable by user from payment details endpoint per `108-payments-endpoints`.
- [ ] `src/interfaces/`
  - [ ] `pdf-options.interface.ts` – `PdfOptions { format?: 'A4' | 'Letter', landscape?: boolean, margin?: { top, right, bottom, left }, headerTemplate?: string, footerTemplate?: string, printBackground?: boolean, scale?: number }`. Defaults: A4 portrait, 10mm margins, page numbers in footer.
- [ ] package files – `@nestlancer/pdf` with deps: `puppeteer` or `playwright`, `handlebars`, `@nestlancer/storage`.

### 8.21 `libs/search/`
- [ ] `src/index.ts` – Barrel exports: `SearchModule`, `SearchService`, `FilterBuilderService`, `SortBuilderService`, and interfaces.
- [ ] `src/search.module.ts` – NestJS module providing search capabilities. Uses PostgreSQL full-text search via `tsvector`/`tsquery` (no external Elasticsearch dependency per tech stack). Provides filter and sort builders for standardized query construction across all services.
- [ ] `src/search.service.ts` – `search(model, query, options): Promise<Paginated<T>>`. Builds `WHERE` clause combining: full-text search (`to_tsvector('english', title || ' ' || description) @@ plainto_tsquery(:query)`), filters (from `FilterBuilderService`), and sorting (from `SortBuilderService`). Supports search across: portfolio items (title, description, tags), blog posts (title, content, tags), users (name, email – admin only), projects (title, description – admin only). Ranking via `ts_rank()` for relevance ordering.
- [ ] `src/filter-builder.service.ts` – `buildFilters(rawFilters: Record<string, any>, allowedFields: string[]): Prisma.XXXWhereInput`. Parses `?filter[status]=active&filter[createdAt][gte]=2026-01-01` format. Validates field names against allowlist (prevents arbitrary field access). Supports operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in` (comma-separated), `contains`, `startsWith`. Type coercion: dates → `DateTime`, numbers → `number`, booleans → `boolean`.
- [ ] `src/sort-builder.service.ts` – `buildSort(rawSort: string, allowedFields: string[]): Prisma.XXXOrderByWithRelationInput`. Parses `?sort=createdAt:desc,title:asc` format. Validates fields against allowlist. Default: `createdAt:desc`. Supports nested sorting for related models (e.g., `sort=project.createdAt:desc`).
- [ ] `src/interfaces/`
  - [ ] `search-options.interface.ts` – `SearchOptions { query?: string, filters?: Record<string, any>, sort?: string, page?: number, limit?: number, fields?: string[], expand?: string[] }`. Comprehensive search request matching `100-api-standards` query parameter conventions.
  - [ ] `filter-operator.interface.ts` – `FilterOperator { eq, ne, gt, gte, lt, lte, in, notIn, contains, startsWith, endsWith, isNull }`. Maps to Prisma where clause operators. `in` operator accepts comma-separated values.
- [ ] package files – `@nestlancer/search` with deps: `@nestlancer/database`, `@nestlancer/common`.

### 8.22 `libs/circuit-breaker/`
- [ ] `src/index.ts` – Barrel exports: `CircuitBreakerModule`, `CircuitBreakerService`, decorators, and interfaces.
- [ ] `src/circuit-breaker.module.ts` – NestJS module providing `CircuitBreakerService`. `forRoot({ defaultOptions })` configures default thresholds. Used for external service calls: Razorpay API, S3 uploads, SMTP, Cloudinary, external webhooks. Per `117-error-codes-endpoints` circuit breaker pattern.
- [ ] `src/circuit-breaker.service.ts` – State machine with three states: CLOSED (normal), OPEN (failing, reject immediately), HALF-OPEN (testing recovery). `execute<T>(name: string, fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>`. Tracks: failure count, success count, last failure time. State transitions: CLOSED → OPEN when failure threshold exceeded (5 failures in 60s). OPEN → HALF-OPEN after reset timeout (30s). HALF-OPEN → CLOSED on success, HALF-OPEN → OPEN on failure. Emits metrics: `nestlancer_circuit_breaker_state`, `nestlancer_circuit_breaker_calls_total`. Publishes alert on state change to OPEN.
- [ ] `src/decorators/`
  - [ ] `circuit-breaker.decorator.ts` – `@CircuitBreaker({ name: 'razorpay', failureThreshold: 5, resetTimeout: 30000, fallback: () => throw new ExternalServiceException() })` method decorator. Wraps method execution with circuit breaker. Name used for distinct breaker instances (separate breaker per external service). Per `117-error-codes-endpoints` recovery patterns.
- [ ] `src/interfaces/`
  - [ ] `circuit-breaker-options.interface.ts` – `CircuitBreakerOptions { name: string, failureThreshold: number (default 5), resetTimeout: number (ms, default 30000), monitorInterval: number (ms, default 60000), fallback?: () => Promise<any>, onStateChange?: (from, to) => void }`. Configuration per breaker instance.
- [ ] package files – `@nestlancer/circuit-breaker` with deps: `@nestlancer/metrics`, `@nestlancer/alerts`.

### 8.23 `libs/turnstile/`
- [ ] `src/index.ts` – Barrel exports: `TurnstileModule`, `TurnstileService`, `TurnstileGuard`, decorators, and interfaces.
- [ ] `src/turnstile.module.ts` – NestJS module providing `TurnstileService` and `TurnstileGuard`. `forRoot({ secretKey, siteKey })` configures Cloudflare Turnstile credentials from `TURNSTILE_SECRET_KEY` and `TURNSTILE_SITE_KEY` env vars. Replaces CAPTCHA per project architecture.
- [ ] `src/turnstile.service.ts` – `verify(token: string, remoteIp?: string): Promise<TurnstileResult>`. Calls Cloudflare Turnstile verification API (`https://challenges.cloudflare.com/turnstile/v0/siteverify`) with `POST { secret, response: token, remoteip }`. Returns success/failure with error codes. Caches successful verifications for 5 minutes (prevents replay but allows reasonable UX). Circuit breaker wrapped for Cloudflare API availability.
- [ ] `src/turnstile.guard.ts` – NestJS guard for `@RequireTurnstile()` decorated routes. Extracts `cf-turnstile-response` from request body or `X-Turnstile-Token` header. Calls `TurnstileService.verify()`. On failure: throws `UnauthorizedException` with `AUTH_TURNSTILE_FAILED`. Skips verification in test environment.
- [ ] `src/decorators/`
  - [ ] `require-turnstile.decorator.ts` – `@RequireTurnstile()` method decorator. Sets metadata for `TurnstileGuard` to activate. Applied to: `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /contact` (all public endpoints susceptible to bot abuse). Per `100-api-standards`.
- [ ] `src/interfaces/`
  - [ ] `turnstile.interface.ts` – `TurnstileResult { success: boolean, challengeTs?: string, hostname?: string, errorCodes?: string[], action?: string, cdata?: string }`. Maps to Cloudflare Turnstile API response. Error codes: `missing-input-secret`, `invalid-input-secret`, `missing-input-response`, `invalid-input-response`, `timeout-or-duplicate`.
- [ ] package files – `@nestlancer/turnstile` with deps: `axios`, `@nestlancer/cache` (for verification caching), `@nestlancer/circuit-breaker`.

### 8.24 `libs/testing/`
- [ ] `src/index.ts` – Barrel exports: all factories, mocks, helpers, and fixtures. Used by all service test files: `import { createMockUser, mockPrismaService, createTestingModule } from '@nestlancer/testing'`.
- [ ] `src/factories/`
  - [ ] `user.factory.ts` – `createMockUser(overrides?): User`. Generates realistic test user with UUID, random email (`faker.internet.email()`), hashed password, `role: USER`, `status: ACTIVE`, `emailVerified: true`. `createMockAdmin(overrides?)`: same with `role: ADMIN`. Uses `@faker-js/faker` for realistic data.
  - [ ] `project.factory.ts` – `createMockProject(userId, overrides?): Project`. Generates project with UUID, title, description, `status: ACTIVE`, `completionPercentage: 0`, `totalAmount: 50000` (₹500 in paise), linked milestones. Supports status overrides for testing different flows.
  - [ ] `request.factory.ts` – `createMockRequest(userId, overrides?): Request`. Generates request with category, description, budget range, timeline, `status: SUBMITTED`. Includes attachments array and status history.
  - [ ] `quote.factory.ts` – `createMockQuote(requestId, overrides?): Quote`. Generates quote with line items, payment breakdown, total amount, `status: SENT`, `validUntil` (30 days from now). Includes related `QuoteLineItem` and `QuotePaymentBreakdown` arrays.
  - [ ] `payment.factory.ts` – `createMockPayment(projectId, overrides?): Payment`. Generates payment with amount, `status: COMPLETED`, Razorpay mock IDs (`pay_test_xxx`, `order_test_xxx`), `method: UPI`. `createMockPaymentIntent()`: with `status: CREATED`, idempotency key.
  - [ ] `message.factory.ts` – `createMockMessage(conversationId, senderId, overrides?): Message`. Generates message with content, `type: TEXT`, `createdAt`. `createMockConversation(projectId)`: with participants array and `lastMessageAt`.
  - [ ] `notification.factory.ts` – `createMockNotification(userId, overrides?): Notification`. Generates notification with type, category, title, message, `priority: MEDIUM`, `channels: ['IN_APP']`. Supports `readAt` override for testing read/unread states.
  - [ ] `media.factory.ts` – `createMockMedia(uploaderId, overrides?): Media`. Generates media with filename, mimeType, size, `status: READY`, S3 key, context. `createMockUploadSession(userId)`: for chunked upload testing.
  - [ ] `portfolio.factory.ts` – `createMockPortfolioItem(overrides?): PortfolioItem`. Generates portfolio item with title, slug, descriptions, category, tags, `status: PUBLISHED`, `featured: false`. Includes related images and client details.
  - [ ] `blog-post.factory.ts` – `createMockPost(authorId, overrides?): Post`. Generates blog post with title, slug, content, category, tags, `status: PUBLISHED`, `commentsEnabled: true`. `createMockComment(postId, userId)`: for testing comment threading.
  - [ ] `contact.factory.ts` – `createMockContactMessage(overrides?): ContactMessage`. Generates contact message with name, email, subject, message, `status: NEW`, IP address, `turnstileVerified: true`.
- [ ] `src/mocks/`
  - [ ] `prisma.mock.ts` – `mockPrismaService()`: creates jest mock of `PrismaService` with all model delegates mocked (`user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() }`). Includes `$transaction` mock that executes callback synchronously. Reset all mocks between tests via `jest.clearAllMocks()`.
  - [ ] `redis.mock.ts` – `mockRedisService()`: in-memory Map-based Redis mock. Supports: `get`, `set` (with TTL tracking), `del`, `exists`, `incr`, `expire`, `keys`, `scan`. Simulates TTL expiry. No actual Redis connection needed. Reset state between tests.
  - [ ] `rabbitmq.mock.ts` – `mockQueuePublisher()`: jest mock of `QueuePublisherService`. Captures published messages in array for assertion: `expect(mockPublisher.published).toContainEqual({ exchange: 'nestlancer.events', routingKey: 'email.verification', payload: expect.any(Object) })`. `mockQueueConsumer()`: triggers handler directly.
  - [ ] `storage.mock.ts` – `mockStorageService()`: in-memory storage mock. Maps key→Buffer. `upload()` stores in Map, returns mock URL. `download()` retrieves from Map. `generatePresignedUploadUrl()` returns `http://localhost/mock-upload`. No S3/Cloudinary calls.
  - [ ] `mail.mock.ts` – `mockMailService()`: captures sent emails in array. `expect(mockMail.sentEmails).toContainEqual({ to: 'user@test.com', templateName: 'verification', templateVariables: expect.objectContaining({ token: expect.any(String) }) })`. No actual SMTP connection.
  - [ ] `razorpay.mock.ts` – `mockRazorpayService()`: mocks Razorpay SDK. `orders.create()` returns mock order with `order_test_xxx` ID. `payments.fetch()` returns mock payment. `webhooks.verifySignature()` always returns true in test. Payment intent amounts in paise (INR).
- [ ] `src/helpers/`
  - [ ] `test-app.helper.ts` – `createTestingModule(metadata: ModuleMetadata): Promise<TestingModule>`. Wraps `Test.createTestingModule()` with common overrides: replaces `PrismaService` with `mockPrismaService()`, `CacheService` with `mockRedisService()`, `QueuePublisherService` with `mockQueuePublisher()`, `MailService` with `mockMailService()`, `StorageService` with `mockStorageService()`. Compiles and returns ready-to-use testing module. Reduces boilerplate across all service tests.
  - [ ] `auth.helper.ts` – `generateTestJwt(userId, role?: UserRole): string`. Generates valid JWT access token for test requests. `generateTestRefreshToken(userId): string`. `createAuthenticatedRequest(userId, role?): { headers: { Authorization } }` for supertest. Uses test-specific JWT secret.
  - [ ] `database.helper.ts` – `resetDatabase(): Promise<void>` – truncates all tables in correct order (respecting foreign keys). `runMigrations(): Promise<void>` – runs Prisma migrations against test database. `seedTestData(): Promise<void>` – runs dev seeds. Used in E2E test setup/teardown. Connects to `DATABASE_TEST_URL`.
  - [ ] `queue.helper.ts` – `purgeAllQueues(): Promise<void>` – purges all RabbitMQ queues (email, notification, audit, media, analytics, webhook, cdn). `waitForQueueDrain(queueName, timeout): Promise<void>` – waits until queue is empty. Used in integration test cleanup.
- [ ] `src/fixtures/`
  - [ ] `users.fixture.ts` – Static test user data objects: `TEST_USER` (standard user with all fields populated), `TEST_ADMIN` (admin user), `TEST_SUSPENDED_USER` (suspended status for access denial tests), `TEST_UNVERIFIED_USER` (emailVerified: false for verification flow tests). Consistent across all test files.
  - [ ] `projects.fixture.ts` – Static test project data objects in various statuses: `ACTIVE_PROJECT`, `COMPLETED_PROJECT`, `ON_HOLD_PROJECT`, `CANCELLED_PROJECT`. Includes linked milestones, deliverables, and payment data for comprehensive integration testing.
  - [ ] `payments.fixture.ts` – Static payment fixtures: `COMPLETED_PAYMENT`, `PENDING_PAYMENT`, `FAILED_PAYMENT`, `REFUNDED_PAYMENT`. Includes Razorpay mock IDs matching `razorpay.mock.ts` responses. Amounts in paise for INR consistency.
- [ ] package files – `@nestlancer/testing` with deps: `@faker-js/faker`, `@nestjs/testing`, `jest`, `supertest`, `@types/supertest`.

---

## 9. API Gateway (`gateway/`)

### 9.1 Source (`gateway/src/`)
- [ ] `main.ts` – Bootstrap NestJS app. Configures: `app.use(compression())`, `app.use(helmet())`, global `ValidationPipe` (whitelist: true, forbidNonWhitelisted: true, transform: true), global `HttpExceptionFilter`, global `ResponseTransformInterceptor`, global `MetricsInterceptor`, global `TimeoutInterceptor` (30s default). Sets up Swagger at `/api/docs`. Listens on `PORT` (default 3000). Enables CORS. Applies `CorrelationIdMiddleware` globally. Enables shutdown hooks for graceful shutdown.
- [ ] `app.module.ts` – Root module importing: `ConfigModule.forRoot()`, `DatabaseModule.forRoot()`, `CacheModule.forRoot()`, `QueueModule.forRoot()`, `AuthLibModule`, `LoggerModule.forRoot()`, `MetricsModule`, `TracingModule.forRoot()`, `HealthLibModule`, `MiddlewareModule`, `ProxyModule`. Registers `JwtAuthGuard` as `APP_GUARD` (global auth). No direct business logic – all requests proxied to microservices.
- [ ] `config/`
  - [ ] `gateway.config.ts` – Gateway-specific environment: `GATEWAY_PORT` (default 3000), `GATEWAY_HOST` (default '0.0.0.0'), `REQUEST_TIMEOUT_MS` (default 30000), `MAX_PAYLOAD_SIZE` (default '10mb'), `SWAGGER_ENABLED` (boolean, true in dev/staging, false in production), `PROXY_RETRY_ATTEMPTS` (default 2), `PROXY_RETRY_DELAY_MS` (default 500).
  - [ ] `routes.config.ts` – Route-to-service mapping: `/api/v1/auth/*` → `http://auth-service:3001`, `/api/v1/users/*` → `http://user-service:3002`, `/api/v1/requests/*` → `http://request-service:3003`, `/api/v1/quotes/*` → `http://quote-service:3004`, `/api/v1/projects/*` → `http://project-service:3005`, `/api/v1/progress/*` → `http://progress-service:3006`, `/api/v1/payments/*` → `http://payment-service:3007`, `/api/v1/messages/*` → `http://messaging-service:3008`, `/api/v1/notifications/*` → `http://notification-service:3009`, `/api/v1/media/*` → `http://media-service:3010`, `/api/v1/portfolio/*` → `http://portfolio-service:3011`, `/api/v1/blog/*` → `http://blog-service:3012`, `/api/v1/contact/*` → `http://contact-service:3013`, `/api/v1/admin/*` → `http://admin-service:3014`, `/api/v1/webhooks/*` → `http://webhooks-ingestion-service:3015`, `/api/v1/health` → local healthcheck controller. Each route config includes: target URL, timeout override, retry config, auth requirement (public/authenticated/admin).
  - [ ] `rate-limit.config.ts` – Per-route rate limit overrides: `/auth/login` (5/min by IP), `/auth/register` (3/hour by IP), `/auth/forgot-password` (3/hour by email), `/contact` (10/day by IP), `/webhooks/*` (100/min by IP, webhook-auth exempts from user rate limiting), `/admin/*` (300/min by userId). Default tiers per `100-api-standards`. Rate limit bypass for health check endpoints.
  - [ ] `cors.config.ts` – CORS configuration object: `origin: ConfigService.get('CORS_ORIGINS').split(',')`, `methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']`, `allowedHeaders: ['Content-Type','Authorization','X-Correlation-ID','X-Idempotency-Key','X-CSRF-Token','X-Turnstile-Token']`, `exposedHeaders: ['X-Correlation-ID','X-RateLimit-Limit','X-RateLimit-Remaining','X-RateLimit-Reset']`, `credentials: true`, `maxAge: 86400`.
  - [ ] `swagger.config.ts` – Swagger/OpenAPI document config: title 'Nestlancer API', version from `package.json`, description, contact info, license (MIT). Bearer token auth scheme (`bearerAuth` with JWT). Cookie auth scheme (`cookieAuth`). Tags for each service domain. Server URLs for dev/staging/production. Enabled only when `SWAGGER_ENABLED=true`.
- [ ] `middleware/`
  - [ ] `cors.middleware.ts` – CORS middleware applying config from `cors.config.ts`. Applied first in middleware chain. Handles preflight OPTIONS requests with 204 response. Per `100-api-standards` CORS policy. Uses NestJS built-in CORS via `app.enableCors(corsConfig)` in `main.ts`, this file extends for custom logic if needed.
  - [ ] `request-tracer.middleware.ts` – Generates UUID v4 `X-Correlation-ID` if absent from request. Stores in `AsyncLocalStorage` for downstream access. Adds to all proxied requests to microservices. Returns in response headers. Enables end-to-end request tracing across gateway → service → worker.
  - [ ] `maintenance-mode.middleware.ts` – Checks `SystemConfig.maintenanceMode` flag (cached in Redis, 30s TTL). If enabled: short-circuits request pipeline, returns HTTP 503 with maintenance message and `Retry-After` header. Exempts `/health/*` (K8s probes), `/admin/*` (admin access during maintenance), `/webhooks/*` (don't lose inbound webhooks).
  - [ ] `rate-limiter.middleware.ts` – Redis sliding window rate limiter. Identifies client: authenticated → userId, anonymous → IP address. Checks per-route overrides first, then falls back to tier defaults (anon: 30/min, auth: 100/min, admin: 300/min). Sets response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (Unix timestamp). Returns 429 with `Retry-After` on limit exceeded.
  - [ ] `request-logger.middleware.ts` – Logs request entry (`method, url, ip, userAgent, correlationId`) and response (`statusCode, duration, contentLength`). Masks sensitive fields in body (`password`, `token`, `secret`). Excludes `/health/*` from logging. Uses `@nestlancer/logger` with structured JSON output. Calculates response time via `process.hrtime()`.
- [ ] `guards/`
  - [ ] `public-route.guard.ts` – Implements `@Public()` decorator check. When `@Public()` metadata is set, skips `JwtAuthGuard` authentication. Applied to: health endpoints, `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /portfolio/*`, `GET /blog/*`, `POST /contact`, `POST /webhooks/*`.
  - [ ] `jwt-auth.guard.ts` – Re-exports/extends `@nestlancer/auth-lib` JwtAuthGuard. Default global guard. Extracts JWT from `Authorization: Bearer <token>` header or `access_token` httpOnly cookie. Attaches `AuthenticatedUser` to `request.user`. Returns 401 with `AUTH_001` error code on failure.
  - [ ] `admin-auth.guard.ts` – Checks `request.user.role === UserRole.ADMIN`. Applied to `/api/v1/admin/*` routes. Returns 403 `AUTH_INSUFFICIENT_ROLE` if not admin. Admin impersonation: checks `X-Impersonate-User` header and logs impersonation to audit trail.
  - [ ] `webhook-auth.guard.ts` – Validates inbound webhook signatures. Route-specific: `/webhooks/razorpay` → verifies `X-Razorpay-Signature` with HMAC SHA256, `/webhooks/github` → verifies `X-Hub-Signature-256`. Raw body preserved for signature verification (not parsed by body-parser). Returns 401 on invalid signature.
  - [ ] `roles.guard.ts` – Re-exports `@nestlancer/auth-lib` RolesGuard. Checks `@Roles()` metadata. Used on proxy routes with `routeConfig.requiredRoles`.
  - [ ] `permissions.guard.ts` – Re-exports `@nestlancer/auth-lib` PermissionsGuard. Checks `@Permissions()` metadata for fine-grained access control.
  - [ ] `csrf.guard.ts` – CSRF protection for cookie-based auth. Validates `X-CSRF-Token` header matches `csrf_token` cookie (double-submit pattern). Skipped for Bearer token auth and webhook routes. Applied to state-changing methods (POST, PUT, PATCH, DELETE).
- [ ] `pipes/`
  - [ ] `global-validation.pipe.ts` – Extends NestJS `ValidationPipe`. Config: `whitelist: true` (strip unknown properties), `forbidNonWhitelisted: true` (throw on unknown), `transform: true` (auto-type coercion), `transformOptions: { enableImplicitConversion: true }`. Custom `exceptionFactory` that maps validation errors to `{ code: 'VALIDATION_ERROR', details: [{ field, constraints }] }` per `100-api-standards` error format.
  - [ ] `webhook-validation.pipe.ts` – Validates webhook payloads against expected schemas. For Razorpay: validates event types (`payment.captured`, `payment.failed`, `refund.created`). For GitHub: validates event types from `X-GitHub-Event` header. Rejects unknown event types with 400. Per `120-webhooks-inbound-endpoints`.
- [ ] `filters/`
  - [ ] `global-exception.filter.ts` – Catches all exceptions, formats response per `100-api-standards`: `{ status: 'error', error: { code, message, details?, validationErrors? }, metadata: { timestamp, correlationId, path } }`. Maps: `HttpException` → appropriate status code, `PrismaClientKnownRequestError` → 409 or 404, `TimeoutError` → 408, unhandled → 500 with logged stack trace. Never exposes internal error details in production.
  - [ ] `gateway-exception.filter.ts` – Handles proxy-specific errors: target service unreachable → 503 `SERVICE_UNAVAILABLE`, proxy timeout → 504 `GATEWAY_TIMEOUT`, connection refused → 503 with circuit breaker state check. Logs proxy errors with target service name and URL. Triggers alert for repeated proxy failures.
- [ ] `interceptors/`
  - [ ] `response-transform.interceptor.ts` – Wraps all successful responses in standard envelope: `{ status: 'success', data: <response>, metadata: { timestamp, correlationId, path, version: 'v1' } }`. For paginated responses: adds `pagination: { page, limit, totalItems, totalPages, hasNextPage, hasPreviousPage }`. Per `100-api-standards` response format.
  - [ ] `logging.interceptor.ts` – Records request processing duration. Logs: `{ method, url, statusCode, duration: '42ms', userId, correlationId }`. Warns on slow responses (>1s). Uses `@nestlancer/logger` with structured output. Works in conjunction with `request-logger.middleware.ts` (middleware logs start, interceptor logs completion).
  - [ ] `timeout.interceptor.ts` – Aborts requests exceeding timeout: default 30s, per-route overrides (e.g., file upload routes: 120s, webhook routes: 10s). Uses RxJS `timeout()` operator. Throws `RequestTimeoutException` with `GATEWAY_TIMEOUT` error code. Configurable via `@Timeout(ms)` decorator on route config.
  - [ ] `cache.interceptor.ts` – HTTP cache for GET requests. Uses `@nestlancer/cache` with `@Cacheable()` decorator on proxy routes. Cache key: `http:<method>:<url>:<query>:<userId?>`. TTL per route: portfolio listing 1h, blog listing 30min, user profile 5min. Respects `Cache-Control: no-cache` header. Invalidated on relevant write operations.
  - [ ] `metrics.interceptor.ts` – Records HTTP metrics via `@nestlancer/metrics`: `nestlancer_http_requests_total` (counter), `nestlancer_http_request_duration_seconds` (histogram). Labels: method, route (parameterized), status_code, service (target service name). Excludes `/metrics` and `/health` endpoints from metrics collection.
- [ ] `proxy/`
  - [ ] `proxy.module.ts` – NestJS module configuring HTTP proxy to downstream microservices. Registers `ProxyService` and `ServiceRegistry`. Sets up `http-proxy-middleware` or custom `axios`-based proxy with retry logic, timeout, and circuit breaker integration.
  - [ ] `proxy.service.ts` – `proxyRequest(req, res, serviceName): Promise<void>`. Resolves target URL from `ServiceRegistry`. Forwards: HTTP method, path, headers (including `X-Correlation-ID`, `Authorization`), body. Strips gateway-specific headers. Adds `X-Forwarded-For`, `X-Forwarded-Proto`. Retry: 2 attempts with 500ms delay for 5xx responses. Circuit breaker per-service: if circuit open, returns 503 immediately. Streams response back to client (supports large file downloads).
  - [ ] `service-registry.ts` – Map of service names to URLs: loaded from `routes.config.ts` in development (static URLs via Docker Compose service names). In production K8s: uses Kubernetes service DNS (`<service-name>.<namespace>.svc.cluster.local`). Health-aware: marks service as unhealthy after consecutive proxy failures, checks health endpoint before re-enabling. Supports dynamic registration for future service discovery integration.
- [ ] `swagger/`
  - [ ] `swagger.setup.ts` – Configures Swagger UI at `/api/docs`. Loads OpenAPI spec from `openapi.yaml` or generates from route metadata. Adds: Bearer JWT auth, Cookie auth, API key auth. Groups endpoints by tag (one per service). Includes example requests/responses. Disables in production (`SWAGGER_ENABLED=false`). Custom CSS for Nestlancer branding.
  - [ ] `swagger-ui.config.ts` – Custom Swagger UI options: `persistAuthorization: true` (remembers JWT across page refreshes), `docExpansion: 'none'` (collapsed by default), `filter: true` (search endpoints), `tagsSorterAlpha: true`, custom favicon, dark mode theme matching Nestlancer brand.

### 9.2 Tests (`gateway/tests/`)
- [ ] `unit/`
  - [ ] `cors.middleware.spec.ts` – Tests CORS headers for allowed/disallowed origins, preflight OPTIONS handling, credential handling. Verifies `Access-Control-Allow-Origin` matches `CORS_ORIGINS` config.
  - [ ] `rate-limiter.middleware.spec.ts` – Tests rate limit enforcement per tier (anonymous, authenticated, admin). Verifies 429 response on limit exceeded. Tests `X-RateLimit-*` response headers. Tests per-route overrides.
  - [ ] `jwt-auth.guard.spec.ts` – Tests JWT extraction from Bearer header and cookie. Tests valid/expired/malformed token handling. Tests `@Public()` route bypass. Verifies `AuthenticatedUser` attached to request.
  - [ ] `proxy.service.spec.ts` – Tests request proxying to correct service URL. Tests header forwarding. Tests retry on 5xx. Tests circuit breaker integration. Tests timeout handling. Mocks `ServiceRegistry` and `axios`.
- [ ] `e2e/`
  - [ ] `gateway.e2e-spec.ts` – End-to-end tests with real HTTP requests. Tests routing to each service (mocked downstream). Tests auth flow: unauthenticated → 401, authenticated → proxied, admin → proxied to admin service. Tests public routes accessible without auth.
  - [ ] `middleware-pipeline.e2e-spec.ts` – Tests full middleware chain execution order: CORS → correlation ID → maintenance mode → rate limiter → auth → proxy. Verifies correlation ID propagation. Tests maintenance mode blocks non-exempt routes.

### 9.3 Configuration Files
- [ ] `package.json` – Package name `@nestlancer/gateway`. Dependencies: `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/swagger`, `swagger-ui-express`, `http-proxy-middleware` or `axios`, `compression`, `helmet`, plus all `@nestlancer/*` shared library packages. Scripts: `start:dev`, `start:prod`, `build`, `test`, `test:e2e`.
- [ ] `tsconfig.json` – Extends `../../tsconfig.base.json`. Compiler options: `outDir: ./dist`, `rootDir: ./src`. Includes `src/**/*.ts`.
- [ ] `nest-cli.json` – NestJS CLI config: `sourceRoot: 'src'`, `compilerOptions: { deleteOutDir: true, webpack: false }`. Build generates to `dist/`.
- [ ] `Dockerfile` – Multi-stage build: (1) `node:20-alpine` builder stage with `pnpm install --frozen-lockfile` and `pnpm build:gateway`, (2) production stage with `node:20-alpine`, copies only `dist/` and `node_modules/`, runs as non-root user `node`, `EXPOSE 3000`, `CMD ["node", "dist/main.js"]`. Health check: `HEALTHCHECK CMD curl -f http://localhost:3000/api/v1/health || exit 1`.
- [ ] `infisical.json` – Infisical secret references for gateway-specific env vars. Points to Nestlancer project workspace and environment (dev/staging/prod).
- [ ] `.eslintrc.js` – ESLint config extending root config. Gateway-specific rules if any.
- [ ] `.prettierrc` – Prettier config extending root config.
- [ ] `README.md` – Gateway documentation: architecture overview, routing table, middleware pipeline diagram, environment variables, local development setup (`pnpm dev:gateway`), API documentation link.

---

## 10. WebSocket Gateway (`ws-gateway/`)

### 10.1 Source (`ws-gateway/src/`)
- [ ] `main.ts` – Bootstrap standalone NestJS app for WebSocket. Uses `WsAdapter` from `@nestlancer/websocket` with Redis adapter for horizontal scaling. Configures: `CORS` matching API gateway, `WS_PORT` (default 3100), `WS_PATH` ('/ws'). Enables shutdown hooks. Registers metrics endpoint at `/metrics`. No HTTP routes except `/health`.
- [ ] `app.module.ts` – Root module importing: `ConfigModule.forRoot()`, `WebSocketModule.forRoot({ redisUrl })`, `AuthLibModule`, `CacheModule.forRoot()`, `QueueModule.forRoot()`, `LoggerModule.forRoot()`, `MetricsModule`, `TracingModule.forRoot()`, `HealthLibModule`. Registers `MessagesGateway` and `NotificationsGateway`.
- [ ] `config/`
  - [ ] `ws-gateway.config.ts` – WebSocket-specific config: `WS_PORT` (default 3100), `WS_PATH` (default '/ws'), `WS_REDIS_URL` (Redis pub/sub instance URL, port 6380), `WS_MAX_CONNECTIONS_PER_USER` (default 5), `WS_HEARTBEAT_INTERVAL` (default 25000ms), `WS_HEARTBEAT_TIMEOUT` (default 20000ms), `WS_MAX_PAYLOAD_SIZE` (default '1mb' for message content), `WS_TRANSPORTS` (default ['websocket', 'polling'] for Socket.IO fallback).
- [ ] `auth/`
  - [ ] `ws-auth.service.ts` – JWT authentication for WebSocket handshake. Extracts token from `socket.handshake.auth.token` or `socket.handshake.query.token`. Verifies with `JWT_ACCESS_SECRET` via `@nestlancer/auth-lib`. On success: attaches `WsClient { userId, role, socketId, connectedAt }` to `socket.data`. On failure: emits `auth:error` with error details and disconnects. Handles token refresh: client sends `auth:refresh` event with refresh token, server validates and issues new access token. Logs connection events for audit.
  - [ ] `ws-auth.guard.ts` – Guard for `@SubscribeMessage()` handlers. Checks `socket.data.user` exists (set by `ws-auth.service.ts` during handshake). If not authenticated, emits `error` event with `AUTH_WS_UNAUTHORIZED` code and prevents handler execution. Applied via `@UseGuards(WsAuthGuard)` or `@WsAuth()` decorator.
- [ ] `gateways/`
  - [ ] `messages.gateway.ts` – `@WebSocketGateway({ namespace: '/messages' })`. Handles real-time messaging events per `109-messaging-endpoints`: `message:send` (validate, save via messaging-service HTTP call, broadcast to `project:<projectId>` room), `message:typing` (broadcast typing indicator to room, throttled to 1 event/3s), `message:read` (mark messages as read, broadcast read receipt), `message:edit` (update message, broadcast edit), `message:delete` (soft-delete, broadcast removal). On connection: auto-joins user's project rooms (queries active projects). Emits `message:new` to room members. Validates sender is participant of the conversation.
  - [ ] `notifications.gateway.ts` – `@WebSocketGateway({ namespace: '/notifications' })`. Subscribes to Redis pub/sub channel `nestlancer:notifications:<userId>`. When notification-worker publishes to Redis (after consuming from notification.queue), this gateway pushes to user's Socket.IO room `user:<userId>`. Events: `notification:new` (new notification), `notification:batch` (multiple notifications), `notification:read` (mark as read acknowledgment). On connection: sends unread notification count. Per `110-notifications-endpoints` real-time push.
- [ ] `services/`
  - [ ] `room-manager.service.ts` – Manages Socket.IO rooms. `joinProjectRoom(socket, projectId): Promise<void>` – validates user is participant via project-service API call, then joins `project:<projectId>`. `leaveProjectRoom(socket, projectId): void`. `joinUserRoom(socket, userId): void` – auto-called on connection for personal notifications. `broadcastToRoom(room, event, data): void`. `getRoomMembers(room): Promise<string[]>`. Room metadata stored in Redis: `room:<name> = { members: [], createdAt }`.
  - [ ] `presence.service.ts` – Tracks user online status in Redis. On connect: `SET presence:<userId> { socketId, device, lastSeen } EX 60`. On heartbeat: `EXPIRE presence:<userId> 60` (refresh TTL). On disconnect: `DEL presence:<userId>`. `getOnlineStatus(userId): Promise<'online' | 'offline'>`. `getOnlineUsers(userIds: string[]): Promise<Map<string, boolean>>` using Redis `MGET`. Broadcasts `presence:update` to relevant project rooms when status changes.
  - [ ] `heartbeat.service.ts` – WebSocket keepalive management. Socket.IO built-in ping/pong: `pingInterval: 25000, pingTimeout: 20000`. On each successful pong: updates presence TTL in Redis. Disconnects clients after 2 missed pongs (45s). Publishes `nestlancer_active_websocket_connections` gauge metric per pod and total.
  - [ ] `redis-subscriber.service.ts` – Subscribes to Redis pub/sub channels for cross-instance event delivery. Channels: `nestlancer:notifications:<userId>` (from notification-worker), `nestlancer:messages:<projectId>` (from messaging-service for multi-pod delivery), `nestlancer:presence:updates` (presence changes from other WS gateway pods). Uses separate Redis connection from adapter (dedicated subscriber connection). `publishToUser(userId, event, data): void` – publishes to Redis, all WS gateway pods receive and route to correct socket.
- [ ] `adapters/`
  - [ ] `redis-io.adapter.ts` – Extends Socket.IO `IoAdapter` with `@socket.io/redis-adapter`. Configures Redis pub/sub pair (publish + subscribe clients) on `WS_REDIS_URL`. Enables horizontal scaling: message emitted on one WS gateway pod is delivered to clients connected to other pods via Redis pub/sub. Configures: `requestsTimeout: 5000`, `publishOnSpecificResponseChannel: true` for improved performance.
- [ ] `decorators/`
  - [ ] `ws-current-user.decorator.ts` – `@WsCurrentUser(field?: string)` parameter decorator. Extracts authenticated user from `socket.data.user`. Usage: `@WsCurrentUser() user: WsClient` or `@WsCurrentUser('userId') userId: string`. Equivalent to HTTP `@CurrentUser()` for WebSocket context.
  - [ ] `ws-room.decorator.ts` – `@WsRoom()` parameter decorator. Extracts room name from event payload `data.room` or `data.projectId` (auto-prefixed to `project:<id>`). Validates user is member of the room via `RoomManagerService` before handler execution.
- [ ] `filters/`
  - [ ] `ws-exception.filter.ts` – Catches exceptions in WebSocket handlers. Formats error response: `{ event: 'error', data: { code, message, details } }`. Maps: `WsException` → emits error event, `UnauthorizedException` → emits `auth:error` and disconnects, unhandled → logs and emits generic error. Never crashes the connection for recoverable errors.
- [ ] `interfaces/`
  - [ ] `ws-client.interface.ts` – `WsClient { socketId: string, userId: string, role: UserRole, connectedAt: Date, rooms: Set<string>, device?: string, ip?: string }`. Attached to `socket.data` after successful authentication.
  - [ ] `ws-events.interface.ts` – Event type constants and payload interfaces. `MessageSendPayload { conversationId, content, type, attachments? }`. `MessageTypingPayload { conversationId, isTyping }`. `MessageReadPayload { conversationId, lastReadMessageId }`. `NotificationPayload { id, type, title, message, data }`. `PresenceUpdatePayload { userId, status }`.
  - [ ] `ws-room.interface.ts` – `WsRoomMetadata { name: string, type: 'project' | 'user', memberIds: string[], createdAt: Date, lastActivity?: Date }`. Stored in Redis hash `room:<name>`.

### 10.2 Tests (`ws-gateway/tests/`)
- [ ] `unit/`
  - [ ] `ws-auth.service.spec.ts` – Tests JWT validation during WebSocket handshake. Tests valid token → `socket.data.user` populated. Tests expired token → disconnection with `auth:error`. Tests missing token → rejection. Tests token refresh flow.
  - [ ] `room-manager.service.spec.ts` – Tests room join/leave lifecycle. Tests user authorization check before room join. Tests broadcast to room members. Tests room membership persistence in Redis. Mocks project-service API.
  - [ ] `presence.service.spec.ts` – Tests online/offline status tracking. Tests heartbeat TTL refresh. Tests multi-user online status query. Tests presence broadcast on status change. Mocks Redis with `mockRedisService()`.
- [ ] `e2e/`
  - [ ] `messages.gateway.e2e-spec.ts` – E2E tests using `socket.io-client`. Tests: connect with valid JWT → success, send message → received by room members, typing indicator → received by room members, edit/delete → broadcast to room, unauthorized user → cannot join room. Uses real WebSocket connections against test server.
  - [ ] `notifications.gateway.e2e-spec.ts` – E2E tests: connect → receive unread count, publish to Redis notification channel → client receives notification, mark as read → acknowledgment received. Tests multi-client scenarios (same user on multiple devices).

### 10.3 Configuration Files
- [ ] `package.json` – Package name `@nestlancer/ws-gateway`. Dependencies: `@nestjs/core`, `@nestjs/platform-socket.io`, `@nestjs/websockets`, `socket.io`, `@socket.io/redis-adapter`, `ioredis`, plus `@nestlancer/*` shared libraries. Scripts: `start:dev`, `start:prod`, `build`, `test`, `test:e2e`.
- [ ] `tsconfig.json` – Extends `../../tsconfig.base.json`. Compiler options: `outDir: ./dist`, `rootDir: ./src`.
- [ ] `nest-cli.json` – NestJS CLI config: `sourceRoot: 'src'`. Same pattern as API gateway.
- [ ] `Dockerfile` – Multi-stage build same pattern as API gateway. `EXPOSE 3100`. Health check: `curl -f http://localhost:3100/health || exit 1`. Note: WebSocket connections are long-lived, so graceful shutdown must drain existing connections before pod termination.
- [ ] `infisical.json` – Infisical secret references for WS gateway env vars. Same project, environment-specific.
- [ ] `.eslintrc.js` – ESLint config extending root.
- [ ] `.prettierrc` – Prettier config extending root.
- [ ] `README.md` – WS Gateway documentation: connection protocol, authentication flow, event catalog (all events with payloads), room management, scaling architecture (Redis adapter diagram), environment variables, local development setup.

---

## 11. Services (`services/`)

Each service follows a similar pattern. Below is a template, then specific per‑service tasks.

**Common structure for every service:**
- `src/`
  - `main.ts` – Bootstrap NestJS app. Configures: global `ValidationPipe`, `HttpExceptionFilter`, `ResponseTransformInterceptor`, `MetricsInterceptor`. Connects to PostgreSQL via `DatabaseModule`, Redis via `CacheModule`, RabbitMQ via `QueueModule`. Listens on service-specific port. Registers health check endpoint at `/health`. Enables graceful shutdown hooks.
  - `app.module.ts` – Root module importing: `ConfigModule.forRoot()`, `DatabaseModule.forRoot()`, `CacheModule.forRoot()`, `QueueModule.forRoot()`, `AuthLibModule`, `LoggerModule.forRoot()`, `MetricsModule`, `TracingModule.forRoot()`, `HealthLibModule`, `OutboxModule.forRoot()`, `IdempotencyModule.forRoot()`. Imports service-specific controllers and services.
  - `controllers/` – Split into `public/` (@Public() decorated, no auth), `user/` (authenticated user endpoints), `admin/` (admin-only endpoints with @Auth(UserRole.ADMIN)). Each controller delegates to service layer, handles DTO validation via pipes.
  - `services/` – Business logic layer. Injects repositories (Prisma), cache service, queue publisher, outbox service. Handles domain validation, status transitions, event publishing, and cache invalidation.
  - `dto/` – Request/response validation using `class-validator` decorators. Request DTOs: `@IsString()`, `@IsEmail()`, `@IsEnum()`, `@IsOptional()`, `@MinLength()`, `@MaxLength()`, `@IsUUID()`. Response DTOs: `@Exclude()` sensitive fields, `@Expose()` computed fields, `@Type()` for nested transforms.
  - `entities/` – TypeScript interfaces/types mirroring Prisma models. Used for internal typing, not ORM entities (Prisma handles that). Includes select/include objects for Prisma queries.
  - `guards/` – Service-specific guards beyond shared `@nestlancer/auth-lib` guards.
  - `interfaces/` – Service-specific interfaces for status flows, config options, external API responses.
  - `config/` – Service-specific environment config extending `@nestlancer/config` schemas.
- `tests/`
  - `unit/` – Jest unit tests for each service and controller. Mock deps via `@nestlancer/testing`. Coverage target: 80%+.
  - `e2e/` – Supertest-based E2E tests against live service with test database. Tests full request→response cycle.
  - `fixtures/` – Test data using `@nestlancer/testing` factories.
- `package.json`, `tsconfig.json`, `nest-cli.json`, `Dockerfile`, `infisical.json`, `.eslintrc.js`, `.prettierrc`, `README.md` – Same pattern as gateway. Dockerfile multi-stage build, service-specific port.

For each service we will list the required files based on `dir-structure.md` and the endpoints from `endpoints-v2.md`.

### 11.1 Health Service (`services/health/`)
- [ ] `src/main.ts` – Bootstrap on port 3016. Imports only `HealthLibModule` and observability modules. Lightweight service – no database connection needed (aggregates health from other services).
- [ ] `src/app.module.ts` – Imports `ConfigModule`, `LoggerModule`, `MetricsModule`, `HealthLibModule`. Registers `HealthController` and all health check services. No `DatabaseModule` (queries other services' health endpoints via HTTP).
- [ ] `src/controllers/public/health.public.controller.ts` – All endpoints `@Public()`, no auth required. Per `101-health-endpoints`:
  - [ ] `GET /` – Aggregated health status. Calls all health indicators in parallel with 5s timeout each. Response: `{ status: 'healthy' | 'degraded' | 'unhealthy', checks: { database, cache, queue, storage, ... }, timestamp, version, uptime }`. Returns 200 for healthy, 503 for unhealthy. Used by external monitoring.
  - [ ] `GET /ready` – Kubernetes readiness probe. Checks: database connection, Redis connection, RabbitMQ connection. Returns 200 if all critical dependencies ready, 503 otherwise. K8s removes pod from service when not ready.
  - [ ] `GET /live` – Kubernetes liveness probe. Lightweight: checks process is running and event loop is not blocked. Returns 200 if alive, 503 if stuck. K8s restarts pod on repeated failures.
  - [ ] `HEAD /ping` – Ultra-lightweight ping. No body, no checks. Returns 200 immediately. Used for load balancer health checks (<1ms response).
  - [ ] `GET /database` – PostgreSQL health: `SELECT 1` on primary, response time, pool stats (active/idle/waiting), replication lag (if replica configured). Degraded if >500ms, unhealthy if connection fails.
  - [ ] `GET /cache` – Redis health: `PING` on cache instance (port 6379) and pub/sub instance (port 6380). Reports: used memory, connected clients, uptime, hit ratio.
  - [ ] `GET /queue` – RabbitMQ health: connection status, queue depths (all queues), consumer counts, DLQ message counts. Degraded if any queue >1000 messages. Unhealthy if connection lost.
  - [ ] `GET /storage` – S3/Cloudinary health: `HeadBucket` for S3, `api.ping()` for Cloudinary. Reports: provider, connection status, bucket accessibility.
  - [ ] `GET /microservices` – Calls `/health` endpoint on each microservice (auth:3001 through webhooks:3015). Reports per-service status. Timeout 3s per service. Degraded if any service degraded, unhealthy if critical service (auth, payments) down.
  - [ ] `GET /external` – External service health: Razorpay API status (ping key validation endpoint), SMTP server (`transporter.verify()`), Cloudflare Turnstile. Circuit breaker state for each external service.
  - [ ] `GET /workers` – Worker health: checks each worker's heartbeat in Redis (`worker:<name>:heartbeat`). Reports last heartbeat time, processing rate, error rate. Degraded if heartbeat >60s old.
  - [ ] `GET /websocket` – WS Gateway health: HTTP call to `ws-gateway:3100/health`. Reports: active connections, rooms count, Redis adapter status.
  - [ ] `GET /system` – System metrics: `process.memoryUsage()` (heapUsed, heapTotal, rss, external), `os.cpus()` (load average), `os.totalmem()`/`os.freemem()`, `process.uptime()`, Node.js version, event loop lag.
  - [ ] `GET /features` – Feature flags status: reads all `FeatureFlag` records from admin service. Reports: flag name, enabled status, rollout percentage. Useful for debugging feature-gated behavior.
  - [ ] `GET /registry` – Service registry status: lists all registered services with their URLs, health status, and last check time. Reports total services, healthy count, unhealthy count.
- [ ] `src/controllers/admin/health-debug.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - [ ] `GET /debug` – Detailed diagnostic dump. Returns: all health check results with full details, recent error logs (last 100), environment info (NODE_ENV, version, pod name), dependency versions, connection pool stats, event loop histogram. Admin-only due to sensitive information exposure. Audit-logged.
- [ ] `src/services/health.service.ts` – Orchestrates all health checks. `getAggregatedHealth(): Promise<AggregatedHealthResult>`. Runs indicators in parallel via `Promise.allSettled()`. Computes overall status: unhealthy if any critical check fails, degraded if any non-critical check fails, healthy otherwise. Caches result for 10s to prevent thundering herd on health endpoint.
- [ ] `src/services/database-health.service.ts` – Uses `@nestlancer/health-lib` `DatabaseHealthIndicator`. Extends with replication lag check via `SELECT pg_last_wal_replay_lsn()` on replica vs `SELECT pg_current_wal_lsn()` on primary.
- [ ] `src/services/cache-health.service.ts` – Uses `RedisHealthIndicator` from `@nestlancer/health-lib`. Checks both Redis instances separately.
- [ ] `src/services/queue-health.service.ts` – Uses `RabbitMQHealthIndicator`. Extends with queue depth monitoring via RabbitMQ Management API (`RABBITMQ_MANAGEMENT_URL`).
- [ ] `src/services/storage-health.service.ts` – Uses `StorageHealthIndicator`. Checks both private and public S3 buckets.
- [ ] `src/services/external-services-health.service.ts` – HTTP health checks to external services. Each wrapped in circuit breaker. Razorpay: `GET /v1/payments?count=0` with API key. SMTP: `transporter.verify()`. Turnstile: lightweight validation test.
- [ ] `src/services/workers-health.service.ts` – Reads worker heartbeat keys from Redis. Pattern: `worker:<name>:heartbeat` with value `{ lastBeat: ISO timestamp, processedCount, errorCount }`. Worker is healthy if lastBeat < 60s ago.
- [ ] `src/services/websocket-health.service.ts` – HTTP call to `ws-gateway:3100/health`. Reports active WebSocket connections and Redis adapter status.
- [ ] `src/services/system-metrics.service.ts` – Collects OS and process metrics. Uses `os` module and `process` APIs. Computes event loop lag via `setImmediate()` timing. Reports GC stats if `--expose-gc` flag is set.
- [ ] `src/services/feature-flags-health.service.ts` – Reads feature flags from Redis cache or queries admin service API. Reports flag states for health dashboard.
- [ ] `src/services/service-registry-health.service.ts` – Iterates service registry, pings each service's `/health` endpoint with 3s timeout. Caches results for 30s.
- [ ] `src/dto/health-query.dto.ts` – `@IsOptional() @IsString() service?: string` (filter to specific service), `@IsOptional() @IsBoolean() verbose?: boolean` (include detailed check info), `@IsOptional() @IsEnum() format?: 'json' | 'prometheus'`.
- [ ] `src/interfaces/health-status.interface.ts` – `AggregatedHealthResult { status: 'healthy' | 'degraded' | 'unhealthy', checks: Record<string, HealthCheckResult>, timestamp: string, version: string, uptime: number, environment: string }`.
- [ ] `src/interfaces/health-check-result.interface.ts` – `HealthCheckResult { status: 'healthy' | 'degraded' | 'unhealthy', responseTime: number, details?: Record<string, any>, error?: string, lastChecked: string }`.
- [ ] `src/interfaces/system-metrics.interface.ts` – `SystemMetrics { memory: { heapUsed, heapTotal, rss, external }, cpu: { loadAvg: number[], cores: number }, uptime: number, nodeVersion: string, eventLoopLag: number, pid: number }`.
- [ ] `src/config/health.config.ts` – `HEALTH_CHECK_TIMEOUT` (default 5000ms), `HEALTH_CACHE_TTL` (default 10s), `DEGRADED_RESPONSE_TIME_MS` (default 500ms), per-service URLs for health checks.
- [ ] `tests/unit/` – Test each health service with mocked indicators. Test aggregation logic: all healthy → healthy, one degraded → degraded, one unhealthy → unhealthy.
- [ ] `tests/e2e/health.e2e-spec.ts` – Tests `/`, `/ready`, `/live`, `/ping` endpoints. Tests 200 when healthy, 503 when unhealthy (mock a failing indicator).
- [ ] `tests/fixtures/health.fixture.ts` – Mock health check results for testing aggregation.

### 11.2 Auth Service (`services/auth/`)
- [ ] `src/main.ts` – Bootstrap on port 3001. Imports auth-specific modules. No queue consumer (auth is synchronous HTTP only). Publishes events to outbox for email notifications.
- [ ] `src/app.module.ts` – Imports standard modules plus `TurnstileModule.forRoot()`. All controllers require `@Public()` since auth endpoints are pre-authentication.
- [ ] `src/controllers/public/auth.public.controller.ts` – All endpoints `@Public()`, pre-auth. Per `102-auth-endpoints`:
  - [ ] `POST /register` – `@RequireTurnstile()`. Validates email uniqueness, password strength (min 8 chars, uppercase, lowercase, number, special char). Creates user with `status: PENDING_VERIFICATION`. Hashes password (bcrypt, 12 rounds). Creates email verification token (crypto-random, SHA-256 hashed for storage, 24h expiry). Publishes `email.verification` event to outbox. Returns 201 with user data (no tokens until email verified). `@Idempotent()` on email.
  - [ ] `POST /login` – `@RequireTurnstile()`. Validates email/password. Checks account status (ACTIVE, not SUSPENDED/DELETED). Checks account lockout (5 failed attempts → 15min lock). If 2FA enabled: returns `{ requires2FA: true, authSessionId }` (temp session, 5min TTL in Redis). If no 2FA: generates access token (15min) + refresh token (7d), sets httpOnly cookies, returns tokens. Publishes `audit.user.login` event. Records login attempt (IP, userAgent, success).
  - [ ] `POST /verify-email` – Validates token (lookup by SHA-256 hash in DB). Updates `user.emailVerified = true`, `user.status = ACTIVE`. Deletes token. Publishes `email.welcome` event. Returns tokens (auto-login after verification).
  - [ ] `POST /resend-verification` – Rate limited: 3/hour per email. Validates user exists and is unverified. Deletes old token, creates new. Publishes `email.verification` event. Returns generic success (doesn't reveal if email exists).
  - [ ] `POST /verify-2fa` – Validates `authSessionId` (from Redis, 5min TTL). Verifies TOTP code via `@nestlancer/crypto` TotpService (±1 window). On success: generates tokens, deletes auth session. On failure: increment attempt counter (max 5, then invalidate session). Supports backup codes.
  - [ ] `POST /refresh` – Extracts refresh token from cookie or body. Validates: exists in DB, not revoked, not expired. Implements token family rotation: invalidates old refresh token, generates new pair. If reuse of revoked token detected: revokes entire token family (compromised session). Returns new access + refresh tokens.
  - [ ] `POST /forgot-password` – `@RequireTurnstile()`. Rate limited: 3/hour per email. Creates password reset token (crypto-random, 1h expiry). Publishes `email.password-reset` event. Returns generic success (timing-safe, same response time regardless of email existence).
  - [ ] `POST /reset-password` – Validates token, checks not expired. Validates new password strength. Hashes new password. Deletes token. Revokes all refresh tokens for user (force re-login everywhere). Publishes `audit.user.password_reset` event.
  - [ ] `GET /check-email` – Rate limited: 10/min. Returns generic `{ available: true }` always (privacy: never reveals if email is registered). Server-side: logs suspicious patterns.
  - [ ] `GET /csrf-token` – Generates CSRF token (crypto-random), sets `csrf_token` httpOnly cookie, returns token in response body. Per `100-api-standards` double-submit cookie pattern.
  - [ ] `GET /health` – Service-specific health check.
- [ ] `src/services/auth.service.ts` – Orchestrates auth flows. Delegates to specialized services. Manages outbox event publishing within transactions.
- [ ] `src/services/registration.service.ts` – `register(dto): Promise<User>`. Validates email uniqueness (case-insensitive). Creates user + verification token in single transaction with outbox event. Assigns default role `USER`, status `PENDING_VERIFICATION`.
- [ ] `src/services/login.service.ts` – `login(dto): Promise<LoginResult>`. Checks lockout status first. Verifies password. Records login attempt. Handles 2FA flow branching. Creates auth session in Redis for 2FA users.
- [ ] `src/services/token.service.ts` – Wraps `@nestlancer/auth-lib` token utilities. `generateTokenPair(user): { accessToken, refreshToken }`. Stores refresh token hash in DB with device info, IP, expiry. `rotateRefreshToken(oldToken): TokenPair`. `revokeTokenFamily(familyId): void`.
- [ ] `src/services/password.service.ts` – `validateStrength(password): { valid, errors[] }`. Rules: min 8 chars, max 128, at least 1 uppercase, 1 lowercase, 1 number, 1 special char, not in common password list (top 10000). Uses `@nestlancer/crypto` HashingService.
- [ ] `src/services/two-factor.service.ts` – Delegates to `@nestlancer/crypto` TotpService. Manages auth sessions in Redis. Tracks backup code usage.
- [ ] `src/services/email-verification.service.ts` – Creates verification tokens: `crypto.randomBytes(32).toString('hex')`, stored as SHA-256 hash. 24h expiry. One active token per user. Publishes to outbox with verification URL.
- [ ] `src/services/turnstile.service.ts` – Delegates to `@nestlancer/turnstile` TurnstileService. Service-level wrapper for auth-specific error handling.
- [ ] `src/services/csrf.service.ts` – `generateToken(): string` using `crypto.randomBytes(32)`. `validateToken(cookieToken, headerToken): boolean` with timing-safe comparison.
- [ ] `src/services/account-lockout.service.ts` – Redis-based lockout tracking. Key: `lockout:<email>`. Increments on failed login. After 5 failures: sets lockout with 15min TTL. `isLocked(email): boolean`. `recordAttempt(email, success): void`. `clearLockout(email): void` on successful login.
- [ ] `src/dto/register.dto.ts` – `@IsEmail() email`, `@MinLength(8) @MaxLength(128) @Matches(/regex/) password`, `@IsString() @MinLength(1) @MaxLength(100) firstName`, `@IsString() @MinLength(1) @MaxLength(100) lastName`, `@IsString() turnstileToken`, `@IsOptional() @IsString() referralCode`.
- [ ] `src/dto/login.dto.ts` – `@IsEmail() email`, `@IsString() password`, `@IsOptional() @IsString() turnstileToken`, `@IsOptional() @IsBoolean() rememberMe`.
- [ ] `src/dto/verify-email.dto.ts` – `@IsString() @Length(64, 64) token`.
- [ ] `src/dto/resend-verification.dto.ts` – `@IsEmail() email`, `@IsOptional() @IsString() turnstileToken`.
- [ ] `src/dto/verify-2fa.dto.ts` – `@IsUUID() authSessionId`, `@IsString() @Length(6, 6) code`, `@IsOptional() @IsEnum(['totp', 'backup']) method`.
- [ ] `src/dto/refresh-token.dto.ts` – `@IsOptional() @IsString() refreshToken` (optional: can come from cookie).
- [ ] `src/dto/forgot-password.dto.ts` – `@IsEmail() email`, `@IsString() turnstileToken`.
- [ ] `src/dto/reset-password.dto.ts` – `@IsString() token`, `@MinLength(8) @MaxLength(128) @Matches(/regex/) newPassword`.
- [ ] `src/dto/check-email.dto.ts` – `@IsEmail() email`.
- [ ] `src/dto/auth-response.dto.ts` – `AuthResponse { accessToken, refreshToken, user: UserResponse, expiresIn: number }`. `TwoFactorChallengeResponse { requires2FA: true, authSessionId, methods: string[] }`.
- [ ] `src/entities/user-credential.entity.ts` – Maps to User Prisma model auth fields: `passwordHash`, `twoFactorSecret` (encrypted), `twoFactorEnabled`, `backupCodes` (hashed array).
- [ ] `src/entities/refresh-token.entity.ts` – Maps to RefreshToken model: `tokenHash`, `userId`, `familyId`, `deviceInfo`, `ipAddress`, `expiresAt`, `revokedAt`, `createdAt`.
- [ ] `src/entities/email-verification-token.entity.ts` – Maps to EmailVerificationToken model: `tokenHash`, `userId`, `expiresAt`, `createdAt`.
- [ ] `src/entities/password-reset-token.entity.ts` – Maps to PasswordResetToken model: `tokenHash`, `userId`, `expiresAt`, `usedAt`, `createdAt`.
- [ ] `src/entities/login-attempt.entity.ts` – Maps to LoginAttempt model: `userId`, `email`, `ipAddress`, `userAgent`, `success`, `failureReason`, `createdAt`. Used for lockout tracking and admin audit.
- [ ] `src/guards/turnstile.guard.ts` – Re-exports `@nestlancer/turnstile` TurnstileGuard with auth-service-specific configuration (skip in test env).
- [ ] `src/interfaces/auth.interface.ts` – `LoginResult { type: 'success' | 'requires2FA', tokens?: TokenPair, authSessionId?: string, user?: AuthenticatedUser }`.
- [ ] `src/interfaces/token-payload.interface.ts` – `TokenPair { accessToken: string, refreshToken: string, expiresIn: number }`.
- [ ] `src/interfaces/login-result.interface.ts` – Same as above, with additional `loginAttempt` metadata.
- [ ] `src/config/auth.config.ts` – `JWT_ACCESS_EXPIRY` (15m), `JWT_REFRESH_EXPIRY` (7d), `EMAIL_VERIFICATION_EXPIRY` (24h), `PASSWORD_RESET_EXPIRY` (1h), `TWO_FACTOR_SESSION_TTL` (300s), `MAX_LOGIN_ATTEMPTS` (5), `LOCKOUT_DURATION_MS` (900000 = 15min), `MAX_REFRESH_TOKENS_PER_USER` (10).
- [ ] `tests/unit/` – Tests: registration with valid/invalid data, login with correct/wrong password, lockout after 5 failures, 2FA flow, token rotation, refresh token family revocation on reuse.
- [ ] `tests/e2e/` – Full auth flow: register → verify email → login → refresh → logout. 2FA flow: enable → login → verify 2FA → access. Password reset flow.
- [ ] `tests/fixtures/auth.fixture.ts` – Test users, tokens, auth sessions using `@nestlancer/testing` factories.

### 11.3 Users Service (`services/users/`)
- [ ] `src/main.ts` – Bootstrap on port 3002. Standard service setup.
- [ ] `src/app.module.ts` – Standard imports plus `StorageModule` (for avatar uploads).
- [ ] `src/controllers/user/profile.controller.ts` – `@Auth()` (authenticated user). Per `103-users-endpoints`:
  - `GET /profile` – Returns current user's full profile including preferences. Uses `@ReadOnly()` for read replica. Cached 5min per userId.
  - `PATCH /profile` – Updates profile fields. Validates: `firstName` (1-100 chars), `lastName` (1-100 chars), `phone` (E.164 format), `timezone` (IANA timezone), `language` (ISO 639-1). Publishes `audit.user.profile_updated` with before/after diff. Invalidates cache.
- [ ] `src/controllers/user/two-factor.controller.ts` – Per `103-users-endpoints` 2FA management:
  - `POST /2fa/enable` – Requires current password verification. Generates TOTP secret via `@nestlancer/crypto`. Returns QR code data URL and secret. Does NOT enable 2FA yet (must verify first).
  - `POST /2fa/verify` – Verifies TOTP code against pending secret. On success: enables 2FA, generates 10 backup codes, stores hashed. Returns backup codes (one-time display).
  - `POST /2fa/disable` – Requires password + TOTP code. Disables 2FA, clears secret and backup codes. Audit logged.
  - `GET /2fa/backup-codes` – Requires password verification. Returns remaining unused backup code count (not actual codes).
  - `POST /2fa/regenerate-codes` – Requires password + TOTP. Generates new 10 codes, invalidates old. Returns new codes. Audit logged.
- [ ] `src/controllers/user/sessions.controller.ts` – Per `103-users-endpoints` session management:
  - `GET /sessions` – Lists active sessions (refresh tokens). Returns: deviceInfo, ipAddress, lastUsedAt, current flag. Uses `@ReadOnly()`.
  - `DELETE /sessions/:id` – Revokes specific refresh token. Cannot revoke current session.
  - `POST /sessions/terminate-others` – Revokes all refresh tokens except current. Force logout from all other devices.
- [ ] `src/controllers/user/account.controller.ts` – Per `103-users-endpoints` account management:
  - `POST /delete-account` – Requires password confirmation. Sets `status: PENDING_DELETION`, `scheduledDeletionAt: Date.now() + 30 days`. Sends confirmation email. Does NOT immediately delete (grace period).
  - `POST /cancel-deletion` – Cancels pending deletion. Restores `status: ACTIVE`.
  - `GET /activity` – Activity log: login history, profile changes, password changes. Paginated, filterable by date range and type. Uses `@ReadOnly()`.
  - `GET /data-export` – GDPR data export. Queues export job (published to queue, processed by analytics-worker). Returns 202 Accepted with job ID. Sends download link via email when ready.
- [ ] `src/controllers/admin/users.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `103-users-endpoints` admin operations:
  - `GET /` – List all users with pagination, filtering (status, role, emailVerified, createdAt range), sorting. Uses `@ReadOnly()`.
  - `GET /:id` – Full user detail including: activity summary, project count, payment total, login history.
  - `PATCH /:id` – Update user fields (admin can update anything except password directly).
  - `PATCH /:id/role` – Change user role (USER ↔ ADMIN). Audit logged with reason.
  - `PATCH /:id/status` – Change status (ACTIVE/SUSPENDED/DEACTIVATED). Suspension: revokes all tokens, sends notification. Audit logged.
  - `POST /:id/force-password-reset` – Creates password reset token, sends email. Used when account may be compromised.
  - `DELETE /:id` – Hard delete (admin override). Cascades: soft-deletes related data, anonymizes personal info. Audit logged.
  - Additional: bulk operations, user statistics.
- [ ] `src/services/users.service.ts` – CRUD operations on User model via Prisma. `findById`, `findByEmail`, `updateProfile`, `updateStatus`. All writes go through `PrismaWriteService`, reads through `PrismaReadService` when `@ReadOnly()`.
- [ ] `src/services/profile.service.ts` – `updateProfile(userId, dto): Promise<User>`. Validates timezone against IANA list. Updates timestamps. Publishes profile update event to outbox.
- [ ] `src/services/preferences.service.ts` – `getPreferences(userId)`, `updatePreferences(userId, dto)`. Preferences stored as JSONB in UserPreferences model. Includes notification settings, privacy settings, UI preferences.
- [ ] `src/services/avatar.service.ts` – `uploadAvatar(userId, file): Promise<string>`. Validates: max 5MB, MIME type (image/jpeg, image/png, image/webp). Uploads to S3 public bucket via `@nestlancer/storage`. Generates thumbnail (150x150). Deletes old avatar. Returns CDN URL. Invalidates avatar cache.
- [ ] `src/services/sessions.service.ts` – `getActiveSessions(userId): Promise<Session[]>`. Queries RefreshToken table for non-revoked, non-expired tokens. `revokeSession(tokenId)`. `terminateOtherSessions(userId, currentTokenId)`.
- [ ] `src/services/two-factor.service.ts` – Wraps `@nestlancer/crypto` TotpService. Manages 2FA state on User model. Backup code management with bcrypt hashing.
- [ ] `src/services/account.service.ts` – `requestDeletion(userId, password)`. Verifies password. Sets deletion schedule. `cancelDeletion(userId)`. Account actually deleted by cleanup-worker after 30 days.
- [ ] `src/services/data-export.service.ts` – `requestExport(userId, format): Promise<{ jobId }>`. Publishes data export job to queue. Export includes: user profile, projects, payments, messages, notifications, media metadata. Generated as JSON or CSV. Uploaded to S3 private bucket with 7-day expiry presigned URL.
- [ ] `src/services/users-admin.service.ts` – Admin-specific operations: bulk status update, user statistics aggregation, impersonation support.
- [ ] `src/dto/update-profile.dto.ts` – `@IsOptional() @IsString() @MinLength(1) @MaxLength(100) firstName`, `lastName`, `@IsOptional() @Matches(/^\+[1-9]\d{1,14}$/) phone`, `@IsOptional() @IsTimezone() timezone`, `@IsOptional() @IsLocale() language`, `@IsOptional() @MaxLength(500) bio`.
- [ ] `src/dto/change-password.dto.ts` – `@IsString() currentPassword`, `@MinLength(8) @MaxLength(128) @Matches(/regex/) newPassword`. Validates current password before change.
- [ ] `src/dto/upload-avatar.dto.ts` – Multipart file upload. Validates via `FileInterceptor` with `MulterOptions`: maxSize 5MB, MIME type whitelist.
- [ ] `src/dto/update-preferences.dto.ts` – Nested DTO: `notifications: { email: boolean, push: boolean, inApp: boolean, quietHoursStart?: string, quietHoursEnd?: string }`, `privacy: { showOnlineStatus: boolean, showLastSeen: boolean }`.
- [ ] `src/dto/enable-2fa.dto.ts` – `@IsString() password`.
- [ ] `src/dto/verify-2fa.dto.ts` – `@IsString() @Length(6, 6) code`.
- [ ] `src/dto/disable-2fa.dto.ts` – `@IsString() password`, `@IsString() @Length(6, 6) code`.
- [ ] `src/dto/query-users.dto.ts` – Extends common pagination DTO. `@IsOptional() @IsEnum(UserStatus) status`, `@IsOptional() @IsEnum(UserRole) role`, `@IsOptional() @IsBoolean() emailVerified`, `@IsOptional() @IsDateString() createdAfter`, `@IsOptional() @IsDateString() createdBefore`, `@IsOptional() @IsString() search`.
- [ ] `src/dto/update-user.dto.ts` – Admin update: all profile fields plus `status`, `role`, `emailVerified`.
- [ ] `src/dto/update-user-role.dto.ts` – `@IsEnum(UserRole) role`, `@IsOptional() @IsString() reason`.
- [ ] `src/dto/update-user-status.dto.ts` – `@IsEnum(UserStatus) status`, `@IsOptional() @IsString() reason`. Status: ACTIVE, SUSPENDED, DEACTIVATED, PENDING_DELETION.
- [ ] `src/dto/reset-user-password.dto.ts` – `@IsOptional() @IsString() temporaryPassword` (if provided, set directly; otherwise send reset email).
- [ ] `src/dto/export-user.dto.ts` – `@IsOptional() @IsEnum(['json', 'csv']) format`.
- [ ] `src/dto/bulk-users.dto.ts` – `@IsEnum(['suspend', 'activate', 'delete']) action`, `@IsUUID('4', { each: true }) userIds`.
- [ ] `src/dto/user-response.dto.ts` – Response shape: `id, email, firstName, lastName, avatar, role, status, emailVerified, twoFactorEnabled, timezone, language, bio, createdAt, updatedAt`. `@Exclude() passwordHash, twoFactorSecret, backupCodes`.
- [ ] `src/dto/session-response.dto.ts` – `id, deviceInfo, ipAddress, lastUsedAt, createdAt, isCurrent: boolean`.
- [ ] `src/dto/activity-query.dto.ts` – `@IsOptional() @IsDateString() from`, `@IsOptional() @IsDateString() to`, `@IsOptional() @IsEnum(ActivityType) type`, pagination fields.
- [ ] `src/entities/user.entity.ts` – Prisma User model select/include objects. `userSelect` for public-facing fields. `userInclude` for relations (preferences, sessions).
- [ ] `src/entities/user-preferences.entity.ts` – Maps UserPreferences model with JSONB settings field.
- [ ] `src/entities/user-session.entity.ts` – Alias for RefreshToken model used in session context.
- [ ] `src/entities/user-activity.entity.ts` – Maps AuditLog filtered by userId for activity view.
- [ ] `src/interfaces/user.interface.ts` – Internal user type with computed fields.
- [ ] `src/interfaces/preferences.interface.ts` – `UserPreferencesData { notifications: NotificationPrefs, privacy: PrivacyPrefs, ui: UiPrefs }`.
- [ ] `src/interfaces/session.interface.ts` – `ActiveSession { id, deviceInfo, ipAddress, lastUsedAt, isCurrent }`.
- [ ] `src/config/users.config.ts` – `AVATAR_MAX_SIZE_MB` (5), `AVATAR_ALLOWED_TYPES` (jpeg, png, webp), `AVATAR_THUMBNAIL_SIZE` (150x150), `SESSION_MAX_COUNT` (10), `ACCOUNT_DELETION_GRACE_DAYS` (30), `DATA_EXPORT_EXPIRY_DAYS` (7).
- [ ] `tests/unit/` – Test profile CRUD, avatar upload/delete, 2FA enable/verify/disable flow, session management, account deletion/cancellation.
- [ ] `tests/e2e/` – Full user lifecycle: update profile → upload avatar → enable 2FA → manage sessions → request data export.
- [ ] `tests/fixtures/users.fixture.ts` – Test users in various states using `@nestlancer/testing` factories.

### 11.4 Requests Service (`services/requests/`)
- [ ] `src/main.ts` – Bootstrap on port 3003.
- [ ] `src/app.module.ts` – Standard imports plus `StorageModule` for attachment handling.
- [ ] `src/controllers/user/requests.controller.ts` – `@Auth()`. Per `104-requests-endpoints`:
  - `POST /` – Create new service request. Client provides: title, description, category, budgetRange, timeline, requirements, attachments. Initial status: `DRAFT`. User can save and edit before submitting. Publishes `request.created` event.
  - `GET /` – List user's requests with pagination, filtering by status. Uses `@ReadOnly()`. Cached 5min.
  - `GET /:id` – Request detail with attachments, status history, associated quotes summary. Validates user owns request. Uses `@ReadOnly()`.
  - `PATCH /:id` – Update draft/returned request. Cannot update after submission unless admin returns it. Validates status is `DRAFT` or `RETURNED`.
  - `DELETE /:id` – Soft-delete. Only owner can delete. Only `DRAFT` status requests can be deleted. Sets `deletedAt`.
  - `POST /:id/submit` – Transitions status: `DRAFT` → `SUBMITTED`. Validates all required fields are filled. Publishes `request.submitted` event (triggers admin notification). Cannot be undone by user.
- [ ] `src/controllers/user/request-attachments.controller.ts` – `@Auth()`:
  - `GET /:id/attachments` – List attachments linked to request. Returns presigned download URLs.
  - `POST /:id/attachments` – Link uploaded media to request. Validates: media exists, user owns it, request is in DRAFT/RETURNED status.
  - `DELETE /:id/attachments/:attachmentId` – Unlink attachment from request.
- [ ] `src/controllers/admin/requests.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `104-requests-endpoints`:
  - `GET /` – List all requests with advanced filtering: status, category, dateRange, userId. Sorting: createdAt, priority. Uses `@ReadOnly()`.
  - `GET /:id` – Admin view with full details including internal notes.
  - `PATCH /:id` – Admin update: add priority, assign category, update description.
  - `PATCH /:id/status` – Admin status transitions: SUBMITTED → REVIEWING → QUOTED → RETURNED. Each transition validates against allowed flows. Publishes status change event.
  - `POST /:id/notes` – Add internal admin note (not visible to user). Stores as RequestNote with adminId.
  - Additional: statistics, bulk operations.
- [ ] `src/services/requests.service.ts` – Core CRUD via Prisma. `create(userId, dto): Promise<Request>`. `findByUser(userId, query)`. `findById(id)`. `update(id, dto)`. `softDelete(id)`. Uses `BaseRepository` pattern.
- [ ] `src/services/request-attachments.service.ts` – Links media records to requests via RequestAttachment join table. Validates media ownership and request access.
- [ ] `src/services/request-notes.service.ts` – `addNote(requestId, adminId, content): Promise<RequestNote>`. Admin-only internal notes stored as RequestNote model.
- [ ] `src/services/request-status.service.ts` – Status state machine. Allowed transitions: `DRAFT → SUBMITTED` (user submit), `SUBMITTED → REVIEWING` (admin picks up), `REVIEWING → QUOTED` (admin sends quote), `REVIEWING → RETURNED` (admin returns for more info), `RETURNED → SUBMITTED` (user resubmits), `SUBMITTED → CANCELLED` (user cancels), `REVIEWING → CANCELLED` (admin cancels). Each transition: validates, updates status, creates StatusHistory entry, publishes event to outbox.
- [ ] `src/services/request-stats.service.ts` – `getUserStats(userId): Promise<RequestStats>`. Returns: total requests, by status breakdown, average time to quote, conversion rate (quoted → project created).
- [ ] `src/services/requests-admin.service.ts` – Admin operations: listing all requests with cross-user filters, bulk status updates, statistics aggregation.
- [ ] `src/dto/create-request.dto.ts` – `@IsString() @MinLength(5) @MaxLength(200) title`, `@IsString() @MinLength(20) @MaxLength(5000) description`, `@IsEnum(RequestCategory) category`, `@ValidateNested() @Type(() => BudgetRangeDto) budgetRange` (min, max in paise/INR), `@IsEnum(TimelinePreference) timeline` (ASAP/1_WEEK/2_WEEKS/1_MONTH/FLEXIBLE), `@IsOptional() @IsArray() @IsString({ each: true }) requirements`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) attachmentIds`.
- [ ] `src/dto/update-request.dto.ts` – `PartialType(CreateRequestDto)`. Only updatable in DRAFT/RETURNED status.
- [ ] `src/dto/query-requests.dto.ts` – Extends pagination. `@IsOptional() @IsEnum(RequestStatus) status`, `@IsOptional() @IsEnum(RequestCategory) category`, `@IsOptional() @IsString() search`.
- [ ] `src/dto/submit-request.dto.ts` – `@IsBoolean() confirmComplete` (user confirms all info is provided).
- [ ] `src/dto/update-request-status.dto.ts` – `@IsEnum(RequestStatus) status`, `@IsOptional() @IsString() @MaxLength(1000) note`.
- [ ] `src/dto/create-note.dto.ts` – `@IsString() @MinLength(1) @MaxLength(2000) content`.
- [ ] `src/dto/add-attachment.dto.ts` – `@IsUUID() mediaId`.
- [ ] `src/dto/request-response.dto.ts` – `RequestResponse { id, title, description, category, budgetRange, timeline, status, statusHistory, attachments: MediaResponse[], quotesCount, createdAt, updatedAt }`.
- [ ] `src/entities/request.entity.ts` – Prisma Request model select/include. Includes relations: `user`, `attachments.media`, `statusHistory`, `quotes`.
- [ ] `src/entities/request-attachment.entity.ts` – Join table: requestId, mediaId, addedAt.
- [ ] `src/entities/request-note.entity.ts` – `requestId`, `adminId`, `content`, `createdAt`. Admin-only internal notes.
- [ ] `src/entities/request-status-history.entity.ts` – `requestId`, `fromStatus`, `toStatus`, `changedBy`, `note`, `createdAt`. Full audit trail of status changes.
- [ ] `src/interfaces/request.interface.ts` – `RequestWithRelations`, `RequestStats`.
- [ ] `src/interfaces/request-status-flow.interface.ts` – `STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]>`. Defines valid transitions used by `RequestStatusService`.
- [ ] `src/config/requests.config.ts` – `ALLOWED_CATEGORIES` (enum list), `MAX_ATTACHMENTS_PER_REQUEST` (10), `MAX_TITLE_LENGTH` (200), `MAX_DESCRIPTION_LENGTH` (5000), `BUDGET_CURRENCY` ('INR').
- [ ] `tests/` – Unit: test status transitions (valid and invalid), attachment management, stats calculation. E2E: create → submit → admin review → quote flow.

### 11.5 Quotes Service (`services/quotes/`)
- [ ] `src/main.ts` – Bootstrap on port 3004.
- [ ] `src/app.module.ts` – Standard imports plus `PdfModule.forRoot()` for quote PDF generation.
- [ ] `src/controllers/user/quotes.controller.ts` – `@Auth()`. Per `105-quotes-endpoints`:
  - `GET /` – List quotes for current user's requests. Paginated, filterable by status. Shows quote summaries with total amount, status, expiry date. Cached 5min.
  - `GET /:id` – Full quote detail: line items, payment breakdown, timeline, scope, terms. Validates user owns the linked request. Uses `@ReadOnly()`.
  - `POST /:id/accept` – Accept quote. Validates: quote status is `SENT`, not expired. Creates acceptance record with: `acceptTerms: true`, `signatureName`, signature timestamp. Transitions status: `SENT` → `ACCEPTED`. Creates Project automatically (linked to request and quote). Publishes `quote.accepted` event (triggers project creation, notification). `@Idempotent()`.
  - `POST /:id/decline` – Decline quote. Transitions: `SENT` → `DECLINED`. Records reason and feedback. Publishes `quote.declined` event. User can optionally request revision instead of full decline.
  - `POST /:id/request-changes` – Request changes to quote. Transitions: `SENT` → `CHANGES_REQUESTED`. Records array of requested changes (section, description). Admin receives notification to revise.
  - `GET /:id/pdf` – Download quote as PDF. Generated via `@nestlancer/pdf`. PDF includes: Nestlancer branding, quote number, dates, client info, line items table, payment breakdown, terms & conditions, QR code for acceptance link. Cached PDF regenerated only on quote update.
  - `GET /stats` – User quote statistics: total quotes received, accepted/declined/pending counts, average response time.
- [ ] `src/controllers/admin/quotes.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `105-quotes-endpoints`:
  - `POST /` – Create new quote for a request. Links to `requestId`. Admin provides: title, line items (name, description, quantity, unitPrice), payment breakdown (milestones), timeline, scope description, technical details, terms. Initial status: `DRAFT`.
  - `GET /` – List all quotes with admin filters: status, dateRange, requestId, totalAmount range.
  - `GET /:id` – Admin view with full details including revision history.
  - `PATCH /:id` – Update draft/changes_requested quote. Recalculates totals from line items.
  - `DELETE /:id` – Soft-delete. Only DRAFT quotes can be deleted.
  - `POST /:id/send` – Send quote to client. Transitions: `DRAFT` → `SENT`, `CHANGES_REQUESTED` → `SENT` (revised). Sets `sentAt`, calculates `expiresAt` (default 14 days). Publishes `email.quote_sent` event with PDF attachment.
  - `POST /:id/duplicate` – Clone existing quote as new DRAFT. Copies all line items, terms. Changes title to "Copy of ...".
  - `GET /stats` – Admin quote statistics: conversion rate (sent → accepted), average quote value, time-to-accept distribution.
  - `GET /templates` – List reusable quote templates.
  - Additional: bulk operations.
- [ ] `src/services/quotes.service.ts` – Core CRUD. `create(dto): Promise<Quote>`. Auto-calculates `totalAmount` from line items: `Σ(quantity × unitPrice)`. Stores amounts in paise (integer) to avoid floating-point issues. Currency: INR (per tech stack).
- [ ] `src/services/quote-status.service.ts` – Status state machine. Transitions: `DRAFT → SENT` (admin sends), `SENT → ACCEPTED` (user accepts), `SENT → DECLINED` (user declines), `SENT → CHANGES_REQUESTED` (user wants changes), `CHANGES_REQUESTED → SENT` (admin resends revised), `SENT → EXPIRED` (cron/TTL). Each transition validates, records history, publishes to outbox.
- [ ] `src/services/quote-pdf.service.ts` – Generates PDF via `@nestlancer/pdf`. Template: professional invoice-style layout with company header, client address, line items table, subtotal/tax/total, payment schedule, terms. Caches generated PDF in S3. Regenerates on quote update. `generatePdf(quoteId): Promise<Buffer>`.
- [ ] `src/services/quote-templates.service.ts` – CRUD for reusable quote templates. `createFromQuote(quoteId): Promise<QuoteTemplate>`. Used to quickly create similar quotes for common project types.
- [ ] `src/services/quote-expiry.service.ts` – Handles quote expiration. Called by scheduler-worker: queries quotes where `status = SENT AND expiresAt < now()`. Transitions to `EXPIRED`. Publishes `quote.expired` event.
- [ ] `src/services/quote-stats.service.ts` – Statistics aggregation: conversion rate, average values, response time percentiles. Cached in Redis, recalculated hourly.
- [ ] `src/services/quotes-admin.service.ts` – Admin-specific: listing across all users, bulk operations, template management.
- [ ] `src/dto/create-quote.dto.ts` – `@IsUUID() requestId`, `@IsString() @MaxLength(200) title`, `@ValidateNested({ each: true }) @Type(() => QuoteLineItemDto) lineItems[]` (name, description, quantity, unitPrice in paise), `@ValidateNested() @Type(() => PaymentBreakdownDto) paymentBreakdown` (milestones with amounts), `@IsString() timeline`, `@IsString() scope`, `@IsOptional() @IsString() technicalDetails`, `@IsOptional() @IsString() terms`, `@IsOptional() @IsNumber() validityDays` (default 14).
- [ ] `src/dto/update-quote.dto.ts` – `PartialType(CreateQuoteDto)`. Only DRAFT/CHANGES_REQUESTED.
- [ ] `src/dto/query-quotes.dto.ts` – Pagination + `@IsOptional() @IsEnum(QuoteStatus) status`, `@IsOptional() @IsUUID() requestId`.
- [ ] `src/dto/accept-quote.dto.ts` – `@IsBoolean() acceptTerms` (must be true), `@IsString() @MaxLength(100) signatureName`, `@IsOptional() @IsString() notes`.
- [ ] `src/dto/decline-quote.dto.ts` – `@IsString() @MaxLength(1000) reason`, `@IsOptional() @IsString() feedback`, `@IsOptional() @IsBoolean() requestRevision`.
- [ ] `src/dto/request-changes.dto.ts` – `@ValidateNested({ each: true }) @Type(() => QuoteChangeRequestDto) changes[]` (section, description).
- [ ] `src/dto/send-quote.dto.ts` – `@IsOptional() @IsString() personalMessage` (included in email).
- [ ] `src/dto/duplicate-quote.dto.ts` – `@IsOptional() @IsString() newTitle`.
- [ ] `src/dto/create-quote-template.dto.ts` – `@IsString() name`, `@IsString() description`, template line items.
- [ ] `src/dto/payment-breakdown.dto.ts` – `@ValidateNested({ each: true }) @Type(() => PaymentMilestoneDto) milestones[]` (name, percentage, dueCondition). Sum of percentages must equal 100%.
- [ ] `src/dto/quote-response.dto.ts` – `QuoteResponse { id, quoteNumber, requestId, title, lineItems, subtotal, tax, totalAmount, paymentBreakdown, timeline, scope, technicalDetails, terms, status, sentAt, expiresAt, acceptedAt, declinedAt, pdfUrl, createdAt, updatedAt }`.
- [ ] `src/entities/quote.entity.ts` – Prisma Quote model. Relations: request, lineItems, paymentBreakdown, statusHistory. Auto-generated `quoteNumber` (format: `QT-YYYYMM-XXXX`).
- [ ] `src/entities/quote-line-item.entity.ts` – `quoteId`, `name`, `description`, `quantity` (decimal), `unitPrice` (paise), `totalPrice` (paise, computed). Order for display.
- [ ] `src/entities/quote-payment-breakdown.entity.ts` – `quoteId`, `name`, `percentage`, `amount` (paise), `dueCondition` (e.g., "On project start", "On milestone completion").
- [ ] `src/entities/quote-template.entity.ts` – Reusable template: name, description, default line items, terms.
- [ ] `src/interfaces/quote.interface.ts` – `QuoteWithRelations`, `QuoteStats`.
- [ ] `src/interfaces/quote-status-flow.interface.ts` – `QUOTE_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]>`.
- [ ] `src/config/quotes.config.ts` – `DEFAULT_VALIDITY_DAYS` (14), `MAX_LINE_ITEMS` (50), `MAX_REVISIONS` (5), `QUOTE_NUMBER_PREFIX` ('QT'), `TAX_RATE` (18% GST), `CURRENCY` ('INR').
- [ ] `tests/` – Unit: line item calculation, status transitions, PDF generation. E2E: create → send → accept/decline → project creation flow.

### 11.6 Projects Service (`services/projects/`)
- [ ] `src/main.ts` – Bootstrap on port 3005.
- [ ] `src/app.module.ts` – Standard imports plus `PdfModule` for project export.
- [ ] `src/controllers/public/projects.public.controller.ts` – `@Public()`. Per `106-projects-endpoints`:
  - `GET /public` – List completed/showcase projects. Paginated, filterable by category. Only `visibility: PUBLIC` projects. Cached 1h. Used for portfolio showcase.
  - `GET /public/:id` – Public project detail. Sanitized (no internal messages, payments). Includes: title, description, category, client testimonial, completion date.
- [ ] `src/controllers/user/projects.controller.ts` – `@Auth()`. Per `106-projects-endpoints`:
  - `GET /` – List user's projects (as client). Paginated, filterable by status. Cached 5min.
  - `GET /:id` – Full project detail: timeline, milestones, deliverables, payments summary, recent messages. Validates user is project participant.
  - `GET /:id/timeline` – Project timeline events. Combines: progress entries, milestone completions, deliverable uploads, status changes. Chronological order. Uses `@ReadOnly()`.
  - `GET /:id/milestones` – List milestones with status and completion percentage. Includes linked deliverables per milestone.
  - `GET /:id/deliverables` – List all deliverables with download URLs (presigned S3). Filterable by milestone.
  - `GET /:id/payments` – Payment history for project: completed payments, pending milestones, total paid vs total quoted.
  - `POST /:id/approve` – Approve completed project. Creates ProjectFeedback: rating (1-5), feedback text, testimonial (optional, for public showcase). Transitions project: `COMPLETED` → `APPROVED`. Publishes `project.approved` event.
  - `POST /:id/request-revision` – Request revisions on deliverables. Specifies: area, priority, description, details. Transitions: `REVIEW` → `IN_PROGRESS`. Publishes `project.revision_requested` event.
  - `POST /:id/feedback` – Submit feedback at any stage (separate from approval).
  - `GET /:id/messages` – Alias to messaging-service: list project conversation messages.
  - `POST /:id/messages` – Alias to messaging-service: send message in project conversation.
  - `GET /stats` – User project statistics: total, active, completed, total spent.
- [ ] `src/controllers/user/project-feedback.controller.ts` – Separate controller for feedback CRUD (may be combined with above).
- [ ] `src/controllers/admin/projects.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `106-projects-endpoints`:
  - `GET /` – List all projects with admin filters.
  - `GET /:id` – Admin view with internal details.
  - `PATCH /:id` – Admin update: title, description, internal notes.
  - `PATCH /:id/status` – Admin status transitions: any valid transition. Status flow: `CREATED` → `IN_PROGRESS` → `REVIEW` → `COMPLETED` → `APPROVED`/`ARCHIVED`. Side branches: `IN_PROGRESS` ↔ `ON_HOLD`, `REVIEW` → `IN_PROGRESS` (revision).
  - `POST /:id/archive` – Archive completed/cancelled project.
  - `POST /:id/duplicate` – Clone project as template for new client.
  - `POST /:id/export` – Export project data as PDF or JSON. Includes: timeline, milestones, deliverables, payments. PDF via `@nestlancer/pdf`.
  - `GET /stats` – Admin statistics: active projects, revenue, on-time completion rate.
  - `GET /templates` – Project templates.
  - Additional: bulk operations.
- [ ] `src/services/projects.service.ts` – Core CRUD. `createFromQuote(quote): Promise<Project>`. Auto-created when quote accepted: copies milestones from payment breakdown, creates conversation in messaging service. Sets initial status `CREATED`.
- [ ] `src/services/project-status.service.ts` – Status state machine. `CREATED → IN_PROGRESS → REVIEW → COMPLETED → APPROVED`. `IN_PROGRESS ↔ ON_HOLD`. `REVIEW → IN_PROGRESS` (revision). Each transition validates, records history, publishes event, sends notification.
- [ ] `src/services/project-feedback.service.ts` – `submitFeedback(projectId, dto): Promise<ProjectFeedback>`. Stores rating, text, optional testimonial. Testimonial can be marked for public display (admin approval needed).
- [ ] `src/services/project-messages.service.ts` – Proxies to messaging-service API. Creates project conversation on project creation. `getMessages(projectId)`, `sendMessage(projectId, dto)`.
- [ ] `src/services/project-templates.service.ts` – CRUD for project templates with default milestones and descriptions.
- [ ] `src/services/project-analytics.service.ts` – Project performance analytics: time tracking, milestone completion rate, budget utilization. Aggregated and cached.
- [ ] `src/services/project-export.service.ts` – `exportProject(projectId, format): Promise<Buffer>`. PDF: formatted report with timeline, milestones, payments. JSON: structured data dump.
- [ ] `src/services/project-stats.service.ts` – Aggregate statistics per user and global.
- [ ] `src/services/projects-admin.service.ts` – Admin operations: cross-user listing, bulk status updates.
- [ ] `src/dto/query-public-projects.dto.ts` – Pagination + `@IsOptional() @IsString() category`, `@IsOptional() @IsString() search`.
- [ ] `src/dto/query-projects.dto.ts` – Pagination + `@IsOptional() @IsEnum(ProjectStatus) status`, `@IsOptional() @IsString() search`.
- [ ] `src/dto/update-project.dto.ts` – `@IsOptional() @IsString() @MaxLength(200) title`, `description`, `internalNotes`. Admin-only fields.
- [ ] `src/dto/update-project-status.dto.ts` – `@IsEnum(ProjectStatus) status`, `@IsOptional() @IsString() note`.
- [ ] `src/dto/approve-project.dto.ts` – `@IsInt() @Min(1) @Max(5) rating`, `@IsString() @MaxLength(2000) feedback`, `@IsOptional() @IsString() @MaxLength(500) testimonial`, `@IsOptional() @IsBoolean() testimonialPublic`.
- [ ] `src/dto/request-revision.dto.ts` – `@IsString() area`, `@IsEnum(Priority) priority`, `@IsString() @MaxLength(2000) description`, `@IsOptional() @IsArray() details[]`.
- [ ] `src/dto/submit-feedback.dto.ts` – `@IsInt() @Min(1) @Max(5) rating`, `@IsString() @MaxLength(2000) feedback`.
- [ ] `src/dto/send-project-message.dto.ts` – `@IsString() @MaxLength(5000) content`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) attachmentIds`.
- [ ] `src/dto/duplicate-project.dto.ts` – `@IsOptional() @IsString() newTitle`.
- [ ] `src/dto/export-project.dto.ts` – `@IsEnum(['pdf', 'json']) format`.
- [ ] `src/dto/create-project-template.dto.ts` – Template name, description, default milestones.
- [ ] `src/dto/project-response.dto.ts` – `ProjectResponse { id, title, description, status, requestId, quoteId, clientId, totalAmount, paidAmount, startDate, estimatedEndDate, actualEndDate, milestones: MilestoneResponse[], feedback: FeedbackResponse, createdAt, updatedAt }`.
- [ ] `src/entities/project.entity.ts` – Prisma Project model. Relations: request, quote, client (user), milestones, feedback, statusHistory.
- [ ] `src/entities/project-feedback.entity.ts` – `projectId`, `userId`, `rating`, `feedback`, `testimonial`, `testimonialApproved`, `createdAt`.
- [ ] `src/entities/project-message.entity.ts` – Alias/view to Message model filtered by project conversation.
- [ ] `src/entities/project-template.entity.ts` – Template with default structure.
- [ ] `src/interfaces/project.interface.ts` – `ProjectWithRelations`, `ProjectStats`.
- [ ] `src/interfaces/project-status-flow.interface.ts` – `PROJECT_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]>`.
- [ ] `src/config/projects.config.ts` – `DEFAULT_ADMIN_ID` (assigned on creation), `MAX_TESTIMONIAL_LENGTH` (500), `PROJECT_CACHE_TTL` (300s), `ALLOWED_STATUSES`.
- [ ] `tests/` – Unit: status transitions, project creation from quote, feedback submission. E2E: full project lifecycle from quote acceptance to approval.

### 11.7 Progress Service (`services/progress/`)
- [ ] `src/main.ts` – Bootstrap on port 3006.
- [ ] `src/app.module.ts` – Standard imports plus `StorageModule` for deliverable file management.
- [ ] `src/controllers/user/progress.controller.ts` – `@Auth()`. Per `107-progress-endpoints`:
  - `GET /` – Progress timeline for user's projects. Shows: progress entries, milestone updates, deliverable uploads. Chronological with pagination. Uses `@ReadOnly()`.
  - `GET /:entryId` – Single progress entry detail with attachments.
  - `GET /status` – Overall project progress status: percentage complete (from milestones), current phase, days remaining.
  - `GET /milestones` – List milestones for user's active projects with completion status.
- [ ] `src/controllers/user/milestone-approvals.controller.ts` – `@Auth()`. Client-side milestone management:
  - `POST /milestones/:id/approve` – Client approves completed milestone. Required before payment release. Creates approval record with feedback. Publishes `milestone.approved` event.
  - `POST /milestones/:id/request-revision` – Client requests revisions on milestone deliverables. Transitions milestone: `COMPLETED` → `REVISION_REQUESTED`. Records reason.
- [ ] `src/controllers/user/deliverable-reviews.controller.ts` – `@Auth()`. Client deliverable review:
  - `POST /deliverables/:id/approve` – Approve individual deliverable with optional rating/feedback.
  - `POST /deliverables/:id/reject` – Reject deliverable with reason and requested changes.
- [ ] `src/controllers/admin/progress.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `107-progress-endpoints`:
  - `POST /projects/:id/progress` – Create progress entry for project. Types: UPDATE, MILESTONE_COMPLETE, DELIVERABLE_UPLOAD, STATUS_CHANGE. Admin can set visibility (client-visible or internal). Publishes `progress.entry_created` event (notifies client if visible).
  - `GET /projects/:id/progress` – List all progress entries for a project.
  - `PATCH /progress/:id` – Update progress entry (title, description).
  - `DELETE /progress/:id` – Soft-delete progress entry.
- [ ] `src/controllers/admin/milestones.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `POST /projects/:id/milestones` – Create milestone under project. Fields: name, description, startDate, endDate, deliverables list, order.
  - `PATCH /milestones/:id` – Update milestone details or dates.
  - `POST /milestones/:id/complete` – Mark milestone as completed. Transitions: `IN_PROGRESS` → `COMPLETED`. Triggers client notification for review/approval. Publishes `milestone.completed` event.
- [ ] `src/controllers/admin/deliverables.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `POST /projects/:id/deliverables` – Upload deliverable: links media files, sets milestone association, description.
  - `GET /projects/:id/deliverables` – List deliverables with download URLs.
  - `PATCH /deliverables/:id` – Update deliverable metadata.
  - `DELETE /deliverables/:id` – Soft-delete deliverable.
- [ ] `src/services/progress.service.ts` – CRUD for progress entries. `createEntry(projectId, dto): Promise<ProgressEntry>`. Records all project activity.
- [ ] `src/services/progress-timeline.service.ts` – `getTimeline(projectId, query): Promise<TimelineEntry[]>`. Aggregates: progress entries + milestone events + deliverable events into unified chronological timeline.
- [ ] `src/services/milestones.service.ts` – Milestone CRUD. `create(projectId, dto)`. `complete(milestoneId)`. Auto-calculates project completion percentage from milestone statuses.
- [ ] `src/services/deliverables.service.ts` – Deliverable management. Links uploaded media to milestones. Generates presigned download URLs. Tracks versions (re-uploads after rejection).
- [ ] `src/services/milestone-approval.service.ts` – Client approval flow. `approve(milestoneId, userId, dto)`. `requestRevision(milestoneId, userId, dto)`. On approval: triggers payment milestone release eligibility.
- [ ] `src/services/deliverable-review.service.ts` – Client review flow. `approve(deliverableId, dto)`. `reject(deliverableId, dto)` → marks for re-upload.
- [ ] `src/services/progress-admin.service.ts` – Admin operations: bulk milestone management, progress report generation.
- [ ] `src/dto/create-progress-entry.dto.ts` – `@IsEnum(ProgressEntryType) type` (UPDATE/MILESTONE_COMPLETE/DELIVERABLE_UPLOAD/STATUS_CHANGE), `@IsString() @MaxLength(200) title`, `@IsString() @MaxLength(5000) description`, `@IsOptional() @IsUUID() milestoneId`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) deliverableIds`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) attachmentIds`, `@IsOptional() @IsBoolean() notifyClient` (default true), `@IsOptional() @IsEnum(Visibility) visibility` (CLIENT_VISIBLE/INTERNAL).
- [ ] `src/dto/update-progress-entry.dto.ts` – `PartialType(CreateProgressEntryDto)`.
- [ ] `src/dto/query-progress.dto.ts` – Pagination + `@IsOptional() @IsEnum(ProgressEntryType) type`, `@IsOptional() @IsUUID() projectId`.
- [ ] `src/dto/create-milestone.dto.ts` – `@IsString() @MaxLength(200) name`, `@IsOptional() @IsString() description`, `@IsDateString() startDate`, `@IsDateString() endDate`, `@IsOptional() @IsArray() deliverables[]`, `@IsOptional() @IsInt() order`.
- [ ] `src/dto/update-milestone.dto.ts` – `PartialType(CreateMilestoneDto)`.
- [ ] `src/dto/approve-milestone.dto.ts` – `@IsOptional() @IsString() @MaxLength(1000) feedback`.
- [ ] `src/dto/request-milestone-revision.dto.ts` – `@IsString() @MaxLength(2000) reason`.
- [ ] `src/dto/upload-deliverable.dto.ts` – `@IsUUID() milestoneId`, `@IsArray() @IsUUID('4', { each: true }) mediaIds`, `@IsOptional() @IsString() @MaxLength(1000) description`.
- [ ] `src/dto/update-deliverable.dto.ts` – `@IsOptional() @IsString() description`.
- [ ] `src/dto/approve-deliverable.dto.ts` – `@IsOptional() @IsInt() @Min(1) @Max(5) rating`, `@IsOptional() @IsString() @MaxLength(1000) feedback`.
- [ ] `src/dto/reject-deliverable.dto.ts` – `@IsString() @MaxLength(2000) reason`, `@IsOptional() @IsArray() requestedChanges[]`.
- [ ] `src/dto/request-changes.dto.ts` – Generic revision request with details array.
- [ ] `src/dto/progress-entry-response.dto.ts` – `ProgressEntryResponse { id, type, title, description, milestoneId, attachments, visibility, createdBy, createdAt }`.
- [ ] `src/dto/milestone-response.dto.ts` – `MilestoneResponse { id, name, description, status, startDate, endDate, completionPercentage, deliverables: DeliverableResponse[], approvedAt, order }`.
- [ ] `src/dto/deliverable-response.dto.ts` – `DeliverableResponse { id, milestoneId, description, media: MediaResponse[], status, version, reviewStatus, createdAt }`.
- [ ] `src/entities/progress-entry.entity.ts` – Prisma model: type, title, description, projectId, milestoneId, visibility, createdBy, attachments relation.
- [ ] `src/entities/milestone.entity.ts` – `projectId`, `name`, `status` (PENDING/IN_PROGRESS/COMPLETED/APPROVED/REVISION_REQUESTED), `startDate`, `endDate`, `completedAt`, `approvedAt`, `order`.
- [ ] `src/entities/deliverable.entity.ts` – `milestoneId`, `description`, `mediaId`, `status` (UPLOADED/APPROVED/REJECTED), `version`, `reviewedAt`, `reviewedBy`.
- [ ] `src/interfaces/progress.interface.ts` – `TimelineEntry`, `ProgressStats`.
- [ ] `src/interfaces/milestone.interface.ts` – `MilestoneWithDeliverables`, `MilestoneStatusFlow`.
- [ ] `src/interfaces/deliverable.interface.ts` – `DeliverableWithMedia`, `DeliverableReview`.
- [ ] `src/config/progress.config.ts` – `ALLOWED_PROGRESS_TYPES`, `MAX_DELIVERABLE_SIZE_MB` (50), `APPROVAL_WINDOW_DAYS` (7, auto-approve after), `MAX_REVISIONS_PER_MILESTONE` (3).
- [ ] `tests/` – Unit: milestone status transitions, deliverable review flow, timeline aggregation. E2E: create milestone → upload deliverable → client review → approve → payment trigger.

### 11.8 Payments Service (`services/payments/`)
- [ ] `src/main.ts` – Bootstrap on port 3007.
- [ ] `src/app.module.ts` – Standard imports plus Razorpay SDK. Imports `PdfModule` for receipts/invoices.
- [ ] `src/controllers/user/payments.controller.ts` – `@Auth()`. Per `108-payments-endpoints`:
  - `POST /create-intent` – Create payment intent for project milestone. Validates: milestone exists, user is project client, milestone is approved and due. Creates Razorpay order via API. Returns `razorpayOrderId`, `amount`, `currency`. `@Idempotent()`.
  - `POST /initiate` – Initiate payment flow. Client-side Razorpay checkout opens. Records payment attempt.
  - `POST /confirm` – Confirm payment after Razorpay checkout. Validates Razorpay signature: `HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, RAZORPAY_KEY_SECRET)`. Captures payment via Razorpay API. Transitions payment: `PENDING` → `COMPLETED`. Publishes `payment.completed` event.
  - `POST /cancel` – Cancel pending payment. Transitions: `PENDING` → `CANCELLED`.
  - `GET /` – List user's payments. Paginated, filterable by status. Cached 5min.
  - `GET /:id` – Payment detail with Razorpay transaction info.
  - `GET /:id/status` – Real-time payment status (queries Razorpay API if pending).
  - `GET /:id/receipt` – Download payment receipt PDF. Generated via `@nestlancer/pdf`. Includes: payment details, date, amount, Razorpay transaction ID.
  - `GET /:id/invoice` – Download invoice PDF. More detailed than receipt: itemized from quote line items, tax breakdown (GST 18%), billing info.
  - `GET /projects/:projectId` – List payments for a project.
  - `GET /projects/:projectId/milestones` – Payment milestone status per project: which milestones are paid, pending, overdue.
  - `GET /methods` – List saved payment methods (masked card info, UPI IDs).
  - `POST /methods` – Save new payment method (Razorpay token).
  - `DELETE /methods/:id` – Remove saved payment method.
  - `GET /stats` – User payment statistics: total spent, by project, by month.
- [ ] `src/controllers/user/payment-methods.controller.ts` – Payment methods CRUD (separated above).
- [ ] `src/controllers/admin/payments.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `108-payments-endpoints`:
  - `GET /` – List all payments with admin filters: status, dateRange, userId, projectId, amount range.
  - `GET /:id` – Admin payment view with Razorpay details and internal notes.
  - `POST /:id/refund` – Process refund via Razorpay Refund API. Supports full and partial refunds. Creates Refund record. Publishes `payment.refunded` event.
  - `POST /:id/verify` – Manual payment verification (for bank transfers or failed webhook scenarios).
  - `GET /stats` – Revenue statistics: total, month-over-month, by project type.
  - `GET /disputes` – List payment disputes.
  - `GET /disputes/:id` – Dispute detail.
  - `POST /disputes/:id/respond` – Admin responds to dispute with evidence.
  - `POST /disputes/:id/resolve` – Resolve dispute: outcome (MERCHANT_WON/CUSTOMER_WON), refund if customer won.
  - `GET /reconciliation` – Reconciliation report: cross-references DB with Razorpay dashboard. Identifies discrepancies.
- [ ] `src/controllers/admin/payment-milestones.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `POST /projects/:id/milestones` – Create payment milestones linked to project milestones. Amount from quote payment breakdown.
  - `PATCH /milestones/:id` – Update payment milestone.
  - `POST /milestones/:id/mark-complete` – Mark milestone work as complete (triggers client notification for payment).
  - `POST /milestones/:id/request-payment` – Request payment from client for completed milestone.
  - `POST /milestones/:id/release` – Release funds (for escrow-style payments, if applicable).
- [ ] `src/controllers/admin/payment-disputes.admin.controller.ts` – Dispute management (combined above).
- [ ] `src/services/payments.service.ts` – Core payment CRUD. `findByUser(userId, query)`. `findById(id)`. All amounts in paise (integer). Currency: INR.
- [ ] `src/services/payment-intent.service.ts` – `createIntent(userId, dto): Promise<PaymentIntent>`. Calls `razorpay.orders.create({ amount, currency: 'INR', receipt: paymentId })`. Stores: razorpayOrderId, amount, status PENDING.
- [ ] `src/services/payment-confirmation.service.ts` – `confirmPayment(dto): Promise<Payment>`. Verifies Razorpay signature. Calls `razorpay.payments.capture(paymentId, amount)`. Updates payment status. Creates receipt. Publishes events.
- [ ] `src/services/payment-methods.service.ts` – Manages saved payment methods via Razorpay customer/token APIs. `save(userId, token)`, `list(userId)`, `remove(methodId)`.
- [ ] `src/services/refund.service.ts` – `processRefund(paymentId, dto): Promise<Refund>`. Calls `razorpay.payments.refund(paymentId, { amount })`. Supports partial refunds. Records refund in DB. Publishes `payment.refunded` event.
- [ ] `src/services/payment-milestones.service.ts` – Links project milestones to payment milestones. `create(projectId, dto)`. `markComplete(milestoneId)`. `requestPayment(milestoneId)`.
- [ ] `src/services/payment-disputes.service.ts` – Dispute lifecycle: `create(paymentId, dto)`, `respond(disputeId, dto)`, `resolve(disputeId, dto)`. Integrates with Razorpay dispute API if available.
- [ ] `src/services/payment-reconciliation.service.ts` – `reconcile(dateRange): Promise<ReconciliationReport>`. Fetches payments from Razorpay API, compares with DB records. Identifies: missing in DB, missing in Razorpay, amount mismatches, status mismatches.
- [ ] `src/services/payment-stats.service.ts` – Revenue analytics. Total, MoM growth, by project category. Cached in Redis, updated hourly.
- [ ] `src/services/receipt-pdf.service.ts` – Generates payment receipt PDF via `@nestlancer/pdf`. Includes: Nestlancer company info, client info, payment details, Razorpay transaction ID, date.
- [ ] `src/services/invoice-pdf.service.ts` – Generates invoice PDF. Includes: invoice number, billing period, line items from quote, subtotal, GST (18%), total, payment status, bank details. Per Indian GST requirements.
- [ ] `src/services/razorpay.service.ts` – Razorpay SDK wrapper. Methods: `createOrder(amount, currency, receipt)`, `capturePayment(paymentId, amount)`, `refundPayment(paymentId, amount)`, `fetchPayment(paymentId)`, `verifySignature(orderId, paymentId, signature)`. Uses `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from config.
- [ ] `src/services/razorpay-webhook.service.ts` – Processes incoming Razorpay webhooks (received via webhooks-ingestion service). Handles events: `payment.captured`, `payment.failed`, `payment.authorized`, `refund.created`, `refund.failed`, `dispute.created`. Idempotent processing via webhook event ID.
- [ ] `src/services/payments-admin.service.ts` – Admin operations: cross-user listing, revenue aggregation, dispute management.
- [ ] `src/dto/create-payment-intent.dto.ts` – `@IsUUID() projectId`, `@IsUUID() milestoneId`, `@IsEnum(PaymentType) type` (MILESTONE/FULL), `@IsInt() @Min(100) amount` (paise, min ₹1), `@IsOptional() @IsString() currency` (default 'INR'), `@IsOptional() @IsString() @MaxLength(500) description`.
- [ ] `src/dto/initiate-payment.dto.ts` – `@IsUUID() paymentIntentId`, `@IsOptional() @IsEnum(PaymentMethod) method` (CARD/UPI/NETBANKING/WALLET), `@IsOptional() @IsBoolean() saveMethod`.
- [ ] `src/dto/confirm-payment.dto.ts` – `@IsString() razorpayPaymentId`, `@IsString() razorpayOrderId`, `@IsString() razorpaySignature`. Signature verification is critical security step.
- [ ] `src/dto/cancel-payment.dto.ts` – `@IsUUID() paymentIntentId`.
- [ ] `src/dto/query-payments.dto.ts` – Pagination + `@IsOptional() @IsEnum(PaymentStatus) status`, `@IsOptional() @IsUUID() projectId`.
- [ ] `src/dto/save-payment-method.dto.ts` – `@IsString() razorpayToken`, `@IsOptional() @IsString() label`.
- [ ] `src/dto/create-payment-milestone.dto.ts` – `@IsUUID() projectId`, `@IsEnum(PaymentMilestoneType) type`, `@IsString() @MaxLength(200) name`, `@IsInt() @Min(100) amount` (paise), `@IsOptional() @IsDateString() dueDate`, `@IsOptional() @IsArray() deliverableIds`.
- [ ] `src/dto/update-payment-milestone.dto.ts` – `PartialType(CreatePaymentMilestoneDto)`.
- [ ] `src/dto/process-refund.dto.ts` – `@IsInt() @Min(100) amount` (paise), `@IsString() @MaxLength(500) reason`, `@IsOptional() @IsString() notes`, `@IsOptional() @IsBoolean() notifyClient` (default true).
- [ ] `src/dto/verify-payment.dto.ts` – `@IsString() transactionId`, `@IsString() notes` for manual verification.
- [ ] `src/dto/respond-dispute.dto.ts` – `@IsString() @MaxLength(5000) response`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) evidenceMediaIds`.
- [ ] `src/dto/resolve-dispute.dto.ts` – `@IsEnum(DisputeOutcome) outcome` (MERCHANT_WON/CUSTOMER_WON), `@IsOptional() @IsInt() refundAmount`.
- [ ] `src/dto/reconciliation-query.dto.ts` – `@IsDateString() from`, `@IsDateString() to`.
- [ ] `src/dto/payment-response.dto.ts` – `PaymentResponse { id, projectId, milestoneId, amount, currency, status, razorpayOrderId, razorpayPaymentId, method, receiptUrl, invoiceUrl, paidAt, createdAt }`.
- [ ] `src/dto/milestone-response.dto.ts` – `PaymentMilestoneResponse { id, projectId, name, amount, status, dueDate, paidAt }`.
- [ ] `src/dto/dispute-response.dto.ts` – `DisputeResponse { id, paymentId, reason, status, adminResponse, outcome, resolvedAt }`.
- [ ] `src/entities/payment.entity.ts` – Prisma Payment model. Fields: `userId`, `projectId`, `milestoneId`, `amount` (paise), `currency`, `status`, `razorpayOrderId`, `razorpayPaymentId`, `method`, `paidAt`. Relations: user, project, milestone, refunds.
- [ ] `src/entities/payment-intent.entity.ts` – `razorpayOrderId`, `amount`, `currency`, `status` (CREATED/AUTHORIZED/CAPTURED/FAILED), `expiresAt`.
- [ ] `src/entities/payment-method.entity.ts` – `userId`, `type` (CARD/UPI/NETBANKING), `last4`/`upiId` (masked), `razorpayTokenId`, `isDefault`.
- [ ] `src/entities/payment-milestone.entity.ts` – `projectId`, `name`, `amount` (paise), `status` (PENDING/WORK_COMPLETE/PAYMENT_REQUESTED/PAID), `dueDate`.
- [ ] `src/entities/payment-dispute.entity.ts` – `paymentId`, `reason`, `status` (OPEN/UNDER_REVIEW/RESOLVED), `outcome`, `evidence`, `resolvedAt`.
- [ ] `src/entities/refund.entity.ts` – `paymentId`, `amount` (paise), `razorpayRefundId`, `status`, `reason`, `processedAt`.
- [ ] `src/interfaces/payment.interface.ts` – `PaymentWithRelations`, `PaymentStats`, `RevenueReport`.
- [ ] `src/interfaces/razorpay.interface.ts` – `RazorpayOrder`, `RazorpayPayment`, `RazorpayRefund`, `RazorpayWebhookPayload`. Types matching Razorpay API responses.
- [ ] `src/interfaces/payment-status-flow.interface.ts` – `PAYMENT_STATUS_TRANSITIONS`, `MILESTONE_STATUS_TRANSITIONS`.
- [ ] `src/interfaces/payment-gateway.interface.ts` – Abstract payment gateway interface: `createOrder()`, `capturePayment()`, `refundPayment()`, `verifySignature()`. Allows swapping Razorpay for another provider.
- [ ] `src/config/payments.config.ts` – `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `PAYMENT_CURRENCY` ('INR'), `MIN_PAYMENT_AMOUNT` (100 paise = ₹1), `REFUND_WINDOW_DAYS` (30), `GST_RATE` (0.18), `INVOICE_PREFIX` ('INV').
- [ ] `tests/` – Unit: Razorpay signature verification, payment status transitions, refund calculation, reconciliation. E2E: full payment flow mock with Razorpay test keys. Webhook handling tests.

### 11.9 Messaging Service (`services/messaging/`)
- [ ] `src/main.ts` – Bootstrap on port 3008.
- [ ] `src/app.module.ts` – Standard imports plus `SearchModule` for message search. Consumes no queues directly (WebSocket gateway handles real-time, this service is HTTP API for persistence).
- [ ] `src/controllers/user/conversations.controller.ts` – `@Auth()`. Per `109-messaging-endpoints`:
  - `GET /conversations` – List user's active conversations (one per project). Returns: projectId, projectTitle, lastMessage preview, unreadCount, participants. Sorted by last activity. Paginated. Cached 2min per userId.
- [ ] `src/controllers/user/messages.controller.ts` – `@Auth()`. Per `109-messaging-endpoints`:
  - `GET /projects/:projectId` – List messages in project conversation. Cursor-based pagination (before messageId). Returns newest first. Validates user is project participant. Includes: sender info, attachments, reactions, thread replies count.
  - `POST /projects/:projectId` – Send message. Creates Message record. Publishes `message.sent` event to outbox (triggers WebSocket broadcast via notification-worker → Redis pub/sub → ws-gateway). Validates user is project participant. Supports: text, attachments (mediaIds), replyTo (thread parent).
  - `PATCH /:messageId` – Edit message. Only sender can edit. Edit window: 15 minutes. Records edit history (`editedAt`, original content preserved). Publishes `message.edited` event.
  - `DELETE /:messageId` – Soft-delete. Only sender or admin can delete. Sets `deletedAt`. Content replaced with "[Message deleted]" in responses. Publishes `message.deleted` event.
  - `POST /:messageId/read` – Mark single message as read. Creates/updates MessageReadReceipt. Publishes `message.read` event (updates read receipts for other participants).
  - `POST /projects/:id/read-all` – Mark all messages in conversation as read up to latest messageId.
  - `POST /:messageId/react` – Add reaction emoji. One reaction per emoji per user. Max 20 reactions per message. Publishes `message.reaction_added` event.
  - `DELETE /:messageId/react` – Remove reaction. Only own reactions.
  - `GET /search` – Full-text search across user's conversations. Query string matched against message content. Filterable by projectId, dateRange, sender. Uses `@nestlancer/search` with PostgreSQL `tsvector` full-text search. Returns messages with highlighted matches.
  - `GET /unread-count` – Total unread message count across all conversations. Cached in Redis per userId, invalidated on new message or mark-read.
  - `GET /:messageId/thread` – Get thread replies for a message. Returns nested messages where `replyToId = messageId`.
  - `POST /:messageId/thread` – Reply in thread. Creates message with `replyToId`. Notifies thread participants.
- [ ] `src/controllers/user/message-threads.controller.ts` – Thread endpoints (combined above).
- [ ] `src/controllers/admin/messages.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `109-messaging-endpoints`:
  - `GET /conversations` – List all project conversations for admin overview.
  - `GET /analytics` – Messaging analytics: messages per day, active conversations, response time metrics.
  - `POST /projects/:id/system` – Send system message in project conversation (e.g., "Project status changed to IN_PROGRESS"). Sender shown as "System".
  - `DELETE /:messageId` – Admin can delete any message.
  - `GET /flagged` – List flagged messages pending review.
  - `POST /:messageId/flag` – Flag a message for review (content violation). Records reason.
- [ ] `src/services/messaging.service.ts` – Core message CRUD. `sendMessage(userId, projectId, dto): Promise<Message>`. Creates message in transaction with outbox event. Validates participant access.
- [ ] `src/services/conversations.service.ts` – `findByUser(userId): Promise<Conversation[]>`. `createForProject(projectId, participantIds): Promise<Conversation>`. Auto-created when project is created (via project-service event). Participants: client + admin.
- [ ] `src/services/message-threads.service.ts` – Thread management. `getThread(messageId, cursor)`. `replyToThread(messageId, dto)`. Limits thread depth to 1 level.
- [ ] `src/services/message-reactions.service.ts` – Reaction management with uniqueness constraint (userId + messageId + emoji). `addReaction(messageId, userId, emoji)`. `removeReaction(messageId, userId, emoji)`.
- [ ] `src/services/message-search.service.ts` – Full-text search via PostgreSQL `to_tsvector()` and `to_tsquery()`. Searches message content with ranking. Results filtered by user's accessible conversations. Configurable: search language, minimum query length.
- [ ] `src/services/message-read.service.ts` – Read receipt management. `markRead(messageId, userId)`. `markAllRead(conversationId, userId)`. Updates `lastReadMessageId` on conversation participant.
- [ ] `src/services/unread-count.service.ts` – `getUnreadCount(userId): Promise<number>`. Calculated: messages after `lastReadMessageId` per conversation. Cached in Redis key `unread:<userId>`, invalidated on message send/read events.
- [ ] `src/services/messaging-admin.service.ts` – Admin operations: conversation listing, analytics, system messages, flagged message review.
- [ ] `src/dto/send-message.dto.ts` – `@IsString() @MinLength(1) @MaxLength(5000) content`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) attachmentIds`, `@IsOptional() @IsUUID() replyToId`.
- [ ] `src/dto/edit-message.dto.ts` – `@IsString() @MinLength(1) @MaxLength(5000) content`.
- [ ] `src/dto/query-messages.dto.ts` – `@IsOptional() @IsUUID() before` (cursor), `@IsOptional() @IsInt() @Min(1) @Max(50) limit` (default 30).
- [ ] `src/dto/search-messages.dto.ts` – `@IsString() @MinLength(2) @MaxLength(200) q`, `@IsOptional() @IsUUID() projectId`, `@IsOptional() @IsDateString() from`, `@IsOptional() @IsDateString() to`.
- [ ] `src/dto/add-reaction.dto.ts` – `@IsString() @MaxLength(10) emoji` (Unicode emoji or shortcode).
- [ ] `src/dto/send-system-message.dto.ts` – `@IsString() @MaxLength(2000) content`, `@IsOptional() @IsEnum(SystemMessageType) type`.
- [ ] `src/dto/flag-message.dto.ts` – `@IsString() @MaxLength(500) reason`.
- [ ] `src/dto/message-response.dto.ts` – `MessageResponse { id, conversationId, content, sender: UserSummary, attachments: MediaResponse[], reactions: ReactionSummary[], replyTo: MessageResponse?, threadCount: number, editedAt?, deletedAt?, createdAt }`.
- [ ] `src/dto/conversation-response.dto.ts` – `ConversationResponse { id, projectId, projectTitle, participants: UserSummary[], lastMessage: MessageResponse, unreadCount, createdAt, lastActivityAt }`.
- [ ] `src/entities/message.entity.ts` – Prisma Message model: `conversationId`, `senderId`, `content`, `replyToId`, `editedAt`, `deletedAt`. Relations: sender, conversation, attachments, reactions, readReceipts.
- [ ] `src/entities/conversation.entity.ts` – `projectId`, `participants[]`, `lastMessageId`, `lastActivityAt`. One conversation per project.
- [ ] `src/entities/message-reaction.entity.ts` – `messageId`, `userId`, `emoji`, `createdAt`. Unique constraint: (messageId, userId, emoji).
- [ ] `src/entities/message-read-receipt.entity.ts` – `conversationId`, `userId`, `lastReadMessageId`, `readAt`.
- [ ] `src/entities/message-flag.entity.ts` – `messageId`, `flaggedBy`, `reason`, `status` (PENDING/REVIEWED/DISMISSED), `reviewedBy`, `reviewedAt`.
- [ ] `src/interfaces/message.interface.ts` – `MessageWithRelations`, `MessageSearchResult`.
- [ ] `src/interfaces/conversation.interface.ts` – `ConversationWithUnread`, `ConversationParticipant`.
- [ ] `src/config/messaging.config.ts` – `MAX_MESSAGE_LENGTH` (5000), `EDIT_WINDOW_MINUTES` (15), `MAX_REACTIONS_PER_MESSAGE` (20), `MAX_ATTACHMENTS_PER_MESSAGE` (10), `SEARCH_MIN_QUERY_LENGTH` (2), `MESSAGES_PER_PAGE` (30).
- [ ] `tests/` – Unit: message CRUD, read receipts, reaction uniqueness, search ranking. E2E: send → receive → edit → delete → search flow.

### 11.10 Notifications Service (`services/notifications/`)
- [ ] `src/main.ts` – Bootstrap on port 3009.
- [ ] `src/app.module.ts` – Standard imports plus `MailModule`, `WebSocketModule` (for real-time push). Consumes `notification.queue` for async delivery.
- [ ] `src/controllers/user/notifications.controller.ts` – `@Auth()`. Per `110-notifications-endpoints`:
  - `GET /` – List user's notifications. Paginated, filterable by type (INFO/WARNING/ACTION_REQUIRED), unreadOnly flag. Sorted newest first. Cached 1min per userId.
  - `GET /:id` – Single notification detail. Marks as read on access if autoRead enabled.
  - `PATCH /:id/read` – Mark notification as read. Updates `readAt` timestamp.
  - `PATCH /:id/unread` – Mark notification as unread. Clears `readAt`.
  - `POST /read-all` – Mark all notifications as read. Bulk update: `WHERE userId = :userId AND readAt IS NULL`.
  - `POST /read-selected` – Mark selected notifications as read. Batch update by IDs.
  - `GET /unread-count` – Unread notification count. Cached in Redis per userId. Real-time via WebSocket. Used for badge count in UI.
  - `DELETE /:id` – Delete (hide) notification. Soft-delete: sets `dismissedAt`.
  - `DELETE /clear-read` – Clear all read notifications. Bulk soft-delete.
  - `GET /history` – Full notification history including dismissed. Admin/audit purposes.
- [ ] `src/controllers/user/notification-preferences.controller.ts` – `@Auth()`:
  - `GET /preferences` – Get user's notification preferences. Includes per-event-type channel settings.
  - `PATCH /preferences` – Update preferences: per event type (quote_received, payment_completed, etc.) enable/disable channels (email, push, inApp). Quiet hours: start/end time, timezone. Frequency: immediate/daily_digest/weekly_digest.
  - `GET /channels` – List available notification channels with their status (email: configured, push: requires subscription, sms: not available).
- [ ] `src/controllers/user/push-subscriptions.controller.ts` – `@Auth()`:
  - `POST /push-subscription` – Register Web Push subscription. Stores VAPID endpoint, keys (p256dh, auth), device info. Validates subscription against VAPID public key.
  - `DELETE /push-subscription` – Unregister push subscription. Removes subscription for current device.
- [ ] `src/controllers/admin/notifications.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `110-notifications-endpoints`:
  - `GET /` – List all notifications with admin filters.
  - `POST /send` – Send targeted notification to specific users. Multi-channel: email + push + inApp. Supports scheduling (future delivery).
  - `POST /broadcast` – Broadcast notification to all users or filtered group. Excludes specified userIds. Can be scheduled.
  - `POST /segment` – Send to user segment. Criteria: role, registration date, activity level, project status. Query builder for targeting.
  - `GET /stats` – Notification statistics: sent, delivered, opened, clicked per channel per event type.
  - `GET /delivery-report` – Delivery report for specific notification: per-recipient delivery status.
  - `DELETE /user/:userId` – Clear all notifications for a user (admin action, e.g., account cleanup).
  - `GET /templates` – List notification templates. Each template: event type, channels, subject, body (with variables).
  - `POST /templates` – Create notification template.
  - Additional: update/delete templates.
- [ ] `src/controllers/admin/notification-templates.admin.controller.ts` – Template CRUD (combined above).
- [ ] `src/services/notifications.service.ts` – Core notification CRUD. `create(userId, notification): Promise<Notification>`. `findByUser(userId, query)`. `markRead(id)`. `markAllRead(userId)`.
- [ ] `src/services/notification-preferences.service.ts` – `getPreferences(userId): Promise<NotificationPreferences>`. Default preferences created on user registration. Per-event-type channel configuration.
- [ ] `src/services/push-subscriptions.service.ts` – Web Push subscription management via `@nestlancer/websocket` PushService. Stores subscriptions per user/device. Uses VAPID keys for Web Push API.
- [ ] `src/services/notification-delivery.service.ts` – Multi-channel delivery engine. `deliver(notification, channels[]): Promise<DeliveryResult[]>`. Channels: `inApp` (create DB record, push via WebSocket), `email` (publish to email.queue), `push` (Web Push via VAPID). Respects user preferences and quiet hours. Records delivery log per channel.
- [ ] `src/services/notification-broadcast.service.ts` – `broadcast(dto): Promise<BroadcastResult>`. Chunks recipients into batches (100 per batch). Publishes batches to notification.queue. Tracks overall delivery progress.
- [ ] `src/services/notification-segment.service.ts` – `buildSegment(criteria): Promise<string[]>` (user IDs). Criteria: role, createdAfter, lastLoginAfter, hasActiveProject, etc. Executes query against users table.
- [ ] `src/services/notification-templates.service.ts` – Template CRUD. Templates use Handlebars variables: `{{user.firstName}}`, `{{project.title}}`, `{{payment.amount}}`. Each template has versions per channel (email has HTML, push has short text, inApp has structured data).
- [ ] `src/services/notification-stats.service.ts` – Analytics: notification volume, delivery rate, open rate (for email), click rate. Aggregated by event type and channel. Cached in Redis.
- [ ] `src/services/notifications-admin.service.ts` – Admin operations: cross-user listing, broadcast management, template management.
- [ ] `src/dto/query-notifications.dto.ts` – Pagination + `@IsOptional() @IsEnum(NotificationType) type`, `@IsOptional() @IsBoolean() unreadOnly`.
- [ ] `src/dto/mark-read.dto.ts` – Used for single read (path param).
- [ ] `src/dto/mark-selected-read.dto.ts` – `@IsArray() @IsUUID('4', { each: true }) notificationIds`.
- [ ] `src/dto/update-preferences.dto.ts` – `@ValidateNested() @Type(() => ChannelPreferencesDto) preferences: Record<NotificationEventType, ChannelPrefs>` where `ChannelPrefs = { email: boolean, push: boolean, inApp: boolean }`. `@IsOptional() @ValidateNested() quietHours: { start: string, end: string, timezone: string }`.
- [ ] `src/dto/register-push-subscription.dto.ts` – `@IsString() endpoint`, `@ValidateNested() keys: { p256dh: string, auth: string }`, `@IsOptional() @IsString() deviceInfo`.
- [ ] `src/dto/send-notification.dto.ts` – `@IsArray() @IsUUID('4', { each: true }) recipientIds`, `@IsString() @MaxLength(200) title`, `@IsString() @MaxLength(2000) message`, `@IsOptional() @IsEnum(NotificationType) type`, `@IsOptional() @IsArray() @IsEnum(NotificationChannel, { each: true }) channels`, `@IsOptional() @IsDateString() scheduledFor`.
- [ ] `src/dto/broadcast-notification.dto.ts` – `@IsString() title`, `@IsString() message`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) excludeUserIds`, `@IsOptional() @IsArray() channels`, `@IsOptional() @IsDateString() scheduledFor`.
- [ ] `src/dto/segment-notification.dto.ts` – `@ValidateNested() @Type(() => SegmentCriteriaDto) criteria` (role, dateRange, activity), notification payload.
- [ ] `src/dto/create-notification-template.dto.ts` – `@IsString() name`, `@IsEnum(NotificationEventType) eventType`, channels config with templates per channel.
- [ ] `src/dto/update-notification-template.dto.ts` – `PartialType(CreateNotificationTemplateDto)`.
- [ ] `src/dto/notification-response.dto.ts` – `NotificationResponse { id, type, title, message, data, actionUrl, readAt, dismissedAt, createdAt }`.
- [ ] `src/dto/preferences-response.dto.ts` – `PreferencesResponse { userId, preferences: Record<string, ChannelPrefs>, quietHours, updatedAt }`.
- [ ] `src/entities/notification.entity.ts` – Prisma Notification model: `userId`, `type`, `title`, `message`, `data` (JSONB), `actionUrl`, `readAt`, `dismissedAt`, `createdAt`.
- [ ] `src/entities/notification-preference.entity.ts` – `userId`, `preferences` (JSONB: per event type channel settings), `quietHoursStart`, `quietHoursEnd`, `quietHoursTimezone`.
- [ ] `src/entities/push-subscription.entity.ts` – `userId`, `endpoint`, `p256dhKey`, `authKey`, `deviceInfo`, `createdAt`. Unique: (userId, endpoint).
- [ ] `src/entities/notification-template.entity.ts` – `name`, `eventType`, `emailSubject`, `emailBody` (Handlebars HTML), `pushTitle`, `pushBody`, `inAppTitle`, `inAppMessage`, `active`.
- [ ] `src/entities/notification-delivery-log.entity.ts` – `notificationId`, `channel`, `status` (PENDING/DELIVERED/FAILED/BOUNCED), `deliveredAt`, `error`.
- [ ] `src/interfaces/notification.interface.ts` – `NotificationEventType` enum: `QUOTE_RECEIVED`, `QUOTE_ACCEPTED`, `PAYMENT_COMPLETED`, `MILESTONE_COMPLETED`, `MESSAGE_RECEIVED`, `PROJECT_STATUS_CHANGED`, etc.
- [ ] `src/interfaces/notification-channel.interface.ts` – `NotificationChannel` interface: `send(userId, notification): Promise<DeliveryResult>`. Implementations: `InAppChannel`, `EmailChannel`, `PushChannel`.
- [ ] `src/interfaces/notification-template.interface.ts` – `TemplateVariables`, `RenderedNotification`.
- [ ] `src/config/notifications.config.ts` – `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:), `DEFAULT_CHANNELS` (['email', 'inApp']), `MAX_BROADCAST_BATCH_SIZE` (100), `DELIVERY_RETRY_ATTEMPTS` (3).
- [ ] `tests/` – Unit: multi-channel delivery, preference filtering, quiet hours, template rendering. E2E: create notification → deliver via channels → mark read.

### 11.11 Media Service (`services/media/`)
- [ ] `src/main.ts` – Bootstrap on port 3010.
- [ ] `src/app.module.ts` – Standard imports plus `StorageModule.forRoot()`, `QueueModule` (publishes processing jobs to media.queue). ClamAV integration for virus scanning.
- [ ] `src/controllers/user/media.controller.ts` – `@Auth()`. Per `111-media-endpoints`:
  - `GET /` – List user's uploaded media. Paginated, filterable by context (PROJECT/AVATAR/PORTFOLIO/BLOG), type (IMAGE/VIDEO/DOCUMENT). Cached 5min.
  - `GET /:id` – Media detail: URL (presigned if private), metadata, processing status, versions. Validates user owns media.
  - `PATCH /:id` – Update metadata: description, tags. Only owner.
  - `DELETE /:id` – Soft-delete media. Marks for cleanup-worker deletion from S3. Only owner (or admin).
  - `GET /:id/status` – Processing status: PENDING, PROCESSING, COMPLETED, FAILED. For large files being transcoded or virus scanned.
  - `POST /:id/regenerate-thumbnail` – Re-trigger thumbnail generation (if original thumbnail is corrupt).
  - `GET /:id/download` – Generate presigned download URL (private bucket). Valid for 1h. Increments download count.
  - `GET /:id/versions` – List file versions (original, thumbnails, processed variants). Each with URL and dimensions.
  - `POST /:id/share` – Create share link. Options: expiry, password, maxDownloads, allowedEmails. Returns shareable URL.
  - `DELETE /:id/share` – Revoke share link.
  - `GET /stats` – User storage statistics: total files, total size, by type breakdown, quota usage.
- [ ] `src/controllers/user/media-upload.controller.ts` – `@Auth()`. Per `111-media-endpoints`:
  - `POST /upload/request` – Request presigned upload URL for client-side S3 upload. Validates: file size within limits, content type allowed, user has storage quota. Returns: `{ uploadId, presignedUrl, fields, expiresAt }`. File goes to private S3 bucket by default. Media record created with status PENDING.
  - `POST /upload/confirm` – Confirm upload completed. Validates: file exists in S3, checksum matches. Triggers processing pipeline (virus scan → thumbnail → optimize). Transitions status: PENDING → PROCESSING.
  - `POST /upload` – Direct upload via multipart form. For small files (<10MB). Server receives file, uploads to S3, triggers processing. Returns media record immediately with status PROCESSING.
- [ ] `src/controllers/user/chunked-upload.controller.ts` – `@Auth()`. For large files (>10MB):
  - `POST /upload/chunked/init` – Initialize multipart upload. Creates S3 multipart upload. Creates ChunkedUploadSession in DB. Returns `{ uploadId, chunkSize, totalChunks }`.
  - `POST /upload/chunked/:id/part` – Upload single chunk. Validates: chunk number, size, upload session exists. Uploads part to S3. Records part ETag.
  - `POST /upload/chunked/:id/complete` – Complete multipart upload. Validates all chunks received. Completes S3 multipart upload. Triggers processing. Deletes session.
  - `POST /upload/chunked/:id/abort` – Abort upload. Aborts S3 multipart upload. Cleans up chunks. Deletes session.
- [ ] `src/controllers/admin/media.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `111-media-endpoints`:
  - `GET /` – List all media with admin filters.
  - `GET /:id` – Admin media view.
  - `GET /analytics` – Storage analytics: total storage used, by user, by type, growth trend.
  - `DELETE /:id` – Admin delete any media.
  - `POST /:id/reprocess` – Re-trigger processing pipeline. Options: regenerate thumbnails, re-scan virus, re-optimize.
  - `GET /storage-usage` – Per-user storage breakdown.
  - `GET /quarantine` – List quarantined files (virus detected). Shows: filename, user, detection details, quarantine date.
  - `POST /quarantine/:id/release` – Release file from quarantine (false positive). Moves back to active storage.
  - `DELETE /quarantine/:id` – Permanently delete quarantined file from S3.
  - `POST /cleanup` – Trigger manual storage cleanup: delete orphaned files, expired share links, old processing artifacts.
- [ ] `src/controllers/admin/quarantine.admin.controller.ts` – Quarantine management (combined above).
- [ ] `src/services/media.service.ts` – Core CRUD. `create(userId, dto): Promise<Media>`. `findByUser(userId, query)`. `update(id, dto)`. `softDelete(id)`. Context-aware bucket selection: project deliverables → private bucket, portfolio/blog → public bucket.
- [ ] `src/services/upload.service.ts` – `handleDirectUpload(userId, file): Promise<Media>`. Validates file. Uploads to S3 via `@nestlancer/storage`. Creates media record. Publishes `media.uploaded` event to media.queue.
- [ ] `src/services/chunked-upload.service.ts` – `initSession(userId, dto): Promise<ChunkedUploadSession>`. `uploadPart(sessionId, partNumber, data)`. `completeSession(sessionId)`. S3 multipart upload lifecycle management.
- [ ] `src/services/presigned-url.service.ts` – `generateUploadUrl(key, contentType): Promise<PresignedPost>`. `generateDownloadUrl(key, expiresIn): Promise<string>`. Uses S3 `createPresignedPost()` and `getSignedUrl()`.
- [ ] `src/services/media-processing.service.ts` – Publishes processing jobs to `media.queue`. Processing pipeline: (1) virus scan via ClamAV, (2) generate thumbnail (images: sharp, videos: ffmpeg), (3) optimize (images: webp conversion, quality reduction), (4) extract metadata (EXIF, duration). Status updates via Redis pub/sub.
- [ ] `src/services/media-versions.service.ts` – Manages file versions. Original always preserved. Generated versions: `thumb_150x150`, `medium_800x600`, `large_1920x1080` (images). `preview_480p`, `hd_720p` (videos). Stored as separate S3 objects.
- [ ] `src/services/media-share.service.ts` – `createShareLink(mediaId, options): Promise<ShareLink>`. Generates unique share token. Options: expiry (default 7d), password (bcrypt hashed), maxDownloads, allowedEmails. `validateShareAccess(token, password?, email?)`.
- [ ] `src/services/media-stats.service.ts` – `getUserStats(userId): Promise<MediaStats>`. Storage quota tracking. Total size, count by type.
- [ ] `src/services/virus-scan.service.ts` – ClamAV integration via `clamav.js` or TCP socket. `scanFile(s3Key): Promise<ScanResult>`. If infected: moves to quarantine S3 prefix, creates QuarantinedFile record, notifies admin. Scan results cached in DB.
- [ ] `src/services/quarantine.service.ts` – `quarantine(mediaId, scanResult): void`. `release(quarantineId): void`. `permanentDelete(quarantineId): void`.
- [ ] `src/services/storage-cleanup.service.ts` – `cleanup(): Promise<CleanupResult>`. Finds: orphaned S3 objects (no DB record), expired share links, soft-deleted media older than 30 days. Called by cleanup-worker on schedule.
- [ ] `src/services/media-admin.service.ts` – Admin operations: cross-user listing, storage analytics, quarantine management.
- [ ] `src/dto/upload-request.dto.ts` – `@IsString() @MaxLength(255) filename`, `@IsString() contentType` (MIME type), `@IsInt() @Min(1) @Max(524288000) size` (bytes, max 500MB), `@IsEnum(MediaContext) context` (PROJECT/AVATAR/PORTFOLIO/BLOG/REQUEST/MESSAGE), `@IsOptional() @IsString() description`.
- [ ] `src/dto/upload-confirm.dto.ts` – `@IsUUID() uploadId`, `@IsOptional() @IsString() checksum` (MD5/SHA-256).
- [ ] `src/dto/direct-upload.dto.ts` – Multipart file via `@UseInterceptors(FileInterceptor('file'))`. Max 10MB. `@IsEnum(MediaContext) context`, `@IsOptional() @IsString() description`.
- [ ] `src/dto/init-chunked-upload.dto.ts` – `@IsString() filename`, `@IsString() contentType`, `@IsInt() size`, `@IsInt() @Min(5242880) chunkSize` (min 5MB per S3 requirement), `@IsEnum(MediaContext) context`.
- [ ] `src/dto/upload-chunk.dto.ts` – `@IsInt() @Min(1) partNumber`, binary body.
- [ ] `src/dto/complete-chunked-upload.dto.ts` – `@IsUUID() uploadId`, `@IsOptional() @IsString() checksum`.
- [ ] `src/dto/update-media.dto.ts` – `@IsOptional() @IsString() @MaxLength(500) description`, `@IsOptional() @IsArray() @IsString({ each: true }) tags`.
- [ ] `src/dto/query-media.dto.ts` – Pagination + `@IsOptional() @IsEnum(MediaContext) context`, `@IsOptional() @IsEnum(MediaType) type`.
- [ ] `src/dto/share-media.dto.ts` – `@IsOptional() @IsInt() @Min(3600) @Max(2592000) expiresIn` (seconds, 1h-30d), `@IsOptional() @IsString() password`, `@IsOptional() @IsInt() @Min(1) maxDownloads`, `@IsOptional() @IsArray() @IsEmail({}, { each: true }) allowedEmails`.
- [ ] `src/dto/reprocess-media.dto.ts` – `@IsOptional() @IsBoolean() thumbnail`, `@IsOptional() @IsBoolean() optimize`, `@IsOptional() @IsBoolean() virusScan`.
- [ ] `src/dto/media-response.dto.ts` – `MediaResponse { id, filename, contentType, size, context, status, url, thumbnailUrl, versions: MediaVersionResponse[], metadata, description, tags, shareLink?, createdAt, updatedAt }`.
- [ ] `src/entities/media.entity.ts` – Prisma Media model: `userId`, `filename`, `s3Key`, `bucket`, `contentType`, `size`, `context`, `status` (PENDING/PROCESSING/READY/FAILED/QUARANTINED), `metadata` (JSONB: dimensions, duration, exif), `thumbnailKey`, `description`, `tags`.
- [ ] `src/entities/media-version.entity.ts` – `mediaId`, `variant` (thumb_150, medium_800, etc.), `s3Key`, `contentType`, `size`, `width`, `height`.
- [ ] `src/entities/media-share-link.entity.ts` – `mediaId`, `token` (unique), `passwordHash`, `maxDownloads`, `downloadCount`, `allowedEmails`, `expiresAt`.
- [ ] `src/entities/chunked-upload-session.entity.ts` – `userId`, `s3UploadId`, `filename`, `contentType`, `totalSize`, `chunkSize`, `totalChunks`, `uploadedChunks` (JSONB: partNumber → ETag), `status`, `expiresAt`.
- [ ] `src/entities/quarantined-file.entity.ts` – `mediaId`, `originalKey`, `quarantineKey`, `virusName`, `scanDetails`, `quarantinedAt`, `releasedAt`.
- [ ] `src/interfaces/media.interface.ts` – `MediaWithVersions`, `ProcessingResult`, `ScanResult`.
- [ ] `src/interfaces/upload-options.interface.ts` – `PresignedUploadResult`, `ChunkedUploadConfig`.
- [ ] `src/interfaces/processing-result.interface.ts` – `ProcessingPipelineResult { virusScan: ScanResult, thumbnail: string?, optimized: string?, metadata: MediaMetadata }`.
- [ ] `src/config/media.config.ts` – `MAX_FILE_SIZE_MB` (500), `MAX_DIRECT_UPLOAD_MB` (10), `MIN_CHUNK_SIZE_MB` (5), `ALLOWED_IMAGE_TYPES` (jpeg, png, webp, gif, svg), `ALLOWED_VIDEO_TYPES` (mp4, webm, mov), `ALLOWED_DOCUMENT_TYPES` (pdf, doc, docx, xls, xlsx), `S3_PRIVATE_BUCKET`, `S3_PUBLIC_BUCKET`, `CLAMAV_HOST`, `CLAMAV_PORT`, `PRESIGNED_URL_EXPIRY` (3600), `SHARE_LINK_MAX_EXPIRY_DAYS` (30).
- [ ] `tests/` – Unit: presigned URL generation, virus scan integration, chunked upload lifecycle. E2E: upload → process → download → share flow. Fixture files for different media types.

### 11.12 Portfolio Service (`services/portfolio/`)
- [ ] `src/main.ts` – Bootstrap on port 3011.
- [ ] `src/app.module.ts` – Standard imports plus `SearchModule` for portfolio search, `CacheModule` (heavy caching for public portfolio).
- [ ] `src/controllers/public/portfolio.public.controller.ts` – `@Public()`. Per `112-portfolio-endpoints`:
  - `GET /` – List published portfolio items. Paginated, filterable by category, tag. Sorted by order/featured/createdAt. Cached 1h (CDN-cacheable). Returns summary: title, slug, shortDescription, thumbnail, category, tags, likeCount.
  - `GET /:idOrSlug` – Single portfolio item detail. Supports lookup by UUID or slug. Full item: description, images gallery, video, client info, project details, links. Increments view count (debounced, 1 per IP per hour). Cached 30min.
  - `GET /featured` – Featured portfolio items only. Limited to top N items. Cached 2h.
  - `GET /categories` – List portfolio categories with item counts. Cached 1h.
  - `GET /tags` – List all tags with usage counts. Cached 1h.
  - `GET /search` – Full-text search across portfolio items. Searches: title, description, tags. Returns ranked results.
  - `POST /:id/like` – Like/unlike portfolio item (toggle). Authenticated users only (despite public controller, this specific endpoint needs auth). Records IP for anonymous like prevention. Returns updated like count.
- [ ] `src/controllers/admin/portfolio.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `112-portfolio-endpoints`:
  - `GET /` – List all portfolio items (including drafts, archived). Admin filters: status, category, featured.
  - `POST /` – Create new portfolio item. Full data: title, slug (auto-generated from title if not provided), shortDescription, fullDescription, contentFormat (MARKDOWN/HTML), categoryId, tags, thumbnail (mediaId), images (mediaIds), video (mediaId/URL), client info, projectDetails, links (live, github), SEO (metaTitle, metaDescription, ogImage), status (DRAFT), featured (false), order.
  - `GET /:id` – Admin view with analytics.
  - `PATCH /:id` – Update portfolio item.
  - `DELETE /:id` – Soft-delete.
  - `POST /:id/publish` – Publish: `DRAFT` → `PUBLISHED`. Sets `publishedAt`. Invalidates CDN cache.
  - `POST /:id/unpublish` – Unpublish: `PUBLISHED` → `DRAFT`.
  - `POST /:id/archive` – Archive: `PUBLISHED`/`DRAFT` → `ARCHIVED`.
  - `POST /:id/toggle-featured` – Toggle featured flag. Featured items appear in `/featured` endpoint and homepage.
  - `PATCH /:id/privacy` – Update visibility: PUBLIC, UNLISTED (accessible by direct URL only), PRIVATE.
  - `POST /:id/duplicate` – Clone portfolio item as new draft.
  - `POST /reorder` – Bulk reorder: receives array of `{ id, order }` pairs. Atomic update.
  - `GET /analytics` – Portfolio analytics: total views, likes per item, top items, traffic sources.
  - `GET /analytics/:id` – Per-item analytics: views over time, referrers, geographic distribution.
  - `POST /bulk-update` – Bulk operations: publish, archive, delete multiple items.
- [ ] `src/controllers/admin/portfolio-categories.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `GET /categories` – List categories with admin details.
  - `POST /categories` – Create category: name, slug, description, order.
  - `PATCH /categories/:id` – Update category.
  - `DELETE /categories/:id` – Delete category. Reassigns items to "Uncategorized" or fails if items exist.
- [ ] `src/services/portfolio.service.ts` – Core CRUD. `create(dto): Promise<PortfolioItem>`. Auto-generates slug from title (unique, kebab-case). Stores images as `mediaIds` referencing media service. `findPublished(query)` uses read replica.
- [ ] `src/services/portfolio-categories.service.ts` – Category CRUD. Validates uniqueness of name and slug. Cascading: reassign or prevent delete with items.
- [ ] `src/services/portfolio-search.service.ts` – Full-text search via PostgreSQL `tsvector` or `@nestlancer/search`. Searches title, description, tags with ranking. Filters: category, tags, dateRange.
- [ ] `src/services/portfolio-analytics.service.ts` – View tracking: records `portfolio_view` events. Aggregates: views per item, per day, per referrer. Caches analytics data in Redis, recalculated hourly.
- [ ] `src/services/portfolio-ordering.service.ts` – `reorder(items: { id, order }[]): Promise<void>`. Atomic update of order field. Invalidates list cache.
- [ ] `src/services/portfolio-likes.service.ts` – Like toggle: creates/deletes PortfolioLike record. Uses unique constraint (userId, portfolioItemId). Updates `likeCount` on item (denormalized counter). Anonymous likes tracked by IP hash.
- [ ] `src/services/portfolio-admin.service.ts` – Admin operations: bulk publish/archive/delete, analytics aggregation.
- [ ] `src/dto/query-portfolio.dto.ts` – Pagination + `@IsOptional() @IsUUID() categoryId`, `@IsOptional() @IsString() tag`, `@IsOptional() @IsBoolean() featured`.
- [ ] `src/dto/search-portfolio.dto.ts` – `@IsString() @MinLength(2) q`, `@IsOptional() @IsUUID() categoryId`.
- [ ] `src/dto/create-portfolio-item.dto.ts` – `@IsString() @MaxLength(200) title`, `@IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) slug`, `@IsString() @MaxLength(500) shortDescription`, `@IsString() @MaxLength(50000) fullDescription`, `@IsEnum(ContentFormat) contentFormat` (MARKDOWN/HTML), `@IsOptional() @IsUUID() categoryId`, `@IsOptional() @IsArray() @IsString({ each: true }) tags`, `@IsOptional() @IsUUID() thumbnailId`, `@IsOptional() @IsArray() @IsUUID('4', { each: true }) imageIds`, `@IsOptional() @IsUUID() videoId`, `@IsOptional() @ValidateNested() client` (name, logo), `@IsOptional() @ValidateNested() projectDetails` (duration, completedAt, technologies), `@IsOptional() @ValidateNested() links` (live, github), `@IsOptional() @ValidateNested() seo` (metaTitle, metaDescription, ogImageId).
- [ ] `src/dto/update-portfolio-item.dto.ts` – `PartialType(CreatePortfolioItemDto)`.
- [ ] `src/dto/update-privacy.dto.ts` – `@IsEnum(Visibility) visibility` (PUBLIC/UNLISTED/PRIVATE).
- [ ] `src/dto/reorder-portfolio.dto.ts` – `@IsArray() @ValidateNested({ each: true }) @Type(() => ReorderItemDto) items` where ReorderItemDto = { id: UUID, order: number }.
- [ ] `src/dto/bulk-update-portfolio.dto.ts` – `@IsEnum(BulkOperation) operation` (PUBLISH/ARCHIVE/DELETE), `@IsArray() @IsUUID('4', { each: true }) ids`.
- [ ] `src/dto/create-category.dto.ts` – `@IsString() @MaxLength(100) name`, `@IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) slug`, `@IsOptional() @IsString() @MaxLength(500) description`, `@IsOptional() @IsInt() order`.
- [ ] `src/dto/update-category.dto.ts` – `PartialType(CreateCategoryDto)`.
- [ ] `src/dto/portfolio-item-response.dto.ts` – `PortfolioItemResponse { id, title, slug, shortDescription, fullDescription, contentFormat, category: CategoryResponse, tags, thumbnail: MediaResponse, images: MediaResponse[], video, client, projectDetails, links, seo, status, featured, order, likeCount, viewCount, publishedAt, createdAt, updatedAt }`.
- [ ] `src/dto/category-response.dto.ts` – `CategoryResponse { id, name, slug, description, itemCount, order }`.
- [ ] `src/entities/portfolio-item.entity.ts` – Prisma PortfolioItem model: `title`, `slug` (unique), `shortDescription`, `fullDescription`, `contentFormat`, `categoryId`, `thumbnailId`, `videoUrl`, `client` (JSONB), `projectDetails` (JSONB), `links` (JSONB), `seo` (JSONB), `status`, `featured`, `order`, `likeCount`, `viewCount`, `publishedAt`.
- [ ] `src/entities/portfolio-category.entity.ts` – `name`, `slug` (unique), `description`, `order`. Has many PortfolioItems.
- [ ] `src/entities/portfolio-tag.entity.ts` – Many-to-many via PortfolioItemTag join table. `name` (unique, lowercase).
- [ ] `src/entities/portfolio-image.entity.ts` – Join table: `portfolioItemId`, `mediaId`, `order`, `caption`.
- [ ] `src/entities/portfolio-like.entity.ts` – `portfolioItemId`, `userId`, `ipHash` (for anonymous), `createdAt`. Unique: (portfolioItemId, userId) or (portfolioItemId, ipHash).
- [ ] `src/interfaces/portfolio.interface.ts` – `PortfolioItemWithRelations`, `PortfolioSearchResult`.
- [ ] `src/interfaces/portfolio-analytics.interface.ts` – `PortfolioAnalytics { totalViews, totalLikes, topItems: ItemStats[], viewsByDay: TimeSeriesData }`.
- [ ] `src/config/portfolio.config.ts` – `MAX_IMAGES_PER_ITEM` (20), `MAX_TAGS_PER_ITEM` (10), `THUMBNAIL_SIZES` (300x200, 600x400), `PUBLIC_CACHE_TTL` (3600s), `FEATURED_CACHE_TTL` (7200s), `VIEW_DEBOUNCE_HOURS` (1).
- [ ] `tests/` – Unit: slug generation, reordering, like toggle, search ranking. E2E: create → publish → public access → like → analytics.

### 11.13 Blog Service (`services/blog/`)
- [ ] `src/main.ts` – Bootstrap on port 3012.
- [ ] `src/app.module.ts` – Standard imports plus `SearchModule`, `CacheModule`, `FeedModule` (RSS/Atom generation).
- [ ] `src/controllers/public/posts.public.controller.ts` – `@Public()`. Per `113-blog-endpoints`:
  - `GET /posts` – List published posts. Paginated, filterable by category, tag, author. Sorted by publishedAt desc. Cached 30min. Returns: title, slug, excerpt, featuredImage, category, tags, author, readingTime, publishedAt.
  - `GET /posts/:slug` – Single post by slug. Full content (markdown/HTML rendered). Increments view count (debounced 1/IP/hour). Includes: author bio, category, tags, readingTime, likeCount, commentCount, series info. Cached 15min.
  - `GET /posts/:slug/related` – Related posts based on category and tags overlap. Algorithm: weighted score (same category +3, shared tag +1 each). Returns top 5. Cached 1h.
  - `POST /posts/:slug/view` – Record view event. Deduped by IP hash per hour.
- [ ] `src/controllers/public/blog-categories.public.controller.ts` – `@Public()`:
  - `GET /categories` – List blog categories with post counts. Cached 1h.
  - `GET /categories/:slug` – Posts filtered by category slug.
- [ ] `src/controllers/public/blog-tags.public.controller.ts` – `@Public()`:
  - `GET /tags` – All tags with usage counts. Cached 1h.
  - `GET /tags/:slug` – Posts filtered by tag.
- [ ] `src/controllers/public/authors.public.controller.ts` – `@Public()`:
  - `GET /authors` – List authors (admin users who have published posts). Cached 2h.
  - `GET /authors/:id` – Author profile with their published posts.
- [ ] `src/controllers/public/feed.public.controller.ts` – `@Public()`:
  - `GET /feed/rss` – RSS 2.0 feed of latest 20 posts. Content-Type: `application/rss+xml`. Cached 1h.
  - `GET /feed/atom` – Atom feed. Content-Type: `application/atom+xml`. Cached 1h.
- [ ] `src/controllers/user/post-interactions.controller.ts` – `@Auth()`:
  - `POST /posts/:slug/like` – Like/unlike post (toggle). Unique per user.
  - `POST /posts/:slug/bookmark` – Bookmark post for later reading.
  - `DELETE /posts/:slug/bookmark` – Remove bookmark.
  - `GET /bookmarks` – List user's bookmarked posts. Paginated.
- [ ] `src/controllers/user/comments.controller.ts` – `@Auth()`. Per `113-blog-endpoints`:
  - `GET /posts/:slug/comments` – List comments for post. Threaded (top-level + replies). Paginated top-level, replies loaded eagerly (max 3 levels). Sorted: pinned first, then by likes or chronological.
  - `POST /posts/:slug/comments` – Create comment. Content max 2000 chars. Auto-moderation: spam check, prohibited words filter. Status: APPROVED (if auto-mod passes) or PENDING (if flagged). `@Idempotent()`.
  - `GET /comments/:commentId` – Single comment with replies.
  - `GET /comments/:commentId/replies` – Paginated replies to a comment.
  - `POST /comments/:commentId/reply` – Reply to comment. Max 3 nesting levels.
  - `PATCH /comments/:commentId` – Edit own comment. Edit window: 30 minutes.
  - `DELETE /comments/:commentId` – Delete own comment. Soft-delete.
  - `POST /comments/:commentId/like` – Like/unlike comment (toggle).
  - `POST /comments/:commentId/report` – Report comment. Reason required. Creates moderation queue entry.
- [ ] `src/controllers/user/bookmarks.controller.ts` – Bookmark endpoints (combined above).
- [ ] `src/controllers/admin/posts.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `113-blog-endpoints`:
  - `POST /posts` – Create post. Fields: title, slug (auto-generated), excerpt, content, contentFormat (MARKDOWN/HTML), featuredImage (mediaId), categoryId, tags, authorId, seo (metaTitle, metaDescription, ogImage), series (name, order), commentsEnabled, status (DRAFT). Auto-calculates readingTime (words / 200 wpm).
  - `GET /posts` – List all posts including drafts/archived. Admin filters.
  - `GET /posts/:id` – Admin view with revision history and analytics.
  - `PATCH /posts/:id` – Update post. Creates new revision automatically.
  - `DELETE /posts/:id` – Soft-delete.
  - `POST /posts/:id/publish` – Publish: `DRAFT` → `PUBLISHED`. Sets `publishedAt`. Invalidates cache. Publishes `blog.post_published` event.
  - `POST /posts/:id/schedule` – Schedule future publish. Sets `scheduledAt`. Scheduler-worker publishes at that time.
  - `POST /posts/:id/unpublish` – Unpublish: `PUBLISHED` → `DRAFT`.
  - `POST /posts/:id/archive` – Archive post.
  - `POST /posts/:id/duplicate` – Clone as new draft.
  - `GET /posts/:id/revisions` – List content revisions. Each revision: content diff, author, timestamp.
  - `POST /posts/:id/revisions/:revisionId/restore` – Restore to previous revision. Creates new revision with restored content.
- [ ] `src/controllers/admin/comments.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `GET /comments` – All comments with filters.
  - `GET /comments/pending` – Moderation queue: comments awaiting approval.
  - `GET /comments/reported` – Reported comments.
  - `POST /comments/:id/approve` – Approve pending comment.
  - `POST /comments/:id/reject` – Reject comment (hide from public).
  - `POST /comments/:id/spam` – Mark as spam. Trains spam filter.
  - `DELETE /comments/:id` – Admin delete any comment.
  - `POST /comments/:id/pin` – Pin comment to top of post comments.
  - `POST /comments/:id/unpin` – Unpin.
- [ ] `src/controllers/admin/blog-categories.admin.controller.ts` – `@Auth(UserRole.ADMIN)`: CRUD for blog categories (name, slug, description).
- [ ] `src/controllers/admin/blog-tags.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - Standard CRUD.
  - `POST /tags/merge` – Merge two tags: reassigns all posts from source tag to target, deletes source. Prevents tag proliferation.
- [ ] `src/controllers/admin/blog-analytics.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `GET /analytics` – Blog-wide analytics: total views, unique visitors, top posts, engagement rate.
  - `GET /analytics/posts/:id` – Per-post analytics: views over time, referrers, reading depth.
- [ ] `src/services/posts.service.ts` – Core CRUD. `create(dto): Promise<Post>`. Auto-generates slug, calculates readingTime. Uses read replica for public queries.
- [ ] `src/services/post-publishing.service.ts` – `publish(postId)`. `unpublish(postId)`. `archive(postId)`. Manages status transitions and cache invalidation.
- [ ] `src/services/post-scheduling.service.ts` – `schedule(postId, scheduledAt)`. Called by scheduler-worker at scheduled time: publishes post automatically.
- [ ] `src/services/post-revisions.service.ts` – `createRevision(postId, content, authorId)`. Auto-created on every edit. `restore(postId, revisionId)`. Max 50 revisions per post, oldest pruned.
- [ ] `src/services/post-interactions.service.ts` – Likes and bookmarks. `toggleLike(postSlug, userId)`. `addBookmark(postSlug, userId)`. `removeBookmark(postSlug, userId)`. Denormalized `likeCount` on post.
- [ ] `src/services/post-search.service.ts` – Full-text search via PostgreSQL tsvector. Searches: title, excerpt, content. Weighted: title (A), excerpt (B), content (C). Returns ranked results with highlighted snippets.
- [ ] `src/services/post-views.service.ts` – View tracking. Records: postId, ipHash, userAgent, referrer, timestamp. Deduped by IP per hour. Aggregates: daily/weekly/monthly.
- [ ] `src/services/comments.service.ts` – Comment CRUD. `create(postSlug, userId, dto)`. Threaded: `parentId` for replies. Max depth 3.
- [ ] `src/services/comment-moderation.service.ts` – Auto-moderation pipeline: (1) prohibited words check, (2) spam score (link density, repetition), (3) rate limiting (max 5 comments/min). If flagged → PENDING for manual review.
- [ ] `src/services/comment-reactions.service.ts` – Comment like toggle.
- [ ] `src/services/categories.service.ts` – Blog category CRUD. Unique slug. Post count denormalized.
- [ ] `src/services/tags.service.ts` – Tag CRUD. `merge(fromId, toId)`. Many-to-many via PostTag.
- [ ] `src/services/bookmarks.service.ts` – `findByUser(userId, query)`. Paginated.
- [ ] `src/services/authors.service.ts` – Author profiles. Queries users with published posts. Cached.
- [ ] `src/services/feed.service.ts` – RSS/Atom generation. Uses `feed` npm package. Includes: title, description, link, pubDate, content (excerpt), author. Cached in Redis, regenerated on post publish/unpublish.
- [ ] `src/services/related-posts.service.ts` – `findRelated(postId, limit): Promise<Post[]>`. Weighted scoring algorithm. Cached per post.
- [ ] `src/services/blog-analytics.service.ts` – View and engagement analytics. Aggregates data from post_views table. Cached hourly.
- [ ] `src/services/blog-admin.service.ts` – Admin operations.
- [ ] `src/dto/query-posts.dto.ts` – Pagination + `@IsOptional() @IsUUID() categoryId`, `@IsOptional() @IsString() tag`, `@IsOptional() @IsUUID() authorId`, `@IsOptional() @IsString() search`.
- [ ] `src/dto/search-posts.dto.ts` – `@IsString() @MinLength(2) q`, filters.
- [ ] `src/dto/create-post.dto.ts` – `@IsString() @MaxLength(200) title`, `@IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) slug`, `@IsString() @MaxLength(500) excerpt`, `@IsString() @MaxLength(100000) content`, `@IsEnum(ContentFormat) contentFormat`, `@IsOptional() @IsUUID() featuredImageId`, `@IsOptional() @IsUUID() categoryId`, `@IsOptional() @IsArray() @IsString({ each: true }) tags`, `@IsOptional() @IsUUID() authorId`, `@IsOptional() @ValidateNested() seo`, `@IsOptional() @ValidateNested() series` (name, order), `@IsOptional() @IsBoolean() commentsEnabled` (default true).
- [ ] `src/dto/update-post.dto.ts` – `PartialType(CreatePostDto)`.
- [ ] `src/dto/schedule-post.dto.ts` – `@IsDateString() scheduledAt` (must be future).
- [ ] `src/dto/create-comment.dto.ts` – `@IsString() @MinLength(1) @MaxLength(2000) content`, `@IsOptional() @IsUUID() parentId`.
- [ ] `src/dto/update-comment.dto.ts` – `@IsString() @MinLength(1) @MaxLength(2000) content`.
- [ ] `src/dto/reply-comment.dto.ts` – `@IsString() @MinLength(1) @MaxLength(2000) content`.
- [ ] `src/dto/report-comment.dto.ts` – `@IsString() @MaxLength(500) reason`.
- [ ] `src/dto/create-category.dto.ts` – `@IsString() @MaxLength(100) name`, `@IsOptional() @IsString() slug`, `@IsOptional() @IsString() description`.
- [ ] `src/dto/update-category.dto.ts` – `PartialType(CreateCategoryDto)`.
- [ ] `src/dto/create-tag.dto.ts` – `@IsString() @MaxLength(50) name`.
- [ ] `src/dto/update-tag.dto.ts` – `@IsString() @MaxLength(50) name`.
- [ ] `src/dto/merge-tags.dto.ts` – `@IsUUID() fromTagId`, `@IsUUID() toTagId`.
- [ ] `src/dto/post-response.dto.ts` – `PostResponse { id, title, slug, excerpt, content, contentFormat, featuredImage, category, tags, author, seo, series, readingTime, likeCount, commentCount, viewCount, commentsEnabled, status, publishedAt, scheduledAt, createdAt, updatedAt }`.
- [ ] `src/dto/comment-response.dto.ts` – `CommentResponse { id, content, author: UserSummary, parentId, replies: CommentResponse[], likeCount, isPinned, status, editedAt, createdAt }`.
- [ ] `src/dto/category-response.dto.ts` – `BlogCategoryResponse { id, name, slug, description, postCount }`.
- [ ] `src/dto/tag-response.dto.ts` – `TagResponse { id, name, slug, postCount }`.
- [ ] `src/dto/author-response.dto.ts` – `AuthorResponse { id, name, avatar, bio, postCount }`.
- [ ] `src/entities/post.entity.ts` – Prisma Post model: `title`, `slug` (unique), `excerpt`, `content`, `contentFormat`, `featuredImageId`, `categoryId`, `authorId`, `seo` (JSONB), `series` (JSONB), `readingTime`, `likeCount`, `commentCount`, `viewCount`, `commentsEnabled`, `status`, `publishedAt`, `scheduledAt`.
- [ ] `src/entities/post-revision.entity.ts` – `postId`, `content`, `authorId`, `createdAt`. Ordered by createdAt desc.
- [ ] `src/entities/post-view.entity.ts` – `postId`, `ipHash`, `userAgent`, `referrer`, `createdAt`.
- [ ] `src/entities/post-like.entity.ts` – `postId`, `userId`. Unique: (postId, userId).
- [ ] `src/entities/comment.entity.ts` – `postId`, `userId`, `content`, `parentId`, `likeCount`, `isPinned`, `status` (APPROVED/PENDING/REJECTED/SPAM), `editedAt`, `deletedAt`.
- [ ] `src/entities/comment-like.entity.ts` – `commentId`, `userId`. Unique.
- [ ] `src/entities/comment-report.entity.ts` – `commentId`, `reportedBy`, `reason`, `status` (PENDING/REVIEWED/DISMISSED), `reviewedBy`.
- [ ] `src/entities/blog-category.entity.ts` – `name`, `slug` (unique), `description`, `postCount`.
- [ ] `src/entities/blog-tag.entity.ts` – `name` (unique), `slug`. Many-to-many via PostTag.
- [ ] `src/entities/bookmark.entity.ts` – `postId`, `userId`, `createdAt`. Unique: (postId, userId).
- [ ] `src/interfaces/post.interface.ts` – `PostWithRelations`, `PostSearchResult`.
- [ ] `src/interfaces/comment.interface.ts` – `ThreadedComment`, `ModerationResult`.
- [ ] `src/interfaces/feed.interface.ts` – `FeedItem`, `FeedConfig`.
- [ ] `src/config/blog.config.ts` – `POSTS_PER_PAGE` (10), `MAX_COMMENT_LENGTH` (2000), `COMMENT_EDIT_WINDOW_MINUTES` (30), `MAX_COMMENT_DEPTH` (3), `MAX_REVISIONS_PER_POST` (50), `READING_WPM` (200), `RSS_ITEMS_COUNT` (20), `VIEW_DEBOUNCE_HOURS` (1), `SPAM_SCORE_THRESHOLD` (0.7).
- [ ] `tests/` – Unit: slug generation, reading time calculation, comment moderation, feed generation, related posts algorithm. E2E: create → publish → comment → like → search → feed.

### 11.14 Contact Service (`services/contact/`)
- [ ] `src/main.ts` – Bootstrap on port 3013.
- [ ] `src/app.module.ts` – Standard imports plus `TurnstileModule` for bot protection on public form.
- [ ] `src/controllers/public/contact.public.controller.ts` – `@Public()`. Per `114-contact-endpoints`:
  - `POST /` – Submit contact form. No auth required. Validates Turnstile token. Rate limited: 3 submissions per IP per hour. Fields: name, email, subject, message. Creates ContactMessage with status NEW. Publishes `contact.submitted` event (triggers admin notification). `@Idempotent()` (prevents duplicate submissions). Returns generic success (no data leak).
- [ ] `src/controllers/admin/contact.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `114-contact-endpoints`:
  - `GET /` – List contact messages. Paginated, filterable by status (NEW/IN_PROGRESS/RESPONDED/SPAM/ARCHIVED), sortable by createdAt. Includes unread count.
  - `GET /:id` – Full contact message detail with response history.
  - `PATCH /:id/status` – Update status. Transitions: `NEW → IN_PROGRESS`, `IN_PROGRESS → RESPONDED`, any → `ARCHIVED`, any → `SPAM`.
  - `POST /:id/respond` – Send email response to contact. Records response in ContactResponseLog. Transitions status to RESPONDED. Optionally marks as resolved. Publishes `email.contact_response` event.
  - `POST /:id/spam` – Mark as spam. Adds sender email/IP to spam filter training data. Transitions to SPAM.
  - `DELETE /:id` – Soft-delete contact message.
- [ ] `src/services/contact.service.ts` – Core CRUD. `findAll(query)`. `findById(id)`. `updateStatus(id, status)`. `softDelete(id)`.
- [ ] `src/services/contact-submission.service.ts` – `submit(dto, ip): Promise<void>`. Validates Turnstile token via `@nestlancer/turnstile`. Checks rate limit (Redis `INCR` with TTL). Runs spam filter. Creates ContactMessage. Publishes notification event.
- [ ] `src/services/contact-response.service.ts` – `respond(contactId, dto): Promise<ContactResponseLog>`. Sends email via email.queue. Records response with admin ID, timestamp. Supports multiple responses per contact.
- [ ] `src/services/spam-filter.service.ts` – Heuristic spam detection. Scores: (1) known spam email domains +0.3, (2) excessive links in message +0.2 per link, (3) ALL CAPS content +0.1, (4) known spam keywords +0.2, (5) honeypot field filled (if implemented) +1.0. Threshold: 0.7 → auto-mark as SPAM. Below threshold → NEW for manual review.
- [ ] `src/services/contact-admin.service.ts` – Admin operations: listing, statistics, spam management.
- [ ] `src/dto/submit-contact.dto.ts` – `@IsString() @MaxLength(100) name`, `@IsEmail() email`, `@IsString() @MaxLength(200) subject`, `@IsString() @MinLength(10) @MaxLength(5000) message`, `@IsString() turnstileToken`.
- [ ] `src/dto/query-contacts.dto.ts` – Pagination + `@IsOptional() @IsEnum(ContactStatus) status`, `@IsOptional() @IsString() sortBy`, `@IsOptional() @IsEnum(SortOrder) order`.
- [ ] `src/dto/update-contact-status.dto.ts` – `@IsEnum(ContactStatus) status`.
- [ ] `src/dto/respond-contact.dto.ts` – `@IsString() @MaxLength(200) subject`, `@IsString() @MaxLength(10000) message`, `@IsOptional() @IsBoolean() markAsResponded` (default true).
- [ ] `src/dto/contact-response.dto.ts` – `ContactMessageResponse { id, name, email, subject, message, status, spamScore, responses: ResponseLogEntry[], createdAt, updatedAt }`.
- [ ] `src/entities/contact-message.entity.ts` – `name`, `email`, `subject`, `message`, `status` (NEW/IN_PROGRESS/RESPONDED/SPAM/ARCHIVED), `spamScore`, `ipAddress` (hashed), `createdAt`.
- [ ] `src/entities/contact-response-log.entity.ts` – `contactMessageId`, `adminId`, `subject`, `message`, `sentAt`.
- [ ] `src/interfaces/contact.interface.ts` – `ContactWithResponses`, `SpamCheckResult`.
- [ ] `src/config/contact.config.ts` – `RATE_LIMIT_PER_IP` (3/hour), `SPAM_SCORE_THRESHOLD` (0.7), `SPAM_EMAIL_DOMAINS` (disposable email list), `MAX_MESSAGE_LENGTH` (5000).
- [ ] `tests/` – Unit: spam filter scoring, Turnstile validation, rate limiting. E2E: submit → admin view → respond → status update.

### 11.15 Admin Service (`services/admin/`)
- [ ] `src/main.ts` – Bootstrap on port 3014.
- [ ] `src/app.module.ts` – Standard imports plus all cross-service integrations. This service aggregates data from other services for admin dashboard.
- [ ] `src/controllers/admin/dashboard.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `115-admin-endpoints`:
  - `GET /dashboard/overview` – Aggregated overview: total users, active projects, pending requests, open quotes, revenue this month, unread contact messages, system health. Each metric queried from respective service. Cached 5min.
  - `GET /dashboard/revenue` – Revenue dashboard: total revenue, MoM growth, by project category. Queries payments service. Filterable by period.
  - `GET /dashboard/users` – User metrics: total, new this month, active (logged in last 30d), by role. Queries users service.
  - `GET /dashboard/projects` – Project metrics: total, by status, average completion time, on-time rate. Queries projects service.
  - `GET /dashboard/performance` – System performance: API response times (p50, p95, p99), error rate, uptime. Queries metrics/Prometheus.
  - `GET /dashboard/activity` – Recent activity feed: last 50 events across all services (user registrations, payments, project updates). Aggregates from audit log.
  - `GET /dashboard/alerts` – Active system alerts: failing health checks, high error rate, disk space low, stale jobs. Queries health and metrics services.
- [ ] `src/controllers/admin/system.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `115-admin-endpoints`:
  - `GET /system/config` – List all system configuration key-value pairs.
  - `PATCH /system/config` – Update system config. Key-value pairs stored in DB. Used for runtime configuration changes without redeployment. Records audit log. Examples: `MAX_UPLOAD_SIZE_MB`, `DEFAULT_QUOTE_VALIDITY_DAYS`, `MAINTENANCE_MESSAGE`.
  - `GET /system/email-templates` – List email templates with metadata.
  - `GET /system/email-templates/:id` – Template detail with Handlebars content.
  - `PATCH /system/email-templates/:id` – Update template content. Validates Handlebars syntax.
  - `GET /system/email-templates/:id/preview` – Render template with sample data. Returns HTML preview.
  - `POST /system/email-templates/:id/test` – Send test email with template to specified address.
  - `POST /system/announcements` – Create system-wide announcement. Displayed in UI banner. Options: type (INFO/WARNING/CRITICAL), dismissable, scheduledFor, expiresAt.
  - `POST /system/maintenance` – Toggle maintenance mode. When enabled: all non-admin requests return 503. Maintenance page shown. Options: message, estimatedEndTime.
  - `GET /system/features` – List feature flags with current state.
  - `PATCH /system/features/:flag` – Toggle feature flag. Immediate effect via Redis pub/sub. Records audit log.
  - `POST /system/cache/clear` – Clear all application caches (Redis FLUSHDB for app prefix).
  - `POST /system/cache/clear/:key` – Clear specific cache key pattern.
  - `GET /system/jobs` – List background jobs: queued, active, completed, failed. Filterable by queue, status.
  - `POST /system/jobs/:id/retry` – Retry failed job.
  - `DELETE /system/jobs/:id` – Remove job from queue.
  - `GET /system/logs` – Application logs viewer. Filterable by level (error, warn, info), service, dateRange. Queries centralized logging (ELK or similar).
  - `GET /system/logs/download` – Download logs as file for date range.
- [ ] `src/controllers/admin/email-templates.admin.controller.ts` – Email template endpoints (combined above).
- [ ] `src/controllers/admin/audit.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `115-admin-endpoints`:
  - `GET /audit` – List audit log entries. Filterable by userId, action, resourceType, dateRange. Paginated.
  - `GET /audit/:id` – Audit entry detail with before/after data diff.
  - `GET /audit/user/:userId` – Audit trail for specific user.
  - `GET /audit/resource/:type/:id` – Audit trail for specific resource.
  - `POST /audit/export` – Export audit log as CSV/JSON. Async: queued as background job, download link sent when ready.
  - `GET /audit/stats` – Audit statistics: actions per day, most active users, most modified resources.
- [ ] `src/controllers/admin/webhooks.admin.controller.ts` – `@Auth(UserRole.ADMIN)`. Per `115-admin-endpoints` (outgoing webhooks admin manages):
  - `GET /webhooks` – List configured outgoing webhooks.
  - `POST /webhooks` – Register new outgoing webhook. Config: name, URL, events to subscribe, custom headers, secret (for HMAC signing), retry policy.
  - `GET /webhooks/:id` – Webhook config detail.
  - `PATCH /webhooks/:id` – Update webhook config.
  - `DELETE /webhooks/:id` – Remove webhook.
  - `POST /webhooks/:id/enable` – Enable disabled webhook.
  - `POST /webhooks/:id/disable` – Disable webhook (stops delivery).
  - `GET /webhooks/:id/deliveries` – Delivery log: timestamp, event, status code, response time, retries.
  - `GET /webhooks/:id/deliveries/:deliveryId` – Delivery detail: request/response headers and body.
  - `POST /webhooks/:id/test` – Send test event. Delivers sample payload to webhook URL. Records delivery.
  - `POST /webhooks/:id/deliveries/:deliveryId/retry` – Retry failed delivery.
  - `GET /webhooks/:id/stats` – Webhook statistics: delivery success rate, average response time.
  - `GET /webhooks/events` – List all available webhook events: `user.created`, `project.created`, `payment.completed`, etc.
- [ ] `src/controllers/admin/impersonation.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `POST /users/:userId/impersonate` – Start impersonation session. Admin acts as specified user. Requires: reason, optional ticketId. Creates ImpersonationSession record. Issues impersonation JWT with `impersonatedBy` claim. All actions during impersonation are audit-logged.
  - `POST /impersonate/end` – End impersonation session. Reverts to admin identity.
  - `GET /impersonate/sessions` – List past impersonation sessions: who, when, duration, reason.
- [ ] `src/controllers/admin/backups.admin.controller.ts` – `@Auth(UserRole.ADMIN)`:
  - `GET /backups` – List database backups. Shows: timestamp, size, status, type (manual/scheduled).
  - `POST /backups` – Trigger manual backup. Async: runs `pg_dump`, uploads to S3. Publishes `backup.completed` event.
  - `GET /backups/:id` – Backup details.
  - `GET /backups/:id/download` – Download backup file (presigned S3 URL).
  - `POST /backups/:id/restore` – Restore from backup. Dangerous: requires confirmation. Creates new backup before restore. Publishes `backup.restore_started` event.
  - `DELETE /backups/:id` – Delete backup from S3.
  - `GET /backups/schedule` – Current backup schedule (cron expression).
  - `PATCH /backups/schedule` – Update backup schedule and retention policy.
- [ ] `src/services/dashboard.service.ts` – `getOverview(): Promise<DashboardOverview>`. Aggregates metrics from multiple services via HTTP calls or shared DB views. Cached 5min.
- [ ] `src/services/dashboard-revenue.service.ts` – Revenue chart data. Queries payments service. `getRevenue(period): Promise<RevenueData>`.
- [ ] `src/services/dashboard-users.service.ts` – User metrics. `getUserMetrics(): Promise<UserMetrics>`.
- [ ] `src/services/dashboard-projects.service.ts` – Project metrics. `getProjectMetrics(): Promise<ProjectMetrics>`.
- [ ] `src/services/dashboard-performance.service.ts` – System performance from Prometheus/metrics. `getPerformance(): Promise<PerformanceMetrics>`.
- [ ] `src/services/system-config.service.ts` – `get(key): Promise<string>`. `set(key, value): Promise<void>`. `getAll(): Promise<Record<string, string>>`. Stored in DB, cached in Redis. Changes publish Redis event for instant propagation.
- [ ] `src/services/email-templates.service.ts` – Template CRUD. `render(templateId, variables): Promise<string>`. `preview(templateId): Promise<string>`. `sendTest(templateId, email): Promise<void>`. Validates Handlebars syntax on save.
- [ ] `src/services/feature-flags.service.ts` – `isEnabled(flag): boolean`. `toggle(flag): Promise<void>`. `getAll(): Promise<FeatureFlag[]>`. Cached in Redis. Changes propagate via Redis pub/sub. Used across all services via `@nestlancer/config`.
- [ ] `src/services/maintenance-mode.service.ts` – `enable(message, estimatedEnd)`. `disable()`. `isEnabled(): boolean`. Sets Redis key `maintenance:enabled`. All services check this key in middleware.
- [ ] `src/services/cache-management.service.ts` – `clearAll(): Promise<void>`. `clearPattern(pattern): Promise<number>`. Uses Redis `SCAN` + `DEL` for safe pattern clearing.
- [ ] `src/services/background-jobs.service.ts` – `listJobs(queue, status): Promise<Job[]>`. `retryJob(jobId): Promise<void>`. `removeJob(jobId): Promise<void>`. Integrates with BullMQ job inspection API.
- [ ] `src/services/system-logs.service.ts` – `getLogs(query): Promise<LogEntry[]>`. `downloadLogs(query): Promise<Buffer>`. Queries centralized logging infrastructure.
- [ ] `src/services/audit.service.ts` – `log(action, resourceType, resourceId, userId, data): Promise<AuditLog>`. Called by interceptor on every state-changing request. Records: action, actor, resource, before/after data, IP, timestamp.
- [ ] `src/services/audit-export.service.ts` – `export(query, format): Promise<string>` (returns job ID). Background job generates CSV/JSON. Uploads to S3. Returns download link.
- [ ] `src/services/webhooks-management.service.ts` – Outgoing webhook CRUD. `register(dto)`. `deliver(event, payload)`: sends HTTP POST with HMAC signature, exponential backoff retry (max 5). Records delivery log.
- [ ] `src/services/webhook-deliveries.service.ts` – Delivery log queries and retry logic.
- [ ] `src/services/webhook-testing.service.ts` – `test(webhookId): Promise<DeliveryResult>`. Sends sample event payload.
- [ ] `src/services/impersonation.service.ts` – `start(adminId, userId, reason): Promise<ImpersonationToken>`. `end(sessionId): Promise<void>`. Issues special JWT. All audit entries during session tagged with impersonation info.
- [ ] `src/services/backups.service.ts` – `createBackup(): Promise<Backup>`. Runs `pg_dump` via child process. Compresses and uploads to S3. `restore(backupId): Promise<void>`. Runs `pg_restore`.
- [ ] `src/services/backup-scheduler.service.ts` – Cron-based backup scheduling. Default: daily at 2 AM UTC. Configurable retention: keep last N backups.
- [ ] `src/services/announcements.service.ts` – `create(dto): Promise<Announcement>`. `getActive(): Promise<Announcement[]>`. Active announcements returned to all clients via API response header or dedicated endpoint.
- [ ] `src/dto/dashboard-query.dto.ts` – `@IsOptional() @IsEnum(Period) period` (TODAY/WEEK/MONTH/QUARTER/YEAR).
- [ ] `src/dto/revenue-query.dto.ts` – `@IsOptional() @IsEnum(Period) period`, `@IsOptional() @IsDateString() from`, `@IsOptional() @IsDateString() to`.
- [ ] `src/dto/update-system-config.dto.ts` – `@IsString() key`, `@IsString() value`.
- [ ] `src/dto/update-email-template.dto.ts` – `@IsOptional() @IsString() subject`, `@IsOptional() @IsString() body` (Handlebars HTML).
- [ ] `src/dto/toggle-feature.dto.ts` – `@IsBoolean() enabled`.
- [ ] `src/dto/toggle-maintenance.dto.ts` – `@IsBoolean() enabled`, `@IsOptional() @IsString() @MaxLength(500) message`, `@IsOptional() @IsDateString() estimatedEnd`.
- [ ] `src/dto/clear-cache.dto.ts` – `@IsOptional() @IsString() keyPattern`.
- [ ] `src/dto/query-jobs.dto.ts` – `@IsOptional() @IsEnum(JobStatus) status`, `@IsOptional() @IsString() queue`.
- [ ] `src/dto/query-logs.dto.ts` – `@IsOptional() @IsEnum(LogLevel) level`, `@IsOptional() @IsString() service`, `@IsOptional() @IsDateString() from`, `@IsOptional() @IsDateString() to`.
- [ ] `src/dto/query-audit.dto.ts` – `@IsOptional() @IsUUID() userId`, `@IsOptional() @IsString() resourceType`, `@IsOptional() @IsString() action`, `@IsOptional() @IsDateString() from`, `@IsOptional() @IsDateString() to`.
- [ ] `src/dto/export-audit.dto.ts` – `@IsEnum(ExportFormat) format` (CSV/JSON), audit filters.
- [ ] `src/dto/create-webhook.dto.ts` – `@IsString() @MaxLength(100) name`, `@IsUrl() url`, `@IsArray() @IsString({ each: true }) events`, `@IsOptional() @IsObject() headers` (custom headers), `@IsOptional() @IsString() secret` (for HMAC), `@IsOptional() @IsBoolean() enabled` (default true), `@IsOptional() @ValidateNested() retryPolicy` (maxRetries, backoffSeconds).
- [ ] `src/dto/update-webhook.dto.ts` – `PartialType(CreateWebhookDto)`.
- [ ] `src/dto/test-webhook.dto.ts` – `@IsString() event` (event type to simulate).
- [ ] `src/dto/query-webhook-deliveries.dto.ts` – Pagination + `@IsOptional() @IsEnum(DeliveryStatus) status`.
- [ ] `src/dto/impersonate-user.dto.ts` – `@IsString() @MaxLength(500) reason`, `@IsOptional() @IsString() ticketId`.
- [ ] `src/dto/create-backup.dto.ts` – `@IsOptional() @IsString() @MaxLength(200) description`.
- [ ] `src/dto/restore-backup.dto.ts` – `@IsUUID() backupId`, `@IsBoolean() confirmRestore` (must be true).
- [ ] `src/dto/update-backup-schedule.dto.ts` – `@IsString() cronExpression`, `@IsInt() @Min(1) @Max(90) retentionDays`.
- [ ] `src/dto/send-announcement.dto.ts` – `@IsString() @MaxLength(200) title`, `@IsString() @MaxLength(1000) message`, `@IsEnum(AnnouncementType) type` (INFO/WARNING/CRITICAL), `@IsOptional() @IsBoolean() dismissable`, `@IsOptional() @IsDateString() scheduledFor`, `@IsOptional() @IsDateString() expiresAt`.
- [ ] `src/dto/dashboard-response.dto.ts` – `DashboardOverview { totalUsers, activeProjects, pendingRequests, openQuotes, revenueThisMonth, unresolvedContacts, systemHealth }`.
- [ ] `src/dto/audit-response.dto.ts` – `AuditLogResponse { id, action, resourceType, resourceId, userId, userEmail, dataBefore, dataAfter, ip, createdAt }`.
- [ ] `src/dto/webhook-response.dto.ts` – `WebhookResponse { id, name, url, events, enabled, lastDeliveryAt, successRate, createdAt }`.
- [ ] `src/dto/backup-response.dto.ts` – `BackupResponse { id, description, size, status, type, downloadUrl, createdAt }`.
- [ ] `src/entities/system-config.entity.ts` – `key` (unique), `value`, `description`, `updatedBy`, `updatedAt`.
- [ ] `src/entities/email-template.entity.ts` – `name`, `eventType`, `subject`, `body` (Handlebars), `variables` (JSONB: list of supported variables), `active`, `updatedBy`.
- [ ] `src/entities/feature-flag.entity.ts` – `name` (unique), `enabled`, `description`, `updatedBy`, `updatedAt`.
- [ ] `src/entities/audit-log.entity.ts` – `action`, `resourceType`, `resourceId`, `userId`, `dataBefore` (JSONB), `dataAfter` (JSONB), `ip`, `impersonatedBy`, `createdAt`. Indexed: (userId, createdAt), (resourceType, resourceId).
- [ ] `src/entities/webhook.entity.ts` – `name`, `url`, `events`, `headers` (JSONB), `secretHash`, `enabled`, `retryPolicy` (JSONB), `lastDeliveryAt`, `successCount`, `failureCount`.
- [ ] `src/entities/webhook-delivery.entity.ts` – `webhookId`, `event`, `payload` (JSONB), `statusCode`, `responseBody`, `responseTime`, `attempts`, `status`, `deliveredAt`.
- [ ] `src/entities/webhook-event.entity.ts` – Event type registry: `name`, `description`, `samplePayload` (JSONB).
- [ ] `src/entities/impersonation-session.entity.ts` – `adminId`, `userId`, `reason`, `ticketId`, `startedAt`, `endedAt`, `actionsCount`.
- [ ] `src/entities/backup.entity.ts` – `description`, `filename`, `s3Key`, `size`, `status` (IN_PROGRESS/COMPLETED/FAILED), `type` (MANUAL/SCHEDULED), `createdAt`.
- [ ] `src/entities/backup-schedule.entity.ts` – `cronExpression`, `retentionDays`, `enabled`, `lastRunAt`, `nextRunAt`.
- [ ] `src/entities/background-job.entity.ts` – View/wrapper over BullMQ job data for admin UI.
- [ ] `src/entities/announcement.entity.ts` – `title`, `message`, `type`, `dismissable`, `scheduledFor`, `expiresAt`, `createdBy`, `createdAt`.
- [ ] `src/guards/super-admin.guard.ts` – Additional guard for destructive operations (backup restore, impersonation). May require re-authentication or 2FA confirmation.
- [ ] `src/interfaces/dashboard.interface.ts` – `DashboardOverview`, `RevenueData`, `UserMetrics`, `ProjectMetrics`, `PerformanceMetrics`.
- [ ] `src/interfaces/system-config.interface.ts` – `SystemConfigEntry`, `ConfigChangeEvent`.
- [ ] `src/interfaces/webhook.interface.ts` – `WebhookConfig`, `DeliveryResult`, `WebhookEvent`.
- [ ] `src/interfaces/audit.interface.ts` – `AuditAction` enum, `AuditQuery`, `AuditExportResult`.
- [ ] `src/interfaces/backup.interface.ts` – `BackupConfig`, `RestoreResult`.
- [ ] `src/config/admin.config.ts` – `DASHBOARD_CACHE_TTL` (300s), `AUDIT_RETENTION_DAYS` (365), `MAX_IMPERSONATION_DURATION_HOURS` (4), `BACKUP_S3_BUCKET`, `BACKUP_RETENTION_DAYS` (30), `WEBHOOK_MAX_RETRIES` (5), `WEBHOOK_BACKOFF_BASE_SECONDS` (10).
- [ ] `tests/` – Unit: dashboard aggregation, feature flag toggle, audit logging, webhook HMAC signing, backup lifecycle. E2E: dashboard data, config update, impersonation flow, backup/restore.

### 11.16 Webhooks Ingestion Service (`services/webhooks/`)
- [ ] `src/main.ts` – Bootstrap on port 3015. Minimal middleware for performance (webhooks are high-throughput).
- [ ] `src/app.module.ts` – Standard imports plus `QueueModule` (publishes to service-specific queues). Raw body parsing enabled for signature verification.
- [ ] `src/controllers/webhook/webhook-receiver.controller.ts` – `@Public()` (no JWT auth, uses webhook signature verification instead). Per `116-webhooks-endpoints`:
  - `POST /razorpay` – Receive Razorpay webhooks. Events: `payment.authorized`, `payment.captured`, `payment.failed`, `refund.created`, `refund.processed`, `refund.failed`, `dispute.created`, `dispute.won`, `dispute.lost`. Verification: HMAC-SHA256 of raw body with `RAZORPAY_WEBHOOK_SECRET`. Returns 200 immediately (async processing). Records raw webhook in DB before processing. `@Idempotent()` via Razorpay event ID.
  - `POST /cloudflare` – Receive Cloudflare webhooks (if CDN cache purge notifications needed). Verification via shared secret header.
  - `POST /:provider` – Generic webhook receiver for future providers. Delegates to registered provider handler.
- [ ] `src/services/webhook-ingestion.service.ts` – Core ingestion pipeline: (1) receive raw payload, (2) verify signature via provider, (3) store IncomingWebhook record with status RECEIVED, (4) check idempotency (event ID already processed?), (5) publish to appropriate service queue, (6) update status to DISPATCHED. On error: status FAILED, retry via dead letter queue.
- [ ] `src/services/webhook-dispatcher.service.ts` – Routes webhook events to correct service queue. Mapping: `payment.*` → `payments.webhook.queue`, `refund.*` → `payments.webhook.queue`, `dispute.*` → `payments.webhook.queue`. Publishes with event metadata (provider, eventType, timestamp, rawPayloadId).
- [ ] `src/services/webhook-retry.service.ts` – Handles failed webhook processing. Dead letter queue consumer. Exponential backoff: 1min, 5min, 30min, 2h, 24h (max 5 retries). After max retries: status DEAD_LETTERED, admin notified.
- [ ] `src/services/webhook-replay.service.ts` – Admin-triggered replay. `replay(webhookId): Promise<void>`. Re-dispatches stored webhook payload. Used for recovering from processing bugs.
- [ ] `src/providers/razorpay.provider.ts` – Razorpay webhook provider. `verifySignature(rawBody, signature): boolean`. Uses `crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex')`. Compares with `X-Razorpay-Signature` header. `parseEvent(payload): WebhookEvent`. Maps Razorpay event structure to internal format.
- [ ] `src/providers/cloudflare.provider.ts` – Cloudflare webhook provider (minimal). Verifies shared secret header. Parses cache purge events.
- [ ] `src/dto/webhook-payload.dto.ts` – Generic: `provider`, `eventType`, `eventId`, `timestamp`, `data` (JSONB). Provider-specific DTOs extend this.
- [ ] `src/dto/razorpay-webhook.dto.ts` – `entity`, `account_id`, `event`, `contains[]`, `payload` (matches Razorpay webhook structure), `created_at`.
- [ ] `src/entities/incoming-webhook.entity.ts` – `provider`, `eventType`, `eventId` (unique per provider), `rawPayload` (JSONB), `headers` (JSONB, sanitized), `status` (RECEIVED/DISPATCHED/PROCESSED/FAILED/DEAD_LETTERED), `attempts`, `lastError`, `processedAt`, `createdAt`. Indexed: (provider, eventId) for idempotency check, (status) for retry queries.
- [ ] `src/interfaces/webhook-provider.interface.ts` – `WebhookProvider { name: string, verifySignature(rawBody: Buffer, headers: Record<string, string>): boolean, parseEvent(payload: any): WebhookEvent }`. Provider registry pattern: new providers implement this interface and register in module.
- [ ] `src/interfaces/webhook-event.interface.ts` – `WebhookEvent { provider, eventType, eventId, timestamp, data, targetQueue }`.
- [ ] `src/config/webhooks.config.ts` – `RAZORPAY_WEBHOOK_SECRET`, `CLOUDFLARE_WEBHOOK_SECRET`, `MAX_RETRY_ATTEMPTS` (5), `RETRY_BACKOFF_MULTIPLIER` (3), `DEAD_LETTER_TTL_DAYS` (30), `RAW_BODY_SIZE_LIMIT` ('1mb').
- [ ] `tests/unit/` – Signature verification for each provider, event parsing, dispatcher routing, idempotency check, retry backoff calculation.
- [ ] `tests/e2e/webhooks.e2e-spec.ts` – Full flow: receive Razorpay payment.captured → verify → store → dispatch to payments queue. Invalid signature returns 401. Duplicate event ID returns 200 (idempotent). Failed processing → retry flow.
- [ ] `package.json`, `tsconfig.json`, `nest-cli.json`, `Dockerfile`, `infisical.json`, `.eslintrc.js`, `.prettierrc`, `README.md`

---

## 12. Workers (`workers/`)

Each worker follows a pattern: `src/main.ts`, `src/app.module.ts`, `src/consumers/`, `src/processors/`, `src/services/`, `src/config/`, `src/interfaces/`, `tests/`, `fixtures/`, `package.json`, etc.

### 12.1 Email Worker (`workers/email-worker/`)
- [ ] `src/main.ts` – Bootstrap standalone NestJS application (no HTTP server). Connects to RabbitMQ `email.queue` via `@nestlancer/queue`. Graceful shutdown: waits for in-flight jobs to complete before exiting. Concurrency: 5 (configurable).
- [ ] `src/app.module.ts` – Imports: `QueueModule.forConsumer('email')`, `MailModule.forRoot()` (Nodemailer with SMTP or SES), `ConfigModule`, `LoggerModule`, `MetricsModule`. No database connection needed (stateless worker).
- [ ] `src/consumers/email.consumer.ts` – `@Processor('email')`. BullMQ consumer. Routes jobs by `type` field to appropriate processor. Job types: `EMAIL_VERIFICATION`, `PASSWORD_RESET`, `WELCOME`, `NOTIFICATION`, `QUOTE_SENT`, `QUOTE_ACCEPTED`, `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `PAYMENT_REFUND`, `PROJECT_UPDATE`, `PROJECT_COMPLETED`, `CONTACT_RESPONSE`, `ANNOUNCEMENT`. Dead letter on max retries (3). Records metrics: jobs processed, failed, duration.
- [ ] `src/processors/`
  - [ ] `verification-email.processor.ts` – Renders `verification.hbs` with `{ userName, verificationUrl, expiresIn }`. Subject: "Verify your email address". Sends via MailService. Verification URL: `${FRONTEND_URL}/verify-email?token=${token}`. Token expires in 24h.
  - [ ] `password-reset-email.processor.ts` – Renders `password-reset.hbs` with `{ userName, resetUrl, expiresIn, ipAddress }`. Subject: "Reset your password". Reset URL valid for 1h. Includes "If you didn't request this" security note.
  - [ ] `welcome-email.processor.ts` – Renders `welcome.hbs` with `{ userName, loginUrl, supportEmail }`. Subject: "Welcome to Nestlancer!". Sent after email verification complete.
  - [ ] `notification-email.processor.ts` – Generic notification email. Renders `notification.hbs` with `{ userName, title, message, actionUrl, actionText }`. Used for: milestone completed, message received, project status changed. Checks user email preferences before sending (skips if email disabled for event type).
  - [ ] `quote-email.processor.ts` – Handles quote-related emails. Sub-types: `QUOTE_SENT` (renders `quote-sent.hbs`, attaches PDF from S3), `QUOTE_ACCEPTED` (renders `quote-accepted.hbs`), `QUOTE_EXPIRED` (renders `quote-expired.hbs`). Quote PDF attached as inline attachment.
  - [ ] `payment-email.processor.ts` – Payment emails. Sub-types: `PAYMENT_RECEIVED` (renders `payment-received.hbs`, attaches receipt PDF), `PAYMENT_FAILED` (renders `payment-failed.hbs` with retry link), `PAYMENT_REFUND` (renders `payment-refund.hbs`). Amounts formatted in INR (₹).
  - [ ] `project-email.processor.ts` – Project lifecycle emails. Sub-types: `PROJECT_UPDATE` (progress entry created), `PROJECT_COMPLETED` (admin marks complete, client review needed). Renders respective templates.
  - [ ] `contact-response.processor.ts` – Renders `contact-response.hbs`. Sends admin's response to contact form submitter. From: configurable reply address (e.g., `hello@nestlancer.com`).
  - [ ] `announcement-email.processor.ts` – Bulk email for system announcements. Processes batches of recipients. Renders `announcement.hbs` with `{ title, message, unsubscribeUrl }`. Includes unsubscribe link per CAN-SPAM compliance.
- [ ] `src/services/`
  - [ ] `email-worker.service.ts` – `sendEmail(to, subject, html, attachments?): Promise<void>`. Wraps Nodemailer `transporter.sendMail()`. Configures: from address, reply-to, DKIM signing. Records send result. Emits metrics.
  - [ ] `email-renderer.service.ts` – `render(templateName, data): Promise<string>`. Compiles Handlebars templates with `layouts/base.hbs` as layout. Injects common variables: `currentYear`, `companyName`, `supportEmail`, `logoUrl`. Caches compiled templates in memory.
  - [ ] `email-retry.service.ts` – Retry logic: exponential backoff (1min, 5min, 30min). Max 3 retries. On permanent failure (invalid email, bounced): logs error, updates notification delivery log status to FAILED. On transient failure (SMTP timeout): retries.
- [ ] `src/templates/` – Handlebars email templates. All extend `layouts/base.hbs` (company header, footer with unsubscribe). Responsive HTML email design (inline CSS, table-based layout for email client compatibility).
  - [ ] `layouts/base.hbs` – Base layout: Nestlancer logo, header bar, `{{{body}}}` content area, footer (company address, unsubscribe link, social links). Responsive tables.
  - [ ] `verification.hbs` – Verification CTA button, expiry note, security warning.
  - [ ] `password-reset.hbs` – Reset CTA button, expiry countdown, IP/device info, "wasn't me" link.
  - [ ] `welcome.hbs` – Welcome message, getting started steps, support info.
  - [ ] `notification.hbs` – Generic: title, message, action button. Used for various notification types.
  - [ ] `quote-sent.hbs` – Quote summary table (line items, total), CTA to view full quote, expiry date.
  - [ ] `quote-accepted.hbs` – Confirmation, project creation notice, next steps.
  - [ ] `payment-received.hbs` – Payment confirmation, amount, transaction ID, receipt attachment note.
  - [ ] `payment-reminder.hbs` – Upcoming milestone payment reminder, amount due, due date, pay CTA.
  - [ ] `payment-failed.hbs` – Failure reason, retry CTA, support contact.
  - [ ] `project-update.hbs` – Progress entry summary, milestone status, view project CTA.
  - [ ] `project-completed.hbs` – Completion notice, review/approve CTA, feedback request.
  - [ ] `contact-response.hbs` – Admin's response text, original message reference.
  - [ ] `announcement.hbs` – System announcement with type-based styling (info=blue, warning=yellow, critical=red).
- [ ] `src/config/email-worker.config.ts` – `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` ('hello@nestlancer.com'), `FROM_NAME` ('Nestlancer'), `REPLY_TO`, `MAX_RETRIES` (3), `CONCURRENCY` (5), `DKIM_DOMAIN`, `DKIM_PRIVATE_KEY`.
- [ ] `src/interfaces/email-job.interface.ts` – `EmailJob { type: EmailJobType, to: string, data: Record<string, any>, attachments?: Attachment[], priority?: number }`.
- [ ] `src/interfaces/email-template-data.interface.ts` – Per-template data interfaces: `VerificationEmailData`, `PasswordResetEmailData`, `QuoteEmailData`, `PaymentEmailData`, etc.
- [ ] `tests/unit/` – Template rendering tests (snapshot testing), processor routing, retry logic. Mock SMTP transport.
- [ ] `tests/fixtures/email.fixture.ts` – Sample job payloads for each email type.

### 12.2 Notification Worker (`workers/notification-worker/`)
- [ ] `src/main.ts` – Bootstrap standalone. Connects to `notification.queue`. Concurrency: 10 (notifications should be fast).
- [ ] `src/app.module.ts` – Imports: `QueueModule.forConsumer('notification')`, `DatabaseModule` (for in-app notification storage), `RedisModule` (for WebSocket pub/sub), `ConfigModule`.
- [ ] `src/consumers/notification.consumer.ts` – `@Processor('notification')`. Routes by job type: `IN_APP`, `PUSH`, `SMS`, `REALTIME_FANOUT`, `BROADCAST_BATCH`. Processes each channel independently. If one channel fails, others still deliver. Records delivery status per channel.
- [ ] `src/processors/`
  - [ ] `in-app-notification.processor.ts` – Creates Notification DB record. Updates Redis unread count (`INCR unread:<userId>`). Publishes to Redis pub/sub channel `notifications:<userId>` for real-time delivery via WebSocket gateway.
  - [ ] `push-notification.processor.ts` – Sends Web Push via VAPID. Fetches user's push subscriptions from DB. For each subscription: calls `webpush.sendNotification(subscription, payload)`. Handles: expired subscriptions (removes from DB), failed delivery (retries). Payload: `{ title, body, icon, badge, data: { url, notificationId } }`.
  - [ ] `sms-notification.processor.ts` – Sends SMS via configured provider (Twilio/MSG91). Currently: SMS not active (per tech stack), but structure in place for future. `sendSms(phoneNumber, message)`.
  - [ ] `realtime-fanout.processor.ts` – Publishes events to Redis pub/sub for WebSocket gateway to broadcast. Events: `message.new`, `message.edited`, `message.deleted`, `typing.start`, `typing.stop`, `presence.update`. Channel: `ws:events:<projectId>` or `ws:user:<userId>`.
- [ ] `src/services/`
  - [ ] `notification-worker.service.ts` – Orchestrates multi-channel delivery. `deliver(job): Promise<DeliveryResult[]>`. Checks user preferences (quiet hours, channel settings) before each channel. Records delivery log entries.
  - [ ] `push-provider.service.ts` – VAPID Web Push. `send(subscription, payload): Promise<boolean>`. Uses `web-push` npm package. Handles: `410 Gone` (subscription expired → cleanup), `429 Too Many Requests` (rate limit → retry), `201 Created` (success).
  - [ ] `sms-provider.service.ts` – SMS abstraction. Currently stub. Interface: `send(phoneNumber, message): Promise<boolean>`.
  - [ ] `redis-publisher.service.ts` – `publish(channel, event): Promise<void>`. Publishes JSON events to Redis pub/sub. WebSocket gateway instances subscribe to these channels.
- [ ] `src/config/notification-worker.config.ts` – `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `PUSH_CONCURRENCY` (10), `SMS_PROVIDER` ('twilio'|'msg91'), `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `REDIS_PUBSUB_PREFIX` ('ws:').
- [ ] `src/interfaces/notification-job.interface.ts` – `NotificationJob { type, userId, channels: NotificationChannel[], notification: { title, message, data, actionUrl }, preferences?: UserNotificationPrefs }`.
- [ ] `src/interfaces/push-payload.interface.ts` – `PushPayload { title, body, icon?, badge?, tag?, data: { url, notificationId, type } }`.
- [ ] `tests/` – Unit: channel routing, preference filtering, push delivery, Redis pub/sub. Mock web-push and Redis.

### 12.3 Audit Worker (`workers/audit-worker/`)
- [ ] `src/main.ts` – Bootstrap standalone. Connects to `audit.queue`. Concurrency: 1 (single consumer, batch processing).
- [ ] `src/app.module.ts` – Imports: `QueueModule.forConsumer('audit')`, `DatabaseModule` (for batch inserts), `ConfigModule`.
- [ ] `src/consumers/audit.consumer.ts` – `@Processor('audit')`. Receives individual audit events but does NOT insert immediately. Instead, pushes to in-memory batch buffer. Acknowledges job immediately (fire-and-forget for producers). Buffer flushed on: (1) buffer reaches `BATCH_SIZE` (100), or (2) `FLUSH_INTERVAL` (5s) timer fires, whichever comes first.
- [ ] `src/processors/audit-batch-insert.processor.ts` – `insertBatch(entries: AuditEntry[]): Promise<void>`. Uses Prisma `createMany()` for efficient bulk insert. Wraps in transaction. On failure: logs error, retries batch once, then writes to fallback file for manual recovery.
- [ ] `src/services/audit-worker.service.ts` – Manages batch lifecycle. `addToBuffer(entry)`. `flush(): Promise<void>`. Tracks: buffer size, total processed, last flush time. Emits metrics: `audit.entries_buffered`, `audit.batch_inserted`, `audit.flush_duration`.
- [ ] `src/services/batch-buffer.service.ts` – In-memory buffer with configurable max size. `add(item)`. `drain(): T[]` (returns and clears buffer). `size(): number`. Timer-based auto-flush via `setInterval`. Graceful shutdown: flushes remaining buffer before exit.
- [ ] `src/config/audit-worker.config.ts` – `BATCH_SIZE` (100), `FLUSH_INTERVAL_MS` (5000), `MAX_BUFFER_SIZE` (1000, backpressure), `FALLBACK_FILE_PATH` ('/tmp/audit-fallback.jsonl'), `RETRY_ON_FAILURE` (true).
- [ ] `src/interfaces/audit-job.interface.ts` – `AuditEntry { action, resourceType, resourceId, userId, dataBefore?, dataAfter?, ip, userAgent, impersonatedBy?, timestamp }`.
- [ ] `tests/` – Unit: buffer add/drain/flush, batch insert, timer-based flush, graceful shutdown. Integration: end-to-end audit event flow.

### 12.4 Media Worker (`workers/media-worker/`)
- [ ] `src/main.ts` – Bootstrap standalone. Connects to `media.queue`. Concurrency: 3 (media processing is CPU-intensive, limit parallelism).
- [ ] `src/app.module.ts` – Imports: `QueueModule.forConsumer('media')`, `StorageModule` (S3 access), `DatabaseModule` (update media status), `ConfigModule`. System dependencies: `sharp` (image processing), `fluent-ffmpeg` (video), `clamav.js` (virus scanning).
- [ ] `src/consumers/media.consumer.ts` – `@Processor('media')`. Routes by job type: `VIRUS_SCAN`, `IMAGE_PROCESS`, `VIDEO_PROCESS`, `DOCUMENT_PROCESS`, `THUMBNAIL_REGENERATE`. Processing pipeline (ordered): (1) virus scan → (2) type-specific processing → (3) metadata extraction → (4) status update. If virus detected at step 1: quarantine and stop. Updates media record status at each stage.
- [ ] `src/processors/`
  - [ ] `image-resize.processor.ts` – Resizes images using `sharp`. Generates configured variants: `thumb_150x150` (cover crop), `medium_800x600` (fit inside), `large_1920x1080` (fit inside). Input: original S3 key. Output: variant S3 keys. Preserves aspect ratio. Format: WebP for thumbnails, original format for larger sizes.
  - [ ] `image-compress.processor.ts` – Optimizes images. WebP conversion for browser-friendly output. Quality: 80 (configurable). Strips EXIF metadata (privacy). For PNG: lossless optimization. Max output: 2MB for thumbnails, 5MB for medium. Updates S3 with optimized version.
  - [ ] `thumbnail-generator.processor.ts` – Generates thumbnail for any media type. Images: `sharp.resize(300, 200, { fit: 'cover' }).webp()`. Videos: `ffmpeg` extracts frame at 1s or 25% duration. Documents (PDF): `pdf-thumbnail` or `pdf-poppler` for first page. Uploads thumbnail to S3. Updates media record `thumbnailKey`.
  - [ ] `video-transcode.processor.ts` – Video processing via `fluent-ffmpeg`. Generates: `preview_480p` (H.264, AAC, 480p, 1Mbps), `hd_720p` (H.264, AAC, 720p, 2.5Mbps). Extracts: duration, dimensions, codec info. Input from S3 stream, output to S3. Progress tracking via Redis pub/sub for UI.
  - [ ] `document-thumbnail.processor.ts` – PDF first-page thumbnail. Uses `pdf-poppler` or `pdfjs-dist` + `canvas`. Output: 300x400 WebP thumbnail. For non-PDF documents (docx, xlsx): generates generic file-type icon thumbnail.
  - [ ] `metadata-extractor.processor.ts` – Extracts metadata from all file types. Images: EXIF data (camera, GPS stripped for privacy, dimensions, colorSpace). Videos: duration, dimensions, codec, bitrate, framerate. Documents: page count, author, title. Updates media record `metadata` JSONB field.
  - [ ] `virus-scan.processor.ts` – ClamAV integration. `scanFile(s3Key): Promise<ScanResult>`. Downloads file from S3 to temp dir. Scans via ClamAV TCP socket (`clamd`). If CLEAN: proceeds with processing. If INFECTED: calls `quarantine.service` → moves to quarantine S3 prefix, creates QuarantinedFile record, notifies admin via notification queue, updates media status to QUARANTINED. Deletes temp file after scan. Timeout: 60s.
- [ ] `src/services/`
  - [ ] `media-worker.service.ts` – Orchestrates processing pipeline. `process(job): Promise<ProcessingResult>`. Sequential: scan → process → extract → update DB. Status transitions: `PENDING → PROCESSING → READY` (success) or `PENDING → PROCESSING → FAILED` (error) or `PENDING → QUARANTINED` (virus). Publishes status updates to Redis for real-time UI.
  - [ ] `image-processing.service.ts` – Sharp wrapper. `resize(input, width, height, fit): Promise<Buffer>`. `compress(input, format, quality): Promise<Buffer>`. `extractMetadata(input): Promise<ImageMetadata>`. Handles: JPEG, PNG, WebP, GIF (first frame), SVG (rasterize for thumbnail).
  - [ ] `video-processing.service.ts` – FFmpeg wrapper. `transcode(input, profile): Promise<string>`. `extractFrame(input, timeSeconds): Promise<Buffer>`. `getInfo(input): Promise<VideoMetadata>`. Profiles defined in config.
  - [ ] `cdn-invalidation-emitter.service.ts` – After processing public media (portfolio/blog context): publishes CDN invalidation event to `cdn.queue` with affected paths. Ensures CDN serves updated media.
- [ ] `src/config/media-worker.config.ts` – `CONCURRENCY` (3), `TEMP_DIR` ('/tmp/media-worker'), `CLAMAV_HOST`, `CLAMAV_PORT` (3310), `CLAMAV_TIMEOUT_MS` (60000), `IMAGE_VARIANTS: [{ name: 'thumb_150', width: 150, height: 150, fit: 'cover' }, { name: 'medium_800', width: 800, height: 600, fit: 'inside' }, { name: 'large_1920', width: 1920, height: 1080, fit: 'inside' }]`, `VIDEO_PROFILES`, `WEBP_QUALITY` (80), `MAX_PROCESSING_TIME_MS` (300000, 5min).
- [ ] `src/interfaces/media-job.interface.ts` – `MediaJob { type: MediaJobType, mediaId: string, s3Key: string, contentType: string, context: MediaContext, userId: string }`.
- [ ] `src/interfaces/processing-options.interface.ts` – `ImageVariant`, `VideoProfile`, `ProcessingPipelineResult`.
- [ ] `tests/` – Unit: sharp resize/compress, ffmpeg transcode (mocked), ClamAV scan (mocked), pipeline orchestration. Integration: fixture files (sample.jpg, sample.mp4, sample.pdf, eicar.com test virus file).

### 12.5 Analytics Worker (`workers/analytics-worker/`)
- [ ] `src/main.ts` – Bootstrap standalone. Connects to `analytics.queue`. Also runs cron-based scheduled aggregation jobs.
- [ ] `src/app.module.ts` – Imports: `QueueModule.forConsumer('analytics')`, `DatabaseModule`, `CacheModule` (Redis for storing aggregated results), `ScheduleModule` (cron triggers), `ConfigModule`.
- [ ] `src/consumers/analytics.consumer.ts` – `@Processor('analytics')`. Routes by job type: `USER_STATS`, `PROJECT_STATS`, `REVENUE_REPORT`, `PORTFOLIO_ANALYTICS`, `BLOG_ANALYTICS`, `ENGAGEMENT_METRICS`. Jobs triggered by: (1) cron schedule (hourly/daily), (2) on-demand admin request, (3) event-triggered recalculation.
- [ ] `src/processors/`
  - [ ] `user-analytics.processor.ts` – Aggregates: total users, new registrations (by day/week/month), active users (last 30d login), users by role, churn rate, average session duration. Stores results in Redis cache `analytics:users:<period>`. Queries users service DB views.
  - [ ] `project-analytics.processor.ts` – Aggregates: total projects by status, average completion time, on-time delivery rate, projects per category, revenue per project. Stored in `analytics:projects:<period>`.
  - [ ] `revenue-analytics.processor.ts` – Revenue reports: total revenue (MoM, QoQ, YoY), revenue by project category, average project value, payment method breakdown, refund rate. Queries payments table. Stored in `analytics:revenue:<period>`. Generates daily revenue snapshot.
  - [ ] `portfolio-analytics.processor.ts` – Portfolio metrics: views per item (deduplicated), likes, top items by engagement, traffic sources (referrer analysis), geographic distribution (IP geolocation). Aggregates from portfolio_views table.
  - [ ] `blog-analytics.processor.ts` – Blog metrics: post views, unique visitors, top posts, average reading time, comment engagement rate, search performance (top queries). Aggregates from post_views table.
  - [ ] `engagement-analytics.processor.ts` – Cross-service engagement: messages per project per day, average response time (admin to client), notification open/click rates, active hours distribution. Combined from messaging, notifications, and project data.
- [ ] `src/services/`
  - [ ] `analytics-worker.service.ts` – Orchestrates analytics jobs. `runAggregation(type, period): Promise<AggregationResult>`. Caches results with TTL. Provides `getLatest(type): Promise<any>` for admin dashboard.
  - [ ] `aggregation.service.ts` – SQL aggregation helpers. `aggregate(table, groupBy, metrics, filters): Promise<Record[]>`. Generates efficient GROUP BY queries. Uses read replica for heavy queries.
  - [ ] `report-generator.service.ts` – `generateReport(type, period, format): Promise<string>` (S3 URL). Generates CSV/PDF reports for admin download. For PDF: uses `pdfkit` or `puppeteer`. Report types: revenue summary, project status, user growth. Can trigger email delivery of report.
- [ ] `src/cron/` – Scheduled aggregation triggers:
  - [ ] `hourly-aggregation.cron.ts` – `@Cron('0 * * * *')`. Runs: portfolio views, blog views, engagement metrics.
  - [ ] `daily-aggregation.cron.ts` – `@Cron('0 2 * * *')`. Runs: all user stats, project stats, revenue daily snapshot.
  - [ ] `weekly-report.cron.ts` – `@Cron('0 3 * * 1')`. Generates weekly summary report. Optionally emails admin.
- [ ] `src/config/analytics-worker.config.ts` – `HOURLY_CRON` ('0 * * * *'), `DAILY_CRON` ('0 2 * * *'), `WEEKLY_CRON` ('0 3 * * 1'), `CACHE_TTL_HOURLY` (3600), `CACHE_TTL_DAILY` (86400), `USE_READ_REPLICA` (true), `REPORT_S3_BUCKET`.
- [ ] `src/interfaces/analytics-job.interface.ts` – `AnalyticsJob { type: AnalyticsJobType, period: Period, from?: Date, to?: Date, format?: ExportFormat }`.
- [ ] `src/interfaces/aggregation-result.interface.ts` – `AggregationResult { type, period, data: Record<string, any>, generatedAt, cachedUntil }`.
- [ ] `tests/` – Unit: aggregation queries, cache storage, cron scheduling. Integration: end-to-end aggregation with sample data.

### 12.6 Webhook Worker (`workers/webhook-worker/`)
- [ ] `src/main.ts` – Bootstrap standalone. Connects to `webhook.queue` (for outgoing webhook delivery, not ingestion). Also connects to `payments.webhook.queue`, `*.webhook.queue` for processing incoming webhook events dispatched by webhooks-ingestion service.
- [ ] `src/app.module.ts` – Imports: `QueueModule.forConsumer(['webhook', 'payments.webhook'])`, `DatabaseModule`, `HttpModule` (for outgoing HTTP calls), `ConfigModule`.
- [ ] `src/consumers/webhook.consumer.ts` – Two consumers: (1) Outgoing webhook delivery: receives events from admin-configured webhooks, delivers via HTTP POST. (2) Incoming webhook processing: receives dispatched events from webhooks-ingestion service, routes to event-specific handlers.
- [ ] `src/processors/`
  - [ ] `outgoing-webhook.processor.ts` – Delivers outgoing webhooks. `deliver(webhookConfig, event, payload): Promise<DeliveryResult>`. Signs payload with HMAC-SHA256 using webhook secret. Sets headers: `X-Webhook-Signature`, `X-Webhook-Event`, `X-Webhook-Delivery-ID`, `Content-Type: application/json`. HTTP POST with 10s timeout. Records: statusCode, responseBody, responseTime in webhook_delivery. On failure: retries with exponential backoff (10s, 30s, 90s, 270s, 810s, max 5).
  - [ ] `razorpay-webhook.processor.ts` – Processes dispatched Razorpay events. Routes to appropriate handler based on event type. Updates IncomingWebhook status to PROCESSED on success.
  - [ ] `github-webhook.processor.ts` – Processes GitHub events (if CI/CD integration). Routes push, pull_request, deployment events to handlers.
  - [ ] `generic-webhook.processor.ts` – Fallback processor for unrecognized providers. Logs and stores for manual review.
- [ ] `src/handlers/` – Event-specific business logic handlers:
  - [ ] `razorpay/payment-captured.handler.ts` – `handle(payload): Promise<void>`. Finds Payment record by `razorpayPaymentId`. Updates status to CAPTURED. Updates Invoice status. Publishes `payment.completed` event to notification queue. Idempotent: checks current status before updating.
  - [ ] `razorpay/payment-failed.handler.ts` – Updates payment status to FAILED. Records failure reason. Publishes `payment.failed` notification. May trigger retry payment flow if configured.
  - [ ] `razorpay/refund-processed.handler.ts` – Updates Refund record status to PROCESSED. Updates original Payment `refundedAmount`. If full refund: updates Invoice status. Publishes `refund.completed` notification.
  - [ ] `razorpay/dispute-created.handler.ts` – Creates Dispute record linked to Payment. Updates payment status to DISPUTED. Notifies admin immediately (high priority). Records dispute details: reason, amount, deadline.
  - [ ] `github/push.handler.ts` – Records push event for deployment tracking (if applicable). Logs commit info.
  - [ ] `github/pull-request.handler.ts` – Records PR events for CI/CD dashboard (if applicable).
  - [ ] `github/deployment.handler.ts` – Records deployment status changes. Updates internal deployment tracking.
- [ ] `src/services/`
  - [ ] `webhook-worker.service.ts` – `dispatch(event): Promise<void>`. Routes to correct handler based on `provider` + `eventType`. Handler registry pattern.
  - [ ] `signature-verifier.service.ts` – Outgoing: `sign(payload, secret): string`. HMAC-SHA256. Incoming: signature already verified by ingestion service, this worker trusts dispatched events.
  - [ ] `webhook-logger.service.ts` – `logDelivery(webhookId, deliveryResult): Promise<void>`. Records outgoing delivery attempts and results.
- [ ] `src/config/webhook-worker.config.ts` – `OUTGOING_TIMEOUT_MS` (10000), `MAX_RETRIES` (5), `BACKOFF_BASE_SECONDS` (10), `BACKOFF_MULTIPLIER` (3).
- [ ] `src/interfaces/webhook-job.interface.ts` – `OutgoingWebhookJob { webhookId, event, payload, attempt }`, `IncomingWebhookJob { provider, eventType, eventId, payload, incomingWebhookId }`.
- [ ] `src/interfaces/webhook-handler.interface.ts` – `WebhookHandler { canHandle(provider, eventType): boolean, handle(payload): Promise<void> }`.
- [ ] `tests/` – Unit: handler routing, HMAC signing, retry logic. Fixtures: sample Razorpay webhook payloads for each event type.

### 12.7 CDN Worker (`workers/cdn-worker/`)
- [ ] `src/main.ts` – Bootstrap standalone. Connects to `cdn.queue`. Concurrency: 2. This worker batches cache invalidation requests to avoid exceeding CDN provider rate limits.
- [ ] `src/app.module.ts` – Imports: `QueueModule.forConsumer('cdn')`, `HttpModule`, `ConfigModule`. Provider SDK: `@cloudflare/cloudflare` (Cloudflare API).
- [ ] `src/consumers/cdn.consumer.ts` – `@Processor('cdn')`. Routes by job type: `INVALIDATE_PATH`, `INVALIDATE_BATCH`, `PURGE_ALL`. Individual path invalidations are collected by batch-collector and processed in bulk every 10s (Cloudflare allows 30 paths per purge request).
- [ ] `src/processors/`
  - [ ] `path-invalidation.processor.ts` – Receives single path invalidation. Adds to batch collector. Does not call CDN API directly (deferred to batch processor). Paths: `/api/v1/portfolio/:slug`, `/api/v1/blog/posts/:slug`, media URLs.
  - [ ] `batch-invalidation.processor.ts` – Processes collected batch of paths. Calls CDN API with array of URLs. Cloudflare: `POST /zones/:zoneId/purge_cache { files: [...urls] }`. AWS CloudFront: `createInvalidation({ Paths: [...paths] })`. Logs: purge request ID, paths count, response time. Retry on 429 (rate limit) with backoff.
- [ ] `src/services/`
  - [ ] `cdn-worker.service.ts` – Orchestrates invalidation. `invalidatePath(path)`. `invalidateBatch(paths)`. `purgeAll()`. Selects provider based on config.
  - [ ] `cloudfront-invalidation.service.ts` – AWS CloudFront integration. `invalidate(paths): Promise<InvalidationResult>`. Uses AWS SDK v3 `CloudFrontClient`. Creates invalidation with caller reference (timestamp). Monitors invalidation completion status.
  - [ ] `cloudflare-invalidation.service.ts` – Cloudflare CDN integration. `purgePaths(paths): Promise<PurgeResult>`. Uses Cloudflare API v4. `POST /zones/:zoneId/purge_cache`. Max 30 files per request. Splits larger batches into multiple API calls. API Token with `Zone.Cache Purge` permission.
  - [ ] `batch-collector.service.ts` – Collects individual paths over time window. `add(path)`. `drain(): string[]`. Timer-based flush every 10s. Deduplicates paths. Max batch: 30 paths (Cloudflare limit). Overflow → immediate secondary batch.
- [ ] `src/config/cdn-worker.config.ts` – `CDN_PROVIDER` ('cloudflare'|'cloudfront'), `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `AWS_CLOUDFRONT_DISTRIBUTION_ID`, `BATCH_WINDOW_MS` (10000), `MAX_BATCH_SIZE` (30), `RETRY_ON_RATE_LIMIT` (true).
- [ ] `src/interfaces/cdn-job.interface.ts` – `CdnJob { type: 'INVALIDATE_PATH'|'INVALIDATE_BATCH'|'PURGE_ALL', paths?: string[] }`.
- [ ] `src/interfaces/cdn-provider.interface.ts` – `CdnProvider { invalidate(paths: string[]): Promise<InvalidationResult>, purgeAll(): Promise<void> }`.
- [ ] `tests/` – Unit: batch collection, deduplication, provider API calls (mocked), rate limit retry. Integration: end-to-end invalidation flow.

### 12.8 Outbox Poller Worker (`workers/outbox-poller/`)
- [ ] `src/main.ts` – Bootstrap standalone. No queue consumer – this worker is a **polling-based** service that reads from the `OutboxEvent` database table and publishes to RabbitMQ. Runs as single instance (leader election via Redis lock to prevent duplicates in multi-replica deployments).
- [ ] `src/app.module.ts` – Imports: `DatabaseModule` (reads outbox table), `QueueModule.forProducer()` (publishes to RabbitMQ exchanges), `RedisModule` (leader election lock), `ScheduleModule` (polling interval), `ConfigModule`.
- [ ] `src/services/outbox-poller.service.ts` – Core polling loop. `@Cron('*/2 * * * * *')` (every 2 seconds). Algorithm: (1) acquire Redis lock `outbox:poller:lock` (TTL 10s), (2) query `OutboxEvent WHERE status = 'PENDING' ORDER BY createdAt LIMIT 100`, (3) for each event: publish to RabbitMQ exchange (event type → exchange routing), (4) update status to `PUBLISHED` in batch, (5) release lock. On failure: event remains PENDING for next poll. Events older than 1h → status STALE (alerts admin). Metrics: events polled, published, stale count.
- [ ] `src/services/outbox-publisher.service.ts` – `publish(event: OutboxEvent): Promise<void>`. Maps event type to RabbitMQ exchange and routing key. Exchange mapping: `payment.*` → `payments.exchange`, `notification.*` → `notifications.exchange`, `email.*` → `email.exchange`, `message.*` → `messaging.exchange`, `media.*` → `media.exchange`, `cdn.*` → `cdn.exchange`. Publishes with: persistent delivery mode, message ID (outbox event ID for deduplication), timestamp.
- [ ] `src/services/leader-election.service.ts` – Redis-based leader election. `acquireLock(): Promise<boolean>`. Uses `SET outbox:poller:lock <instanceId> NX EX 10`. Only leader instance polls. Lock auto-expires if leader crashes. Re-acquired by next instance.
- [ ] `src/services/stale-event-monitor.service.ts` – `@Cron('0 */5 * * * *')` (every 5 min). Checks for PENDING events older than `STALE_THRESHOLD_MINUTES`. Marks as STALE. Publishes admin alert. These events may indicate a processing issue or dead service.
- [ ] `src/config/outbox-poller.config.ts` – `POLLING_INTERVAL_MS` (2000), `BATCH_SIZE` (100), `LOCK_TTL_SECONDS` (10), `STALE_THRESHOLD_MINUTES` (60), `LEADER_LOCK_KEY` ('outbox:poller:lock'), `INSTANCE_ID` (generated UUID on startup).
- [ ] `src/interfaces/outbox-event.interface.ts` – `OutboxEvent { id, aggregateType, aggregateId, eventType, payload (JSONB), status (PENDING/PUBLISHED/STALE/FAILED), attempts, createdAt, publishedAt }`. Maps to Prisma `OutboxEvent` model defined in shared database schema.
- [ ] `tests/unit/` – Polling logic, leader election, exchange routing, stale detection.
- [ ] `tests/e2e/outbox-poller.e2e-spec.ts` – Full flow: insert outbox event → poller picks up → publishes to RabbitMQ → verify message received by consumer.
- [ ] `package.json`, `tsconfig.json`, `nest-cli.json`, `Dockerfile`, `infisical.json`, `.eslintrc.js`, `.prettierrc`, `README.md`

---

## 13. Final Verification

- [ ] **Independent Service Startup** – Each of the 16 microservices and 8 workers starts independently without errors. Verify: `docker compose up <service-name>` for each. Health endpoint returns `{ status: 'ok' }`. No unresolved dependency injection errors.
- [ ] **Shared Library Integration** – All 24 shared libraries compile and are correctly imported. Verify: `npx nx run-many --target=build --projects=libs/*`. No circular dependency warnings.
- [ ] **Database Schema** – Prisma schema validates and generates client without errors. Verify: `npx prisma validate`, `npx prisma generate`, `npx prisma migrate deploy` against test database. All indexes, constraints, and relations correct.
- [ ] **Full Test Suite** – Unit tests pass across all packages. Verify: `npx nx run-many --target=test --all`. Target: >80% coverage on services and shared libs. E2E tests pass with test database and mocked external services (S3, Razorpay, ClamAV, SMTP).
- [ ] **Docker Build** – All Docker images build successfully. Verify: `docker compose build`. No build errors. Image sizes reasonable (target <300MB per service with multi-stage build). Health checks configured in Dockerfiles.
- [ ] **Docker Compose Up** – Full stack starts via `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`. All services healthy. Inter-service communication works (API gateway routes to microservices). RabbitMQ queues created. Redis connected.
- [ ] **API Gateway Routing** – All endpoint routes proxy correctly from API gateway to microservices. Verify: Postman/curl tests against gateway port. Rate limiting active. CORS configured. Helmet security headers present.
- [ ] **WebSocket Gateway** – WebSocket connections establish successfully. Authentication via token. Room joining works. Real-time message delivery verified. Heartbeat/ping-pong active.
- [ ] **Worker Processing** – All workers consume from correct queues. Verify: publish test messages to each queue, verify processing. Email worker sends test email. Notification worker creates in-app notification. Media worker processes test image.
- [ ] **Outbox Pattern** – Events written to outbox table by services are polled and published by outbox-poller. Verify end-to-end: create project → outbox event → poller publishes → notification worker creates notification.
- [ ] **Performance/Load Tests** – API endpoints respond within SLA: p95 < 200ms for reads, p95 < 500ms for writes. Verify: `k6` or `artillery` load tests against staging. Database queries optimized (no N+1, indexes used). Redis caching reduces DB load.
- [ ] **Security Audit** – JWT tokens validated correctly. Refresh token rotation works. Rate limiting prevents brute force. RBAC enforces admin-only endpoints. Helmet headers set. CORS restricted to allowed origins. SQL injection prevented by Prisma. XSS prevented by input validation.
- [ ] **Documentation Sync** – All implementation changes reflected in endpoint docs, architecture docs, and this tracker. API versions match. README files accurate.
- [ ] **CI/CD Pipeline** – GitHub Actions workflows pass: lint, test, build, Docker push. Staging deployment succeeds via CD pipeline.
- [ ] **Create Release Tag** – `git tag v1.0.0` with changelog summarizing all implemented features, services, and endpoints.

---

**End of Project Tracker** – This checklist covers **every file, module, and endpoint** defined in the design documents.  
Use it to track progress, assign tasks, and ensure nothing is overlooked.
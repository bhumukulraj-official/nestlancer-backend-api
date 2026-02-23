# System Architecture Overview

## Introduction

Nestlancer is a freelancing platform backend built as a **NestJS monorepo**. It consists of an API Gateway, a WebSocket Gateway, 16 microservices, 8 asynchronous workers, and 24 shared libraries.

## High-Level Architecture

```
Client → Cloudflare (CDN / Turnstile CAPTCHA)
  → Nginx (TLS termination / Rate limiting)
    → API Gateway (Auth / RBAC / Validation / Routing)
      → [Microservice] → PostgreSQL / Redis
        → Outbox Event → RabbitMQ → [Worker]
```

## Components

### Entry Layer

| Component | Port | Description |
|-----------|------|-------------|
| **Nginx** | 80/443 | TLS termination, rate limiting, static asset serving, reverse proxy |
| **API Gateway** | 3000 | Authentication, RBAC, validation, request routing to services |
| **WebSocket Gateway** | 3001 | Real-time messaging and notifications via Socket.IO |

### Middleware Pipeline (API Gateway)

All requests pass through this ordered middleware pipeline:

1. **CORS Middleware** – Cross-origin request handling
2. **Request Tracer** – Generates/forwards `X-Correlation-ID`
3. **JWT Auth Guard** – Token validation (skipped for `@Public()` routes)
4. **Rate Limiter** – Per-tier rate limiting (anonymous: 30/min, authenticated: 100/min, admin: 300/min)
5. **Validation Pipe** – DTO validation via `class-validator`
6. **CSRF Guard** – Double-submit cookie pattern for web clients

### Microservices (16)

| Service | Port | Description |
|---------|------|-------------|
| Health | 3010 | System health checks and readiness probes |
| Auth | 3011 | Authentication, JWT, 2FA, sessions |
| Users | 3012 | User profiles, preferences, sessions |
| Requests | 3013 | Service request management |
| Quotes | 3014 | Quote/proposal generation and acceptance |
| Projects | 3015 | Project lifecycle management |
| Progress | 3016 | Milestones, deliverables, progress tracking |
| Payments | 3017 | Razorpay integration, payment processing |
| Messaging | 3018 | Real-time messaging via conversations |
| Notifications | 3019 | Multi-channel notification delivery |
| Media | 3020 | File upload, processing, CDN integration |
| Portfolio | 3021 | Public portfolio showcase |
| Blog | 3022 | Blog posts, comments, categories |
| Contact | 3023 | Contact form submissions |
| Admin | 3024 | System administration, config, audit |
| Webhooks | 3025 | Inbound/outbound webhook management |

### Async Workers (8)

| Worker | Queue | Description |
|--------|-------|-------------|
| Email Worker | `email.queue` | Sends transactional emails via ZeptoMail/SES |
| Notification Worker | `notification.queue` | Sends push notifications, SMS, in-app |
| Audit Worker | `audit.queue` | Batch-inserts audit logs to PostgreSQL |
| Media Worker | `media.queue` | Image resize, video transcode, virus scan |
| Analytics Worker | `analytics.queue` | Aggregates view counts, statistics |
| Webhook Worker | `webhook.queue` | Processes inbound/outbound webhooks |
| CDN Worker | `cdn.queue` | CloudFront/Cloudflare cache invalidation |
| Outbox Poller | – | Polls outbox table, publishes to RabbitMQ |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **PostgreSQL 16** | Primary + Read Replicas | Persistent data storage (R/W split via Patroni) |
| **Redis 7 (Cache)** | Port 6379 | Application caching with LRU eviction |
| **Redis 7 (Pub/Sub)** | Port 6380 | WebSocket cross-instance communication |
| **RabbitMQ 3.13** | Port 5672 | Event bus for async processing |
| **S3-Compatible** | – | File storage (private + public buckets) |
| **CloudFront/Cloudflare** | – | CDN for public assets |

## Key Architectural Decisions

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | pnpm + Turborepo monorepo | Shared code, single CI pipeline, atomic refactors |
| ADR-002 | PostgreSQL with read replicas | ACID for payments, JSONB for metadata, Prisma support |
| ADR-003 | JWT + refresh token rotation | 15min access / 7d refresh, dual delivery (cookie + Bearer) |
| ADR-004 | Transactional outbox pattern | At-least-once delivery, no dual-write problem |
| ADR-005 | Read/write split | `PrismaWriteService` for mutations, `PrismaReadService` for queries |
| ADR-006 | RabbitMQ topic exchange | Flexible routing, dead-letter queues, publisher confirms |
| ADR-007 | Idempotency keys | Redis + PostgreSQL, 24h TTL, prevents duplicate payments |
| ADR-008 | Tag-based cache invalidation | Entity-specific TTLs, Redis sets for tag→key mapping |

## Request Flow Example

### Project Lifecycle

```
1. Client submits service request → POST /api/v1/requests
2. Admin reviews request → PATCH /api/v1/requests/:id/status
3. Admin sends quote → POST /api/v1/quotes
4. Client accepts quote → POST /api/v1/quotes/:id/accept
5. Project created automatically → Project + Milestones + Payment Schedule
6. Admin tracks progress → POST /api/v1/progress/:projectId/entries
7. Deliverables uploaded → POST /api/v1/progress/:projectId/deliverables
8. Client approves milestone → POST /api/v1/progress/:projectId/milestones/:id/approve
9. Payment processed → POST /api/v1/payments/intents → Razorpay → Webhook
10. Project completed → PATCH /api/v1/projects/:id/status
```

## Deployment

- **Container orchestration**: Kubernetes (EKS)
- **Infrastructure as Code**: Terraform (AWS)
- **CI/CD**: GitHub Actions (lint → test → build → deploy)
- **Environments**: Development → Staging → Production
- **Monitoring**: Prometheus + Grafana + Jaeger + Alertmanager

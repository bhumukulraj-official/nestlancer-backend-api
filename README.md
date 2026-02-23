# 🚀 Nestlancer Backend API

[![CI](https://github.com/nestlancer/backend-api/actions/workflows/ci.yml/badge.svg)](https://github.com/nestlancer/backend-api/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

**Nestlancer** is a production-ready freelancing platform backend built as a NestJS monorepo. It provides a comprehensive solution for managing service requests, quotes, projects, progress tracking, payments, messaging, and more.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Available Commands](#-available-commands)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗 Architecture

```
Client → Cloudflare (CDN/Turnstile) → Nginx (TLS/Rate-limit)
  → API Gateway (Auth/RBAC/Validation) → [Service] → PostgreSQL/Redis
  → Outbox Event → RabbitMQ → [Worker]
```

The backend consists of:

- **1 API Gateway** – Routes, authenticates, and rate-limits all requests
- **1 WebSocket Gateway** – Real-time messaging and notifications
- **16 NestJS Microservices** – Health, Auth, Users, Requests, Quotes, Projects, Progress, Payments, Messaging, Notifications, Media, Portfolio, Blog, Contact, Admin, Webhooks
- **8 RabbitMQ Workers** – Email, Notification, Audit, Media, Analytics, Webhook, CDN, Outbox Poller
- **24 Shared Libraries** – Common utilities, config, database, cache, queue, auth, logging, metrics, tracing, and more

For detailed architecture documentation, see [`docs/architecture/`](docs/architecture/).

---

## 🧰 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js 20 (LTS) |
| **Framework** | NestJS 10.x |
| **Language** | TypeScript 5.x (strict mode) |
| **ORM** | Prisma 5.x |
| **Database** | PostgreSQL 16 (primary + read replicas) |
| **Cache** | Redis 7 (cache + pub/sub) |
| **Queue** | RabbitMQ 3.13 |
| **Auth** | JWT (RS256/HS256), bcrypt, TOTP 2FA |
| **Storage** | S3-compatible (Backblaze B2) |
| **CDN** | Cloudflare |
| **Payments** | Razorpay (INR, amounts in paise) |
| **Email** | ZeptoMail (transactional) + AWS SES (bulk) |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Testing** | Jest 29.x + Supertest |
| **Container** | Docker + Kubernetes |
| **IaC** | Terraform |
| **CI/CD** | GitHub Actions |

---

## ⚡ Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org/) (or use `nvm use`)
- [pnpm 9+](https://pnpm.io/installation) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Compose

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/nestlancer/backend-api.git
cd backend-api

# 2. Install dependencies
make install
# or: pnpm install && pnpm db:generate

# 3. Start infrastructure services (PostgreSQL, Redis, RabbitMQ, MailHog)
make dev-services
# or: docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 4. Run database migrations and seed
make db-migrate
make db-seed

# 5. Start all services in dev mode
make dev
# or: pnpm dev
```

### Verify

```bash
# API Health Check
curl http://localhost:3000/api/v1/health

# RabbitMQ Management UI
open http://localhost:15672  # guest/guest

# MailHog Web UI
open http://localhost:8025
```

---

## 📁 Project Structure

```
├── gateway/              # API Gateway (port 3000)
├── ws-gateway/           # WebSocket Gateway (port 3001)
├── services/             # 16 NestJS microservices
│   ├── auth/
│   ├── users/
│   ├── requests/
│   ├── quotes/
│   ├── projects/
│   ├── progress/
│   ├── payments/
│   ├── messaging/
│   ├── notifications/
│   ├── media/
│   ├── portfolio/
│   ├── blog/
│   ├── contact/
│   ├── admin/
│   ├── webhooks/
│   └── health/
├── workers/              # 8 RabbitMQ workers
├── libs/                 # 24 shared libraries
├── prisma/               # Database schema, migrations, seeds
├── docker/               # Dockerfiles, Nginx, monitoring
├── deploy/               # Kubernetes manifests, Terraform
├── scripts/              # Setup, DB, Docker, deploy, dev scripts
├── docs/                 # API docs, architecture, ADRs, guides
└── reference-docs/       # Specification documents
```

---

## 🛠 Available Commands

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies + generate Prisma client |
| `make dev` | Start Docker services + run all apps in dev mode |
| `make dev-services` | Start only infrastructure services |
| `make build` | Build all packages |
| `make test` | Run full test suite |
| `make test-unit` | Run unit tests only |
| `make lint` | Run ESLint across all packages |
| `make format` | Format code with Prettier |
| `make db-migrate` | Run database migrations |
| `make db-seed` | Seed the database |
| `make db-reset` | Reset database (drop + migrate + seed) |
| `make docker-up` | Start Docker infrastructure |
| `make docker-down` | Stop Docker infrastructure |
| `make clean` | Remove build artifacts and node_modules |
| `make help` | Show all available commands |

---

## 📖 API Documentation

- **OpenAPI Spec**: [`docs/api/openapi.yaml`](docs/api/openapi.yaml)
- **Swagger UI**: `http://localhost:3000/api/docs` (when gateway is running)
- **Postman Collection**: [`docs/api/postman-collection.json`](docs/api/postman-collection.json)
- **Endpoint Reference**: [`docs/api/endpoints-reference.md`](docs/api/endpoints-reference.md)

All API responses follow the standard envelope format. See [`reference-docs/100-api-standards-endpoints.md`](reference-docs/100-api-standards-endpoints.md) for full specifications.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m 'feat(auth): add 2FA support'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix a bug
docs(scope): update documentation
refactor(scope): refactor code
test(scope): add or update tests
chore(scope): maintenance tasks
ci(scope): CI/CD changes
perf(scope): performance improvement
```

### Coding Standards

- **Files**: `kebab-case.type.ts` (e.g., `create-request.dto.ts`)
- **Classes**: `PascalCase` (e.g., `AuthService`)
- **Methods**: `camelCase` (e.g., `findById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGINATION_LIMIT`)
- **Currency**: INR only, amounts in paise (smallest unit)
- **Dates**: ISO 8601 UTC

See [`docs/guides/coding-standards.md`](docs/guides/coding-standards.md) for full details.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ using <a href="https://nestjs.com/">NestJS</a></p>

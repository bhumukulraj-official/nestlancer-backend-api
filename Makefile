# ──────────────────────────────────────────────────
# Nestlancer Backend – Developer Makefile
# ──────────────────────────────────────────────────

.PHONY: install dev build test test-unit test-e2e test-integration lint format \
        db-migrate db-migrate-deploy db-seed db-reset db-studio \
        docker-up docker-down docker-up-full docker-test docker-build docker-push clean help

# ─── Dependencies ──────────────────────────────────

install: ## Install dependencies + generate Prisma client
	pnpm install
	pnpm db:generate

# ─── Development ───────────────────────────────────

dev: ## Start Docker services + run all apps in dev mode
	docker compose -f docker-compose.yml up -d
	pnpm dev

dev-services: ## Start only infrastructure services (MailHog, MinIO, Jaeger)
	docker compose -f docker-compose.yml up -d

dev-full: ## Start all infra including MinIO and Jaeger
	docker compose -f docker-compose.yml --profile full up -d

# ─── Build ─────────────────────────────────────────

build: ## Build all packages (topological order via Turborepo)
	pnpm build

# ─── Testing ───────────────────────────────────────

test: ## Run full test suite
	pnpm test

test-unit: ## Run unit tests only
	pnpm test:unit

test-e2e: ## Run end-to-end tests (requires Docker services)
	pnpm test:e2e

test-integration: ## Run integration tests (requires Docker services)
	pnpm test:integration

test-cov: ## Run tests with coverage report
	pnpm test:cov

# ─── Code Quality ──────────────────────────────────

lint: ## Run ESLint across all packages
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

format: ## Format code with Prettier
	pnpm format

format-check: ## Check formatting (CI)
	pnpm format:check

# ─── Database ──────────────────────────────────────

db-migrate: ## Run Prisma migrations (dev mode – creates migration files)
	pnpm db:migrate

db-migrate-deploy: ## Apply pending migrations (staging/production)
	pnpm db:migrate:deploy

db-seed: ## Seed the database
	pnpm db:seed

db-reset: ## Reset database (drop + recreate + migrate + seed)
	pnpm db:reset

db-generate: ## Generate Prisma client
	pnpm db:generate

db-studio: ## Open Prisma Studio
	pnpm db:studio

# ─── Docker ────────────────────────────────────────

docker-up: ## Start infrastructure services for development
	docker compose -f docker-compose.yml up -d

docker-down: ## Stop all Docker services
	docker compose -f docker-compose.yml down

docker-up-full: ## Start all services including MinIO and Jaeger
	docker compose -f docker-compose.yml --profile full up -d

docker-test: ## Start test infrastructure
	docker compose -f docker-compose.yml up -d

docker-test-down: ## Stop test infrastructure
	docker compose -f docker-compose.yml down -v

docker-build: ## Build all Docker images
	bash scripts/docker/build-all.sh

docker-push: ## Push all Docker images to registry
	bash scripts/docker/push-all.sh

docker-clean: ## Clean up Docker resources
	bash scripts/docker/clean.sh

# ─── Logs ──────────────────────────────────────────

logs: ## Tail logs from all Docker containers
	docker compose logs -f --tail=100

logs-service: ## Tail logs for a specific service (usage: make logs-service SERVICE=postgres)
	docker compose logs -f --tail=100 $(SERVICE)

# ─── Cleanup ───────────────────────────────────────

clean: ## Remove dist, coverage, node_modules, and Turborepo cache
	pnpm clean
	rm -rf node_modules
	rm -rf coverage
	rm -rf .turbo

# ─── Help ──────────────────────────────────────────

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

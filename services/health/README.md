# Nestlancer Health Service

The Health Service is responsible for monitoring the health and availability of all infrastructure components, services, and workers in the Nestlancer ecosystem. It exposes public health endpoints and protected admin endpoints for deep diagnostics.

## Endpoints
- `GET /api/v1/health` - Aggregated system health
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe
- `GET /api/v1/health/database` - Database health
- `GET /api/v1/health/cache` - Cache health
- `GET /api/v1/health/queue` - Queue health
- `GET /api/v1/health/debug` - Detailed admin diagnostics

## Setup
```bash
# Install dependencies
pnpm install

# Run locally
pnpm run start:dev

# Run tests
pnpm test
```

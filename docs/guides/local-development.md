# Local Development Guide

## Docker Service Management

### Start infrastructure only

```bash
scripts/dev/start-services.sh
# Starts: PostgreSQL, Redis (cache + pubsub), RabbitMQ, Mailpit
```

### Start with full observability stack

```bash
scripts/dev/start-services.sh --full
# Also starts: MinIO (S3 mock), Jaeger (tracing)
```

### Stop services

```bash
docker compose down
```

## Running Individual Services

```bash
# Run a specific service
pnpm --filter @nestlancer/auth dev

# Run the API gateway
pnpm --filter @nestlancer/gateway dev

# Run multiple services
pnpm turbo dev --filter=@nestlancer/auth --filter=@nestlancer/gateway
```

## Debugging with VS Code

1. Start a service with debug port:

   ```bash
   NODE_OPTIONS='--inspect=0.0.0.0:9229' pnpm --filter @nestlancer/auth dev
   ```

2. Attach VS Code debugger using `.vscode/launch.json`:
   ```json
   {
     "type": "node",
     "request": "attach",
     "name": "Attach to Service",
     "port": 9229,
     "restart": true,
     "sourceMaps": true
   }
   ```

## Database

### Run migrations

```bash
pnpm prisma migrate dev
```

### Seed data

```bash
pnpm db:seed
```

### View data

```bash
pnpm prisma studio
```

### Reset database

```bash
pnpm prisma migrate reset
```

## Logs

### Watch all service logs

```bash
scripts/dev/watch-logs.sh
```

### Filter by service

```bash
scripts/dev/watch-logs.sh --service=auth
```

## WebSocket Testing

```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c "ws://localhost:3001/ws/messages?token=YOUR_JWT_TOKEN"
```

## Hot Reload

All services use NestJS hot-reload (`nest start --watch`). Changes to `.ts` files trigger automatic restart.

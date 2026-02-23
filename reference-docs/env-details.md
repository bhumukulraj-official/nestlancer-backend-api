# Environment Variables Reference

This document lists all environment variables required across the Nestlancer monorepo. Variables are grouped by functionality, with descriptions, example values, and notes on where they are used. Use this as a template for your `.env` file (or `infisical.json` if using Infisical).

---

## 1. General

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` / `staging` / `production` |
| `PORT` | Port on which the service runs (overridden per service) | `3000` |
| `APP_NAME` | Application name | `Nestlancer` |
| `API_VERSION` | Default API version | `v1` |
| `LOG_LEVEL` | Logging level | `debug` / `info` / `warn` / `error` |
| `LOG_FORMAT` | Log output format | `json` (prod) / `pretty` (dev) |
| `LOG_OUTPUT` | Where to write logs | `console` / `file` |
| `LOG_FILE_PATH` | Path to log file (if `LOG_OUTPUT=file`) | `./logs/app.log` |
| `LOG_MAX_SIZE` | Max size per log file before rotation | `10m` |
| `LOG_MAX_FILES` | Number of rotated log files to keep | `7` |
| `CORRELATION_ID_HEADER` | Header name for correlation ID | `X-Request-ID` |
| `FRONTEND_URL` | Base URL of the frontend application | `https://yourdomain.com` |

---

## 2. Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Primary PostgreSQL connection string (for writes) | `postgresql://user:pass@primary-host:5432/db` |
| `DATABASE_READ_URL` | Read replica connection string (for reads) | `postgresql://user:pass@replica-host:5432/db` |
| `DATABASE_POOL_MIN` | Minimum pool size | `2` |
| `DATABASE_POOL_MAX` | Maximum pool size | `20` |
| `DATABASE_IDLE_TIMEOUT` | Idle connection timeout (ms) | `10000` |
| `DATABASE_CONNECTION_TIMEOUT` | Connection timeout (ms) | `5000` |

---

## 3. Redis

Two dedicated Redis instances are used: one for caching/rate‑limiting/idempotency, and one for pub/sub (WebSocket scaling).

### 3.1 Redis Cache

| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_CACHE_URL` | Redis connection URL for cache | `redis://:password@cache-host:6379/0` |
| `REDIS_CACHE_TTL_DEFAULT` | Default TTL for cache entries (seconds) | `300` |
| `REDIS_CACHE_MAX_ITEMS` | Max items (if using LRU) | `10000` |

### 3.2 Redis Pub/Sub

| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_PUBSUB_URL` | Redis connection URL for pub/sub | `redis://:password@pubsub-host:6379/1` |

---

## 4. RabbitMQ

| Variable | Description | Example |
|----------|-------------|---------|
| `RABBITMQ_URL` | AMQP connection string | `amqp://user:pass@rabbitmq-host:5672` |
| `RABBITMQ_EXCHANGE_EVENTS` | Name of the events exchange | `events` |
| `RABBITMQ_EXCHANGE_WEBHOOKS` | Name of the webhooks exchange | `webhooks` |
| `RABBITMQ_PREFETCH` | Consumer prefetch count | `10` |
| `RABBITMQ_RETRY_DELAY` | Delay between retries (ms) | `5000` |
| `RABBITMQ_MAX_RETRIES` | Max delivery attempts before DLQ | `3` |

---

## 5. Authentication & Security

### 5.1 JWT

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | `a-very-long-random-string` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | `another-long-random-string` |
| `JWT_ACCESS_EXPIRATION` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime | `30d` |
| `JWT_ISSUER` | JWT issuer claim | `yourdomain.com` |
| `JWT_AUDIENCE` | JWT audience claim | `yourdomain.com` |

### 5.2 CSRF

| Variable | Description | Example |
|----------|-------------|---------|
| `CSRF_SECRET` | Secret used to sign CSRF tokens | `csrf-secret-key` |
| `CSRF_COOKIE_NAME` | Name of the CSRF cookie | `_csrf` |
| `CSRF_HEADER_NAME` | Header containing the CSRF token | `X-CSRF-Token` |

### 5.3 Turnstile (Cloudflare)

| Variable | Description | Example |
|----------|-------------|---------|
| `TURNSTILE_SITE_KEY` | Site key for client‑side Turnstile | `0x4AAAAAA...` |
| `TURNSTILE_SECRET_KEY` | Secret key for server‑side verification | `0x4AAAAAA...` |

### 5.4 API Keys

| Variable | Description | Example |
|----------|-------------|---------|
| `API_KEY_SALT` | Salt for hashing API keys | `random-salt-for-api-keys` |

### 5.5 Account Lockout

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_MAX_FAILED_ATTEMPTS` | Max failed login attempts before lockout | `5` |
| `AUTH_LOCKOUT_DURATION` | Lockout duration (minutes) | `30` |

---

## 6. Storage (Backblaze B2)

The system uses two buckets: private (project deliverables) and public (portfolio/blog media).

| Variable | Description | Example |
|----------|-------------|---------|
| `STORAGE_PROVIDER` | Storage provider driver | `b2` / `s3` / `local` |
| `B2_KEY_ID` | Backblaze Application Key ID | `002...` |
| `B2_APPLICATION_KEY` | Backblaze Application Key | `K001...` |
| `B2_ENDPOINT` | Backblaze endpoint (region‑specific) | `s3.us-west-001.backblazeb2.com` |
| `B2_BUCKET_PRIVATE` | Name of the private bucket | `nestlancer-private` |
| `B2_BUCKET_PUBLIC` | Name of the public bucket | `nestlancer-public` |
| `B2_PRESIGNED_URL_EXPIRY` | Expiry of presigned URLs (seconds) | `3600` |
| `STORAGE_MAX_FILE_SIZE` | Max upload size (bytes) | `104857600` (100 MB) |
| `STORAGE_ALLOWED_MIME_TYPES` | Comma‑separated allowed MIME types | `image/jpeg,image/png,application/pdf` |

---

## 7. CDN (Cloudflare)

| Variable | Description | Example |
|----------|-------------|---------|
| `CDN_PROVIDER` | CDN provider | `cloudflare` / `cloudfront` |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID | `abc123...` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (with cache purge permission) | `token...` |
| `CDN_PURGE_BATCH_SIZE` | Max paths per purge request | `30` |
| `CDN_PURGE_INTERVAL` | Interval (ms) to batch invalidations | `5000` |

---

## 8. Email

Two email providers are used: ZeptoMail for critical transactional emails, and AWS SES for high‑volume notifications. You can also use SMTP for development.

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_PROVIDER` | Email provider driver | `zeptomail` / `ses` / `smtp` |

### 8.1 ZeptoMail

| Variable | Description | Example |
|----------|-------------|---------|
| `ZEPTOMAIL_URL` | ZeptoMail API endpoint | `https://api.zeptomail.com/v1.1/email/template` |
| `ZEPTOMAIL_TOKEN` | ZeptoMail API token | `your-zeptomail-token` |

### 8.2 AWS SES

| Variable | Description | Example |
|----------|-------------|---------|
| `SES_REGION` | AWS region | `us-east-1` |
| `SES_ACCESS_KEY` | AWS access key | `AKIA...` |
| `SES_SECRET_KEY` | AWS secret key | `...` |
| `SES_FROM_EMAIL` | Default sender email | `noreply@yourdomain.com` |

### 8.3 SMTP (development)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `SMTP_USER` | SMTP username | `user@gmail.com` |
| `SMTP_PASS` | SMTP password | `app-password` |

---

## 9. Payments (Razorpay)

| Variable | Description | Example |
|----------|-------------|---------|
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret | `...` |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for verifying Razorpay webhooks | `whsec_...` |
| `RAZORPAY_CURRENCY` | Default currency | `INR` |

---

## 10. Inbound Webhooks (from external providers)

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_WEBHOOK_SECRET` | Secret for verifying GitHub webhooks | `github-secret` |
| `STRIPE_WEBHOOK_SECRET` | Secret for verifying Stripe webhooks | `stripe-secret` |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID | `...` |

---

## 11. Rate Limiting

| Variable | Description | Example |
|----------|-------------|---------|
| `RATE_LIMIT_ANONYMOUS` | Requests/hour for anonymous users | `100` |
| `RATE_LIMIT_ANONYMOUS_BURST` | Burst per minute | `10` |
| `RATE_LIMIT_USER` | Requests/hour for free users | `1000` |
| `RATE_LIMIT_USER_BURST` | Burst per minute | `30` |
| `RATE_LIMIT_PAID` | Requests/hour for paid users | `5000` |
| `RATE_LIMIT_PAID_BURST` | Burst per minute | `100` |
| `RATE_LIMIT_ADMIN` | Requests/hour for admin | `10000` |
| `RATE_LIMIT_ADMIN_BURST` | Burst per minute | `200` |
| `RATE_LIMIT_WEBHOOK` | Requests/hour for webhook endpoints | `5000` |

---

## 12. Feature Flags & Maintenance

| Variable | Description | Example |
|----------|-------------|---------|
| `FEATURE_FLAGS` | JSON object of feature flags | `{"newDashboard":true,"betaApi":false}` |
| `MAINTENANCE_MODE_ENABLED` | Enable maintenance mode globally | `false` |
| `MAINTENANCE_MODE_MESSAGE` | Custom maintenance message | `System undergoing upgrade, back soon.` |
| `MAINTENANCE_MODE_RETRY_AFTER` | Retry-After seconds | `3600` |

---

## 13. Observability

### 13.1 Tracing (Jaeger)

| Variable | Description | Example |
|----------|-------------|---------|
| `TRACING_ENABLED` | Enable OpenTelemetry tracing | `true` |
| `JAEGER_URL` | Jaeger collector endpoint | `http://jaeger:14268/api/traces` |
| `TRACING_SAMPLE_RATE` | Sampling rate (0.0–1.0) | `0.1` |

### 13.2 Metrics (Prometheus)

| Variable | Description | Example |
|----------|-------------|---------|
| `METRICS_ENABLED` | Expose Prometheus metrics endpoint | `true` |
| `METRICS_PORT` | Port for metrics endpoint | `9464` |
| `METRICS_PATH` | Metrics endpoint path | `/metrics` |

---

## 14. File Upload & Media Processing

| Variable | Description | Example |
|----------|-------------|---------|
| `FILE_UPLOAD_MAX_SIZE` | Max file size for direct uploads (bytes) | `10485760` (10 MB) |
| `FILE_UPLOAD_ALLOWED_MIME_TYPES` | Comma‑separated allowed MIME types | `image/jpeg,image/png,application/pdf` |
| `CHUNKED_UPLOAD_CHUNK_SIZE` | Chunk size for chunked uploads (bytes) | `5242880` (5 MB) |
| `CHUNKED_UPLOAD_MAX_PARTS` | Max number of parts | `100` |
| `VIRUS_SCAN_ENABLED` | Enable ClamAV virus scanning | `true` |
| `CLAMAV_HOST` | ClamAV daemon host | `localhost` |
| `CLAMAV_PORT` | ClamAV port | `3310` |
| `MEDIA_PROCESSING_QUEUE` | RabbitMQ queue for media jobs | `media` |
| `MEDIA_THUMBNAIL_SIZES` | JSON array of thumbnail dimensions | `[{"width":320,"height":180},{"width":640,"height":360}]` |

---

## 15. Outbox Pattern

| Variable | Description | Example |
|----------|-------------|---------|
| `OUTBOX_POLL_INTERVAL` | How often the outbox poller runs (ms) | `5000` |
| `OUTBOX_BATCH_SIZE` | Number of events to fetch per poll | `100` |
| `OUTBOX_MAX_RETRIES` | Max retries for failed outbox events | `5` |

---

## 16. Webhooks (Outbound)

| Variable | Description | Example |
|----------|-------------|---------|
| `WEBHOOK_RETRY_POLICY` | JSON object defining retry policy | `{"maxRetries":5,"backoff":"exponential"}` |
| `WEBHOOK_TIMEOUT` | Timeout for sending webhooks (ms) | `5000` |

---

## 17. Pagination Defaults

| Variable | Description | Example |
|----------|-------------|---------|
| `PAGINATION_DEFAULT_LIMIT` | Default items per page | `20` |
| `PAGINATION_MAX_LIMIT` | Maximum allowed limit | `100` |

---

## 18. CORS

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGINS` | Comma‑separated allowed origins | `https://yourdomain.com,http://localhost:3000` |
| `CORS_CREDENTIALS` | Allow credentials (cookies) | `true` |
| `CORS_MAX_AGE` | Preflight cache time (seconds) | `86400` |

---

## 19. Service‑Specific Overrides

Each service can override the base `PORT` and may have its own tuning variables.

| Variable | Description | Example |
|----------|-------------|---------|
| `GATEWAY_PORT` | API Gateway port | `3000` |
| `WS_GATEWAY_PORT` | WebSocket Gateway port | `3001` |
| `AUTH_SERVICE_PORT` | Auth service port | `3002` |
| `USERS_SERVICE_PORT` | Users service port | `3003` |
| `REQUESTS_SERVICE_PORT` | Requests service port | `3004` |
| `QUOTES_SERVICE_PORT` | Quotes service port | `3005` |
| `PROJECTS_SERVICE_PORT` | Projects service port | `3006` |
| `PROGRESS_SERVICE_PORT` | Progress service port | `3007` |
| `PAYMENTS_SERVICE_PORT` | Payments service port | `3008` |
| `MESSAGING_SERVICE_PORT` | Messaging service port | `3009` |
| `NOTIFICATIONS_SERVICE_PORT` | Notifications service port | `3010` |
| `MEDIA_SERVICE_PORT` | Media service port | `3011` |
| `PORTFOLIO_SERVICE_PORT` | Portfolio service port | `3012` |
| `BLOG_SERVICE_PORT` | Blog service port | `3013` |
| `CONTACT_SERVICE_PORT` | Contact service port | `3014` |
| `ADMIN_SERVICE_PORT` | Admin service port | `3015` |
| `WEBHOOKS_SERVICE_PORT` | Inbound webhooks ingestion port | `3016` |
| `HEALTH_SERVICE_PORT` | Health service port | `3017` |

---

## 20. Worker Configuration

Each worker can have its own concurrency and prefetch settings.

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_WORKER_CONCURRENCY` | Number of concurrent email jobs | `5` |
| `EMAIL_WORKER_PREFETCH` | RabbitMQ prefetch for email worker | `10` |
| `NOTIFICATION_WORKER_CONCURRENCY` | Number of concurrent notification jobs | `10` |
| `MEDIA_WORKER_CONCURRENCY` | Number of concurrent media jobs | `3` |
| `WEBHOOK_WORKER_CONCURRENCY` | Number of concurrent webhook deliveries | `20` |
| `ANALYTICS_WORKER_CONCURRENCY` | Number of concurrent analytics jobs | `2` |
| `AUDIT_WORKER_BATCH_SIZE` | Batch size for audit inserts | `100` |
| `AUDIT_WORKER_FLUSH_INTERVAL` | Max time (ms) before flushing audit batch | `5000` |

---

## 21. Infisical (Secrets Manager)

If using Infisical, you only need the Infisical token; all other secrets will be injected at runtime.

| Variable | Description | Example |
|----------|-------------|---------|
| `INFISICAL_TOKEN` | Infisical service token | `st.xxxx...` |
---

## 22. Web Push (VAPID)

Used by the Notification Worker to sign web push messages.

| Variable | Description | Example |
|----------|-------------|---------|
| `VAPID_PUBLIC_KEY` | Public key for VAPID push notifications | `B...long-base64-string` |
| `VAPID_PRIVATE_KEY` | Private key for VAPID push notifications | `...long-base64-string` |
| `VAPID_SUBJECT` | Contact URI (mailto: or https:) for VAPID | `mailto:admin@yourdomain.com` |

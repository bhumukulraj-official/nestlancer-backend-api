Below are three `.env` files tailored for **development**, **staging**, and **production** environments. They follow the structure from `env-details.md` and include all essential variables. Sensitive values are placeholders (e.g., `change-me`, `dummy`) — you should replace them with real secrets when uploading to Infisical.

---

## **1. Development Environment (`dev.env`)**

```env
# ─────────────────────────────────────────────────────────────────
# GENERAL
# ─────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000
APP_NAME=Nestlancer
API_VERSION=v1
LOG_LEVEL=debug
LOG_FORMAT=pretty
LOG_OUTPUT=console
CORRELATION_ID_HEADER=X-Request-ID
FRONTEND_URL=http://localhost:3000

# ─────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestlancer?schema=public
DATABASE_READ_URL=postgresql://postgres:postgres@localhost:5432/nestlancer?schema=public
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_IDLE_TIMEOUT=10000
DATABASE_CONNECTION_TIMEOUT=5000

# ─────────────────────────────────────────────────────────────────
# REDIS (Cache + Pub/Sub)
# ─────────────────────────────────────────────────────────────────
REDIS_CACHE_URL=redis://localhost:6379/0
REDIS_CACHE_TTL_DEFAULT=300
REDIS_CACHE_MAX_ITEMS=10000
REDIS_PUBSUB_URL=redis://localhost:6379/1

# ─────────────────────────────────────────────────────────────────
# RABBITMQ
# ─────────────────────────────────────────────────────────────────
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_EXCHANGE_EVENTS=events
RABBITMQ_EXCHANGE_WEBHOOKS=webhooks
RABBITMQ_PREFETCH=10
RABBITMQ_RETRY_DELAY=5000
RABBITMQ_MAX_RETRIES=3

# ─────────────────────────────────────────────────────────────────
# AUTHENTICATION & SECURITY
# ─────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=dev-access-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
JWT_ISSUER=localhost
JWT_AUDIENCE=localhost

CSRF_SECRET=dev-csrf-secret
CSRF_COOKIE_NAME=_csrf
CSRF_HEADER_NAME=X-CSRF-Token

TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

API_KEY_SALT=dev-api-key-salt

AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=30

# ─────────────────────────────────────────────────────────────────
# STORAGE (Backblaze B2 / Local)
# ─────────────────────────────────────────────────────────────────
STORAGE_PROVIDER=local
B2_KEY_ID=dummy
B2_APPLICATION_KEY=dummy
B2_ENDPOINT=s3.us-west-001.backblazeb2.com
B2_BUCKET_PRIVATE=nestlancer-private-dev
B2_BUCKET_PUBLIC=nestlancer-public-dev
B2_PRESIGNED_URL_EXPIRY=3600
STORAGE_MAX_FILE_SIZE=104857600
STORAGE_ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf

# ─────────────────────────────────────────────────────────────────
# CDN
# ─────────────────────────────────────────────────────────────────
CDN_PROVIDER=cloudflare
CLOUDFLARE_ZONE_ID=dummy
CLOUDFLARE_API_TOKEN=dummy
CDN_PURGE_BATCH_SIZE=30
CDN_PURGE_INTERVAL=5000

# ─────────────────────────────────────────────────────────────────
# EMAIL (SMTP for dev)
# ─────────────────────────────────────────────────────────────────
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# ZeptoMail (dummy)
ZEPTOMAIL_URL=https://api.zeptomail.com/v1.1/email/template
ZEPTOMAIL_TOKEN=dummy

# AWS SES (dummy)
SES_REGION=us-east-1
SES_ACCESS_KEY=AKIA...
SES_SECRET_KEY=...
SES_FROM_EMAIL=noreply@localhost

# ─────────────────────────────────────────────────────────────────
# PAYMENTS (Razorpay)
# ─────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_dummy
RAZORPAY_KEY_SECRET=dummy
RAZORPAY_WEBHOOK_SECRET=whsec_dummy
RAZORPAY_CURRENCY=INR

# ─────────────────────────────────────────────────────────────────
# INBOUND WEBHOOKS (external providers)
# ─────────────────────────────────────────────────────────────────
GITHUB_WEBHOOK_SECRET=dummy
STRIPE_WEBHOOK_SECRET=dummy
PAYPAL_WEBHOOK_ID=dummy

# ─────────────────────────────────────────────────────────────────
# RATE LIMITING
# ─────────────────────────────────────────────────────────────────
RATE_LIMIT_ANONYMOUS=1000
RATE_LIMIT_ANONYMOUS_BURST=50
RATE_LIMIT_USER=5000
RATE_LIMIT_USER_BURST=100
RATE_LIMIT_PAID=10000
RATE_LIMIT_PAID_BURST=200
RATE_LIMIT_ADMIN=20000
RATE_LIMIT_ADMIN_BURST=500
RATE_LIMIT_WEBHOOK=5000

# ─────────────────────────────────────────────────────────────────
# FEATURE FLAGS & MAINTENANCE
# ─────────────────────────────────────────────────────────────────
FEATURE_FLAGS={"newDashboard":true,"betaApi":true}
MAINTENANCE_MODE_ENABLED=false
MAINTENANCE_MODE_MESSAGE="System under maintenance"
MAINTENANCE_MODE_RETRY_AFTER=3600

# ─────────────────────────────────────────────────────────────────
# OBSERVABILITY (Tracing / Metrics)
# ─────────────────────────────────────────────────────────────────
TRACING_ENABLED=false
JAEGER_URL=http://localhost:14268/api/traces
TRACING_SAMPLE_RATE=0.1
METRICS_ENABLED=true
METRICS_PORT=9464
METRICS_PATH=/metrics

# ─────────────────────────────────────────────────────────────────
# FILE UPLOAD & MEDIA PROCESSING
# ─────────────────────────────────────────────────────────────────
FILE_UPLOAD_MAX_SIZE=10485760
FILE_UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf
CHUNKED_UPLOAD_CHUNK_SIZE=5242880
CHUNKED_UPLOAD_MAX_PARTS=100
VIRUS_SCAN_ENABLED=false
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
MEDIA_PROCESSING_QUEUE=media
MEDIA_THUMBNAIL_SIZES=[{"width":320,"height":180},{"width":640,"height":360}]

# ─────────────────────────────────────────────────────────────────
# OUTBOX PATTERN
# ─────────────────────────────────────────────────────────────────
OUTBOX_POLL_INTERVAL=5000
OUTBOX_BATCH_SIZE=100
OUTBOX_MAX_RETRIES=5

# ─────────────────────────────────────────────────────────────────
# OUTBOUND WEBHOOKS
# ─────────────────────────────────────────────────────────────────
WEBHOOK_RETRY_POLICY={"maxRetries":5,"backoff":"exponential"}
WEBHOOK_TIMEOUT=5000

# ─────────────────────────────────────────────────────────────────
# PAGINATION
# ─────────────────────────────────────────────────────────────────
PAGINATION_DEFAULT_LIMIT=20
PAGINATION_MAX_LIMIT=100

# ─────────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────────
CORS_ORIGINS=http://localhost:3000,http://localhost:4000
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# ─────────────────────────────────────────────────────────────────
# SERVICE PORTS (overrides)
# ─────────────────────────────────────────────────────────────────
GATEWAY_PORT=3000
WS_GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
USERS_SERVICE_PORT=3003
REQUESTS_SERVICE_PORT=3004
QUOTES_SERVICE_PORT=3005
PROJECTS_SERVICE_PORT=3006
PROGRESS_SERVICE_PORT=3007
PAYMENTS_SERVICE_PORT=3008
MESSAGING_SERVICE_PORT=3009
NOTIFICATIONS_SERVICE_PORT=3010
MEDIA_SERVICE_PORT=3011
PORTFOLIO_SERVICE_PORT=3012
BLOG_SERVICE_PORT=3013
CONTACT_SERVICE_PORT=3014
ADMIN_SERVICE_PORT=3015
WEBHOOKS_SERVICE_PORT=3016
HEALTH_SERVICE_PORT=3017

# ─────────────────────────────────────────────────────────────────
# WORKER CONFIGURATION
# ─────────────────────────────────────────────────────────────────
EMAIL_WORKER_CONCURRENCY=2
EMAIL_WORKER_PREFETCH=5
NOTIFICATION_WORKER_CONCURRENCY=5
MEDIA_WORKER_CONCURRENCY=1
WEBHOOK_WORKER_CONCURRENCY=5
ANALYTICS_WORKER_CONCURRENCY=1
AUDIT_WORKER_BATCH_SIZE=50
AUDIT_WORKER_FLUSH_INTERVAL=5000

# ─────────────────────────────────────────────────────────────────
# WEB PUSH (VAPID)
# ─────────────────────────────────────────────────────────────────
VAPID_PUBLIC_KEY=B...long-base64-string
VAPID_PRIVATE_KEY=...long-base64-string
VAPID_SUBJECT=mailto:admin@localhost

# ─────────────────────────────────────────────────────────────────
# INFISICAL (optional for dev)
# ─────────────────────────────────────────────────────────────────
INFISICAL_TOKEN=st.dev_dummy
INFISICAL_ENV=dev
```

---

## **2. Staging Environment (`staging.env`)**

```env
# ─────────────────────────────────────────────────────────────────
# GENERAL
# ─────────────────────────────────────────────────────────────────
NODE_ENV=staging
PORT=3000
APP_NAME=Nestlancer
API_VERSION=v1
LOG_LEVEL=info
LOG_FORMAT=json
LOG_OUTPUT=console
CORRELATION_ID_HEADER=X-Request-ID
FRONTEND_URL=https://staging.yourdomain.com

# ─────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://app:password@staging-primary.db.internal:5432/nestlancer
DATABASE_READ_URL=postgresql://app:password@staging-replica.db.internal:5432/nestlancer
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_IDLE_TIMEOUT=10000
DATABASE_CONNECTION_TIMEOUT=5000

# ─────────────────────────────────────────────────────────────────
# REDIS (Cache + Pub/Sub)
# ─────────────────────────────────────────────────────────────────
REDIS_CACHE_URL=redis://:password@staging-redis-cache.internal:6379/0
REDIS_CACHE_TTL_DEFAULT=300
REDIS_CACHE_MAX_ITEMS=20000
REDIS_PUBSUB_URL=redis://:password@staging-redis-pubsub.internal:6379/1

# ─────────────────────────────────────────────────────────────────
# RABBITMQ
# ─────────────────────────────────────────────────────────────────
RABBITMQ_URL=amqp://app:password@staging-rabbitmq.internal:5672
RABBITMQ_EXCHANGE_EVENTS=events
RABBITMQ_EXCHANGE_WEBHOOKS=webhooks
RABBITMQ_PREFETCH=20
RABBITMQ_RETRY_DELAY=5000
RABBITMQ_MAX_RETRIES=3

# ─────────────────────────────────────────────────────────────────
# AUTHENTICATION & SECURITY
# ─────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=staging-access-secret-change-me
JWT_REFRESH_SECRET=staging-refresh-secret-change-me
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
JWT_ISSUER=staging.yourdomain.com
JWT_AUDIENCE=staging.yourdomain.com

CSRF_SECRET=staging-csrf-secret
CSRF_COOKIE_NAME=_csrf
CSRF_HEADER_NAME=X-CSRF-Token

TURNSTILE_SITE_KEY=0x4AAAAAA...   # real staging key
TURNSTILE_SECRET_KEY=0x4AAAAAA... # real staging key

API_KEY_SALT=staging-api-key-salt

AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=30

# ─────────────────────────────────────────────────────────────────
# STORAGE (Backblaze B2)
# ─────────────────────────────────────────────────────────────────
STORAGE_PROVIDER=b2
B2_KEY_ID=002...   # real staging key
B2_APPLICATION_KEY=K001...       # real staging key
B2_ENDPOINT=s3.us-west-001.backblazeb2.com
B2_BUCKET_PRIVATE=nestlancer-private-staging
B2_BUCKET_PUBLIC=nestlancer-public-staging
B2_PRESIGNED_URL_EXPIRY=3600
STORAGE_MAX_FILE_SIZE=104857600
STORAGE_ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf

# ─────────────────────────────────────────────────────────────────
# CDN
# ─────────────────────────────────────────────────────────────────
CDN_PROVIDER=cloudflare
CLOUDFLARE_ZONE_ID=staging-zone-id
CLOUDFLARE_API_TOKEN=staging-api-token
CDN_PURGE_BATCH_SIZE=30
CDN_PURGE_INTERVAL=5000

# ─────────────────────────────────────────────────────────────────
# EMAIL (ZeptoMail for staging)
# ─────────────────────────────────────────────────────────────────
EMAIL_PROVIDER=zeptomail
ZEPTOMAIL_URL=https://api.zeptomail.com/v1.1/email/template
ZEPTOMAIL_TOKEN=staging-zeptomail-token

# ─────────────────────────────────────────────────────────────────
# PAYMENTS (Razorpay test keys)
# ─────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=whsec_...
RAZORPAY_CURRENCY=INR

# ─────────────────────────────────────────────────────────────────
# INBOUND WEBHOOKS
# ─────────────────────────────────────────────────────────────────
GITHUB_WEBHOOK_SECRET=staging-github-secret
STRIPE_WEBHOOK_SECRET=staging-stripe-secret
PAYPAL_WEBHOOK_ID=staging-paypal-id

# ─────────────────────────────────────────────────────────────────
# RATE LIMITING (staging limits)
# ─────────────────────────────────────────────────────────────────
RATE_LIMIT_ANONYMOUS=200
RATE_LIMIT_ANONYMOUS_BURST=20
RATE_LIMIT_USER=2000
RATE_LIMIT_USER_BURST=50
RATE_LIMIT_PAID=10000
RATE_LIMIT_PAID_BURST=150
RATE_LIMIT_ADMIN=20000
RATE_LIMIT_ADMIN_BURST=300
RATE_LIMIT_WEBHOOK=5000

# ─────────────────────────────────────────────────────────────────
# FEATURE FLAGS & MAINTENANCE
# ─────────────────────────────────────────────────────────────────
FEATURE_FLAGS={"newDashboard":true,"betaApi":false}
MAINTENANCE_MODE_ENABLED=false
MAINTENANCE_MODE_MESSAGE="Scheduled maintenance"
MAINTENANCE_MODE_RETRY_AFTER=3600

# ─────────────────────────────────────────────────────────────────
# OBSERVABILITY
# ─────────────────────────────────────────────────────────────────
TRACING_ENABLED=true
JAEGER_URL=http://staging-jaeger:14268/api/traces
TRACING_SAMPLE_RATE=0.1
METRICS_ENABLED=true
METRICS_PORT=9464
METRICS_PATH=/metrics

# ─────────────────────────────────────────────────────────────────
# FILE UPLOAD & MEDIA PROCESSING
# ─────────────────────────────────────────────────────────────────
FILE_UPLOAD_MAX_SIZE=10485760
FILE_UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf
CHUNKED_UPLOAD_CHUNK_SIZE=5242880
CHUNKED_UPLOAD_MAX_PARTS=100
VIRUS_SCAN_ENABLED=true
CLAMAV_HOST=staging-clamav.internal
CLAMAV_PORT=3310
MEDIA_PROCESSING_QUEUE=media
MEDIA_THUMBNAIL_SIZES=[{"width":320,"height":180},{"width":640,"height":360}]

# ─────────────────────────────────────────────────────────────────
# OUTBOX PATTERN
# ─────────────────────────────────────────────────────────────────
OUTBOX_POLL_INTERVAL=5000
OUTBOX_BATCH_SIZE=100
OUTBOX_MAX_RETRIES=5

# ─────────────────────────────────────────────────────────────────
# OUTBOUND WEBHOOKS
# ─────────────────────────────────────────────────────────────────
WEBHOOK_RETRY_POLICY={"maxRetries":5,"backoff":"exponential"}
WEBHOOK_TIMEOUT=5000

# ─────────────────────────────────────────────────────────────────
# PAGINATION
# ─────────────────────────────────────────────────────────────────
PAGINATION_DEFAULT_LIMIT=20
PAGINATION_MAX_LIMIT=100

# ─────────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────────
CORS_ORIGINS=https://staging.yourdomain.com
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# ─────────────────────────────────────────────────────────────────
# SERVICE PORTS (overrides)
# ─────────────────────────────────────────────────────────────────
GATEWAY_PORT=3000
WS_GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
... (same as dev, but ports may be internal only)

# ─────────────────────────────────────────────────────────────────
# WORKER CONFIGURATION
# ─────────────────────────────────────────────────────────────────
EMAIL_WORKER_CONCURRENCY=5
EMAIL_WORKER_PREFETCH=10
NOTIFICATION_WORKER_CONCURRENCY=10
MEDIA_WORKER_CONCURRENCY=3
WEBHOOK_WORKER_CONCURRENCY=10
ANALYTICS_WORKER_CONCURRENCY=2
AUDIT_WORKER_BATCH_SIZE=100
AUDIT_WORKER_FLUSH_INTERVAL=5000

# ─────────────────────────────────────────────────────────────────
# WEB PUSH (VAPID)
# ─────────────────────────────────────────────────────────────────
VAPID_PUBLIC_KEY=staging-vapid-public-key
VAPID_PRIVATE_KEY=staging-vapid-private-key
VAPID_SUBJECT=mailto:admin@staging.yourdomain.com

# ─────────────────────────────────────────────────────────────────
# INFISICAL
# ─────────────────────────────────────────────────────────────────
INFISICAL_TOKEN=st.staging_...   # real Infisical token
INFISICAL_ENV=staging
```

---

## **3. Production Environment (`prod.env`)**

```env
# ─────────────────────────────────────────────────────────────────
# GENERAL
# ─────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
APP_NAME=Nestlancer
API_VERSION=v1
LOG_LEVEL=info
LOG_FORMAT=json
LOG_OUTPUT=console
CORRELATION_ID_HEADER=X-Request-ID
FRONTEND_URL=https://yourdomain.com

# ─────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://app:${DB_PASSWORD}@prod-primary.db.internal:5432/nestlancer
DATABASE_READ_URL=postgresql://app:${DB_PASSWORD}@prod-replica.db.internal:5432/nestlancer
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=50
DATABASE_IDLE_TIMEOUT=10000
DATABASE_CONNECTION_TIMEOUT=5000

# ─────────────────────────────────────────────────────────────────
# REDIS (Cache + Pub/Sub)
# ─────────────────────────────────────────────────────────────────
REDIS_CACHE_URL=redis://:${REDIS_CACHE_PASSWORD}@prod-redis-cache.internal:6379/0
REDIS_CACHE_TTL_DEFAULT=300
REDIS_CACHE_MAX_ITEMS=50000
REDIS_PUBSUB_URL=redis://:${REDIS_PUBSUB_PASSWORD}@prod-redis-pubsub.internal:6379/1

# ─────────────────────────────────────────────────────────────────
# RABBITMQ
# ─────────────────────────────────────────────────────────────────
RABBITMQ_URL=amqp://app:${RABBITMQ_PASSWORD}@prod-rabbitmq.internal:5672
RABBITMQ_EXCHANGE_EVENTS=events
RABBITMQ_EXCHANGE_WEBHOOKS=webhooks
RABBITMQ_PREFETCH=50
RABBITMQ_RETRY_DELAY=5000
RABBITMQ_MAX_RETRIES=3

# ─────────────────────────────────────────────────────────────────
# AUTHENTICATION & SECURITY
# ─────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}          # set via Infisical
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}        # set via Infisical
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
JWT_ISSUER=yourdomain.com
JWT_AUDIENCE=yourdomain.com

CSRF_SECRET=${CSRF_SECRET}
CSRF_COOKIE_NAME=_csrf
CSRF_HEADER_NAME=X-CSRF-Token

TURNSTILE_SITE_KEY=${TURNSTILE_SITE_KEY}
TURNSTILE_SECRET_KEY=${TURNSTILE_SECRET_KEY}

API_KEY_SALT=${API_KEY_SALT}

AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=30

# ─────────────────────────────────────────────────────────────────
# STORAGE (Backblaze B2)
# ─────────────────────────────────────────────────────────────────
STORAGE_PROVIDER=b2
B2_KEY_ID=${B2_KEY_ID}
B2_APPLICATION_KEY=${B2_APPLICATION_KEY}
B2_ENDPOINT=s3.us-west-001.backblazeb2.com
B2_BUCKET_PRIVATE=nestlancer-private-prod
B2_BUCKET_PUBLIC=nestlancer-public-prod
B2_PRESIGNED_URL_EXPIRY=3600
STORAGE_MAX_FILE_SIZE=104857600
STORAGE_ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf

# ─────────────────────────────────────────────────────────────────
# CDN
# ─────────────────────────────────────────────────────────────────
CDN_PROVIDER=cloudflare
CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
CDN_PURGE_BATCH_SIZE=30
CDN_PURGE_INTERVAL=5000

# ─────────────────────────────────────────────────────────────────
# EMAIL (ZeptoMail for critical, SES for bulk)
# ─────────────────────────────────────────────────────────────────
EMAIL_PROVIDER=zeptomail
ZEPTOMAIL_URL=https://api.zeptomail.com/v1.1/email/template
ZEPTOMAIL_TOKEN=${ZEPTOMAIL_TOKEN}

# SES for high‑volume (optional)
SES_REGION=us-east-1
SES_ACCESS_KEY=${SES_ACCESS_KEY}
SES_SECRET_KEY=${SES_SECRET_KEY}
SES_FROM_EMAIL=noreply@yourdomain.com

# ─────────────────────────────────────────────────────────────────
# PAYMENTS (Razorpay live keys)
# ─────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
RAZORPAY_WEBHOOK_SECRET=${RAZORPAY_WEBHOOK_SECRET}
RAZORPAY_CURRENCY=INR

# ─────────────────────────────────────────────────────────────────
# INBOUND WEBHOOKS
# ─────────────────────────────────────────────────────────────────
GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
PAYPAL_WEBHOOK_ID=${PAYPAL_WEBHOOK_ID}

# ─────────────────────────────────────────────────────────────────
# RATE LIMITING (production values)
# ─────────────────────────────────────────────────────────────────
RATE_LIMIT_ANONYMOUS=100
RATE_LIMIT_ANONYMOUS_BURST=10
RATE_LIMIT_USER=1000
RATE_LIMIT_USER_BURST=30
RATE_LIMIT_PAID=5000
RATE_LIMIT_PAID_BURST=100
RATE_LIMIT_ADMIN=10000
RATE_LIMIT_ADMIN_BURST=200
RATE_LIMIT_WEBHOOK=5000

# ─────────────────────────────────────────────────────────────────
# FEATURE FLAGS & MAINTENANCE
# ─────────────────────────────────────────────────────────────────
FEATURE_FLAGS={"newDashboard":true,"betaApi":false}
MAINTENANCE_MODE_ENABLED=false
MAINTENANCE_MODE_MESSAGE="System undergoing upgrade, back soon."
MAINTENANCE_MODE_RETRY_AFTER=3600

# ─────────────────────────────────────────────────────────────────
# OBSERVABILITY
# ─────────────────────────────────────────────────────────────────
TRACING_ENABLED=true
JAEGER_URL=http://prod-jaeger:14268/api/traces
TRACING_SAMPLE_RATE=0.05
METRICS_ENABLED=true
METRICS_PORT=9464
METRICS_PATH=/metrics

# ─────────────────────────────────────────────────────────────────
# FILE UPLOAD & MEDIA PROCESSING
# ─────────────────────────────────────────────────────────────────
FILE_UPLOAD_MAX_SIZE=10485760
FILE_UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf
CHUNKED_UPLOAD_CHUNK_SIZE=5242880
CHUNKED_UPLOAD_MAX_PARTS=100
VIRUS_SCAN_ENABLED=true
CLAMAV_HOST=prod-clamav.internal
CLAMAV_PORT=3310
MEDIA_PROCESSING_QUEUE=media
MEDIA_THUMBNAIL_SIZES=[{"width":320,"height":180},{"width":640,"height":360}]

# ─────────────────────────────────────────────────────────────────
# OUTBOX PATTERN
# ─────────────────────────────────────────────────────────────────
OUTBOX_POLL_INTERVAL=5000
OUTBOX_BATCH_SIZE=100
OUTBOX_MAX_RETRIES=5

# ─────────────────────────────────────────────────────────────────
# OUTBOUND WEBHOOKS
# ─────────────────────────────────────────────────────────────────
WEBHOOK_RETRY_POLICY={"maxRetries":5,"backoff":"exponential"}
WEBHOOK_TIMEOUT=5000

# ─────────────────────────────────────────────────────────────────
# PAGINATION
# ─────────────────────────────────────────────────────────────────
PAGINATION_DEFAULT_LIMIT=20
PAGINATION_MAX_LIMIT=100

# ─────────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────────
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# ─────────────────────────────────────────────────────────────────
# SERVICE PORTS (overrides) – internal only, no need to expose
# ─────────────────────────────────────────────────────────────────
GATEWAY_PORT=3000
WS_GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
... (list same as dev)

# ─────────────────────────────────────────────────────────────────
# WORKER CONFIGURATION
# ─────────────────────────────────────────────────────────────────
EMAIL_WORKER_CONCURRENCY=10
EMAIL_WORKER_PREFETCH=20
NOTIFICATION_WORKER_CONCURRENCY=20
MEDIA_WORKER_CONCURRENCY=5
WEBHOOK_WORKER_CONCURRENCY=20
ANALYTICS_WORKER_CONCURRENCY=2
AUDIT_WORKER_BATCH_SIZE=200
AUDIT_WORKER_FLUSH_INTERVAL=5000

# ─────────────────────────────────────────────────────────────────
# WEB PUSH (VAPID)
# ─────────────────────────────────────────────────────────────────
VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}
VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
VAPID_SUBJECT=mailto:admin@yourdomain.com

# ─────────────────────────────────────────────────────────────────
# INFISICAL
# ─────────────────────────────────────────────────────────────────
INFISICAL_TOKEN=${INFISICAL_TOKEN}   # set via Infisical itself
INFISICAL_ENV=prod
```

---

### **Notes**

- **Secrets** like `JWT_ACCESS_SECRET`, database passwords, API keys should be stored securely in Infisical and referenced as placeholders (`${VAR}`) in the `.env` files.
- The **port lists** for services can be omitted if they are not exposed externally; they are kept here for consistency.
- Adjust **hostnames**, **bucket names**, and other environment‑specific values to match your actual infrastructure.
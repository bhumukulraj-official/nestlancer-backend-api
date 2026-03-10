# Environment Variables Reference

## Application

| Variable       | Required | Default       | Description                                         |
| -------------- | -------- | ------------- | --------------------------------------------------- |
| `NODE_ENV`     | Yes      | `development` | Environment: development, test, staging, production |
| `PORT`         | No       | `3000`        | HTTP server port                                    |
| `LOG_LEVEL`    | No       | `info`        | Log level: debug, info, warn, error                 |
| `API_PREFIX`   | No       | `/api/v1`     | API route prefix                                    |
| `FRONTEND_URL` | Yes      | –             | Frontend URL for CORS and email links               |

## Database

| Variable                     | Required | Default | Description                              |
| ---------------------------- | -------- | ------- | ---------------------------------------- |
| `DATABASE_URL`               | Yes      | –       | PostgreSQL connection string             |
| `DATABASE_READ_REPLICA_URLS` | No       | –       | Comma-separated replica URLs (R/W split) |

## Redis

| Variable           | Required | Default | Description                            |
| ------------------ | -------- | ------- | -------------------------------------- |
| `REDIS_CACHE_URL`  | Yes      | –       | Redis cache instance URL (port 6379)   |
| `REDIS_PUBSUB_URL` | Yes      | –       | Redis pub/sub instance URL (port 6380) |

## RabbitMQ

| Variable                  | Required | Default | Description                            |
| ------------------------- | -------- | ------- | -------------------------------------- |
| `RABBITMQ_URL`            | Yes      | –       | AMQP connection URL                    |
| `RABBITMQ_MANAGEMENT_URL` | No       | –       | Management API URL (for health checks) |

## JWT Authentication

| Variable             | Required | Default | Description                                |
| -------------------- | -------- | ------- | ------------------------------------------ |
| `JWT_ACCESS_SECRET`  | Yes      | –       | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes      | –       | Refresh token signing secret               |
| `JWT_ACCESS_EXPIRY`  | No       | `15m`   | Access token expiry                        |
| `JWT_REFRESH_EXPIRY` | No       | `7d`    | Refresh token expiry                       |

## Payment (Razorpay)

| Variable                  | Required | Default | Description                           |
| ------------------------- | -------- | ------- | ------------------------------------- |
| `RAZORPAY_KEY_ID`         | Yes      | –       | Razorpay API key                      |
| `RAZORPAY_KEY_SECRET`     | Yes      | –       | Razorpay API secret                   |
| `RAZORPAY_WEBHOOK_SECRET` | Yes      | –       | Webhook signature verification secret |

## Storage

| Variable                | Required | Default | Description                             |
| ----------------------- | -------- | ------- | --------------------------------------- |
| `STORAGE_PROVIDER`      | No       | `s3`    | Storage provider: s3, cloudinary, local |
| `AWS_ACCESS_KEY_ID`     | Cond.    | –       | AWS access key (required for S3)        |
| `AWS_SECRET_ACCESS_KEY` | Cond.    | –       | AWS secret key                          |
| `AWS_S3_BUCKET_PRIVATE` | Cond.    | –       | Private bucket (deliverables)           |
| `AWS_S3_BUCKET_PUBLIC`  | Cond.    | –       | Public bucket (portfolio, blog)         |
| `AWS_S3_REGION`         | Cond.    | –       | S3 region                               |

## Email

| Variable          | Required | Default      | Description          |
| ----------------- | -------- | ------------ | -------------------- |
| `SMTP_HOST`       | Yes      | –            | SMTP server host     |
| `SMTP_PORT`       | No       | `587`        | SMTP port            |
| `SMTP_USER`       | Yes      | –            | SMTP username        |
| `SMTP_PASS`       | Yes      | –            | SMTP password        |
| `SMTP_FROM_NAME`  | No       | `Nestlancer` | Sender display name  |
| `SMTP_FROM_EMAIL` | Yes      | –            | Sender email address |

## CDN

| Variable                     | Required | Default | Description                |
| ---------------------------- | -------- | ------- | -------------------------- |
| `CLOUDFRONT_DISTRIBUTION_ID` | No       | –       | CloudFront distribution ID |
| `CLOUDFRONT_DOMAIN`          | No       | –       | CloudFront domain name     |

## Security

| Variable               | Required | Default | Description                 |
| ---------------------- | -------- | ------- | --------------------------- |
| `TURNSTILE_SECRET_KEY` | No       | –       | Cloudflare Turnstile secret |
| `CORS_ORIGINS`         | No       | `*`     | Allowed CORS origins        |
| `CSRF_SECRET`          | No       | –       | CSRF token signing secret   |

## Rate Limiting

| Variable                   | Required | Default | Description                    |
| -------------------------- | -------- | ------- | ------------------------------ |
| `RATE_LIMIT_ENABLED`       | No       | `true`  | Enable rate limiting           |
| `RATE_LIMIT_ANONYMOUS`     | No       | `30`    | Requests/min for anonymous     |
| `RATE_LIMIT_AUTHENTICATED` | No       | `100`   | Requests/min for authenticated |
| `RATE_LIMIT_ADMIN`         | No       | `300`   | Requests/min for admin         |

## Web Push

| Variable            | Required | Default | Description           |
| ------------------- | -------- | ------- | --------------------- |
| `VAPID_PUBLIC_KEY`  | No       | –       | VAPID public key      |
| `VAPID_PRIVATE_KEY` | No       | –       | VAPID private key     |
| `VAPID_SUBJECT`     | No       | –       | VAPID subject (email) |

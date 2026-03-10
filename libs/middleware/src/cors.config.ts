import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function getCorsConfig(origins: string[]): CorsOptions {
  return {
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Idempotency-Key',
      'X-CSRF-Token',
      'X-Turnstile-Token',
    ],
    exposedHeaders: [
      'X-Correlation-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    credentials: true,
    maxAge: 86400,
  };
}

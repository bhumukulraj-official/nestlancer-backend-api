import { z } from 'zod';

export const appConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  DATABASE_READ_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),
  REDIS_PUBSUB_URL: z.string().url().optional(),
  RABBITMQ_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(64),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
}).passthrough();

export type AppConfig = z.infer<typeof appConfigSchema>;

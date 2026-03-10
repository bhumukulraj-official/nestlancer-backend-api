import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seeds/index.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});

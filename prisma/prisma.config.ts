import { defineConfig } from 'prisma/config';

export default defineConfig({
    earlyAccess: true,
    schema: 'prisma/schema',
    migrations: {
        path: 'prisma/migrations',
        seed: 'npx ts-node prisma/seeds/index.ts',
    },
    datasource: {
        url: 'postgresql://nl_db_user:dev-pg-c2e3f4g5h6i7@100.103.64.83:5432/nl_dev_db?schema=public',
    },
});

import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient | null = null;

/**
 * Set up the test database: connect PrismaClient and run migrations.
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nestlancer_test';

    prismaClient = new PrismaClient({
        datasources: { db: { url: databaseUrl } } as object,
        log: ['error'],
    } as any);

    await prismaClient.$connect();
    return prismaClient;
}

/**
 * Tear down the test database: disconnect PrismaClient.
 */
export async function teardownTestDatabase(): Promise<void> {
    if (prismaClient) {
        await prismaClient.$disconnect();
        prismaClient = null;
    }
}

/**
 * Reset the test database by truncating all tables (preserving schema).
 * Uses raw SQL to truncate all tables in the public schema.
 */
export async function resetTestDatabase(): Promise<void> {
    if (!prismaClient) return;

    const tables = await prismaClient.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != '_prisma_migrations'
  `;

    const tableNames = tables.map((t) => `"${t.tablename}"`).join(', ');

    if (tableNames.length > 0) {
        await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`);
    }
}

/**
 * Get the current test PrismaClient instance.
 */
export function getTestPrismaClient(): PrismaClient | null {
    return prismaClient;
}

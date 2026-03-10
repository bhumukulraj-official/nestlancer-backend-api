/**
 * E2E Test Cleanup
 *
 * Utilities for cleaning up test data between E2E test runs.
 * Uses direct database access for reliable cleanup.
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { createMailHogClient } from './mailhog-client';

let prismaClient: PrismaClient | null = null;

/**
 * Get or create a PrismaClient for cleanup operations.
 */
async function getCleanupPrismaClient(): Promise<PrismaClient> {
  if (prismaClient) return prismaClient;

  const databaseUrl =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nestlancer_e2e';
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  prismaClient = new PrismaClient({
    adapter,
    log: ['error'],
  });
  await prismaClient.$connect();
  return prismaClient;
}

/**
 * Disconnect the cleanup PrismaClient.
 */
export async function disconnectCleanup(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}

/**
 * Delete test users created during E2E tests.
 * Identifies test users by email pattern (e2e-*@*.test).
 */
export async function cleanupTestUsers(): Promise<void> {
  const client = await getCleanupPrismaClient();
  try {
    await client.$executeRawUnsafe(`
            DELETE FROM "User" WHERE email LIKE 'e2e-%' OR email LIKE '%@nestlancer.test'
        `);
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test users:', (error as Error).message);
  }
}

/**
 * Truncate all tables in the database (except migrations).
 * Use with caution – this wipes ALL data.
 */
export async function truncateAllTables(): Promise<void> {
  const client = await getCleanupPrismaClient();
  try {
    const tables = await client.$queryRawUnsafe<Array<{ table_name: string }>>(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name != '_prisma_migrations'
        `);

    const tableNames = tables.map((t) => `"${t.table_name}"`).join(', ');
    if (tableNames.length > 0) {
      await client.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`);
    }
  } catch (error) {
    console.warn('⚠️  Failed to truncate tables:', (error as Error).message);
  }
}

/**
 * Clean up MailHog (delete all captured emails).
 */
export async function cleanupEmails(): Promise<void> {
  try {
    const mailhog = createMailHogClient();
    await mailhog.deleteAll();
  } catch (error) {
    console.warn('⚠️  Failed to cleanup MailHog:', (error as Error).message);
  }
}

/**
 * Run all cleanup tasks.
 */
export async function cleanupAll(): Promise<void> {
  console.log('🧹 Running E2E cleanup...');

  await Promise.allSettled([cleanupTestUsers(), cleanupEmails()]);

  console.log('✅ E2E cleanup complete');
}

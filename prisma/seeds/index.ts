// =============================================================================
// Nestlancer – Database Seed Entry Point
// =============================================================================
// Runs all seed files in order. Execute via: npx prisma db seed
// Seeds are split into numbered files for ordering and idempotency.
// Dev seeds (10-13) only run when NODE_ENV !== 'production'.

import { PrismaClient } from '../generated';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log('🌱 Starting database seeding...\n');

    // Core seeds (always run)
    const { seedRoles } = await import('./01-roles.seed');
    await seedRoles(prisma);

    const { seedPermissions } = await import('./02-permissions.seed');
    await seedPermissions(prisma);

    const { seedCategories } = await import('./03-categories.seed');
    await seedCategories(prisma);

    const { seedEmailTemplates } = await import('./05-email-templates.seed');
    await seedEmailTemplates(prisma);

    const { seedNotificationTemplates } = await import('./06-notification-templates.seed');
    await seedNotificationTemplates(prisma);

    const { seedFeatureFlags } = await import('./07-feature-flags.seed');
    await seedFeatureFlags(prisma);

    const { seedErrorCodes } = await import('./08-error-codes.seed');
    await seedErrorCodes(prisma);

    const { seedSystemConfig } = await import('./09-system-config.seed');
    await seedSystemConfig(prisma);

    // Dev seeds (only in non-production environments)
    if (process.env.NODE_ENV !== 'production') {
        console.log('\n📦 Running development seeds...\n');

        const { seedTestUsers } = await import('./dev/10-test-users.seed');
        await seedTestUsers(prisma);

        const { seedTestProjects } = await import('./dev/11-test-projects.seed');
        await seedTestProjects(prisma);

        const { seedTestPortfolio } = await import('./dev/12-test-portfolio.seed');
        await seedTestPortfolio(prisma);

        const { seedTestBlogPosts } = await import('./dev/13-test-blog-posts.seed');
        await seedTestBlogPosts(prisma);
    }

    console.log('\n✅ Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

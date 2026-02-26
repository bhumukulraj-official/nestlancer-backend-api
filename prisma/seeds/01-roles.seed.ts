import { PrismaClient } from '@prisma/client';

/**
 * Seed default user roles.
 * Roles are stored as an enum in the schema but this seed ensures
 * any role-related system config data is present.
 */
export async function seedRoles(prisma: PrismaClient): Promise<void> {
    console.log('  🔑 Seeding roles...');

    // Roles are defined as enums in the Prisma schema (UserRole: USER, ADMIN).
    // This seed creates system config entries that document role capabilities.
    await prisma.systemConfig.upsert({
        where: { key: 'roles.config' },
        update: {},
        create: {
            key: 'roles.config',
            value: {
                USER: {
                    label: 'User',
                    description: 'Standard platform user (client)',
                    capabilities: [
                        'create:request',
                        'view:own_projects',
                        'manage:own_profile',
                        'send:messages',
                        'view:portfolio',
                        'view:blog',
                        'submit:contact',
                    ],
                },
                ADMIN: {
                    label: 'Administrator',
                    description: 'Platform administrator with full access',
                    capabilities: [
                        'manage:all_users',
                        'manage:all_projects',
                        'manage:all_requests',
                        'manage:all_quotes',
                        'manage:payments',
                        'manage:portfolio',
                        'manage:blog',
                        'manage:system_config',
                        'view:audit_logs',
                        'manage:feature_flags',
                    ],
                },
            },
            description: 'Role definitions and capabilities mapping',
        },
    });

    console.log('  ✅ Roles seeded');
}

import { PrismaClient } from '@prisma/client';

/**
 * Seed default permissions mapping.
 * Stores fine-grained permission definitions in SystemConfig.
 */
export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  console.log('  🛡️  Seeding permissions...');

  await prisma.systemConfig.upsert({
    where: { key: 'permissions.config' },
    update: {},
    create: {
      key: 'permissions.config',
      value: {
        resources: [
          'users',
          'requests',
          'quotes',
          'projects',
          'milestones',
          'deliverables',
          'payments',
          'messages',
          'notifications',
          'media',
          'portfolio',
          'blog',
          'contact',
          'system',
        ],
        actions: ['create', 'read', 'update', 'delete', 'manage'],
        rolePermissions: {
          USER: {
            users: ['read:own', 'update:own'],
            requests: ['create', 'read:own', 'update:own'],
            projects: ['read:own'],
            messages: ['create', 'read:own'],
            notifications: ['read:own', 'update:own'],
            media: ['create', 'read:own'],
            portfolio: ['read'],
            blog: ['read'],
            contact: ['create'],
          },
          ADMIN: {
            '*': ['manage'],
          },
        },
      },
      description: 'Fine-grained permission definitions per role',
    },
  });

  console.log('  ✅ Permissions seeded');
}

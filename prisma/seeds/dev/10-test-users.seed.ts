import { PrismaClient } from '@prisma/client';

/**
 * Seed test users for development environment.
 * Creates admin and standard user accounts with known passwords.
 * Password: 'Test1234!' (bcrypt hashed)
 */
export async function seedTestUsers(prisma: PrismaClient): Promise<void> {
    console.log('    👤 Seeding test users...');

    // bcrypt hash of 'Test1234!' with 12 rounds
    const testPasswordHash = '$2b$12$LJ3m4ys3Gz8m.O1lHUkJQeT6bJxHlqJ5kKDqQ1p7rF4YJx8vXxJzS';

    const users = [
        {
            id: 'test-admin-001',
            email: 'admin@nestlancer.com',
            passwordHash: testPasswordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN' as const,
            status: 'ACTIVE' as const,
        },
        {
            id: 'test-user-001',
            email: 'user@nestlancer.com',
            passwordHash: testPasswordHash,
            firstName: 'Test',
            lastName: 'User',
            role: 'USER' as const,
            status: 'ACTIVE' as const,
        },
        {
            id: 'test-user-002',
            email: 'client@nestlancer.com',
            passwordHash: testPasswordHash,
            firstName: 'Test',
            lastName: 'Client',
            role: 'USER' as const,
            status: 'ACTIVE' as const,
        },
        {
            id: 'test-user-suspended',
            email: 'suspended@nestlancer.com',
            passwordHash: testPasswordHash,
            firstName: 'Suspended',
            lastName: 'User',
            role: 'USER' as const,
            status: 'SUSPENDED' as const,
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    // Create preferences for test users
    for (const user of users.filter((u) => u.status === 'ACTIVE')) {
        await prisma.userPreference.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                timezone: 'Asia/Kolkata',
                language: 'en',
                theme: 'system',
            },
        });
    }

    console.log('    ✅ Test users seeded');
}

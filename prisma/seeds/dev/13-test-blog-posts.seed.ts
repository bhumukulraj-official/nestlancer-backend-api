import { PrismaClient } from '@prisma/client';

/**
 * Seed test blog posts, tags, and comments for development.
 */
export async function seedTestBlogPosts(prisma: PrismaClient): Promise<void> {
    console.log('    📝 Seeding test blog posts...');

    // Get the technology category
    const techCategory = await prisma.blogCategory.findUnique({
        where: { slug: 'technology' },
    });

    if (!techCategory) {
        console.log('    ⚠️  Technology category not found, skipping blog posts');
        return;
    }

    // Create a blog series
    const series = await prisma.blogSeries.upsert({
        where: { slug: 'nestjs-deep-dive' },
        update: {},
        create: {
            slug: 'nestjs-deep-dive',
            name: 'NestJS Deep Dive',
            description: 'A comprehensive series exploring NestJS patterns and best practices.',
        },
    });

    // Create test blog posts
    const posts = [
        {
            authorId: 'test-admin-001',
            categoryId: techCategory.id,
            title: 'Building Scalable Microservices with NestJS',
            slug: 'building-scalable-microservices-nestjs',
            excerpt: 'Learn how to build production-ready microservices using NestJS, RabbitMQ, and PostgreSQL.',
            content: '# Building Scalable Microservices with NestJS\n\nIn this comprehensive guide, we explore how to architect and build scalable microservices...\n\n## Architecture Overview\n\nWe use an API Gateway pattern with event-driven communication via RabbitMQ...\n\n## Key Patterns\n\n1. **Transactional Outbox** - Ensures reliable event publishing\n2. **Circuit Breaker** - Handles external service failures gracefully\n3. **CQRS** - Separates read and write concerns\n\n## Implementation\n\n```typescript\n@Module({\n  imports: [DatabaseModule, QueueModule],\n})\nexport class AppModule {}\n```\n\nFull implementation details follow...',
            contentFormat: 'markdown',
            status: 'PUBLISHED' as const,
            commentsEnabled: true,
            seriesId: series.id,
            seriesPosition: 1,
            seo: {
                title: 'Building Scalable Microservices with NestJS | Nestlancer Blog',
                description: 'Learn how to build production-ready microservices using NestJS, RabbitMQ, and PostgreSQL.',
            },
            publishedAt: new Date(),
        },
        {
            authorId: 'test-admin-001',
            categoryId: techCategory.id,
            title: 'TypeScript Best Practices for Large Codebases',
            slug: 'typescript-best-practices-large-codebases',
            excerpt: 'Essential TypeScript patterns and practices for maintaining clean, scalable code.',
            content: '# TypeScript Best Practices\n\nManaging a large TypeScript codebase requires discipline and the right patterns...\n\n## Strict Mode\n\nAlways enable strict TypeScript configuration...\n\n## Type-Safe Error Handling\n\n```typescript\nclass AppError extends Error {\n  constructor(\n    public readonly code: string,\n    message: string,\n    public readonly statusCode: number = 500,\n  ) {\n    super(message);\n  }\n}\n```',
            contentFormat: 'markdown',
            status: 'PUBLISHED' as const,
            commentsEnabled: true,
            seo: {
                title: 'TypeScript Best Practices for Large Codebases | Nestlancer Blog',
                description: 'Essential TypeScript patterns and practices for maintaining clean, scalable code.',
            },
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            authorId: 'test-admin-001',
            categoryId: techCategory.id,
            title: 'Draft: Kubernetes Deployment Strategies',
            slug: 'kubernetes-deployment-strategies',
            excerpt: 'A deep dive into blue-green, canary, and rolling deployment strategies on K8s.',
            content: '# Kubernetes Deployment Strategies\n\nWork in progress...',
            contentFormat: 'markdown',
            status: 'DRAFT' as const,
            commentsEnabled: true,
        },
    ];

    for (const post of posts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: {},
            create: post,
        });
    }

    // Connect tags to the first published post
    const firstPost = await prisma.blogPost.findUnique({ where: { slug: 'building-scalable-microservices-nestjs' } });
    if (firstPost) {
        const nestjsTag = await prisma.blogTag.findUnique({ where: { slug: 'nestjs' } });
        const tsTag = await prisma.blogTag.findUnique({ where: { slug: 'typescript' } });
        if (nestjsTag && tsTag) {
            await prisma.blogPost.update({
                where: { id: firstPost.id },
                data: { tags: { connect: [{ id: nestjsTag.id }, { id: tsTag.id }] } },
            });
        }

        // Create a test comment (using authorId, the required FK to User)
        await prisma.blogComment.upsert({
            where: { id: 'test-comment-001' },
            update: {},
            create: {
                id: 'test-comment-001',
                postId: firstPost.id,
                authorId: 'test-user-001',
                content: 'Great article! The transactional outbox pattern is crucial for reliable messaging.',
                status: 'APPROVED',
            },
        });

        // Create a reply comment
        await prisma.blogComment.upsert({
            where: { id: 'test-comment-002' },
            update: {},
            create: {
                id: 'test-comment-002',
                postId: firstPost.id,
                authorId: 'test-admin-001',
                content: 'Thanks! We\'ll cover more patterns in the follow-up posts in this series.',
                parentId: 'test-comment-001',
                status: 'APPROVED',
            },
        });
    }

    // Create a notification for the admin about the published posts
    await prisma.notification.upsert({
        where: { id: 'test-notification-001' },
        update: {},
        create: {
            id: 'test-notification-001',
            userId: 'test-admin-001',
            type: 'PROJECT_UPDATE',
            title: 'Blog post published',
            message: 'Your blog post "Building Scalable Microservices with NestJS" is now live.',
            priority: 'NORMAL',
            read: true,
            readAt: new Date(),
            actionUrl: '/blog/building-scalable-microservices-nestjs',
        },
    });

    // Create a test contact message
    await prisma.contactMessage.upsert({
        where: { ticketId: 'TICKET-2026-0001' },
        update: {},
        create: {
            ticketId: 'TICKET-2026-0001',
            name: 'Potential Client',
            email: 'potential@example.com',
            subject: 'GENERAL',
            message: 'I\'m interested in building a SaaS application. Could we discuss the project scope and timeline?',
            status: 'NEW',
            ipInfo: { ip: '203.0.113.42', country: 'IN', city: 'Mumbai' },
        },
    });

    console.log('    ✅ Test blog posts seeded');
}

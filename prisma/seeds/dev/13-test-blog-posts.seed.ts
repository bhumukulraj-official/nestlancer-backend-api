import { PrismaClient } from '../../../generated';

/**
 * Seed test blog posts, tags, and comments for development.
 */
export async function seedTestBlogPosts(prisma: PrismaClient): Promise<void> {
    console.log('    📝 Seeding test blog posts...');

    // Create test tags
    const tags = [
        { name: 'TypeScript', slug: 'typescript' },
        { name: 'NestJS', slug: 'nestjs' },
        { name: 'React', slug: 'react' },
        { name: 'DevOps', slug: 'devops' },
        { name: 'Performance', slug: 'performance' },
    ];

    for (const tag of tags) {
        await prisma.blogTag.upsert({
            where: { slug: tag.slug },
            update: {},
            create: tag,
        });
    }

    // Get the technology category
    const techCategory = await prisma.blogCategory.findUnique({
        where: { slug: 'technology' },
    });

    // Create test blog posts
    const posts = [
        {
            authorId: 'test-admin-001',
            categoryId: techCategory?.id,
            title: 'Building Scalable Microservices with NestJS',
            slug: 'building-scalable-microservices-nestjs',
            excerpt: 'Learn how to build production-ready microservices using NestJS, RabbitMQ, and PostgreSQL.',
            content: '# Building Scalable Microservices with NestJS\n\nIn this comprehensive guide, we explore how to architect and build scalable microservices...\n\n## Architecture Overview\n\nWe use an API Gateway pattern with event-driven communication via RabbitMQ...\n\n## Key Patterns\n\n1. **Transactional Outbox** - Ensures reliable event publishing\n2. **Circuit Breaker** - Handles external service failures gracefully\n3. **CQRS** - Separates read and write concerns\n\n## Implementation\n\n```typescript\n@Module({\n  imports: [DatabaseModule, QueueModule],\n})\nexport class AppModule {}\n```\n\nFull implementation details follow...',
            status: 'PUBLISHED' as const,
            featured: true,
            commentsEnabled: true,
            viewCount: 1250,
            publishedAt: new Date(),
        },
        {
            authorId: 'test-admin-001',
            categoryId: techCategory?.id,
            title: 'TypeScript Best Practices for Large Codebases',
            slug: 'typescript-best-practices-large-codebases',
            excerpt: 'Essential TypeScript patterns and practices for maintaining clean, scalable code.',
            content: '# TypeScript Best Practices\n\nManaging a large TypeScript codebase requires discipline and the right patterns...\n\n## Strict Mode\n\nAlways enable strict TypeScript configuration...\n\n## Type-Safe Error Handling\n\n```typescript\nclass AppError extends Error {\n  constructor(\n    public readonly code: string,\n    message: string,\n    public readonly statusCode: number = 500,\n  ) {\n    super(message);\n  }\n}\n```',
            status: 'PUBLISHED' as const,
            featured: false,
            commentsEnabled: true,
            viewCount: 890,
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            authorId: 'test-admin-001',
            title: 'Draft: Kubernetes Deployment Strategies',
            slug: 'kubernetes-deployment-strategies',
            excerpt: 'A deep dive into blue-green, canary, and rolling deployment strategies on K8s.',
            content: '# Kubernetes Deployment Strategies\n\nWork in progress...',
            status: 'DRAFT' as const,
            featured: false,
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

        // Create a test comment
        await prisma.blogComment.upsert({
            where: { id: 'test-comment-001' },
            update: {},
            create: {
                id: 'test-comment-001',
                postId: firstPost.id,
                userId: 'test-user-001',
                content: 'Great article! The transactional outbox pattern is crucial for reliable messaging.',
                status: 'APPROVED',
            },
        });
    }

    console.log('    ✅ Test blog posts seeded');
}
